/**
 * AI Dev Team Agent - Base Agent Class
 * 
 * Abstract base class that all agents inherit from.
 * Provides common functionality for LLM communication and file operations.
 */

import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import { IAgent, AgentResult, WorkflowContext, LLMRequest, LLMResponse, FileOperationResult } from '../types';

export abstract class BaseAgent implements IAgent {
    abstract name: string;
    abstract description: string;    /**
     * Execute the agent's primary function
     */
    abstract execute(context: WorkflowContext, ...args: unknown[]): Promise<AgentResult>;

    /**
     * Validate if the agent can run in the current context
     */
    canExecute(context: WorkflowContext): boolean {
        // Default implementation - can be overridden by subclasses
        return context.workspacePath !== undefined && context.projectPath !== undefined;
    }    /**
     * Get estimated token usage for the operation
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    estimateTokens(_context: WorkflowContext, ..._args: unknown[]): number {
        // Default estimation - can be overridden by subclasses
        return 1000;
    }

    /**
     * Send a request to the LLM
     */
    protected async callLLM(request: LLMRequest): Promise<LLMResponse> {
        const startTime = Date.now();
        
        try {
            // Get the default model from configuration
            const config = vscode.workspace.getConfiguration('aiDevTeam');
            const defaultModel = config.get<string>('defaultModel', 'copilot-gpt-4');
            const model = request.model || defaultModel;

            // Prepare the messages
            const messages: vscode.LanguageModelChatMessage[] = [];
            
            if (request.systemMessage) {
                messages.push(vscode.LanguageModelChatMessage.User(request.systemMessage));
            }
            
            messages.push(vscode.LanguageModelChatMessage.User(request.prompt));            // Get the language model
            const models = await vscode.lm.selectChatModels({ 
                vendor: 'copilot',
                family: model
            });

            if (models.length === 0) {
                throw new Error(`No language model available for: ${model}`);
            }

            const selectedModel = models[0];            // Send the request with updated API
            const chatResponse = await selectedModel.sendRequest(messages, {
                justification: 'AI Dev Team Agent workflow automation'
            }, new vscode.CancellationTokenSource().token);

            // Collect the response
            let content = '';
            for await (const fragment of chatResponse.text) {
                content += fragment;
            }            const responseTime = Date.now() - startTime;
            
            return {
                content,
                usage: {
                    promptTokens: this.estimateTokensUsed(request.prompt),
                    completionTokens: this.estimateTokensUsed(content),
                    totalTokens: this.estimateTokensUsed(request.prompt + content)
                },
                model: selectedModel.name,
                timestamp: new Date().toISOString(),
                responseTime
            };

        } catch (error) {
            throw new Error(`LLM request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Estimate tokens used (rough approximation)
     */
    private estimateTokensUsed(text: string): number {
        // Rough estimation: ~4 characters per token
        return Math.ceil(text.length / 4);
    }    /**
     * Read a file from the filesystem
     */
    protected async readFile(filePath: string): Promise<FileOperationResult> {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const stats = await fs.stat(filePath);
            
            return {
                success: true,
                filePath,
                operation: 'read',
                size: stats.size,
                content
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                filePath,
                operation: 'read'
            };
        }
    }

    /**
     * Write content to a file
     */
    protected async writeFile(filePath: string, content: string): Promise<FileOperationResult> {
        try {
            await fs.writeFile(filePath, content, 'utf-8');
            const stats = await fs.stat(filePath);
            
            return {
                success: true,
                filePath,
                operation: 'write',
                size: stats.size
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                filePath,
                operation: 'write'
            };
        }
    }

    /**
     * Check if a file exists
     */
    protected async fileExists(filePath: string): Promise<FileOperationResult> {
        try {
            await fs.access(filePath);
            return {
                success: true,
                filePath,
                operation: 'exists'
            };
        } catch {
            return {
                success: false,
                filePath,
                operation: 'exists'
            };
        }
    }

    /**
     * Create a backup of a file
     */
    protected async backupFile(filePath: string): Promise<FileOperationResult> {
        try {
            const backupPath = `${filePath}.backup`;
            await fs.copyFile(filePath, backupPath);
            
            return {
                success: true,
                filePath: backupPath,
                operation: 'backup'
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                filePath,
                operation: 'backup'
            };
        }
    }

    /**
     * Restore a file from backup
     */
    protected async restoreFile(filePath: string): Promise<FileOperationResult> {
        try {
            const backupPath = `${filePath}.backup`;
            await fs.copyFile(backupPath, filePath);
            
            return {
                success: true,
                filePath,
                operation: 'restore'
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                filePath,
                operation: 'restore'
            };
        }
    }

    /**
     * Delete a file
     */
    protected async deleteFile(filePath: string): Promise<FileOperationResult> {
        try {
            await fs.unlink(filePath);
            
            return {
                success: true,
                filePath,
                operation: 'delete'
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                filePath,
                operation: 'delete'
            };
        }
    }

    /**
     * Get file content as string
     */
    protected async getFileContent(filePath: string): Promise<string> {
        const result = await this.readFile(filePath);
        if (!result.success) {
            throw new Error(`Failed to read file ${filePath}: ${result.error}`);
        }
        
        return await fs.readFile(filePath, 'utf-8');
    }

    /**
     * Ensure directory exists (create if it doesn't)
     */
    protected async ensureDirectory(dirPath: string): Promise<void> {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            if (error instanceof Error && 'code' in error && error.code !== 'EEXIST') {
                throw error;
            }
        }
    }

    /**
     * Get workspace configuration for this agent
     */
    protected getConfig(): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration('aiDevTeam');
    }

    /**
     * Log a message with agent name prefix
     */
    protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${this.name}]`;
        
        switch (level) {
            case 'info':
                console.log(`${prefix} ${message}`);
                break;
            case 'warn':
                console.warn(`${prefix} ${message}`);
                break;
            case 'error':
                console.error(`${prefix} ${message}`);
                break;
        }
    }

    /**
     * Create a standardized success result
     */
    protected createSuccessResult(
        message: string, 
        options: Partial<AgentResult> = {}
    ): AgentResult {
        return {
            success: true,
            message,
            ...options
        };
    }

    /**
     * Create a standardized error result
     */
    protected createErrorResult(
        message: string, 
        options: Partial<AgentResult> = {}
    ): AgentResult {
        return {
            success: false,
            message,
            ...options
        };
    }
}
