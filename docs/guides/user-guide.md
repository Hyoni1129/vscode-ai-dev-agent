# VS Code AI Dev Agent User Guide

This guide provides detailed instructions on how to use the VS Code AI Dev Agent extension effectively.

## Getting Started

### Installation

1. Install the extension from the VS Code Marketplace
2. Alternatively, download the VSIX file and install it manually:
   ```
   code --install-extension vscode-ai-dev-agent-0.1.0.vsix
   ```

### Setting Up Your Project

1. Open a workspace in VS Code where you want to create or develop a project
2. Create a `Project.md` file in the root of your workspace
3. Define your project requirements in the Markdown file (see format below)

### Project.md Format

Your `Project.md` file should include:

```markdown
# Project Name

## Description
A clear description of what your project does.

## Requirements
- List technical requirements
- Languages and frameworks
- Platform compatibility
- Performance needs

## Features
- Detailed list of features
- User interactions
- Data management
- UI/UX requirements
```

## Using the Chat Interface

The VS Code AI Dev Agent is accessible through VS Code's chat interface:

### Starting a Workflow

To start the development workflow:

```
@ai-dev-team /start
```

### Checking Status

To check the current status of your workflow:

```
@ai-dev-team /status
```

### Resetting a Workflow

If you need to start over:

```
@ai-dev-team /reset
```

## Understanding the Workflow

The VS Code AI Dev Agent follows this process:

1. **Project Analysis**: The PM Agent analyzes your project requirements
2. **Planning**: Tasks are identified and organized
3. **Development**: The Dev Agent implements your features
4. **Testing**: The Code Tester Agent validates the implementation
5. **Enhancement**: The Enhancement Agent improves the code
6. **Web Testing**: For web projects, the Web Tester ensures cross-browser compatibility

## Configuration Options

The extension can be configured through VS Code settings:

- `aiDevTeam.defaultModel`: Set the default LLM model
- `aiDevTeam.enableWebTesting`: Enable/disable web testing capabilities
- `aiDevTeam.autoSave`: Automatically save files during the workflow

## Best Practices

- Be detailed in your project requirements
- Break complex projects into smaller, focused descriptions
- Review the generated code and provide feedback
- Use the workflow incrementally for large projects

## Troubleshooting

### Common Issues

- **Workflow stalls**: Try the `/reset` command and start again
- **Incomplete analysis**: Provide more detailed requirements
- **Memory issues**: Break your project into smaller chunks

### Getting Help

If you encounter issues:
1. Check the extension's Output panel for logs
2. Visit our GitHub repository to report issues
3. Check the documentation for updates
