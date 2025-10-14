// src/services/sessionService.js
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
    serverTimestamp,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import CryptoJS from 'crypto-js';

// Security Configuration
const SESSION_CONFIG = {
    MAX_SESSIONS_PER_USER: 5,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_ATTEMPT_WINDOW: 15 * 60 * 1000, // 15 minutes
    SUSPICIOUS_ACTIVITY_THRESHOLD: 3,
    TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
    ENCRYPTION_KEY: process.env.REACT_APP_ENCRYPTION_KEY || 'your-secret-key-here',
};

/**
 * Generate a secure session ID
 */
const generateSessionId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const combined = `${timestamp}-${random}`;
    return CryptoJS.SHA256(combined).toString();
};

/**
 * Generate secure tokens
 */
const generateTokens = (userId) => {
    const accessToken = CryptoJS.AES.encrypt(
        JSON.stringify({
            userId,
            timestamp: Date.now(),
            type: 'access'
        }),
        SESSION_CONFIG.ENCRYPTION_KEY
    ).toString();

    const refreshToken = CryptoJS.AES.encrypt(
        JSON.stringify({
            userId,
            timestamp: Date.now(),
            type: 'refresh'
        }),
        SESSION_CONFIG.ENCRYPTION_KEY
    ).toString();

    return { accessToken, refreshToken };
};

/**
 * Decrypt and validate token
 */
const validateToken = (token, type = 'access') => {
    try {
        const decrypted = CryptoJS.AES.decrypt(token, SESSION_CONFIG.ENCRYPTION_KEY);
        const data = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

        const maxAge = type === 'access'
            ? SESSION_CONFIG.TOKEN_EXPIRY
            : SESSION_CONFIG.REFRESH_TOKEN_EXPIRY;

        if (Date.now() - data.timestamp > maxAge) {
            return { valid: false, reason: 'Token expired' };
        }

        return { valid: true, data };
    } catch (error) {
        return { valid: false, reason: 'Invalid token' };
    }
};

/**
 * Get device information
 */
const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let osName = 'Unknown';
    let deviceType = 'desktop';

    // Detect browser
    if (ua.includes('Firefox')) browserName = 'Firefox';
    else if (ua.includes('Chrome')) browserName = 'Chrome';
    else if (ua.includes('Safari')) browserName = 'Safari';
    else if (ua.includes('Edge')) browserName = 'Edge';

    // Detect OS
    if (ua.includes('Windows')) osName = 'Windows';
    else if (ua.includes('Mac')) osName = 'macOS';
    else if (ua.includes('Linux')) osName = 'Linux';
    else if (ua.includes('Android')) osName = 'Android';
    else if (ua.includes('iOS')) osName = 'iOS';

    // Detect device type
    if (/Mobile|Android|iPhone|iPad/.test(ua)) {
        deviceType = /iPad/.test(ua) ? 'tablet' : 'mobile';
    }

    return {
        browser: browserName,
        os: osName,
        deviceType,
        userAgent: ua,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
    };
};

/**
 * Get IP address (approximate using public API)
 */
const getIPAddress = async () => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error getting IP:', error);
        return 'unknown';
    }
};

/**
 * Get location from IP (optional - requires API key)
 */
const getLocationFromIP = async (ip) => {
    try {
        // Using ipapi.co (free tier available)
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await response.json();
        return {
            country: data.country_name,
            city: data.city,
            region: data.region,
            timezone: data.timezone,
        };
    } catch (error) {
        console.error('Error getting location:', error);
        return null;
    }
};

/**
 * Create a new session
 */
