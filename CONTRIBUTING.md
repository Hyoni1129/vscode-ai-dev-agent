# Contributing to AI Dev Team Agent

🎉 First off, thank you for considering contributing to AI Dev Team Agent! It's people like you that make this project amazing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@ai-dev-team-agent.com].

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- VS Code (v1.87.0 or higher)
- Git
- TypeScript knowledge

### Development Environment

1. **Fork the repository**
   ```bash
   git clone https://github.com/Hyoni1129/vscode-ai-dev-agent.git
   cd vscode-ai-dev-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Open in VS Code**
   ```bash
   code .
   ```

4. **Run the extension**
   - Press `F5` to launch a new Extension Development Host window
   - The extension will be loaded automatically

## How to Contribute

### 🐛 Bug Reports

Before creating bug reports, please check the [issue list](https://github.com/Hyoni1129/vscode-ai-dev-agent/issues) to see if the problem has already been reported.

When creating a bug report, include these details:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**

### ✨ Feature Requests

Feature requests are welcome! Before creating one:

- **Check if the feature has already been requested**
- **Provide a clear and detailed explanation of the feature**
- **Explain why this feature would be useful**
- **Include mockups or examples if applicable**

### 🔧 Code Contributions

#### Areas that need help:

- **Agent Implementations**: Improving existing agents or creating new ones
- **Error Handling**: Enhancing error recovery and user experience
- **Testing**: Adding unit tests and integration tests
- **Documentation**: Improving code comments and user guides
- **Performance**: Optimizing token usage and execution speed

#### Before you start:

1. **Check for existing issues** related to your contribution
2. **Create an issue** if one doesn't exist to discuss your planned changes
3. **Get feedback** from maintainers before starting significant work

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the [code style](#code-style) guidelines
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run compile
   npm run lint
   npm run test
   ```

4. **Commit your changes**
   ```bash
   git commit -m "feat: add new agent functionality"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a clear and descriptive title
   - Provide a detailed description of your changes
   - Reference any related issues
   - Include screenshots/GIFs for UI changes

### Pull Request Guidelines

- **One feature per PR**: Keep pull requests focused on a single feature or bug fix
- **Clear description**: Explain what your PR does and why
- **Update documentation**: Update README.md and other docs as needed
- **Add tests**: Include tests for new functionality
- **Follow conventions**: Use consistent naming and coding patterns

## Code Style

### TypeScript Guidelines

- Use **meaningful variable names**
- Add **comprehensive comments** for complex logic
- Follow **VS Code extension best practices**
- Use **async/await** instead of Promises where possible
- Implement **proper error handling**

### File Structure

```
src/
├── agents/           # AI agent implementations
├── core/            # Core workflow management
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── extension.ts     # Main extension entry point
```

### Naming Conventions

- **Classes**: PascalCase (`WorkflowManager`)
- **Functions/Methods**: camelCase (`executeWorkflow`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRIES`)
- **Files**: PascalCase for classes, camelCase for utilities

### Comment Guidelines

```typescript
/**
 * Brief description of the function
 * 
 * @param context - Workflow context containing state and configuration
 * @param action - Specific action for the agent to perform
 * @returns Promise resolving to the agent's execution result
 */
async execute(context: WorkflowContext, action: string): Promise<AgentResult> {
    // Implementation details...
}
```

## Testing

### Running Tests

```bash
# Compile the project
npm run compile

# Run linting
npm run lint

# Run tests (when available)
npm run test
```

### Writing Tests

- **Unit tests**: Test individual functions and classes
- **Integration tests**: Test component interactions
- **End-to-end tests**: Test complete workflows

Example test structure:
```typescript
describe('WorkflowManager', () => {
    it('should initialize all agents correctly', () => {
        // Test implementation
    });
    
    it('should handle workflow state transitions', async () => {
        // Test implementation
    });
});
```

## Reporting Bugs

### Security Issues

**DO NOT** open a public issue for security vulnerabilities. Instead, email us at [security@ai-dev-team-agent.com].

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows 10]
 - VS Code Version: [e.g. 1.87.0]
 - Extension Version: [e.g. 0.1.0]

**Additional context**
Add any other context about the problem here.
```

## Suggesting Enhancements

### Enhancement Template

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## Development Tips

### Debugging

- Use VS Code's built-in debugger
- Add `console.log` statements for quick debugging
- Use the Extension Development Host for testing

### Performance

- Monitor token usage in LLM calls
- Optimize file I/O operations
- Use caching where appropriate

### Agent Development

When creating new agents:

1. **Extend BaseAgent class**
2. **Implement required methods**
3. **Add comprehensive error handling**
4. **Include progress reporting**
5. **Test with various project types**

## Questions?

Don't hesitate to ask questions! You can:

- **Open an issue** for general questions
- **Join our Discord** for real-time discussion
- **Email us** at [dev@ai-dev-team-agent.com]

## Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **Release notes** for significant contributions
- **Hall of Fame** on our website

Thank you for contributing to AI Dev Team Agent! 🚀
