# ai-dev-team-agent README

This is the README for your extension "ai-dev-team-agent". After writing up a brief description, we recommend including the following sections.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

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
- [Auto_Agent_Project_Workflow.md](../../Markdown/Auto_Agent_Project_Workflow.md)
- [Enhanced_Implementation_Plan.md](../../Markdown/Enhanced_Implementation_Plan.md)

**Enjoy automated development with AI agents!**
