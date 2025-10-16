// src/services/newtonVerificationService.js
import { mathComparison } from './mathComparisonService';

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
            } else {
                const cleanExpr = expression.replace(/\s+/g, '');
                const url = `${this.baseURL}/${operation}/${encodeURIComponent(cleanExpr)}`;

                console.log('🔄 Newton verify:', url);

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Newton API error: ${response.status}`);
                }

                const data = await response.json();
                result = data.result;
                this.cache.set(cacheKey, result);
            }

            const newtonAnswer = operation === 'integrate' ? `${result} + C` : result;
            const verified = operation === 'integrate'
                ? mathComparison.compareIntegrals(userAnswer, newtonAnswer)
                : mathComparison.compare(userAnswer, newtonAnswer);

            console.log('🔍 Verification:', { userAnswer, newtonAnswer, verified });

            return {
                verified: verified,
                newtonAnswer: newtonAnswer,
                userAnswer: userAnswer,
                message: verified ? '✅ Newton API confirms: Correct!' : '❌ Check your answer',
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

    clearCache() {
        this.cache.clear();
    }
}

export const newtonVerification = new NewtonVerificationService();
export default NewtonVerificationService;