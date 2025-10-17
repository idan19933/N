// src/services/universalProblemFetcher.js - FETCHES FROM ANY SOURCE
import axios from 'axios';

class UniversalProblemFetcher {

    /**
     * Fetch from any source - AI will parse it
     */
    async fetch(source) {
        console.log('🌐 Fetching from source:', source.type);

        try {
            if (source.type === 'text') {
                return this.parseText(source.text);
            } else if (source.type === 'url') {
                return await this.fetchFromURL(source.url);
            } else if (source.type === 'github') {
                return await this.fetchFromGitHub(source.owner, source.repo, source.path);
            }

            throw new Error('Unknown source type');
        } catch (error) {
            console.error('❌ Fetch error:', error);
            throw error;
        }
    }

    /**
     * Parse text input - Just split into chunks for AI
     */
    parseText(text) {
        console.log('📝 Parsing text input...');

        // Don't try to parse - let AI do ALL the work
        // Just return the raw text as a single "problem" for AI to extract from
        return [{ raw: text }];
    }

    /**
     * Fetch from URL
     */
    async fetchFromURL(url) {
        console.log('🌐 Fetching from URL:', url);

        try {
            const response = await axios.get(url, {
                timeout: 30000,
                headers: {
                    'Accept': 'application/json, text/plain, text/html, */*'
                }
            });

            console.log('✅ Fetched data, type:', typeof response.data);

            // Return raw data - AI will parse it
            if (typeof response.data === 'string') {
                return [{ raw: response.data }];
            } else if (Array.isArray(response.data)) {
                return response.data;
            } else if (typeof response.data === 'object') {
                return [response.data];
            }

            return [{ raw: JSON.stringify(response.data) }];

        } catch (error) {
            console.error('❌ URL fetch error:', error.message);
            throw new Error(`Failed to fetch from URL: ${error.message}`);
        }
    }

    /**
     * Fetch from GitHub
     */
    async fetchFromGitHub(owner, repo, path) {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
        console.log('📂 Fetching from GitHub:', rawUrl);

        return await this.fetchFromURL(rawUrl);
    }
}

export const universalFetcher = new UniversalProblemFetcher();