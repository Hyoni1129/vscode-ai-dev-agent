# AI Dev Team Agent - Development Guide

## Quick Setup for Contributors

### 1. Clone and Setup
```bash
git clone https://github.com/Hyoni1129/vscode-ai-dev-agent.git
cd vscode-ai-dev-agent
npm install
```

### 2. Development Commands
```bash
# Compile TypeScript
npm run compile

# Watch mode (auto-compile on changes)
npm run watch

# Run linting
npm run lint

# Run tests (when available)
npm run test
```

### 3. Testing the Extension
1. Open VS Code in the extension directory
2. Press `F5` to launch Extension Development Host
3. In the new window, open a workspace with a `Project.md` file
4. Open VS Code Chat (`Ctrl+Alt+I`)
5. Type `@ai-dev-team /start` to test

### 4. Project Structure
```
src/
├── extension.ts          # Main entry point
├── core/
│   ├── WorkflowManager.ts    # State machine & orchestration
│   └── ChatHandler.ts        # User interface
├── agents/
│   ├── BaseAgent.ts         # Abstract base class
│   ├── PMAgent.ts           # Project Manager
│   ├── DevAgent.ts          # Developer
│   ├── CodeTesterAgent.ts   # Code Analysis
│   ├── WebTesterAgent.ts    # Browser Testing
│   └── EnhancementAgent.ts  # UX/UI Improvements
├── types/
│   └── index.ts             # TypeScript definitions
└── utils/
    ├── fileSystem.ts        # File operations
    ├── llmManager.ts        # LLM integration
    ├── progressManager.ts   # Progress tracking
    └── errorRecovery.ts     # Error handling
```

### 5. Key Development Notes

#### Adding New Agents
1. Extend `BaseAgent` class
2. Implement `execute()` method
3. Add to `WorkflowManager.initializeAgents()`
4. Update workflow state machine if needed

#### Workflow States
- `InitialPlanning` → PM Agent creates development plan
- `CoreDevelopment` → Dev Agent implements features
- `CodeTesting` → Code Tester analyzes code
- `BugFixing` → Dev Agent fixes issues
- `ReadyForEnhancement` → PM prepares for enhancements
- `EnhancementReview` → Enhancement Agent suggests improvements
- `EnhancementPlanning` → PM plans enhancements
- `ImplementingEnhancement` → Dev Agent applies enhancements
- `Complete` → Workflow finished

#### State Persistence
- Workflow state is saved in VS Code's `workspaceState`
- Survives VS Code restarts
- Includes checkpoints for rollback

#### Error Handling
- All agents implement retry logic
- Checkpoint system allows rollback
- Graceful degradation on failures

### 6. Debugging Tips
- Use `console.log()` for quick debugging
- VS Code debugger works in Extension Development Host
- Check Output panel for extension logs
- Monitor token usage in LLM calls

### 7. Common Issues
- **Module not found**: Check import paths
- **Extension not loading**: Check `package.json` configuration
- **Chat participant not working**: Verify registration in `contributes`

### 8. Release Process
1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run full test suite
4. Build extension: `npm run compile`
5. Package: `vsce package` (requires vsce installation)

### 9. VS Code Extension APIs Used
- Chat Participant API (`vscode.chat.*`)
- Language Model API (`vscode.lm.*`) 
- Workspace API (`vscode.workspace.*`)
- File System API (`vscode.workspace.fs.*`)
- Progress API (`vscode.window.withProgress`)

### 10. Future Development Areas
- **Testing Framework**: Add comprehensive test suite
- **Performance**: Optimize LLM token usage
- **Multi-language**: Support Python, Java, C# projects
- **Plugins**: Custom agent plugin system
- **UI**: Rich text interface beyond chat

For detailed contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).
