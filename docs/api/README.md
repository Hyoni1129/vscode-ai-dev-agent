# AI Dev Team Agent API

This document provides an overview of the public API exposed by the AI Dev Team Agent extension.

## Core APIs

### WorkflowManager

The `WorkflowManager` class is the central coordinator for the agent workflow.

```typescript
interface WorkflowManager {
  startWorkflow(context: WorkflowContext): Promise<void>;
  resumeWorkflow(context: WorkflowContext): Promise<void>;
  getStatus(): WorkflowState;
  resetWorkflow(): void;
}
```

### Agent Interface

All specialized agents implement the `Agent` interface:

```typescript
interface Agent {
  execute(context: WorkflowContext): Promise<AgentResult>;
  getCapabilities(): AgentCapability[];
}
```

## Context and Types

### WorkflowContext

```typescript
interface WorkflowContext {
  workspacePath: string;
  projectInfo: ProjectInfo;
  state: WorkflowState;
  checkpoints: WorkflowCheckpoint[];
  results: Record<string, unknown>;
}
```

### AgentResult

```typescript
interface AgentResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  error?: Error;
}
```

## Extension Commands

The extension registers the following commands:

- `ai-dev-team.start`: Start the development workflow
- `ai-dev-team.status`: Check workflow status
- `ai-dev-team.resume`: Resume a paused workflow
- `ai-dev-team.reset`: Reset workflow state

## Events

The extension emits the following events:

- `onWorkflowStart`: When a workflow begins
- `onWorkflowComplete`: When a workflow completes
- `onWorkflowError`: When a workflow encounters an error
- `onAgentChange`: When control passes to a different agent

## Using the API in Your Code

```typescript
import * as vscode from 'vscode';

// Get workflow manager instance
const api = vscode.extensions.getExtension('ai-dev-team.ai-dev-team-agent')?.exports;
const workflowManager = api.getWorkflowManager();

// Start a workflow
workflowManager.startWorkflow({
  workspacePath: '/path/to/workspace',
  projectInfo: {
    name: 'My Project',
    description: 'Sample project'
  },
  state: 'initialized',
  checkpoints: [],
  results: {}
});

// Get current status
const status = workflowManager.getStatus();
```
