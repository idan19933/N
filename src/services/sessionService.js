import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    deleteDoc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const SESSION_CONFIG = {
    MAX_SESSIONS_PER_USER: 5,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_ATTEMPT_WINDOW: 15 * 60 * 1000, // 15 minutes
    SESSION_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Generate unique session ID (no encryption needed)
const generateSessionId = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

// Get device info
const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';
    let deviceType = 'desktop';

    // Detect browser
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    // Detect OS
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    // Detect device type
    if (/Mobile|Android|iPhone/.test(ua)) deviceType = 'mobile';
    else if (/iPad/.test(ua)) deviceType = 'tablet';

    return { browser, os, deviceType, userAgent: ua };
};

// Get approximate location (optional, doesn't affect security)
const getApproximateLocation = async () => {
    try {
        const response = await fetch('https://ipapi.co/json/', { timeout: 3000 });
        if (response.ok) {
            const data = await response.json();
            return {
                country: data.country_name,
                city: data.city,
                region: data.region
            };
        }
    } catch (error) {
        console.log('Could not get location (optional)');
    }
    return { country: 'Unknown', city: 'Unknown', region: 'Unknown' };
};

// Enforce session limit - delete oldest sessions
const enforceSessionLimit = async (userId) => {
    try {
        const sessionsQuery = query(
            collection(db, 'sessions'),
            where('userId', '==', userId),
            where('isActive', '==', true)
        );

        const snapshot = await getDocs(sessionsQuery);

        if (snapshot.size >= SESSION_CONFIG.MAX_SESSIONS_PER_USER) {
            // Sort by lastActivity
            const sessions = snapshot.docs
                .map(doc => ({ id: doc.id, data: doc.data() }))
                .sort((a, b) => {
                    const aTime = a.data.lastActivity?.toMillis() || 0;
                    const bTime = b.data.lastActivity?.toMillis() || 0;
                    return bTime - aTime;
                });

            // Delete oldest sessions
            const sessionsToRemove = sessions.slice(SESSION_CONFIG.MAX_SESSIONS_PER_USER - 1);

            for (const session of sessionsToRemove) {
                await deleteDoc(doc(db, 'sessions', session.id));
            }
        }
    } catch (error) {
        console.error('Error enforcing session limit:', error);
    }
};

// Create session (simplified - no fake encryption)
export const createSession = async (userId, email) => {
    try {
        const sessionId = generateSessionId();
        const deviceInfo = getDeviceInfo();
        const location = await getApproximateLocation();

        const sessionData = {
            sessionId,
            userId,
            email,
            deviceInfo,
            location,
            createdAt: serverTimestamp(),
            lastActivity: serverTimestamp(),
            expiresAt: new Date(Date.now() + SESSION_CONFIG.SESSION_EXPIRY),
            isActive: true,
            isSuspicious: false
        };

        // Enforce session limit
        await enforceSessionLimit(userId);

        // Save session
        await setDoc(doc(db, 'sessions', sessionId), sessionData);

        // Store only sessionId in localStorage (Firebase handles auth tokens)
        localStorage.setItem('sessionId', sessionId);

        return { success: true, sessionId };
    } catch (error) {
        console.error('Error creating session:', error);
        return { success: false, error: error.message };
    }
};

// Validate session
export const validateSession = async () => {
    try {
        const sessionId = localStorage.getItem('sessionId');

        if (!sessionId) {
            return { valid: false, reason: 'No session found' };
        }

        // Check session in database
        const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));

        if (!sessionDoc.exists()) {
            localStorage.removeItem('sessionId');
            return { valid: false, reason: 'Session not found' };
        }

        const sessionData = sessionDoc.data();

        if (!sessionData.isActive) {
            localStorage.removeItem('sessionId');
            return { valid: false, reason: 'Session inactive' };
        }

        // Check expiration
        const expiresAt = sessionData.expiresAt?.toDate() || new Date(0);
        if (expiresAt < new Date()) {
            await terminateSession(sessionId);
            return { valid: false, reason: 'Session expired' };
        }

        // Update last activity
        await updateDoc(doc(db, 'sessions', sessionId), {
            lastActivity: serverTimestamp()
        });

        return { valid: true, userId: sessionData.userId };
    } catch (error) {
        console.error('Error validating session:', error);
        return { valid: false, reason: 'Validation error' };
    }
};

