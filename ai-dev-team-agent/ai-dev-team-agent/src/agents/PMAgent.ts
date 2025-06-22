/**
 * AI Dev Team Agent - Project Manager Agent
 * 
 * Handles project planning, coordination, and workflow management.
 * Creates development checklists and manages enhancement phases.
 */

import * as path from 'path';
import { BaseAgent } from './BaseAgent';
import { AgentResult, WorkflowContext, WorkflowState } from '../types';

export class PMAgent extends BaseAgent {
    name = 'Project Manager Agent';
    description = 'Handles project planning, coordination, and workflow management';

    async execute(context: WorkflowContext, action: string): Promise<AgentResult> {
        this.log(`Executing action: ${action}`);
        
        switch (action) {
            case 'initial_plan':
                return await this.createInitialPlan(context);
            case 'prepare_enhancement':
                return await this.prepareEnhancementPhase(context);
            case 'plan_enhancement':
                return await this.planEnhancement(context);
            default:
                return this.createErrorResult(`Unknown action: ${action}`);
        }
    }

    private async createInitialPlan(context: WorkflowContext): Promise<AgentResult> {
        try {
            this.log('Creating initial development plan');
            
            // Read the project description
            const projectContent = await this.getFileContent(context.projectPath);
            
            const prompt = `As a Project Manager AI, analyze this project description and create a comprehensive development checklist.

PROJECT DESCRIPTION:
${projectContent}

Create a detailed markdown checklist named "Dev_Checklist.md" with:
1. Project setup tasks (folder structure, package.json, etc.)
2. Core feature implementation tasks
3. UI/UX implementation tasks
4. Testing setup tasks
5. Documentation tasks

Each task should be:
- Specific and actionable
- Include file names and paths where applicable
- Ordered logically by dependencies
- Marked with [ ] for checkboxes

Format as proper markdown with clear sections.`;

            const response = await this.callLLM({ prompt });
            const checklistPath = path.join(context.workspacePath, 'Dev_Checklist.md');
            
            const writeResult = await this.writeFile(checklistPath, response.content);
            if (!writeResult.success) {
                return this.createErrorResult(`Failed to write checklist: ${writeResult.error}`);
            }            return this.createSuccessResult('✅ Created comprehensive development checklist', {
                filesCreated: [checklistPath],
                nextState: WorkflowState.CoreDevelopment,
                tokensUsed: response.usage?.totalTokens || 0
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.log(`Failed to create initial plan: ${errorMessage}`, 'error');
            return this.createErrorResult(`Failed to create initial plan: ${errorMessage}`);
        }
    }

    private async prepareEnhancementPhase(context: WorkflowContext): Promise<AgentResult> {
        try {
            this.log('Preparing enhancement phase');
            
            // This is a simplified version - in full implementation, we would read all created files
            const projectContent = await this.getFileContent(context.projectPath);
            
            const prompt = `Create a comprehensive project status report for the Enhancement Agent.

ORIGINAL PROJECT REQUIREMENTS:
${projectContent}

CURRENT IMPLEMENTATION STATUS:
Project has been implemented with basic features.

Create a "Project_Current_Report.md" that includes:
1. Summary of implemented features
2. Current project structure
3. Key accomplishments
4. Areas that might need enhancement
5. Overall project status

Be objective and detailed.`;

            const response = await this.callLLM({ prompt });
            const reportPath = path.join(context.workspacePath, 'Project_Current_Report.md');
            
            const writeResult = await this.writeFile(reportPath, response.content);
            if (!writeResult.success) {
                return this.createErrorResult(`Failed to write report: ${writeResult.error}`);
            }            return this.createSuccessResult('✅ Created project status report for enhancement review', {
                filesCreated: [reportPath],
                nextState: WorkflowState.EnhancementReview,
                tokensUsed: response.usage?.totalTokens || 0
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.log(`Failed to prepare enhancement phase: ${errorMessage}`, 'error');
            return this.createErrorResult(`Failed to prepare enhancement phase: ${errorMessage}`);
        }
    }

    private async planEnhancement(context: WorkflowContext): Promise<AgentResult> {
        try {
            this.log('Planning enhancement implementation');
            
            const enhancementReportPath = path.join(context.workspacePath, 'Enhancement_Report.md');
            const enhancementReport = await this.getFileContent(enhancementReportPath);
            
            const prompt = `Based on this enhancement report, create a specific development checklist for implementing the suggested improvements.

ENHANCEMENT REPORT:
${enhancementReport}

Create a "Dev_Enhanced_Checklist.md" with:
1. Specific tasks for each suggested enhancement
2. Clear file modifications needed
3. New files to create
4. Dependencies between tasks
5. Testing requirements for new features

Each task should be actionable and specific.`;

            const response = await this.callLLM({ prompt });
            const enhancedChecklistPath = path.join(context.workspacePath, 'Dev_Enhanced_Checklist.md');
            
            const writeResult = await this.writeFile(enhancedChecklistPath, response.content);
            if (!writeResult.success) {
                return this.createErrorResult(`Failed to write enhanced checklist: ${writeResult.error}`);
            }            return this.createSuccessResult('✅ Created enhanced development checklist', {
                filesCreated: [enhancedChecklistPath],
                nextState: WorkflowState.ImplementingEnhancement,
                tokensUsed: response.usage?.totalTokens || 0
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.log(`Failed to plan enhancement: ${errorMessage}`, 'error');
            return this.createErrorResult(`Failed to plan enhancement: ${errorMessage}`);
        }
    }
}
