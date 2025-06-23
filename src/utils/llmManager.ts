import * as vscode from 'vscode';
import { LLMRequest, LLMResponse, AgentRole } from '../types';

/**
 * Simple LLM Manager for handling Large Language Model interactions
 */
export class LLMManager {
    private static instance: LLMManager;
    private modelMap: Map<AgentRole, string> = new Map();

    private constructor() {
        this.initializeModels();
    }

    static getInstance(): LLMManager {
        if (!LLMManager.instance) {
            LLMManager.instance = new LLMManager();
        }
        return LLMManager.instance;
    }

    private initializeModels(): void {
        const config = vscode.workspace.getConfiguration('aiDevTeam');
        const defaultModel = config.get<string>('defaultModel', 'copilot-gpt-4');

        // Set specific models for different agent roles if needed
        this.modelMap.set(AgentRole.PROJECT_MANAGER, defaultModel);
        this.modelMap.set(AgentRole.DEVELOPER, defaultModel);
        this.modelMap.set(AgentRole.CODE_TESTER, defaultModel);
        this.modelMap.set(AgentRole.WEB_TESTER, defaultModel);
        this.modelMap.set(AgentRole.ENHANCER, defaultModel);
    }

    /**
     * Send a request to the LLM
     */
    async sendRequest(request: LLMRequest, role: AgentRole): Promise<LLMResponse> {
        try {
            // Use VS Code's language model API (GitHub Copilot integration)
            const models = await vscode.lm.selectChatModels({
                vendor: 'copilot',
                family: 'gpt-4'
            });

            if (models.length === 0) {
                throw new Error('No suitable language model found');
            }

            const chatModel = models[0];
            const messages: vscode.LanguageModelChatMessage[] = [];

            // Add system message if provided
            if (request.systemMessage) {
                messages.push(vscode.LanguageModelChatMessage.User(
                    `System: ${request.systemMessage}`
                ));
            }

            // Add context messages
            if (request.context) {
                for (const contextMsg of request.context) {
                    messages.push(vscode.LanguageModelChatMessage.User(contextMsg));
                }
            }

            // Add main prompt
            messages.push(vscode.LanguageModelChatMessage.User(request.prompt));

            const chatRequest = await chatModel.sendRequest(messages, {});

            let response = '';
            for await (const fragment of chatRequest.text) {
                response += fragment;
            }

            return {
                content: response.trim(),
                model: this.getModelForRole(role),
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            throw new Error(`LLM request failed: ${error}`);
        }
    }

    /**
     * Create a specialized request for code generation
     */
    createCodeRequest(
        prompt: string,
        language: string,
        context?: string[],
        role: AgentRole = AgentRole.DEVELOPER
    ): LLMRequest {
        const systemMessage = this.getSystemMessage(role, language);
        
        return {
            prompt,
            systemMessage,
            context
        };
    }

    /**
     * Create a specialized request for test generation
     */
    createTestRequest(
        codeToTest: string,
        testFramework: string,
        role: AgentRole = AgentRole.CODE_TESTER
    ): LLMRequest {
        const systemMessage = `You are a ${role} agent. Generate comprehensive tests for the provided code using ${testFramework}. 
        Include unit tests, integration tests, and edge cases. Follow best practices for test organization and assertions.`;
        
        return {
            prompt: `Generate tests for this code:\n\n${codeToTest}`,
            systemMessage
        };
    }

    /**
     * Create a specialized request for code review
     */
    createReviewRequest(
        code: string,
        reviewCriteria: string[],
        role: AgentRole = AgentRole.ENHANCER
    ): LLMRequest {
        const systemMessage = `You are a ${role} agent. Review the provided code for: ${reviewCriteria.join(', ')}. 
        Provide specific, actionable feedback with code examples where appropriate.`;
        
        return {
            prompt: `Review this code:\n\n${code}`,
            systemMessage
        };
    }

    private getSystemMessage(role: AgentRole, language?: string): string {
        const baseMessages = {
            [AgentRole.PROJECT_MANAGER]: 'You are a Project Manager agent responsible for analyzing requirements, creating project plans, and coordinating development tasks.',
            [AgentRole.DEVELOPER]: `You are a Developer agent responsible for writing clean, efficient code${language ? ` in ${language}` : ''}. Follow best practices and write production-ready code.`,
            [AgentRole.CODE_TESTER]: 'You are a Code Tester agent responsible for creating comprehensive tests, identifying edge cases, and ensuring code quality.',
            [AgentRole.WEB_TESTER]: 'You are a Web Tester agent responsible for automated web testing using Playwright, including UI tests, accessibility tests, and performance tests.',
            [AgentRole.ENHANCER]: 'You are an Enhancement agent responsible for code review, optimization, and suggesting improvements for maintainability and performance.'
        };

        return baseMessages[role] || 'You are an AI assistant helping with software development tasks.';
    }

    /**
     * Estimate token count (rough approximation)
     */
    private estimateTokens(text: string): number {
        // Rough approximation: 1 token ≈ 4 characters
        return Math.ceil(text.length / 4);
    }

    /**
     * Get available models
     */
    async getAvailableModels(): Promise<string[]> {
        try {
            const models = await vscode.lm.selectChatModels();
            return models.map(model => model.id);
        } catch (error) {
            console.error('Failed to get available models:', error);
            return ['copilot-gpt-4']; // Fallback
        }
    }

    /**
     * Update model for a specific role
     */
    setModelForRole(role: AgentRole, model: string): void {
        this.modelMap.set(role, model);
    }

    /**
     * Get model for a specific role
     */
    getModelForRole(role: AgentRole): string {
        return this.modelMap.get(role) || 'copilot-gpt-4';
    }

    /**
     * Validate request before sending
     */
    private validateRequest(request: LLMRequest): void {
        if (!request.prompt || request.prompt.trim().length === 0) {
            throw new Error('Request prompt cannot be empty');
        }

        const config = vscode.workspace.getConfiguration('aiDevTeam');
        const maxTokens = config.get<number>('maxTokensPerRequest', 4000);
        
        if (this.estimateTokens(request.prompt) > maxTokens) {
            throw new Error(`Request prompt exceeds maximum token limit of ${maxTokens}`);
        }
    }
}
