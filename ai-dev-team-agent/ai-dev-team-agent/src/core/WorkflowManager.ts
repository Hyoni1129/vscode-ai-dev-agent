/**
 * AI Dev Team Agent - Workflow Manager
 * 
 * Central coordinator for the automated development workflow.
 * Manages agent execution, state persistence, and progress tracking.
 */

import * as vscode from 'vscode';
import { 
    WorkflowState, 
    WorkflowContext, 
    IAgent, 
    AgentResult, 
    WorkflowCheckpoint, 
    ProgressInfo,
    WorkflowEvent,
    WorkflowStats
} from '../types';
import { PMAgent } from '../agents/PMAgent';
import { DevAgent } from '../agents/DevAgent';
import { CodeTesterAgent } from '../agents/CodeTesterAgent';
import { WebTesterAgent } from '../agents/WebTesterAgent';
import { EnhancementAgent } from '../agents/EnhancementAgent';

export class WorkflowManager {
    private context: WorkflowContext | null = null;
    private agents: Map<string, IAgent> = new Map();
    private stateChangeEmitter = new vscode.EventEmitter<WorkflowState>();
    private progressChangeEmitter = new vscode.EventEmitter<ProgressInfo>();
    private eventEmitter = new vscode.EventEmitter<WorkflowEvent>();
    private isExecuting = false;
    private cancellationToken?: vscode.CancellationTokenSource;
    private stats: WorkflowStats | null = null;

    // Public event emitters
    public readonly onStateChange = this.stateChangeEmitter.event;
    public readonly onProgressChange = this.progressChangeEmitter.event;
    public readonly onEvent = this.eventEmitter.event;

    constructor(private extensionContext: vscode.ExtensionContext) {
        this.initializeAgents();
        this.loadPersistedState();
    }

    /**
     * Initialize all available agents
     */
    private initializeAgents() {
        try {
            this.agents.set('pm', new PMAgent());
            this.agents.set('dev', new DevAgent());
            this.agents.set('code_tester', new CodeTesterAgent());
            this.agents.set('web_tester', new WebTesterAgent());
            this.agents.set('enhancement', new EnhancementAgent());
            
            console.log(`✅ Initialized ${this.agents.size} agents`);
        } catch (error) {
            console.error('❌ Failed to initialize agents:', error);
            throw error;
        }
    }

    /**
     * Load persisted workflow state from VS Code workspace state
     */
    private loadPersistedState() {
        try {
            const saved = this.extensionContext.workspaceState.get<WorkflowContext>('workflow_context');
            if (saved) {
                this.context = saved;
                // Restore Date objects
                this.context.startTime = new Date(this.context.startTime);
                this.context.lastUpdate = new Date(this.context.lastUpdate);
                this.context.checkpoints = this.context.checkpoints.map(checkpoint => ({
                    ...checkpoint,
                    timestamp: new Date(checkpoint.timestamp)
                }));
                
                console.log(`🔄 Restored workflow state: ${this.context.state}`);
                this.emitStateChange(this.context.state);
            }
        } catch (error) {
            console.error('❌ Failed to load persisted state:', error);
        }
    }

    /**
     * Persist current workflow state to VS Code workspace state
     */
    private persistState() {
        if (this.context) {
            try {
                this.extensionContext.workspaceState.update('workflow_context', this.context);
            } catch (error) {
                console.error('❌ Failed to persist state:', error);
            }
        }
    }

