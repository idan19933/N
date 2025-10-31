// src/services/smartCache.js
class SmartCache {
    constructor() {
        this.cache = new Map();
        this.timestamps = new Map();
        this.pendingRequests = new Map();

        this.ttl = {
            userLookup: 5 * 60 * 1000,
            stats: 30 * 1000,
            notebook: 60 * 1000,
            profile: 5 * 60 * 1000,
            curriculum: 10 * 60 * 1000
        };
    }

    getCacheKey(type, params) {
        return `${type}:${JSON.stringify(params)}`;
    }

    isValid(key, ttl) {
        if (!this.cache.has(key)) return false;
        const timestamp = this.timestamps.get(key);
        return (Date.now() - timestamp) < ttl;
    }

    get(type, params) {
        const key = this.getCacheKey(type, params);
        const ttl = this.ttl[type] || 60000;

        if (this.isValid(key, ttl)) {
            return this.cache.get(key);
        }
        return null;
    }

    set(type, params, data) {
        const key = this.getCacheKey(type, params);
        this.cache.set(key, data);
        this.timestamps.set(key, Date.now());
    }

    invalidate(type, params) {
        const key = this.getCacheKey(type, params);
        this.cache.delete(key);
        this.timestamps.delete(key);
    }

    invalidateAll(type) {
        for (const [key] of this.cache.entries()) {
            if (key.startsWith(`${type}:`)) {
                this.cache.delete(key);
                this.timestamps.delete(key);
            }
        }
    }

    async dedupe(requestKey, requestFn) {
        if (this.pendingRequests.has(requestKey)) {
            return this.pendingRequests.get(requestKey);
        }

        const promise = requestFn();
        this.pendingRequests.set(requestKey, promise);

        try {
            const result = await promise;
            return result;
        } finally {
            this.pendingRequests.delete(requestKey);
        }
    }

    clear() {
        this.cache.clear();
        this.timestamps.clear();
        this.pendingRequests.clear();
    }
}

export const smartCache = new SmartCache();
export default smartCache;