// Terminate session
export const terminateSession = async (sessionId) => {
    try {
        if (!sessionId) {
            sessionId = localStorage.getItem('sessionId');
        }

        if (sessionId) {
            await updateDoc(doc(db, 'sessions', sessionId), {
                isActive: false,
                terminatedAt: serverTimestamp()
            });
        }

        localStorage.removeItem('sessionId');

        return { success: true };
    } catch (error) {
        console.error('Error terminating session:', error);
        localStorage.removeItem('sessionId');
        return { success: false };
    }
};

// Terminate all user sessions
export const terminateAllSessions = async (userId) => {
    try {
        const sessionsQuery = query(
            collection(db, 'sessions'),
            where('userId', '==', userId),
            where('isActive', '==', true)
        );

        const snapshot = await getDocs(sessionsQuery);

        const promises = snapshot.docs.map(docSnapshot =>
            updateDoc(docSnapshot.ref, {
                isActive: false,
                terminatedAt: serverTimestamp()
            })
        );

        await Promise.all(promises);

        localStorage.removeItem('sessionId');

        return { success: true };
    } catch (error) {
        console.error('Error terminating all sessions:', error);
        return { success: false };
    }
};

// Get user sessions
export const getUserSessions = async (userId) => {
    try {
        const sessionsQuery = query(
            collection(db, 'sessions'),
            where('userId', '==', userId),
            where('isActive', '==', true)
        );

        const snapshot = await getDocs(sessionsQuery);
        const currentSessionId = localStorage.getItem('sessionId');

        return snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                isCurrent: doc.id === currentSessionId
            }))
            .sort((a, b) => {
                const aTime = a.lastActivity?.toMillis() || 0;
                const bTime = b.lastActivity?.toMillis() || 0;
                return bTime - aTime;
            });
    } catch (error) {
        console.error('Error getting sessions:', error);
        return [];
    }
};

// Log activity (for audit trail)
export const logActivity = async (userId, action, metadata = {}) => {
    try {
        const deviceInfo = getDeviceInfo();

        await setDoc(doc(collection(db, 'activityLogs')), {
            userId,
            action,
            metadata,
            timestamp: serverTimestamp(),
            deviceInfo,
            sessionId: localStorage.getItem('sessionId')
        });

        return { success: true };
    } catch (error) {
        console.error('Error logging activity:', error);
        return { success: false };
    }
};

// Check rate limit
export const checkRateLimit = async (identifier) => {
    try {
        const rateLimitDoc = await getDoc(doc(db, 'rateLimits', identifier));

        if (!rateLimitDoc.exists()) {
            await setDoc(doc(db, 'rateLimits', identifier), {
                attempts: 1,
                firstAttempt: serverTimestamp(),
                lastAttempt: serverTimestamp()
            });
            return { allowed: true, remaining: SESSION_CONFIG.MAX_LOGIN_ATTEMPTS - 1 };
        }

        const data = rateLimitDoc.data();
        const timeSinceFirst = Date.now() - data.firstAttempt.toMillis();

        // Reset if outside window
        if (timeSinceFirst > SESSION_CONFIG.LOGIN_ATTEMPT_WINDOW) {
            await setDoc(doc(db, 'rateLimits', identifier), {
                attempts: 1,
                firstAttempt: serverTimestamp(),
                lastAttempt: serverTimestamp()
            });
            return { allowed: true, remaining: SESSION_CONFIG.MAX_LOGIN_ATTEMPTS - 1 };
        }

        // Check if exceeded
        if (data.attempts >= SESSION_CONFIG.MAX_LOGIN_ATTEMPTS) {
            const timeRemaining = SESSION_CONFIG.LOGIN_ATTEMPT_WINDOW - timeSinceFirst;
            return {
                allowed: false,
                remaining: 0,
                retryAfter: Math.ceil(timeRemaining / 1000 / 60) // minutes
            };
        }

        // Increment attempts
        await updateDoc(doc(db, 'rateLimits', identifier), {
            attempts: data.attempts + 1,
            lastAttempt: serverTimestamp()
        });

        return {
            allowed: true,
            remaining: SESSION_CONFIG.MAX_LOGIN_ATTEMPTS - data.attempts - 1
        };
    } catch (error) {
        console.error('Error checking rate limit:', error);
        return { allowed: true }; // Fail open to not block legitimate users
    }
};

export default {
    createSession,
    validateSession,
    terminateSession,
    terminateAllSessions,
    getUserSessions,
    logActivity,
    checkRateLimit
};