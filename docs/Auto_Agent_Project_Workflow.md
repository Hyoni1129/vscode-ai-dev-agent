AI Agent-Based Automated Development Workflow

This document outlines an automated software development process managed by a team of specialized AI agents. The workflow begins with a user-defined project description and proceeds through development, testing, and enhancement cycles, minimizing manual intervention.

1. Agent Roles & Responsibilities

Here are the specialized agents in the system and their core functions.

* PM Agent (Project Manager Agent)

* Role: Acts as the central coordinator of the project.

* Responsibilities:

* Analyzes the initial Project.md to create a detailed development plan, outputting it as Dev_Checklist.md.

* Receives the Error_Fix_Report.md from the DEV Agent, confirming that the initial development and bug fixes are complete.

* Synthesizes a Project_Current_Report.md and delivers it to the EA (Enhancement Agent) for review.

* Analyzes the Enhancement_Report.md from the EA, translates actionable feedback into a Dev_Enhanced_Checklist.md, and assigns it to the DEV Agent for implementation.

* Manages the iterative enhancement loop until no further improvements are suggested.

* DEV Agent (Developer Agent)

* Role: The primary agent responsible for writing and debugging code.

* Responsibilities:

* Understands the high-level project goals from Project.md and implements features by following the tasks in Dev_Checklist.md or Dev_Enhanced_Checklist.md.

* Receives Tester_Report.md from the Tester Agents and systematically resolves all reported errors.

* Reports the completion of bug fixes by generating Error_Fix_Report.md for the PM Agent.

* Reports the completion of enhancement tasks by generating Completion_Report.md for the PM Agent.

* Code Tester Agent

* Role: Performs static and logical analysis of the codebase.

* Responsibilities:

* Once the DEV Agent completes the checklist, this agent meticulously analyzes the source code.

* It verifies the correct implementation of all features, checks for unimplemented parts, build errors, and logical flaws in key workflows.

* Compiles all findings into a Code_Tester_Report.md and sends it to the DEV Agent for debugging.

* Web Tester Agent (Optional)

* Role: Conducts dynamic testing for web-based projects.

* Responsibilities:

* When activated for web projects, it launches the application and simulates user interactions (e.g., clicking buttons, filling forms).

* Monitors the browser console for runtime errors and reports them.

* Findings are documented in a Web_Tester_Report.md.

* Note: This agent utilizes Playwright for browser automation. To manage token consumption, Playwright should be activated exclusively for this agent and deactivated immediately after use.

* EA (Enhancement Agent)

* Role: Acts as a product and UX/UI specialist.

* Responsibilities:

* Evaluates the project's current state based on Project_Current_Report.md and the original Project.md.

* Identifies potential improvements, such as UI/UX enhancements or valuable new features.

* Generates a detailed Enhancement_Report.md with concrete suggestions and delivers it to the PM Agent.

2. Automated Workflow

The entire process unfolds in the following automated sequence:

* Project Initiation: The user provides a detailed description of the desired web application, game, or software in a Project.md file.

* Activation: The user attaches Project.md and invokes the PM Agent within their IDE (e.g., VS Code Copilot chat). This action triggers the automated workflow.

* Initial Planning: The PM Agent analyzes Project.md, creates Dev_Checklist.md, and invokes the DEV Agent.

* Core Development: The DEV Agent follows the Dev_Checklist.md to implement all required features. Upon completion, it invokes the Code Tester Agent.

* Code Testing & Reporting: The Code Tester Agent analyzes the code, generates Code_Tester_Report.md, and sends it back to the DEV Agent.

* Bug Fixing: The DEV Agent resolves all issues listed in the report and, upon completion, sends Error_Fix_Report.md to the PM Agent.

* Initiating Enhancement Phase: The PM Agent, confirming the project is stable, generates Project_Current_Report.md and passes it to the EA (Enhancement Agent).

* Feedback & Suggestions: The EA reviews the project, identifies areas for improvement, and creates an Enhancement_Report.md, which is sent to the PM Agent.

* Planning Enhancements: The PM Agent analyzes the Enhancement_Report.md, creates a new Dev_Enhanced_Checklist.md, and assigns it to the DEV Agent.

* Implementing Enhancements: The DEV Agent implements the new features and improvements. Once finished, it returns a Completion_Report.md to the PM Agent.

* Iterative Loop: The PM Agent re-engages the EA to review the latest changes.

* If the EA provides further suggestions, steps 8-11 are repeated.

* If the EA confirms the project is complete and no further enhancements are needed, the loop terminates. The user is then notified that the project is successfully completed.