    /**
     * Start the automated development workflow
     */
    public async startWorkflow(projectPath: string, workspacePath: string): Promise<boolean> {
        if (this.isExecuting) {
            throw new Error('Workflow is already running');
        }

        this.isExecuting = true;
        this.cancellationToken = new vscode.CancellationTokenSource();

        try {
            // Initialize workflow context
            this.context = {
                state: WorkflowState.InitialPlanning,
                projectPath,
                workspacePath,
                currentStep: 0,
                totalSteps: 10, // Initial estimate
                checkpoints: [],
                data: {},
                startTime: new Date(),
                lastUpdate: new Date()
            };

            // Initialize stats
            this.stats = {
                startTime: new Date(),
                duration: 0,
                totalTokensUsed: 0,
                filesCreated: 0,
                filesModified: 0,
                errorsEncountered: 0,
                checkpointsCreated: 0,
                agentStats: {}
            };

            this.persistState();
            this.emitStateChange(WorkflowState.InitialPlanning);
            this.emitEvent('state_change', 'Workflow started', { projectPath, workspacePath });

            // Execute the workflow
            const success = await this.executeWorkflow();
            
            return success;

        } catch (error) {
            console.error('❌ Workflow execution failed:', error);
            if (this.context) {
                this.context.state = WorkflowState.Error;
                this.context.lastError = error instanceof Error ? error.message : 'Unknown error';
                this.persistState();
                this.emitStateChange(WorkflowState.Error);
            }
            return false;
            
        } finally {
            this.isExecuting = false;
            this.cancellationToken?.dispose();
            this.cancellationToken = undefined;
        }
    }

    /**
     * Execute the main workflow loop
     */
    private async executeWorkflow(): Promise<boolean> {
        if (!this.context) {
            throw new Error('No workflow context available');
        }

        let maxIterations = 50; // Prevent infinite loops
        let iteration = 0;

        while (
            this.context.state !== WorkflowState.Complete && 
            this.context.state !== WorkflowState.Error &&
            iteration < maxIterations &&
            !this.cancellationToken?.token.isCancellationRequested
        ) {
            try {
                iteration++;
                console.log(`🔄 Workflow iteration ${iteration}, state: ${this.context.state}`);

                // Execute current state
                const result = await this.executeCurrentState();
                
                if (!result.success) {
                    console.error(`❌ State execution failed: ${result.message}`);
                    this.context.state = WorkflowState.Error;
                    this.context.lastError = result.message;
                    break;
                }

                // Create checkpoint
                this.createCheckpoint(result);

                // Transition to next state
                if (result.nextState && result.nextState !== this.context.state) {
                    const previousState = this.context.state;
                    this.context.state = result.nextState;
                    this.context.lastUpdate = new Date();
                    this.persistState();
                    this.emitStateChange(this.context.state);
                    this.emitEvent('state_change', `Transitioned from ${previousState} to ${this.context.state}`);
                }

                // Update progress
                this.context.currentStep++;
                this.updateProgress();

                // Small delay to prevent overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`❌ Error in workflow iteration ${iteration}:`, error);
                this.context.state = WorkflowState.Error;
                this.context.lastError = error instanceof Error ? error.message : 'Unknown error';
                break;
            }
        }

        // Final state handling
        const isComplete = this.context.state === WorkflowState.Complete;
        const isError = this.context.state === WorkflowState.Error;
        const wasCancelled = this.cancellationToken?.token.isCancellationRequested;

        if (wasCancelled) {
            this.context.state = WorkflowState.Paused;
            this.emitEvent('user_action', 'Workflow cancelled by user');
        } else if (iteration >= maxIterations) {
            this.context.state = WorkflowState.Error;
            this.context.lastError = 'Maximum iterations reached - possible infinite loop';
        }

        // Update final stats
        if (this.stats) {
            this.stats.endTime = new Date();
            this.stats.duration = this.stats.endTime.getTime() - this.stats.startTime.getTime();
        }

        this.persistState();
        
        return isComplete && !isError && !wasCancelled;
    }

