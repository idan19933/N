// src/services/claudeService.js - COMPLETE
class ClaudeService {
    constructor() {
        this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        console.log('🤖 Claude Service initialized (via proxy):', this.backendUrl);
    }

    // AI Chat/Help
    async chat(messages, context = {}) {
        try {
            const response = await fetch(`${this.backendUrl}/api/ai-help`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    messages: messages,
                    context: context
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Chat failed');
            }

            return data.response;

        } catch (error) {
            console.error('❌ Chat error:', error);
            throw error;
        }
    }

    // Generate hint
    async generateHint(question, currentAnswer, hintNumber) {
        try {
            const response = await fetch(`${this.backendUrl}/api/generate-hint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question,
                    currentAnswer,
                    hintNumber
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            return data.hint;

        } catch (error) {
            console.error('❌ Hint generation error:', error);
            throw error;
        }
    }

    // Health check
    async checkHealth() {
        try {
            const response = await fetch(`${this.backendUrl}/health`);
            return await response.json();
        } catch (error) {
            console.error('❌ Health check failed:', error);
            return { status: 'error', error: error.message };
        }
    }
}

export const claudeService = new ClaudeService();
export default claudeService;