export const createSession = async (userId, email) => {
    try {
        const sessionId = generateSessionId();
        const deviceInfo = getDeviceInfo();
        const ipAddress = await getIPAddress();
        const location = await getLocationFromIP(ipAddress);
        const { accessToken, refreshToken } = generateTokens(userId);

        const sessionData = {
            sessionId,
            userId,
            email,
            accessToken,
            refreshToken,
            deviceInfo,
            ipAddress,
            location,
            createdAt: serverTimestamp(),
            lastActivity: serverTimestamp(),
            expiresAt: new Date(Date.now() + SESSION_CONFIG.TOKEN_EXPIRY),
            isActive: true,
            isSuspicious: false,
            activityLog: [],
        };

        // Check session limit
        await enforceSessionLimit(userId);

        // Save session to Firestore
        await setDoc(doc(db, 'sessions', sessionId), sessionData);

        // Store in localStorage
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Log activity
        await logActivity(userId, 'login', {
            deviceInfo,
            ipAddress,
            location
        });

        return {
            success: true,
            sessionId,
            accessToken,
            refreshToken,
        };
    } catch (error) {
        console.error('Error creating session:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Enforce maximum sessions per user
 */
const enforceSessionLimit = async (userId) => {
    try {
        const sessionsQuery = query(
            collection(db, 'sessions'),
            where('userId', '==', userId),
            where('isActive', '==', true),
            orderBy('lastActivity', 'desc')
        );

        const sessionsSnapshot = await getDocs(sessionsQuery);
        const sessions = sessionsSnapshot.docs;

        if (sessions.length >= SESSION_CONFIG.MAX_SESSIONS_PER_USER) {
            // Remove oldest sessions
            const sessionsToRemove = sessions.slice(SESSION_CONFIG.MAX_SESSIONS_PER_USER - 1);

            for (const session of sessionsToRemove) {
                await deleteDoc(doc(db, 'sessions', session.id));
            }
        }
    } catch (error) {
        console.error('Error enforcing session limit:', error);
    }
};

/**
 * Validate current session
 */
export const validateSession = async () => {
    try {
        const sessionId = localStorage.getItem('sessionId');
        const accessToken = localStorage.getItem('accessToken');

        if (!sessionId || !accessToken) {
            return { valid: false, reason: 'No session found' };
        }

        // Validate token
        const tokenValidation = validateToken(accessToken, 'access');
        if (!tokenValidation.valid) {
            // Try to refresh token
            return await refreshSession();
        }

        // Get session from Firestore
        const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));

        if (!sessionDoc.exists()) {
            return { valid: false, reason: 'Session not found' };
        }

        const sessionData = sessionDoc.data();

        // Check if session is active
        if (!sessionData.isActive) {
            return { valid: false, reason: 'Session inactive' };
        }

        // Check if session expired
        if (sessionData.expiresAt.toDate() < new Date()) {
            await terminateSession(sessionId);
            return { valid: false, reason: 'Session expired' };
        }

        // Check for suspicious activity
        if (sessionData.isSuspicious) {
            return { valid: false, reason: 'Suspicious activity detected' };
        }

        // Update last activity
        await updateDoc(doc(db, 'sessions', sessionId), {
            lastActivity: serverTimestamp(),
        });

        return {
            valid: true,
            userId: sessionData.userId,
            sessionId,
        };
    } catch (error) {
        console.error('Error validating session:', error);
        return { valid: false, reason: 'Validation error' };
    }
};

/**
 * Refresh session with refresh token
 */
export const refreshSession = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        const sessionId = localStorage.getItem('sessionId');

        if (!refreshToken || !sessionId) {
            return { valid: false, reason: 'No refresh token' };
        }

        // Validate refresh token
        const tokenValidation = validateToken(refreshToken, 'refresh');
        if (!tokenValidation.valid) {
            return { valid: false, reason: 'Invalid refresh token' };
        }

        // Generate new tokens
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            generateTokens(tokenValidation.data.userId);

        // Update session in Firestore
        await updateDoc(doc(db, 'sessions', sessionId), {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            lastActivity: serverTimestamp(),
            expiresAt: new Date(Date.now() + SESSION_CONFIG.TOKEN_EXPIRY),
        });

        // Update localStorage
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        return {
            valid: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    } catch (error) {
        console.error('Error refreshing session:', error);
        return { valid: false, reason: 'Refresh error' };
    }
};

