/**
 * AI Dev Team Agent - Type Definitions
 */

/**
 * Represents all possible states in the automated development workflow
 */
export enum WorkflowState {
    Idle = 'idle',
    InitialPlanning = 'initial_planning',
    CoreDevelopment = 'core_development',
    CodeTesting = 'code_testing',
    BugFixing = 'bug_fixing',
    ReadyForEnhancement = 'ready_for_enhancement',
    EnhancementReview = 'enhancement_review',
    EnhancementPlanning = 'enhancement_planning',
    ImplementingEnhancement = 'implementing_enhancement',
    Complete = 'complete',
    Error = 'error',
    Paused = 'paused'
}

/**
 * Agent role enumeration
 */
export enum AgentRole {
    PROJECT_MANAGER = 'project_manager',
    DEVELOPER = 'developer',
    CODE_TESTER = 'code_tester',
    WEB_TESTER = 'web_tester',
    ENHANCER = 'enhancer'
}

/**
 * Represents the current context and state of the workflow
 */
export interface WorkflowContext {
    /** Current state of the workflow */
    state: WorkflowState;
    /** Absolute path to the Project.md file */
    projectPath: string;
    /** Absolute path to the workspace directory */
    workspacePath: string;
    /** Current step number (for progress tracking) */
    currentStep: number;
    /** Total number of steps estimated */
    totalSteps: number;
    /** Description of the current step being executed */
    currentStepDescription?: string;
    /** Last error message if any */
    lastError?: string;
    /** List of checkpoints for rollback capability */
    checkpoints: WorkflowCheckpoint[];    /** Additional data that agents can store */
    data: Record<string, unknown>;
    /** Start time of the workflow */
    startTime: Date;
    /** Last update time */
    lastUpdate: Date;
}

/**
 * Represents a checkpoint in the workflow for rollback capability
 */
export interface WorkflowCheckpoint {
    /** State when checkpoint was created */
    state: WorkflowState;
    /** Timestamp of the checkpoint */
    timestamp: Date;
    /** List of files created at this checkpoint */
    filesCreated: string[];
    /** List of files modified at this checkpoint */
    filesModified: string[];
    /** Human-readable description of what was accomplished */
    description: string;
    /** Agent that created this checkpoint */
    agentName: string;
}

/**
 * Standardized result interface for all agent operations
 */
export interface AgentResult {
    /** Whether the operation was successful */
    success: boolean;
    /** Human-readable message about the operation */
    message: string;
    /** Files created during this operation */
    filesCreated?: string[];
    /** Files modified during this operation */
    filesModified?: string[];
    /** Suggested next state for the workflow */
    nextState?: WorkflowState;    /** Additional data from the operation */
    data?: Record<string, unknown>;
    /** Token count used for this operation */
    tokensUsed?: number;
    /** Time taken for the operation in milliseconds */
    duration?: number;
}

/**
 * Interface that all agents must implement
 */
export interface IAgent {
    /** Unique name identifier for the agent */
    name: string;
    /** Human-readable description of the agent's purpose */
    description: string;    /** Execute the agent's primary function */
    execute(context: WorkflowContext, ...args: unknown[]): Promise<AgentResult>;
    /** Validate if the agent can run in the current context */
    canExecute(context: WorkflowContext): boolean;    /** Get estimated token usage for the operation */
    estimateTokens(context: WorkflowContext, ...args: unknown[]): number;
}

/**
 * Configuration for individual agents
 */
export interface AgentConfig {
    /** Whether this agent is enabled */
    enabled: boolean;
    /** Maximum tokens this agent can use per operation */
    maxTokens: number;
    /** Maximum retries on failure */
    maxRetries: number;
    /** Timeout in milliseconds */
    timeout: number;    /** Agent-specific configuration */
    config: Record<string, unknown>;
}

/**
 * Global workflow settings
 */
export interface WorkflowSettings {
    /** Default LLM model to use */
    defaultModel: string;
    /** Whether web testing is enabled */
    enableWebTesting: boolean;
    /** Maximum tokens per LLM request */
    maxTokensPerRequest: number;
    /** Whether to enable verbose logging */
    verboseLogging: boolean;
    /** Maximum workflow duration in minutes */
    maxDuration: number;
    /** Configuration for each agent */
    agents: Record<string, AgentConfig>;
}

/**
 * LLM request configuration
 */
