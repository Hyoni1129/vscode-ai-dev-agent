/**
 * AI Dev Team Agent - Extension Entry Point
 * 
 * Copyright (c) 2025 JEONGHAN LEE
 * 
 * This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/4.0/
 * 
 * Part of the Stella Open Source Project
 */

import * as vscode from 'vscode';
import { WorkflowManager } from './core/WorkflowManager';
import { ChatHandler } from './core/ChatHandler';
import { ProgressInfo, WorkflowState } from './types';

let workflowManager: WorkflowManager;

/**
 * Extension activation function
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('🤖 AI Dev Team Agent is now active!');

    try {
        // Initialize workflow manager with persistent state
        console.log('Initializing WorkflowManager...');
        workflowManager = new WorkflowManager(context);
        console.log('✅ WorkflowManager initialized');

        // Create chat handler
        console.log('Creating ChatHandler...');
        const chatHandler = new ChatHandler(workflowManager);
        console.log('✅ ChatHandler created');        // Register chat participant
        console.log('Registering chat participant with ID: ai-dev-team');
        
        // Ensure GitHub Copilot Chat is available
        if (!vscode.extensions.getExtension('github.copilot-chat')) {
            const errorMsg = 'GitHub Copilot Chat extension is required for AI Dev Team Agent to work.';
            console.error('❌', errorMsg);
            vscode.window.showErrorMessage(errorMsg, 'Install GitHub Copilot Chat').then(selection => {
                if (selection) {
                    vscode.commands.executeCommand('workbench.extensions.search', 'github.copilot-chat');
                }
            });
            throw new Error(errorMsg);
        }
        
        const participant = vscode.chat.createChatParticipant('ai-dev-team', chatHandler.handle.bind(chatHandler));
        participant.iconPath = new vscode.ThemeIcon('robot');
        console.log('✅ Chat participant registered');
        
        // Verify participant is registered
        console.log('Chat participant details:', {
            id: participant.id,
            iconPath: participant.iconPath?.toString()
        });
        
        // Add to context subscriptions to ensure proper cleanup
        context.subscriptions.push(participant);
        
        // Set up participant follow-up provider
        participant.followupProvider = {
            provideFollowups: () => [{
                prompt: 'Get started with automated development workflow',
                label: 'Start workflow',
                command: 'start'
            }]
        };
        
        // Test if chat participant is accessible
        setTimeout(() => {
            console.log('🔍 Testing chat participant availability...');
            
            // Try multiple commands to open chat
            const chatCommands = [
                'workbench.action.chat.open',
                'workbench.panel.chat.view.copilot.focus',
                'workbench.action.chat.openInSidebar'
            ];
            
            let commandIndex = 0;
            const tryNextCommand = () => {
                if (commandIndex < chatCommands.length) {
                    const cmd = chatCommands[commandIndex++];
                    console.log(`Trying command: ${cmd}`);
                    vscode.commands.executeCommand(cmd).then(() => {
                        console.log(`✅ Command ${cmd} executed successfully`);
                    }, (err: unknown) => {
                        console.log(`❌ Command ${cmd} failed:`, err);
                        tryNextCommand();
                    });
                }
            };
            
            tryNextCommand();
            
            // Also try to get all available chat participants
            console.log('🔍 Checking if participant is accessible via direct test...');
            // We'll test this by trying to trigger our handler directly
            
        }, 2000);        // Add status bar item
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        statusBarItem.text = "$(robot) @ai-dev-team: Ready";
        statusBarItem.tooltip = "AI Dev Team Agent - Use @ai-dev-team in chat to interact";
        statusBarItem.command = 'workbench.panel.chat.view.copilot.focus';
        statusBarItem.show();

        // Add context subscriptions
        context.subscriptions.push(participant, statusBarItem);        // Update status bar when workflow state changes
        workflowManager.onStateChange((state: WorkflowState) => {
            const stateDisplay = state.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
            statusBarItem.text = `$(robot) @ai-dev-team: ${stateDisplay}`;
            statusBarItem.tooltip = `AI Dev Team Agent - Current state: ${stateDisplay}\nUse @ai-dev-team in chat to interact`;
        });        // Update status bar on progress changes
        workflowManager.onProgressChange((progress: ProgressInfo) => {
            statusBarItem.text = `$(robot) @ai-dev-team: ${progress.currentOperation} (${progress.percentage}%)`;
            statusBarItem.tooltip = `AI Dev Team Agent - ${progress.currentOperation}\nProgress: ${progress.currentStep}/${progress.totalSteps} (${progress.percentage}%)\nUse @ai-dev-team in chat to interact`;
        });

        // Show notification to user about successful activation
        vscode.window.showInformationMessage(
            '🤖 AI Dev Team Agent is ready! Use @ai-dev-team in chat to get started.',
            'Open Chat', 'Reload Window'
        ).then(selection => {
            if (selection === 'Open Chat') {
                vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
            } else if (selection === 'Reload Window') {
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
        });

        console.log('✅ AI Dev Team Agent activated successfully');

    } catch (error) {
        console.error('❌ Failed to activate AI Dev Team Agent:', error);
        vscode.window.showErrorMessage(`Failed to activate AI Dev Team Agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error; // Re-throw to ensure VS Code knows activation failed
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
