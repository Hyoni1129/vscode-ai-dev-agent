# AI Dev Team Agent Development Guide

This document provides information for developers working on the AI Dev Team Agent extension.

## Architecture Overview

The AI Dev Team Agent extension is structured as follows:

- `src/`: Source code for the extension
  - `agents/`: Individual AI agent implementations
  - `core/`: Core workflow and coordination logic
  - `types/`: TypeScript interface and type definitions
  - `utils/`: Utility functions and helpers
- `test/`: Automated tests
- `scripts/`: Build and development scripts
- `docs/`: Documentation files
- `samples/`: Example projects and use cases

## Key Concepts

### Agent Workflow

1. **Project Analysis**: The PM Agent analyzes the project requirements
2. **Task Generation**: Tasks are created and assigned to specialized agents
3. **Implementation**: The Dev Agent implements code based on requirements
4. **Testing**: The Code Tester Agent validates the implementation
5. **Enhancement**: The Enhancement Agent improves the code
6. **Web Testing**: The Web Tester Agent verifies web-specific functionality

### Extension Activation

The extension is activated when:
- A command from the AI Dev Team Agent is triggered
- The chat interface is used with the agent

## Development Workflow

### Setting Up

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the extension: `npm run compile`
4. Launch debug instance: Press F5 in VS Code

### Making Changes

1. Create a feature branch
2. Implement your changes
3. Add tests
4. Ensure linting passes: `npm run lint`
5. Build and test: `npm run compile && npm test`
6. Submit a pull request

### Debugging Tips

- Use VS Code's built-in debugging tools
- Check logs in the Output panel under "AI Dev Team Agent"
- Set breakpoints in the TypeScript code
- Use the `console.log` for temporary debugging

## Extension API

The extension exposes the following API:

- `startWorkflow(context: WorkflowContext)`: Start the automation workflow
- `getStatus()`: Get the current workflow status
- `resetWorkflow()`: Reset the workflow state

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a release branch
4. Build and test the extension
5. Package the extension: `vsce package`
6. Publish to the VS Code Marketplace

## Performance Considerations

- Minimize synchronous operations in the main thread
- Use the VS Code API efficiently
- Consider caching for expensive operations
- Be mindful of memory usage, especially with large projects