export interface LLMRequest {
    /** The prompt to send */
    prompt: string;
    /** Model to use (optional, falls back to default) */
    model?: string;
    /** Maximum tokens for the response */
    maxTokens?: number;
    /** Temperature for randomness (0-1) */
    temperature?: number;
    /** System message (optional) */
    systemMessage?: string;
    /** Context messages for the conversation */
    context?: string[];    /** Additional parameters */
    parameters?: Record<string, unknown>;
}

/**
 * LLM response with metadata
 */
export interface LLMResponse {
    /** The generated content */
    content: string;
    /** Token usage information */
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    /** Model that was used */
    model: string;
    /** Response timestamp */
    timestamp: string;
    /** Response time in milliseconds */
    responseTime?: number;
}

/**
 * File operation result
 */
export interface FileOperationResult {
    /** Whether the operation was successful */
    success: boolean;
    /** Error message if failed */
    error?: string;
    /** File path that was operated on */
    filePath: string;
    /** Operation type */
    operation: 'read' | 'write' | 'delete' | 'exists' | 'backup' | 'restore';
    /** File size in bytes (for read/write operations) */
    size?: number;
    /** File content (for read operations) */
    content?: string;
}

/**
 * Progress tracking interface
 */
export interface ProgressInfo {
    /** Current step number */
    currentStep: number;
    /** Total number of steps */
    totalSteps: number;
    /** Progress percentage (0-100) */
    percentage: number;
    /** Current operation description */
    currentOperation: string;
    /** Estimated time remaining in minutes */
    estimatedTimeRemaining?: number;
    /** Files processed so far */
    filesProcessed: number;
    /** Total files to process */
    totalFiles: number;
}

/**
 * Error recovery options
 */
export interface RecoveryOptions {
    /** Whether to retry the failed operation */
    retry: boolean;
    /** Number of retries attempted */
    retryCount: number;
    /** Maximum retries allowed */
    maxRetries: number;
    /** Whether to rollback to last checkpoint */
    rollback: boolean;
    /** Whether to skip the failed operation and continue */
    skip: boolean;
    /** Custom recovery action */
    customAction?: string;
}

/**
 * Workflow event for logging and monitoring
 */
export interface WorkflowEvent {
    /** Event timestamp */
    timestamp: Date;
    /** Event type */
    type: 'state_change' | 'agent_start' | 'agent_complete' | 'error' | 'checkpoint' | 'user_action';
    /** Agent that triggered the event (if applicable) */
    agentName?: string;
    /** Previous state (for state_change events) */
    previousState?: WorkflowState;
    /** Current state */
    currentState: WorkflowState;
    /** Event message */
    message: string;    /** Additional event data */
    data?: Record<string, unknown>;
}

/**
 * Statistics about the workflow execution
 */
export interface WorkflowStats {
    /** Start time of the workflow */
    startTime: Date;
    /** End time of the workflow (if completed) */
    endTime?: Date;
    /** Total duration in milliseconds */
    duration: number;
    /** Total tokens used across all agents */
    totalTokensUsed: number;
    /** Number of files created */
    filesCreated: number;
    /** Number of files modified */
    filesModified: number;
    /** Number of errors encountered */
    errorsEncountered: number;
    /** Number of checkpoints created */
    checkpointsCreated: number;
    /** Agent execution statistics */
    agentStats: Record<string, {
        executionCount: number;
        totalTokens: number;
        totalDuration: number;
        successCount: number;
        errorCount: number;
    }>;
}

/**
 * Code analysis issue interface
 */
export interface CodeIssue {
    /** Type of issue */
    type: 'error' | 'warning' | 'info' | 'missing' | 'incomplete';
    /** Issue severity */
    severity: 'critical' | 'high' | 'medium' | 'low';
    /** Issue category */
    category: 'syntax' | 'logic' | 'security' | 'performance' | 'style' | 'completeness';
    /** Human-readable message */
    message: string;
    /** File path where issue was found */
    file: string;
    /** Line number (if applicable) */
    line?: number;
    /** Column number (if applicable) */
    column?: number;
    /** Code snippet */
    code?: string;
    /** Suggested fix */
    suggestion?: string;
}

/**
 * Code analysis result interface
 */
export interface CodeAnalysisResult {
    /** List of found issues */
    issues: CodeIssue[];
    /** Analysis summary */
    summary: {
        totalIssues: number;
        criticalIssues: number;
        warnings: number;
        info: number;
    };
    /** Token usage for analysis */
    tokensUsed: number;
    /** Files analyzed */
    filesAnalyzed: string[];
}