    /**
     * Execute the current workflow state
     */
    private async executeCurrentState(): Promise<AgentResult> {
        if (!this.context) {
            return { success: false, message: 'No workflow context' };
        }

        try {
            switch (this.context.state) {
                case WorkflowState.InitialPlanning:
                    return await this.executeAgent('pm', 'initial_plan');

                case WorkflowState.CoreDevelopment:
                    return await this.executeAgent('dev', 'implement_features');

                case WorkflowState.CodeTesting:
                    return await this.executeAgent('code_tester', 'analyze_code');

                case WorkflowState.BugFixing:
                    return await this.executeAgent('dev', 'fix_bugs');

                case WorkflowState.ReadyForEnhancement:
                    return await this.executeAgent('pm', 'prepare_enhancement');

                case WorkflowState.EnhancementReview:
                    return await this.executeAgent('enhancement', 'review_project');

                case WorkflowState.EnhancementPlanning:
                    return await this.executeAgent('pm', 'plan_enhancement');

                case WorkflowState.ImplementingEnhancement:
                    return await this.executeAgent('dev', 'implement_enhancement');

                default:
                    return { 
                        success: false, 
                        message: `Unknown state: ${this.context.state}` 
                    };
            }
        } catch (error) {
            return {
                success: false,
                message: `Error executing state ${this.context.state}: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Execute a specific agent with given action
     */
    private async executeAgent(agentName: string, action: string): Promise<AgentResult> {
        const agent = this.agents.get(agentName);
        if (!agent || !this.context) {
            return { success: false, message: `Agent ${agentName} not found` };
        }

        const startTime = Date.now();
        this.emitEvent('agent_start', `Starting ${agent.name}`, { agentName, action });

        try {
            // Check if agent can execute
            if (!agent.canExecute(this.context)) {
                return { 
                    success: false, 
                    message: `Agent ${agent.name} cannot execute in current context` 
                };
            }

            // Execute the agent
            const result = await agent.execute(this.context, action);
            const duration = Date.now() - startTime;
            result.duration = duration;

            // Update stats
            if (this.stats) {
                if (!this.stats.agentStats[agentName]) {
                    this.stats.agentStats[agentName] = {
                        executionCount: 0,
                        totalTokens: 0,
                        totalDuration: 0,
                        successCount: 0,
                        errorCount: 0
                    };
                }
                
                const agentStats = this.stats.agentStats[agentName];
                agentStats.executionCount++;
                agentStats.totalDuration += duration;
                
                if (result.tokensUsed) {
                    agentStats.totalTokens += result.tokensUsed;
                    this.stats.totalTokensUsed += result.tokensUsed;
                }
                
                if (result.success) {
                    agentStats.successCount++;
                } else {
                    agentStats.errorCount++;
                    this.stats.errorsEncountered++;
                }

                if (result.filesCreated?.length) {
                    this.stats.filesCreated += result.filesCreated.length;
                }
                
                if (result.filesModified?.length) {
                    this.stats.filesModified += result.filesModified.length;
                }
            }

            this.emitEvent('agent_complete', `Completed ${agent.name}`, { 
                agentName, 
                action, 
                success: result.success, 
                duration,
                tokensUsed: result.tokensUsed 
            });

            return result;

        } catch (error) {
            const duration = Date.now() - startTime;
            const errorResult: AgentResult = {
                success: false,
                message: `Agent ${agent.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                duration
            };

            this.emitEvent('error', `Agent ${agent.name} failed`, { agentName, action, error: error instanceof Error ? error.message : 'Unknown error' });
            
            return errorResult;
        }
    }

    /**
     * Create a checkpoint for rollback capability
     */
    private createCheckpoint(result: AgentResult) {
        if (!this.context) return;

        const checkpoint: WorkflowCheckpoint = {
            state: this.context.state,
            timestamp: new Date(),
            filesCreated: result.filesCreated || [],
            filesModified: result.filesModified || [],
            description: result.message,
            agentName: this.getCurrentAgentName()
        };

        this.context.checkpoints.push(checkpoint);
        
        if (this.stats) {
            this.stats.checkpointsCreated++;
        }

        this.emitEvent('checkpoint', `Checkpoint created: ${checkpoint.description}`);
    }

    /**
     * Get the name of the currently executing agent
     */
    private getCurrentAgentName(): string {
        switch (this.context?.state) {
            case WorkflowState.InitialPlanning:
            case WorkflowState.ReadyForEnhancement:
            case WorkflowState.EnhancementPlanning:
                return 'PM Agent';
            case WorkflowState.CoreDevelopment:
            case WorkflowState.BugFixing:
            case WorkflowState.ImplementingEnhancement:
                return 'Developer Agent';
            case WorkflowState.CodeTesting:
                return 'Code Tester Agent';
            case WorkflowState.EnhancementReview:
                return 'Enhancement Agent';
            default:
                return 'Unknown Agent';
        }
    }

    /**
     * Update and emit progress information
     */
    private updateProgress() {
        if (!this.context) return;

        const progressInfo: ProgressInfo = {
            currentStep: this.context.currentStep,
            totalSteps: this.context.totalSteps,
            percentage: Math.round((this.context.currentStep / this.context.totalSteps) * 100),
            currentOperation: this.getOperationDescription(this.context.state),
            filesProcessed: this.stats?.filesCreated || 0,
            totalFiles: 0 // Will be updated as we learn more about the project
        };

        // Estimate time remaining
        if (this.stats && this.context.currentStep > 0) {
            const elapsed = Date.now() - this.stats.startTime.getTime();
            const avgTimePerStep = elapsed / this.context.currentStep;
            const remainingSteps = this.context.totalSteps - this.context.currentStep;
            progressInfo.estimatedTimeRemaining = Math.round(remainingSteps * avgTimePerStep / (1000 * 60)); // Convert to minutes
        }

        this.progressChangeEmitter.fire(progressInfo);
    }

    /**
     * Get human-readable operation description for current state
     */
    private getOperationDescription(state: WorkflowState): string {
        switch (state) {
            case WorkflowState.InitialPlanning:
                return 'Creating development plan';
            case WorkflowState.CoreDevelopment:
                return 'Implementing core features';
            case WorkflowState.CodeTesting:
                return 'Testing and analyzing code';
            case WorkflowState.BugFixing:
                return 'Fixing identified issues';
            case WorkflowState.ReadyForEnhancement:
                return 'Preparing for enhancements';
            case WorkflowState.EnhancementReview:
                return 'Reviewing for improvements';
            case WorkflowState.EnhancementPlanning:
                return 'Planning enhancements';
            case WorkflowState.ImplementingEnhancement:
                return 'Implementing enhancements';
            default:
                return state.replace(/_/g, ' ');
        }
    }

    /**
     * Emit state change event
     */
    private emitStateChange(state: WorkflowState) {
        this.stateChangeEmitter.fire(state);
    }

    /**
     * Emit workflow event
     */
    private emitEvent(type: WorkflowEvent['type'], message: string, data?: Record<string, unknown>) {
        const event: WorkflowEvent = {
            timestamp: new Date(),
            type,
            message,
            currentState: this.context?.state || WorkflowState.Idle,
            data
        };

        this.eventEmitter.fire(event);
    }

    /**
     * Get current workflow status
     */
    public getStatus(): WorkflowContext | null {
        return this.context;
    }

    /**
     * Get workflow statistics
     */
    public getStats(): WorkflowStats | null {
        return this.stats;
    }

    /**
     * Check if workflow is currently executing
     */
    public isRunning(): boolean {
        return this.isExecuting;
    }

    /**
     * Pause the current workflow
     */
    public pause(): boolean {
        if (this.isExecuting && this.cancellationToken) {
            this.cancellationToken.cancel();
            return true;
        }
        return false;
    }

    /**
     * Resume a paused workflow
     */
    public async resume(): Promise<boolean> {
        if (this.context && this.context.state === WorkflowState.Paused && !this.isExecuting) {
            // Resume from where we left off
            this.context.state = this.getPreviousState();
            return await this.startWorkflow(this.context.projectPath, this.context.workspacePath);
        }
        return false;
    }

    /**
     * Get the previous state for resuming
     */
    private getPreviousState(): WorkflowState {
        // This is a simplified version - in a more complex implementation,
        // we would store the previous state in the context
        return this.context?.checkpoints.length ? 
            this.context.checkpoints[this.context.checkpoints.length - 1].state : 
            WorkflowState.InitialPlanning;
    }

    /**
     * Reset workflow state and start fresh
     */
    public resetWorkflow(): void {
        this.context = null;
        this.stats = null;
        this.extensionContext.workspaceState.update('workflow_context', undefined);
        this.emitStateChange(WorkflowState.Idle);
        this.emitEvent('user_action', 'Workflow reset by user');
    }

    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.pause();
        this.stateChangeEmitter.dispose();
        this.progressChangeEmitter.dispose();
        this.eventEmitter.dispose();
    }
}
