/**
 * AI Dev Team Agent - Extension Entry Point
 */

import * as vscode from 'vscode';
import { WorkflowManager } from './core/WorkflowManager';
import { ChatHandler } from './core/ChatHandler';

let workflowManager: WorkflowManager;

/**
 * Extension activation function
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('🤖 AI Dev Team Agent is now active!');

    try {
        // Initialize workflow manager with persistent state
        workflowManager = new WorkflowManager(context);

        // Create chat handler
        const chatHandler = new ChatHandler(workflowManager);

        // Register chat participant
        const participant = vscode.chat.createChatParticipant('dev_team', chatHandler.handle.bind(chatHandler));
        participant.iconPath = new vscode.ThemeIcon('organization');

        // Add status bar item
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        statusBarItem.text = "$(robot) AI Dev Team: Ready";
        statusBarItem.tooltip = "AI Dev Team Agent - Ready to start automated development";
        statusBarItem.show();

        // Add context subscriptions
        context.subscriptions.push(participant, statusBarItem);        // Update status bar when workflow state changes
        workflowManager.onStateChange((state: string) => {
            const stateDisplay = state.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
            statusBarItem.text = `$(robot) AI Dev Team: ${stateDisplay}`;
            statusBarItem.tooltip = `AI Dev Team Agent - Current state: ${stateDisplay}`;
        });

        // Update status bar on progress changes
        workflowManager.onProgressChange((progress: any) => {
            statusBarItem.text = `$(robot) AI Dev Team: ${progress.currentOperation} (${progress.percentage}%)`;
            statusBarItem.tooltip = `AI Dev Team Agent - ${progress.currentOperation}\nProgress: ${progress.currentStep}/${progress.totalSteps} (${progress.percentage}%)`;
        });

        console.log('✅ AI Dev Team Agent activated successfully');

    } catch (error) {
        console.error('❌ Failed to activate AI Dev Team Agent:', error);
        vscode.window.showErrorMessage(`Failed to activate AI Dev Team Agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Extension deactivation function
 */
export function deactivate() {
    console.log('🔌 AI Dev Team Agent is being deactivated...');
    
    try {
        workflowManager?.dispose();
        console.log('✅ AI Dev Team Agent deactivated successfully');
    } catch (error) {
        console.error('❌ Error during deactivation:', error);
    }
}
