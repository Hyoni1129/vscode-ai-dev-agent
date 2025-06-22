import * as vscode from 'vscode';
import { WorkflowContext, WorkflowCheckpoint, WorkflowState, RecoveryOptions } from '../types';
import { FileSystemHelper } from './fileSystem';

/**
 * Error Recovery System for handling workflow failures and rollbacks
 */
export class ErrorRecovery {
    private static instance: ErrorRecovery;
    private maxRetries: number = 3;
    private retryDelay: number = 1000; // Base delay in milliseconds

    private constructor() {}

    static getInstance(): ErrorRecovery {
        if (!ErrorRecovery.instance) {
            ErrorRecovery.instance = new ErrorRecovery();
        }
        return ErrorRecovery.instance;
    }

    /**
     * Handle an error with automatic recovery options
     */
    async handleError(
        error: Error,
        context: WorkflowContext,
        operation: string
    ): Promise<RecoveryOptions> {
        console.error(`[ErrorRecovery] Error in ${operation}:`, error.message);

        // Analyze the error and determine recovery strategy
        const recoveryOptions = await this.analyzeError(error, context, operation);
        
        // Log the error for debugging
        await this.logError(error, context, operation, recoveryOptions);

        return recoveryOptions;
    }

    /**
     * Retry an operation with exponential backoff
     */
    async retryOperation<T>(
        operation: () => Promise<T>,
        operationName: string,
        maxRetries: number = this.maxRetries
    ): Promise<T> {
        let lastError: Error | undefined;
        let attempt = 1;

        while (attempt <= maxRetries) {
            try {
                return await operation();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');
                
                console.warn(`[ErrorRecovery] Attempt ${attempt} of ${operationName} failed: ${lastError.message}`);
                
                if (attempt === maxRetries) {
                    break;
                }

                // Exponential backoff with jitter
                const delay = this.retryDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
                await this.sleep(delay);
                
                attempt++;
            }
        }

        throw new Error(`${operationName} failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
    }

    /**
     * Rollback to the last checkpoint
     */
    async rollbackToCheckpoint(
        context: WorkflowContext,
        checkpointIndex?: number
    ): Promise<boolean> {
        try {
            if (context.checkpoints.length === 0) {
                throw new Error('No checkpoints available for rollback');
            }

            const targetIndex = checkpointIndex ?? context.checkpoints.length - 1;
            const checkpoint = context.checkpoints[targetIndex];

            if (!checkpoint) {
                throw new Error(`Checkpoint at index ${targetIndex} not found`);
            }

            console.log(`[ErrorRecovery] Rolling back to checkpoint: ${checkpoint.description}`);

            // Remove files created after this checkpoint
            await this.removeFilesCreatedAfterCheckpoint(context, targetIndex);

            // Restore the workflow state
            context.state = checkpoint.state;
            context.currentStep = this.getStepFromState(checkpoint.state);
            context.lastError = undefined;

            // Remove checkpoints after the target checkpoint
            context.checkpoints = context.checkpoints.slice(0, targetIndex + 1);

            console.log(`[ErrorRecovery] Successfully rolled back to: ${checkpoint.description}`);
            return true;

        } catch (error) {
            console.error(`[ErrorRecovery] Rollback failed:`, error);
            return false;
        }
    }

    /**
     * Create a backup of critical files before risky operations
     */
    async createBackup(filePaths: string[], backupSuffix: string = '.backup'): Promise<string[]> {
        const backupPaths: string[] = [];

        for (const filePath of filePaths) {
            try {
                if (await FileSystemHelper.fileExists(filePath)) {
                    const backupPath = filePath + backupSuffix;
                    await FileSystemHelper.copyFile(filePath, backupPath);
                    backupPaths.push(backupPath);
                }
            } catch (error) {
                console.warn(`[ErrorRecovery] Failed to backup ${filePath}:`, error);
            }
        }

        return backupPaths;
    }

    /**
     * Restore files from backup
     */
    async restoreFromBackup(backupPaths: string[], backupSuffix: string = '.backup'): Promise<boolean> {
        let allRestored = true;

        for (const backupPath of backupPaths) {
            try {
                if (await FileSystemHelper.fileExists(backupPath)) {
                    const originalPath = backupPath.replace(backupSuffix, '');
                    await FileSystemHelper.copyFile(backupPath, originalPath);
                    await FileSystemHelper.deleteFile(backupPath); // Clean up backup file
                }
            } catch (error) {
                console.error(`[ErrorRecovery] Failed to restore ${backupPath}:`, error);
                allRestored = false;
            }
        }

        return allRestored;
    }

    /**
     * Show recovery options to the user
     */
    async showRecoveryOptions(
        error: Error,
        recoveryOptions: RecoveryOptions
    ): Promise<'retry' | 'rollback' | 'skip' | 'abort'> {
        const options: vscode.QuickPickItem[] = [];

        if (recoveryOptions.retry && recoveryOptions.retryCount < recoveryOptions.maxRetries) {
            options.push({
                label: 'Retry',
                description: `Attempt the operation again (${recoveryOptions.retryCount}/${recoveryOptions.maxRetries} attempts)`
            });
        }

        if (recoveryOptions.rollback) {
            options.push({
                label: 'Rollback',
                description: 'Return to the last successful checkpoint'
            });
        }

        if (recoveryOptions.skip) {
            options.push({
                label: 'Skip',
                description: 'Skip this operation and continue with the workflow'
            });
        }

        options.push({
            label: 'Abort',
            description: 'Stop the workflow completely'
        });

        const selection = await vscode.window.showQuickPick(options, {
            title: 'Workflow Error Recovery',
            placeHolder: `Error: ${error.message}. How would you like to proceed?`
        });

        switch (selection?.label) {
            case 'Retry':
                return 'retry';
            case 'Rollback':
                return 'rollback';
            case 'Skip':
                return 'skip';
            default:
                return 'abort';
        }
    }

    /**
     * Validate workflow state integrity
     */
    async validateWorkflowState(context: WorkflowContext): Promise<boolean> {
        try {
            // Check if required files exist
            if (!await FileSystemHelper.fileExists(context.projectPath)) {
                throw new Error('Project.md file is missing');
            }

            // Check workspace accessibility
            if (!await FileSystemHelper.isDirectory(context.workspacePath)) {
                throw new Error('Workspace directory is not accessible');
            }

            // Validate checkpoints
            for (const checkpoint of context.checkpoints) {
                for (const filePath of checkpoint.filesCreated) {
                    if (!await FileSystemHelper.fileExists(filePath)) {
                        console.warn(`[ErrorRecovery] Checkpoint file missing: ${filePath}`);
                    }
                }
            }

            return true;

        } catch (error) {
            console.error(`[ErrorRecovery] Workflow state validation failed:`, error);
            return false;
        }
    }

    private async analyzeError(
        error: Error,
        context: WorkflowContext,
        operation: string
    ): Promise<RecoveryOptions> {
        const errorMessage = error.message.toLowerCase();

        // Determine if retry is appropriate
        const isRetryable = this.isRetryableError(error);
        
        // Check if rollback is possible
        const canRollback = context.checkpoints.length > 0;
        
        // Check if operation can be skipped
        const canSkip = this.isSkippableOperation(operation);

        return {
            retry: isRetryable,
            retryCount: 0,
            maxRetries: this.maxRetries,
            rollback: canRollback,
            skip: canSkip,
            customAction: this.getCustomAction(error, operation)
        };
    }

    private isRetryableError(error: Error): boolean {
        const errorMessage = error.message.toLowerCase();
        
        // Network or temporary errors that might resolve on retry
        return errorMessage.includes('timeout') ||
               errorMessage.includes('network') ||
               errorMessage.includes('econnreset') ||
               errorMessage.includes('rate limit') ||
               errorMessage.includes('temporarily unavailable');
    }

    private isSkippableOperation(operation: string): boolean {
        const skippableOperations = [
            'web_testing',
            'enhancement_review',
            'documentation_update'
        ];
        
        return skippableOperations.some(op => operation.toLowerCase().includes(op));
    }

    private getCustomAction(error: Error, operation: string): string | undefined {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('file not found')) {
            return 'recreate_missing_files';
        }
        
        if (errorMessage.includes('permission denied')) {
            return 'check_file_permissions';
        }
        
        if (errorMessage.includes('disk space')) {
            return 'clean_temporary_files';
        }
        
        return undefined;
    }

    private async removeFilesCreatedAfterCheckpoint(
        context: WorkflowContext,
        checkpointIndex: number
    ): Promise<void> {
        for (let i = checkpointIndex + 1; i < context.checkpoints.length; i++) {
            const checkpoint = context.checkpoints[i];
            
            for (const filePath of checkpoint.filesCreated) {
                try {
                    if (await FileSystemHelper.fileExists(filePath)) {
                        await FileSystemHelper.deleteFile(filePath);
                        console.log(`[ErrorRecovery] Removed file: ${filePath}`);
                    }
                } catch (error) {
                    console.warn(`[ErrorRecovery] Failed to remove file ${filePath}:`, error);
                }
            }
        }
    }

    private getStepFromState(state: WorkflowState): number {
        const stateStepMap = {
            [WorkflowState.Idle]: 0,
            [WorkflowState.InitialPlanning]: 1,
            [WorkflowState.CoreDevelopment]: 2,
            [WorkflowState.CodeTesting]: 3,
            [WorkflowState.BugFixing]: 4,
            [WorkflowState.ReadyForEnhancement]: 5,
            [WorkflowState.EnhancementReview]: 6,
            [WorkflowState.EnhancementPlanning]: 7,
            [WorkflowState.ImplementingEnhancement]: 8,
            [WorkflowState.Complete]: 10,
            [WorkflowState.Error]: -1,
            [WorkflowState.Paused]: -1
        };

        return stateStepMap[state] || 0;
    }

    private async logError(
        error: Error,
        context: WorkflowContext,
        operation: string,
        recoveryOptions: RecoveryOptions
    ): Promise<void> {
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: {
                message: error.message,
                stack: error.stack
            },
            operation,
            workflowState: context.state,
            currentStep: context.currentStep,
            recoveryOptions
        };

        try {
            const logPath = FileSystemHelper.getAbsolutePath('workflow-errors.log');
            const logEntry = JSON.stringify(errorLog, null, 2) + '\n';
            
            // Append to error log file
            const existingLog = await FileSystemHelper.fileExists(logPath) 
                ? await FileSystemHelper.readFile(logPath) 
                : '';
            
            await FileSystemHelper.writeFile(logPath, existingLog + logEntry);
        } catch (logError) {
            console.error('[ErrorRecovery] Failed to write error log:', logError);
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clear error recovery state
     */
    reset(): void {
        // Reset any internal state if needed
        console.log('[ErrorRecovery] Reset error recovery state');
    }

    /**
     * Get recovery statistics
     */
    getRecoveryStats(): {
        totalErrors: number;
        successfulRetries: number;
        successfulRollbacks: number;
    } {
        // This would track statistics across the session
        return {
            totalErrors: 0,
            successfulRetries: 0,
            successfulRollbacks: 0
        };
    }
}
