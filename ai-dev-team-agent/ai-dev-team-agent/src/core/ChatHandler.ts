/**
 * AI Dev Team Agent - Chat Handler
 * 
 * Handles all chat participant interactions and commands.
 * Provides user interface for the automated development workflow.
 */

import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
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
                
                case 'resume':
                    return await this.handleResume(stream);
                
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
    }    /**
     * Handle the /start command - initiate workflow
     */
    private async handleStart(stream: vscode.ChatResponseStream): Promise<vscode.ChatResult> {
        stream.markdown("🚀 **AI Development Team Activated!**\n\n");
        
        try {
            // Check if there's already an active workflow
            const existingStatus = this.workflowManager.getStatus();
            if (existingStatus && existingStatus.state !== 'idle' && existingStatus.state !== 'complete' && existingStatus.state !== 'error') {
                stream.markdown("⚠️ **Workflow Already Running**\n\n");
                stream.markdown(`Current state: **${existingStatus.state}**\n\n`);
                stream.markdown("Use `/status` to check progress or `/reset` to start fresh.");
                return {};
            }

            // Look for Project.md file in workspace
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                stream.markdown("❌ **No Workspace Found**\n\n");
                stream.markdown("Please open a workspace folder first.");
                return { errorDetails: { message: "No workspace folder found" } };
            }

            const workspacePath = workspaceFolders[0].uri.fsPath;
            const projectMdPath = await this.findProjectMd(workspacePath);
            
            if (!projectMdPath) {
                stream.markdown("❌ **Project.md Not Found**\n\n");
                stream.markdown("Please create a `Project.md` file in your workspace root with your project description.\n\n");
                stream.markdown("**Example Project.md:**\n```markdown\n# My Web App\n\nCreate a simple task management web application using HTML, CSS, and JavaScript.\n\nFeatures:\n- Add/remove tasks\n- Mark tasks as complete\n- Local storage persistence\n```");
                return { errorDetails: { message: "Project.md file not found" } };
            }

            stream.markdown("📋 **Project.md Found!**\n\n");
            stream.markdown(`Starting automated development workflow...\n\n`);
            
            // Progress indicator
            stream.progress("Initializing AI Development Team...");

            // Start the workflow
            const success = await this.workflowManager.startWorkflow(projectMdPath, workspacePath);
            
            if (success) {
                stream.markdown("✅ **Workflow Started Successfully!**\n\n");
                stream.markdown("The AI development team is now working on your project. Use `/status` to check progress.");
            } else {
                stream.markdown("❌ **Failed to Start Workflow**\n\n");
                const status = this.workflowManager.getStatus();
                if (status?.lastError) {
                    stream.markdown(`Error: ${status.lastError}`);
                }
            }
            
            return {};
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            stream.markdown(`❌ **Error Starting Workflow**: ${errorMessage}`);
            return { errorDetails: { message: errorMessage } };
        }
    }    /**
     * Handle the /status command - show current workflow status
     */
    private async handleStatus(stream: vscode.ChatResponseStream): Promise<vscode.ChatResult> {
        const status = this.workflowManager.getStatus();
        
        if (!status) {
            stream.markdown("ℹ️ **No Active Workflow**\n\nNo workflow is currently running. Use `/start` to begin a new workflow.");
            return {};
        }

        // Display current status
        stream.markdown(`## 📊 Workflow Status\n\n`);
        stream.markdown(`**State**: ${this.formatState(status.state)}\n`);
        stream.markdown(`**Progress**: ${status.currentStep}/${status.totalSteps} steps\n`);
        
        if (status.startTime) {
            const elapsed = Date.now() - status.startTime.getTime();
            stream.markdown(`**Elapsed Time**: ${this.formatDuration(elapsed)}\n`);
        }

        if (status.projectPath) {
            const projectName = path.basename(status.projectPath, '.md');
            stream.markdown(`**Project**: ${projectName}\n`);
        }

        // Show progress bar
        const progressPercent = Math.round((status.currentStep / status.totalSteps) * 100);
        const progressBar = this.createProgressBar(progressPercent);
        stream.markdown(`\n${progressBar} ${progressPercent}%\n\n`);

        // Show current step details
        if (status.currentStepDescription) {
            stream.markdown(`**Current Task**: ${status.currentStepDescription}\n\n`);
        }

        // Show any errors
        if (status.lastError) {
            stream.markdown(`⚠️ **Last Error**: ${status.lastError}\n\n`);
        }

        // Show completion status
        if (status.state === 'complete') {
            stream.markdown("🎉 **Workflow Complete!** Your project has been successfully generated.\n\n");
        } else if (status.state === 'error') {
            stream.markdown("❌ **Workflow Failed**. Use `/reset` to clear state and try again.\n\n");
        } else {
            stream.markdown("⏳ **Workflow in progress**. The AI team is working on your project...\n\n");
        }

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
     * Handle the /resume command - resume interrupted workflow
     */
    private async handleResume(stream: vscode.ChatResponseStream): Promise<vscode.ChatResult> {
        const status = this.workflowManager.getStatus();
        
        if (!status) {
            stream.markdown("ℹ️ **No Workflow to Resume**\n\nNo workflow state found. Use `/start` to begin a new workflow.");
            return {};
        }

        if (status.state === 'complete') {
            stream.markdown("✅ **Workflow Already Complete**\n\nThe workflow has already finished successfully.");
            return {};
        }

        if (status.state === 'idle') {
            stream.markdown("ℹ️ **No Active Workflow**\n\nWorkflow is in idle state. Use `/start` to begin a new workflow.");
            return {};
        }

        try {
            stream.markdown("🔄 **Resuming Workflow...**\n\n");
            stream.markdown(`Current state: **${this.formatState(status.state)}**\n\n`);
            stream.progress("Resuming AI Development Team...");

            const success = await this.workflowManager.resume();
            
            if (success) {
                stream.markdown("✅ **Workflow Resumed Successfully!**\n\n");
                stream.markdown("The AI development team is continuing work on your project. Use `/status` to check progress.");
            } else {
                stream.markdown("❌ **Failed to Resume Workflow**\n\n");
                if (status.lastError) {
                    stream.markdown(`Error: ${status.lastError}`);
                }
            }
            
            return {};
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            stream.markdown(`❌ **Error Resuming Workflow**: ${errorMessage}`);
            return { errorDetails: { message: errorMessage } };
        }
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

    /**
     * Find Project.md file in workspace
     */
    private async findProjectMd(workspacePath: string): Promise<string | null> {
        const possiblePaths = [
            path.join(workspacePath, 'Project.md'),
            path.join(workspacePath, 'project.md'),
            path.join(workspacePath, 'PROJECT.md'),
            path.join(workspacePath, 'docs', 'Project.md'),
            path.join(workspacePath, 'docs', 'project.md')
        ];

        for (const projectPath of possiblePaths) {
            try {
                await fs.access(projectPath);
                return projectPath;
            } catch {
                // File doesn't exist, continue searching
            }
        }

        return null;
    }

    /**
     * Helper methods for formatting and display
     */
    private formatState(state: string): string {
        return state.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }

    private formatDuration(milliseconds: number): string {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    private createProgressBar(percent: number): string {
        const barLength = 20;
        const filledLength = Math.round((percent / 100) * barLength);
        const filled = '█'.repeat(filledLength);
        const empty = '░'.repeat(barLength - filledLength);
        return `[${filled}${empty}]`;
    }
}
