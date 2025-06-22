import * as vscode from 'vscode';
import { ProgressInfo, WorkflowState } from '../types';

/**
 * Progress Manager for tracking and reporting workflow progress
 */
export class ProgressManager {
    private static instance: ProgressManager;
    private currentProgress: ProgressInfo | null = null;
    private progressEmitter = new vscode.EventEmitter<ProgressInfo>();
    public readonly onProgressUpdate = this.progressEmitter.event;

    private constructor() {}

    static getInstance(): ProgressManager {
        if (!ProgressManager.instance) {
            ProgressManager.instance = new ProgressManager();
        }
        return ProgressManager.instance;
    }

    /**
     * Initialize progress tracking for a workflow
     */
    initializeProgress(
        totalSteps: number,
        totalFiles: number,
        currentOperation: string
    ): void {
        this.currentProgress = {
            currentStep: 0,
            totalSteps,
            percentage: 0,
            currentOperation,
            estimatedTimeRemaining: undefined,
            filesProcessed: 0,
            totalFiles
        };

        this.emitProgress();
    }

    /**
     * Update the current step and operation
     */
    updateStep(step: number, operation: string): void {
        if (!this.currentProgress) {
            return;
        }

        this.currentProgress.currentStep = step;
        this.currentProgress.currentOperation = operation;
        this.currentProgress.percentage = Math.round((step / this.currentProgress.totalSteps) * 100);

        this.emitProgress();
    }

    /**
     * Update files processed count
     */
    updateFilesProcessed(filesProcessed: number): void {
        if (!this.currentProgress) {
            return;
        }

        this.currentProgress.filesProcessed = filesProcessed;
        this.emitProgress();
    }

    /**
     * Increment the files processed count
     */
    incrementFilesProcessed(): void {
        if (!this.currentProgress) {
            return;
        }

        this.currentProgress.filesProcessed++;
        this.emitProgress();
    }

    /**
     * Set estimated time remaining
     */
    setEstimatedTimeRemaining(minutes: number): void {
        if (!this.currentProgress) {
            return;
        }

        this.currentProgress.estimatedTimeRemaining = minutes;
        this.emitProgress();
    }

    /**
     * Get current progress information
     */
    getCurrentProgress(): ProgressInfo | null {
        return this.currentProgress;
    }

    /**
     * Get progress percentage
     */
    getProgressPercentage(): number {
        return this.currentProgress?.percentage || 0;
    }

    /**
     * Check if progress is complete
     */
    isComplete(): boolean {
        return this.currentProgress?.currentStep === this.currentProgress?.totalSteps;
    }

    /**
     * Generate progress bar text
     */
    getProgressBarText(): string {
        if (!this.currentProgress) {
            return '⏳ Preparing...';
        }

        const { currentStep, totalSteps, percentage, currentOperation } = this.currentProgress;
        const barLength = 20;
        const filledLength = Math.round((percentage / 100) * barLength);
        const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

        return `${bar} ${percentage}% (${currentStep}/${totalSteps}) - ${currentOperation}`;
    }

    /**
     * Generate detailed progress report
     */
    getProgressReport(): string {
        if (!this.currentProgress) {
            return 'No active progress tracking';
        }

        const {
            currentStep,
            totalSteps,
            percentage,
            currentOperation,
            estimatedTimeRemaining,
            filesProcessed,
            totalFiles
        } = this.currentProgress;

        let report = `**Progress Report**\n\n`;
        report += `**Current Step:** ${currentStep} of ${totalSteps}\n`;
        report += `**Progress:** ${percentage}%\n`;
        report += `**Current Operation:** ${currentOperation}\n`;
        report += `**Files Processed:** ${filesProcessed} of ${totalFiles}\n`;

        if (estimatedTimeRemaining !== undefined) {
            report += `**Estimated Time Remaining:** ${estimatedTimeRemaining} minutes\n`;
        }

        return report;
    }

    /**
     * Calculate step progress based on workflow state
     */
    calculateStepFromState(state: WorkflowState): number {
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

    /**
     * Get operation description from workflow state
     */
    getOperationFromState(state: WorkflowState): string {
        const stateOperationMap = {
            [WorkflowState.Idle]: 'Ready to start',
            [WorkflowState.InitialPlanning]: 'Creating project plan',
            [WorkflowState.CoreDevelopment]: 'Implementing core features',
            [WorkflowState.CodeTesting]: 'Running code analysis',
            [WorkflowState.BugFixing]: 'Fixing identified issues',
            [WorkflowState.ReadyForEnhancement]: 'Preparing enhancement review',
            [WorkflowState.EnhancementReview]: 'Reviewing project for enhancements',
            [WorkflowState.EnhancementPlanning]: 'Planning enhancement implementation',
            [WorkflowState.ImplementingEnhancement]: 'Implementing enhancements',
            [WorkflowState.Complete]: 'Workflow complete',
            [WorkflowState.Error]: 'Error occurred',
            [WorkflowState.Paused]: 'Workflow paused'
        };

        return stateOperationMap[state] || 'Unknown operation';
    }

    /**
     * Update progress based on workflow state
     */
    updateFromWorkflowState(state: WorkflowState): void {
        const step = this.calculateStepFromState(state);
        const operation = this.getOperationFromState(state);

        if (step >= 0) {
            this.updateStep(step, operation);
        }
    }

    /**
     * Reset progress tracking
     */
    reset(): void {
        this.currentProgress = null;
        this.emitProgress();
    }

    /**
     * Dispose of the progress manager
     */
    dispose(): void {
        this.progressEmitter.dispose();
        this.currentProgress = null;
    }

    private emitProgress(): void {
        if (this.currentProgress) {
            this.progressEmitter.fire(this.currentProgress);
        }
    }

    /**
     * Create a VS Code progress indicator
     */
    async withProgress<T>(
        title: string,
        task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>
    ): Promise<T> {
        return vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title,
                cancellable: false
            },
            task
        );
    }

    /**
     * Show progress in VS Code status bar
     */
    showInStatusBar(statusBarItem: vscode.StatusBarItem): void {
        if (!this.currentProgress) {
            statusBarItem.text = "$(robot) AI Dev Team: Ready";
            return;
        }

        const { percentage, currentOperation } = this.currentProgress;
        statusBarItem.text = `$(robot) AI Dev Team: ${percentage}% - ${currentOperation}`;
    }
}