/**
 * Terminate a session
 */
export const terminateSession = async (sessionId) => {
    try {
        await updateDoc(doc(db, 'sessions', sessionId), {
            isActive: false,
            terminatedAt: serverTimestamp(),
        });

        // Clear localStorage if it's current session
        if (localStorage.getItem('sessionId') === sessionId) {
            localStorage.removeItem('sessionId');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }

        return { success: true };
    } catch (error) {
        console.error('Error terminating session:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Terminate all sessions for a user
 */
export const terminateAllSessions = async (userId) => {
    try {
        const sessionsQuery = query(
            collection(db, 'sessions'),
            where('userId', '==', userId),
            where('isActive', '==', true)
        );

        const sessionsSnapshot = await getDocs(sessionsQuery);

        const promises = sessionsSnapshot.docs.map(doc =>
            updateDoc(doc.ref, {
                isActive: false,
                terminatedAt: serverTimestamp(),
            })
        );

        await Promise.all(promises);

        // Clear localStorage
        localStorage.removeItem('sessionId');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        return { success: true };
    } catch (error) {
        console.error('Error terminating all sessions:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all active sessions for a user
 */
export const getUserSessions = async (userId) => {
    try {
        const sessionsQuery = query(
            collection(db, 'sessions'),
            where('userId', '==', userId),
            where('isActive', '==', true),
            orderBy('lastActivity', 'desc')
        );

        const sessionsSnapshot = await getDocs(sessionsQuery);
        const currentSessionId = localStorage.getItem('sessionId');

        return sessionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            isCurrent: doc.id === currentSessionId,
        }));
    } catch (error) {
        console.error('Error getting user sessions:', error);
        return [];
    }
};

/**
 * Log user activity
 */
export const logActivity = async (userId, action, metadata = {}) => {
    try {
        const activityData = {
            userId,
            action,
            metadata,
            timestamp: serverTimestamp(),
            ipAddress: await getIPAddress(),
            deviceInfo: getDeviceInfo(),
        };

        await setDoc(doc(collection(db, 'activityLogs')), activityData);

        // Check for suspicious activity
        await detectSuspiciousActivity(userId);

        return { success: true };
    } catch (error) {
        console.error('Error logging activity:', error);
        return { success: false };
    }
};

/**
 * Detect suspicious activity
 */
const detectSuspiciousActivity = async (userId) => {
    try {
        // Get recent activities (last hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const activitiesQuery = query(
            collection(db, 'activityLogs'),
            where('userId', '==', userId),
            where('timestamp', '>', oneHourAgo),
            orderBy('timestamp', 'desc')
        );

        const activitiesSnapshot = await getDocs(activitiesQuery);
        const activities = activitiesSnapshot.docs.map(doc => doc.data());

        let suspiciousCount = 0;
        const uniqueIPs = new Set();
        const uniqueLocations = new Set();

        activities.forEach(activity => {
            uniqueIPs.add(activity.ipAddress);
            if (activity.metadata?.location?.city) {
                uniqueLocations.add(activity.metadata.location.city);
            }
        });

        // Flag as suspicious if:
        // 1. Multiple IPs in short time
        if (uniqueIPs.size > 3) suspiciousCount++;

        // 2. Multiple locations in short time
        if (uniqueLocations.size > 2) suspiciousCount++;

        // 3. Many failed login attempts
        const failedLogins = activities.filter(a => a.action === 'login_failed').length;
        if (failedLogins > SESSION_CONFIG.MAX_LOGIN_ATTEMPTS) suspiciousCount++;

        // If suspicious, flag all active sessions
        if (suspiciousCount >= SESSION_CONFIG.SUSPICIOUS_ACTIVITY_THRESHOLD) {
            const sessionsQuery = query(
                collection(db, 'sessions'),
                where('userId', '==', userId),
                where('isActive', '==', true)
            );

            const sessionsSnapshot = await getDocs(sessionsQuery);

            const promises = sessionsSnapshot.docs.map(doc =>
                updateDoc(doc.ref, {
                    isSuspicious: true,
                })
            );

            await Promise.all(promises);

            // Send security alert (implement email/SMS notification)
            await sendSecurityAlert(userId, 'Suspicious activity detected');
        }

        return { suspicious: suspiciousCount >= SESSION_CONFIG.SUSPICIOUS_ACTIVITY_THRESHOLD };
    } catch (error) {
        console.error('Error detecting suspicious activity:', error);
        return { suspicious: false };
    }
};

/**
 * Send security alert
 */
const sendSecurityAlert = async (userId, message) => {
    // Implement email/SMS notification here
    console.log(`Security Alert for user ${userId}: ${message}`);

    // Example: Save alert to Firestore
    await setDoc(doc(collection(db, 'securityAlerts')), {
        userId,
        message,
        timestamp: serverTimestamp(),
        status: 'unread',
    });
};

/**
 * Rate limiting for login attempts
 */
export const checkRateLimit = async (identifier) => {
    try {
        const rateLimitDoc = await getDoc(doc(db, 'rateLimits', identifier));

        if (!rateLimitDoc.exists()) {
            // First attempt
            await setDoc(doc(db, 'rateLimits', identifier), {
                attempts: 1,
                firstAttempt: serverTimestamp(),
                lastAttempt: serverTimestamp(),
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
                lastAttempt: serverTimestamp(),
            });
            return { allowed: true, remaining: SESSION_CONFIG.MAX_LOGIN_ATTEMPTS - 1 };
        }

        // Check if exceeded
        if (data.attempts >= SESSION_CONFIG.MAX_LOGIN_ATTEMPTS) {
            const timeRemaining = SESSION_CONFIG.LOGIN_ATTEMPT_WINDOW - timeSinceFirst;
            return {
                allowed: false,
                remaining: 0,
                retryAfter: Math.ceil(timeRemaining / 1000 / 60), // minutes
            };
        }

        // Increment attempts
        await updateDoc(doc(db, 'rateLimits', identifier), {
            attempts: data.attempts + 1,
            lastAttempt: serverTimestamp(),
        });

        return {
            allowed: true,
            remaining: SESSION_CONFIG.MAX_LOGIN_ATTEMPTS - data.attempts - 1,
        };
    } catch (error) {
        console.error('Error checking rate limit:', error);
        return { allowed: true }; // Fail open
    }
};

/**
 * Get security events for user
 */
export const getSecurityEvents = async (userId) => {
    try {
        const eventsQuery = query(
            collection(db, 'activityLogs'),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        const eventsSnapshot = await getDocs(eventsQuery);

        return eventsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error getting security events:', error);
        return [];
    }
};

/**
 * Enable two-factor authentication
 */
export const enable2FA = async (userId) => {
    try {
        // Generate 2FA secret
        const secret = CryptoJS.lib.WordArray.random(20).toString();

        await updateDoc(doc(db, 'users', userId), {
            twoFactorEnabled: true,
            twoFactorSecret: secret,
            twoFactorEnabledAt: serverTimestamp(),
        });

        return { success: true, secret };
    } catch (error) {
        console.error('Error enabling 2FA:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Verify 2FA code
 */
export const verify2FACode = async (userId, code) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();

        if (!userData.twoFactorEnabled) {
            return { valid: false, reason: '2FA not enabled' };
        }

        // Implement TOTP verification here
        // This is a simplified example
        const isValid = code.length === 6 && /^\d+$/.test(code);

        return { valid: isValid };
    } catch (error) {
        console.error('Error verifying 2FA:', error);
        return { valid: false, reason: 'Verification error' };
    }
};

export default {
    createSession,
    validateSession,
    refreshSession,
    terminateSession,
    terminateAllSessions,
    getUserSessions,
    logActivity,
    checkRateLimit,
    getSecurityEvents,
    enable2FA,
    verify2FACode,
};