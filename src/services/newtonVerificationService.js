// src/services/newtonVerificationService.js
class NewtonVerificationService {
    constructor() {
        this.baseURL = 'https://newton.now.sh/api/v2';
        this.cache = new Map();
    }

    async verify(operation, expression, userAnswer) {
        if (!operation || !expression) {
            return {
                verified: false,
                message: 'No Newton verification available',
                useLocal: true
            };
        }

        try {
            const cacheKey = `${operation}:${expression}`;
            let result;

            if (this.cache.has(cacheKey)) {
                result = this.cache.get(cacheKey);
                console.log('📦 Using cached Newton result');
            } else {
                const cleanExpr = expression.replace(/\s+/g, '');
                const url = `${this.baseURL}/${operation}/${encodeURIComponent(cleanExpr)}`;

                console.log('🔄 Newton verify:', url);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Newton API error: ${response.status}`);
                }

                const data = await response.json();
                result = data.result;
                this.cache.set(cacheKey, result);

                console.log('✅ Newton result:', result);
            }

            // Normalize for comparison
            const normalize = (str) => {
                return String(str)
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .replace(/\+c$/i, '')
                    .replace(/\*/g, '')
                    .replace(/\^/g, '')
                    .replace(/\(/g, '')
                    .replace(/\)/g, '')
                    .replace(/\[/g, '')
                    .replace(/\]/g, '');
            };

            const newtonNorm = normalize(result);
            const userNorm = normalize(userAnswer);

            // Check exact match
            let verified = newtonNorm === userNorm;

            // Check partial match
            if (!verified) {
                verified = newtonNorm.includes(userNorm) || userNorm.includes(newtonNorm);
            }

            // For integrals, check without +C
            if (!verified && operation === 'integrate') {
                const newtonWithoutC = newtonNorm.replace(/c$/i, '');
                const userWithoutC = userNorm.replace(/c$/i, '');
                verified = newtonWithoutC === userWithoutC;
            }

            console.log('🔍 Newton verification:', {
                operation,
                expression,
                newtonAnswer: result,
                userAnswer,
                newtonNorm,
                userNorm,
                verified
            });

            return {
                verified: verified,
                newtonAnswer: result,
                userAnswer: userAnswer,
                message: verified ? '✅ Newton API confirms!' : '❌ Check your answer',
                useLocal: false
            };
        } catch (error) {
            console.error('❌ Newton verification error:', error);
            return {
                verified: false,
                error: error.message,
                message: 'Newton verification unavailable',
                useLocal: true
            };
        }
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Newton cache cleared');
    }

    // Get cache size
    getCacheSize() {
        return this.cache.size;
    }
}

export const newtonVerification = new NewtonVerificationService();