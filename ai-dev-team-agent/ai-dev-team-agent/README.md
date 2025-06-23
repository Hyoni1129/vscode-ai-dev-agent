# AI Dev Team Agent

An intelligent VS Code extension that automates development workflows using specialized AI agents. This extension provides a complete development team simulation with dedicated agents for project management, development, code testing, enhancement, and web testing.

## Features

- **Project Management Agent (PM)**: Creates project structures, manages tasks, and coordinates workflow
- **Development Agent (Dev)**: Implements features, fixes bugs, and handles code development
- **Code Tester Agent**: Analyzes code quality, runs tests, and identifies issues
- **Enhancement Agent**: Reviews and improves code based on feedback and best practices
- **Web Tester Agent**: Performs web-specific testing including cross-browser compatibility

### Key Capabilities

- Automated project setup and structure creation
- Intelligent code generation and implementation
- Comprehensive testing and quality assurance
- Cross-browser web testing with Playwright
- Continuous improvement through enhancement cycles
- Integrated chat interface for easy interaction

## Requirements

- VS Code version 1.85.0 or higher
- Node.js for JavaScript/TypeScript projects
- Internet connection for AI model access

## Usage

1. Open a workspace in VS Code
2. Create a `Project.md` file describing your project requirements
3. Use the chat interface with commands:
   - `@ai-dev-team /start` - Initialize and start the development workflow
   - `@ai-dev-team /status` - Check current workflow status
   - `@ai-dev-team /reset` - Reset workflow state

### Example Project.md

```markdown
# My Web Application

## Description
A simple task management web application with CRUD operations.

## Requirements
- HTML/CSS/JavaScript
- Responsive design
- Local storage for data persistence
- Modern browser compatibility

## Features
- Add/edit/delete tasks
- Mark tasks as complete
- Filter tasks by status
- Clean, modern UI
```

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## 🚀 Getting Started

### Prerequisites
- VS Code 1.85.0 or higher
- GitHub Copilot extension (for LLM access)

### Installation & Usage

1. **Load the Extension**:
   - Press `F5` to open Extension Development Host
   - Or package with `vsce package` and install the .vsix file

2. **Create a Project Description**:
   - Create a `Project.md` file with your project requirements
   - See `examples/Project-TaskManager-Sample.md` for reference

3. **Start the Automated Workflow**:
   ```
   @ai-dev-team /start
   ```

4. **Monitor Progress**:
   ```
   @ai-dev-team /status
   ```

5. **Available Commands**:
   - `/start` - Begin automated development workflow
   - `/status` - Check current progress
   - `/resume` - Resume interrupted workflow
   - `/reset` - Reset workflow state

### Example Workflow
1. Create `Project.md` with your project description
2. Open VS Code chat and type: `@ai-dev-team /start`
3. The system will automatically:
   - Analyze your project requirements
   - Create development checklist
   - Generate code files
   - Test the implementation
   - Suggest improvements
   - Iterate until complete

## 🛠️ Development

### Building from Source
```bash
npm install
npm run compile
```

### Running Tests
```bash
npm test
```

### Debugging
Press `F5` to launch the extension in debug mode.

---

## 📚 Documentation

For detailed documentation, see:
- [User Guide](docs/guides/user-guide.md)
- [API Documentation](docs/api/README.md)
- [Development Guide](docs/DEVELOPMENT.md)

**Enjoy automated development with AI agents!**
