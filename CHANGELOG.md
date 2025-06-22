# Changelog

All notable changes to the AI Dev Team Agent extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Multi-language support (Python, Java, C#)
- Custom agent plugins
- Advanced project templates
- Team collaboration features

## [0.1.0] - 2025-06-22

### Added
- 🎯 **Project Manager Agent** - Handles project planning and workflow coordination
- 👨‍💻 **Developer Agent** - Generates code and implements features
- 🔍 **Code Tester Agent** - Performs static analysis and quality checks
- 🌐 **Web Tester Agent** - Browser automation and dynamic testing
- ✨ **Enhancement Agent** - UI/UX improvements and feature suggestions
- 💬 **Chat Interface** - User interaction via VS Code chat participant
- 📊 **Progress Tracking** - Real-time workflow status and progress bars
- 🔄 **State Persistence** - Resume workflows after VS Code restarts
- 🛡️ **Error Recovery** - Robust error handling with automatic retries
- 📁 **Multi-format Support** - HTML, CSS, JavaScript, TypeScript generation

### Chat Commands
- `/start` - Begin automated development workflow
- `/status` - Check current workflow status and progress
- `/resume` - Resume interrupted workflow
- `/reset` - Reset workflow state and start fresh

### Configuration Options
- `aiDevTeam.defaultModel` - Default LLM model selection
- `aiDevTeam.enableWebTesting` - Toggle Playwright web testing
- `aiDevTeam.maxRetries` - Maximum retry attempts for operations
- `aiDevTeam.tokenOptimization` - Enable token usage optimization

### Technical Features
- Complete TypeScript implementation
- VS Code Chat Participant API integration
- State machine workflow architecture
- LLM integration with token optimization
- File system operations with backup/restore
- Checkpoint system for rollback capability
- Event-driven architecture with progress events

### Project Structure
```
src/
├── agents/           # AI agent implementations
│   ├── BaseAgent.ts
│   ├── PMAgent.ts
│   ├── DevAgent.ts
│   ├── CodeTesterAgent.ts
│   ├── WebTesterAgent.ts
│   └── EnhancementAgent.ts
├── core/            # Core workflow management
│   ├── WorkflowManager.ts
│   └── ChatHandler.ts
├── types/           # TypeScript type definitions
│   └── index.ts
├── utils/           # Utility functions
│   ├── fileSystem.ts
│   ├── llmManager.ts
│   ├── progressManager.ts
│   └── errorRecovery.ts
└── extension.ts     # Main extension entry point
```

### Known Limitations
- Currently supports web projects (HTML/CSS/JS/TS)
- Requires Project.md file in workspace root
- LLM token usage depends on project complexity
- Web testing requires Playwright installation

### Dependencies
- VS Code ^1.87.0
- Node.js ^18.0.0
- TypeScript ^5.3.0
- Playwright ^1.40.0 (optional, for web testing)

---

## Version History

- **0.1.0** - Initial release with full agent ecosystem
- **0.0.x** - Development and alpha versions (not released)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
