/**
 * AI Dev Team Agent - Chat Handler
 * 
 * Handles all chat participant interactions and commands.
 * Provides user interface for the automated development workflow.
 */

import * as vscode from 'vscode';
import { WorkflowManager } from './WorkflowManager';

export class ChatHandler {
    constructor(private workflowManager: WorkflowManager) {}

    /**
     * Main chat request handler
     */
    async handle(
        request: vscode.ChatRequest,
        chatContext: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<vscode.ChatResult> {
        
        try {
            switch (request.command) {
                case 'start':
                    return await this.handleStart(stream);
                
                case 'status':
                    return await this.handleStatus(stream);
                
                case 'reset':
                    return await this.handleReset(stream);
                
                default:
                    return await this.handleDefault(stream);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            stream.markdown(`❌ **Error**: ${errorMessage}`);
            return { errorDetails: { message: errorMessage } };
        }
    }

    /**
     * Handle the /start command - initiate workflow
     */
    private async handleStart(stream: vscode.ChatResponseStream): Promise<vscode.ChatResult> {
        stream.markdown("🚀 **AI Development Team Activated!**\n\n");
        stream.markdown("This is a simplified test version. Full implementation coming soon!");
        return {};
    }

    /**
     * Handle the /status command - show current workflow status
     */
    private async handleStatus(stream: vscode.ChatResponseStream): Promise<vscode.ChatResult> {
        const status = this.workflowManager.getStatus();
        
        if (!status) {
            stream.markdown("ℹ️ **No Active Workflow**\n\nNo workflow is currently running.");
            return {};
        }

        stream.markdown(`📊 **Workflow Status**: ${status.state}\n\n`);
        return {};
    }

    /**
     * Handle the /reset command - reset workflow state
     */
    private async handleReset(stream: vscode.ChatResponseStream): Promise<vscode.ChatResult> {
        this.workflowManager.resetWorkflow();
        stream.markdown("🔄 **Workflow Reset Complete**\n\nAll workflow state has been cleared.");
        return {};
    }

    /**
     * Handle default case (no command or help)
     */
    private async handleDefault(stream: vscode.ChatResponseStream): Promise<vscode.ChatResult> {
        const helpText = `# 🤖 AI Dev Team Agent

**Automated development workflow powered by specialized AI agents**

## Available Commands

- \`/start\` - Start automated development workflow
- \`/status\` - Check current workflow status
- \`/reset\` - Reset workflow state

*This is a work-in-progress extension. Full functionality coming soon!*`;
        
        stream.markdown(helpText);
        return {};
    }
}
