/**
 * AI Dev Team Agent - Code Tester Agent
 * 
 * Performs static analysis and testing of the generated code.
 * Identifies bugs, issues, and areas for improvement.
 */

import * as path from 'path';
import { BaseAgent } from './BaseAgent';
import { AgentResult, WorkflowContext, WorkflowState, LLMRequest, AgentRole } from '../types';
import { FileSystemHelper } from '../utils/fileSystem';

// Local interfaces for CodeTesterAgent
interface CodeIssue {
    type: string;
    severity: string;
    category: string;
    message: string;
    file: string;
    line?: number;
    column?: number;
    code?: string;
    suggestion?: string;
}

interface AnalysisData {
    issues: CodeIssue[];
    summary?: string | {
        totalIssues: number;
        criticalIssues: number;
        warnings: number;
        info: number;
    };
    tokensUsed?: number;
    filesAnalyzed?: string[];
    filePath?: string;
    [key: string]: unknown;
}

export class CodeTesterAgent extends BaseAgent {
    name = 'Code Tester Agent';
    description = 'Analyzes code for errors, completeness, and quality';
    protected role = AgentRole.CODE_TESTER;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(context: WorkflowContext, ..._args: unknown[]): Promise<AgentResult> {
        try {
            // Basic context validation
            if (!context.workspacePath || !context.projectPath) {
                return this.createErrorResult('Invalid workflow context');
            }
            
            this.log('Starting comprehensive code analysis...');

            // Run complete code analysis workflow
            const analysisResult = await this.runCodeAnalysis(context);
            
            if (!analysisResult.success) {
                return analysisResult;
            }

            // Generate comprehensive test report
            const reportResult = await this.generateTestReport(context, analysisResult.data as AnalysisData);
            
            if (!reportResult.success) {
                return reportResult;
            }            // Determine next workflow state based on findings
            const analysisData = analysisResult.data as { issues?: unknown[]; tokensUsed?: number } | undefined;
            const hasIssues = analysisData?.issues && Array.isArray(analysisData.issues) && analysisData.issues.length > 0;
            const nextState = hasIssues ? WorkflowState.BugFixing : WorkflowState.ReadyForEnhancement;

            return this.createSuccessResult(
                hasIssues 
                    ? '⚠️ Code analysis complete - issues found requiring fixes'
                    : '✅ Code analysis complete - no critical issues found',
                {
                    filesCreated: reportResult.filesCreated,
                    nextState,
                    data: { 
                        issuesFound: Array.isArray(analysisData?.issues) ? analysisData.issues.length : 0,
                        tokensUsed: (analysisData?.tokensUsed || 0) + ((reportResult.data as { tokensUsed?: number })?.tokensUsed || 0)
                    }
                }
            );

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.log(`Code analysis failed: ${errorMessage}`, 'error');
            return this.createErrorResult(`Code analysis failed: ${errorMessage}`);
        }
    }

    private async runCodeAnalysis(context: WorkflowContext): Promise<AgentResult> {
        try {
            // Find all project files to analyze
            const projectFiles = await this.findProjectFiles(context.workspacePath);
            this.log(`Found ${projectFiles.length} files to analyze`);

            const issues: CodeIssue[] = [];
            let totalTokensUsed = 0;

            // Analyze each file
            for (const filePath of projectFiles) {
                const fileAnalysis = await this.analyzeFile(filePath, context);
                if (fileAnalysis.issues) {
                    issues.push(...fileAnalysis.issues);
                }
                totalTokensUsed += fileAnalysis.tokensUsed || 0;
            }

            // Check for completeness against checklist
            const completenessCheck = await this.checkCompleteness(context);
            if (completenessCheck.issues) {
                issues.push(...completenessCheck.issues);
            }
            totalTokensUsed += completenessCheck.tokensUsed || 0;            return this.createSuccessResult(
                `Analyzed ${projectFiles.length} files`,
                { data: { issues, tokensUsed: totalTokensUsed } }
            );

        } catch (error) {
            return this.createErrorResult(`Code analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private async findProjectFiles(_workspacePath: string): Promise<string[]> {
        const patterns = [
            '**/*.js',
            '**/*.ts',
            '**/*.jsx',
            '**/*.tsx',
            '**/*.html',
            '**/*.css',
            '**/*.json',
            '**/*.md'
        ];

        const excludePatterns = [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/.git/**',
            '**/coverage/**'
        ];

        let allFiles: string[] = [];

        for (const pattern of patterns) {
            try {                const files = await FileSystemHelper.findFiles(pattern, `{${excludePatterns.join(',')}}`);
                allFiles.push(...files);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (_error) {
                this.log(`Warning: Could not find files with pattern ${pattern}`, 'warn');
            }
        }

        // Remove duplicates
        return [...new Set(allFiles)];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private async analyzeFile(filePath: string, _context: WorkflowContext): Promise<AnalysisData> {        try {
            const fileContent = await FileSystemHelper.readFile(filePath);
            const fileExtension = FileSystemHelper.getFileExtension(filePath);
            const fileName = FileSystemHelper.getFileName(filePath);

            const request: LLMRequest = {
                prompt: `Analyze this ${fileExtension} file for errors, completeness, and code quality issues:

FILE: ${fileName}${fileExtension}
CONTENT:
${fileContent}

Please identify:
1. Syntax errors or compilation issues
2. Runtime errors or logical problems
3. Incomplete functions or methods
4. Missing imports or dependencies
5. Code quality issues (naming, structure, etc.)
6. Security vulnerabilities
7. Performance issues

Format your response as JSON with this structure:
{
  "issues": [
    {
      "type": "error|warning|suggestion",
      "category": "syntax|logic|completeness|quality|security|performance",
      "line": number,
      "message": "description of the issue",
      "severity": "critical|high|medium|low",
      "suggestion": "how to fix this issue"
    }
  ],
  "summary": "overall assessment of the file"
}`,
                systemMessage: `You are a code analysis expert. Analyze code files thoroughly for issues and provide actionable feedback. Focus on correctness, completeness, and best practices.`
            };

            const response = await this.callLLM(request);
            
            try {
                const analysis = JSON.parse(response.content);
                return {
                    filePath,
                    issues: analysis.issues || [],
                    summary: analysis.summary,
                    tokensUsed: response.usage?.totalTokens || 0
                };            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (_parseError) {
                // If JSON parsing fails, treat the whole response as a single issue
                return {
                    filePath,
                    issues: [{
                        type: 'warning',
                        category: 'analysis',
                        file: filePath,
                        line: 0,
                        message: `Analysis response could not be parsed: ${response.content.substring(0, 200)}...`,
                        severity: 'medium',
                        suggestion: 'Review the file manually'
                    }],
                    summary: 'Analysis response format error',
                    tokensUsed: response.usage?.totalTokens || 0
                };
            }

        } catch (error) {
            return {
                filePath,
                issues: [{
                    type: 'error',
                    category: 'analysis',
                    file: filePath,
                    line: 0,
                    message: `Failed to analyze file: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    severity: 'high',
                    suggestion: 'Check file accessibility and content'
                }],
                summary: 'Analysis failed',
                tokensUsed: 0
            };
        }
    }

    private async checkCompleteness(context: WorkflowContext): Promise<AnalysisData> {
        try {
            const checklistPath = path.join(context.workspacePath, 'Dev_Checklist.md');
              if (!(await FileSystemHelper.fileExists(checklistPath))) {
                return {
                    issues: [{
                        type: 'warning',
                        category: 'completeness',
                        file: checklistPath,
                        line: 0,
                        message: 'Dev_Checklist.md not found - cannot verify completeness',
                        severity: 'medium',
                        suggestion: 'Create or regenerate the development checklist'
                    }],
                    tokensUsed: 0
                };
            }const checklistContent = await FileSystemHelper.readFile(checklistPath);
            const projectContent = await FileSystemHelper.readFile(context.projectPath);

            const request: LLMRequest = {
                prompt: `Compare the project requirements with the development checklist to identify missing or incomplete features:

PROJECT REQUIREMENTS:
${projectContent}

DEVELOPMENT CHECKLIST:
${checklistContent}

Check if all requirements from the project have been addressed in the checklist and identify:
1. Missing features or requirements
2. Incomplete checklist items
3. Requirements that may have been overlooked
4. Essential features that should be added

Respond in JSON format:
{
  "issues": [
    {
      "type": "error|warning|suggestion",
      "category": "completeness",
      "message": "description of what's missing or incomplete",
      "severity": "critical|high|medium|low",
      "suggestion": "what should be added or completed"
    }
  ],
  "completeness_score": 0-100,
  "summary": "overall completeness assessment"
}`,
                systemMessage: 'You are a project completeness analyzer. Compare requirements with implementation plans to identify gaps.'
            };

            const response = await this.callLLM(request);
            
            try {
                const analysis = JSON.parse(response.content);
                return {
                    issues: analysis.issues || [],
                    completenessScore: analysis.completeness_score,
                    summary: analysis.summary,
                    tokensUsed: response.usage?.totalTokens || 0
                };            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (_parseError) {
                return {
                    issues: [{
                        type: 'warning',
                        category: 'completeness',
                        file: checklistPath,
                        message: 'Could not parse completeness analysis',
                        severity: 'low',
                        suggestion: 'Review project completeness manually'
                    }],
                    tokensUsed: response.usage?.totalTokens || 0
                };
            }

        } catch (error) {
            return {
                issues: [{
                    type: 'error',
                    category: 'completeness',
                    file: context.projectPath,
                    message: `Completeness check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    severity: 'medium',
                    suggestion: 'Review project completeness manually'
                }],
                tokensUsed: 0
            };
        }
    }

    private async generateTestReport(context: WorkflowContext, analysisData: AnalysisData): Promise<AgentResult> {
        try {
            const issues = analysisData.issues || [];
            const reportPath = path.join(context.workspacePath, 'Code_Tester_Report.md');

            // Group issues by category and severity
            const issuesByCategory = this.groupIssuesByCategory(issues);
            const issuesBySeverity = this.groupIssuesBySeverity(issues);

            const reportContent = `# Code Analysis Report

Generated: ${new Date().toISOString()}
Total Issues Found: ${issues.length}

## Summary

${this.generateSummarySection(issuesBySeverity)}

## Issues by Category

${this.generateCategorySection(issuesByCategory)}

## Critical Issues

${this.generateCriticalIssuesSection(issues)}

## Detailed Analysis

${this.generateDetailedIssuesSection(issues)}

## Recommendations

${this.generateRecommendationsSection(issues)}

---
*Report generated by AI Dev Team Code Tester Agent*
`;

            await FileSystemHelper.writeFile(reportPath, reportContent);

            return this.createSuccessResult(
                'Generated comprehensive code analysis report',
                { 
                    filesCreated: [reportPath],
                    data: { tokensUsed: 0 } // No LLM tokens used for report generation
                }
            );

        } catch (error) {
            return this.createErrorResult(`Failed to generate test report: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }    private groupIssuesByCategory(issues: CodeIssue[]): Record<string, CodeIssue[]> {
        return issues.reduce((groups, issue) => {
            const category = issue.category || 'other';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(issue);
            return groups;
        }, {} as Record<string, CodeIssue[]>);
    }    private groupIssuesBySeverity(issues: CodeIssue[]): Record<string, CodeIssue[]> {
        return issues.reduce((groups, issue) => {
            const severity = issue.severity || 'low';
            if (!groups[severity]) {
                groups[severity] = [];
            }
            groups[severity].push(issue);
            return groups;
        }, {} as Record<string, CodeIssue[]>);
    }

    private generateSummarySection(issuesBySeverity: Record<string, CodeIssue[]>): string {
        const severityOrder = ['critical', 'high', 'medium', 'low'];
        let summary = '';

        for (const severity of severityOrder) {
            const count = issuesBySeverity[severity]?.length || 0;
            if (count > 0) {
                const emoji = {
                    critical: '🔴',
                    high: '🟠',
                    medium: '🟡',
                    low: '🟢'
                }[severity];
                summary += `- ${emoji} **${severity.toUpperCase()}**: ${count} issues\n`;
            }
        }

        return summary || '✅ No issues found';
    }

    private generateCategorySection(issuesByCategory: Record<string, CodeIssue[]>): string {
        let content = '';

        for (const [category, categoryIssues] of Object.entries(issuesByCategory)) {
            content += `### ${category.charAt(0).toUpperCase() + category.slice(1)} (${categoryIssues.length})\n\n`;
            
            for (const issue of categoryIssues.slice(0, 5)) { // Limit to top 5 per category
                content += `- **${issue.type?.toUpperCase() || 'ISSUE'}**: ${issue.message}\n`;
                if (issue.suggestion) {
                    content += `  - *Suggestion*: ${issue.suggestion}\n`;
                }
            }
            
            if (categoryIssues.length > 5) {
                content += `- ... and ${categoryIssues.length - 5} more issues\n`;
            }
            
            content += '\n';
        }

        return content || 'No issues found by category.';
    }

    private generateCriticalIssuesSection(issues: CodeIssue[]): string {
        const criticalIssues = issues.filter(issue => 
            issue.severity === 'critical' || issue.severity === 'high'
        );

        if (criticalIssues.length === 0) {
            return '✅ No critical issues found.';
        }

        let content = '';
        for (const issue of criticalIssues) {
            content += `### ${issue.message}\n\n`;
            content += `**File**: ${issue.file || 'Unknown'}\n`;
            content += `**Line**: ${issue.line || 'N/A'}\n`;
            content += `**Severity**: ${issue.severity?.toUpperCase() || 'UNKNOWN'}\n`;
            content += `**Category**: ${issue.category || 'other'}\n\n`;
            
            if (issue.suggestion) {
                content += `**Solution**: ${issue.suggestion}\n\n`;
            }
            
            content += '---\n\n';
        }

        return content;
    }

    private generateDetailedIssuesSection(issues: CodeIssue[]): string {
        if (issues.length === 0) {
            return '✅ No detailed issues to report.';
        }        let content = '';
        const groupedByFile = issues.reduce((groups, issue) => {
            const file = issue.file || 'Unknown File';
            if (!groups[file]) {
                groups[file] = [];
            }
            groups[file].push(issue);
            return groups;
        }, {} as Record<string, CodeIssue[]>);

        for (const [filePath, fileIssues] of Object.entries(groupedByFile)) {
            content += `### ${path.basename(filePath)}\n\n`;
            
            for (const issue of fileIssues) {const severityEmoji = {
                    critical: '🔴',
                    high: '🟠',
                    medium: '🟡',
                    low: '🟢'
                }[issue.severity as 'critical' | 'high' | 'medium' | 'low'] || '⚪';
                
                content += `${severityEmoji} **Line ${issue.line || 'N/A'}**: ${issue.message}\n`;
                if (issue.suggestion) {
                    content += `   💡 *${issue.suggestion}*\n`;
                }
                content += '\n';
            }
        }

        return content;
    }

    private generateRecommendationsSection(issues: CodeIssue[]): string {
        const recommendations = new Set<string>();

        // Generate general recommendations based on issue patterns
        const categories = [...new Set(issues.map(issue => issue.category))];
        
        if (categories.includes('syntax')) {
            recommendations.add('Consider using a linter and IDE with syntax checking to catch syntax errors early');
        }
        
        if (categories.includes('security')) {
            recommendations.add('Implement security scanning as part of your development workflow');
        }
        
        if (categories.includes('performance')) {
            recommendations.add('Consider performance testing and optimization as part of your development process');
        }
        
        if (categories.includes('completeness')) {
            recommendations.add('Review project requirements and ensure all features are properly implemented');
        }

        // Add specific recommendations from issues
        issues.forEach(issue => {
            if (issue.suggestion && issue.severity === 'critical') {
                recommendations.add(issue.suggestion);
            }
        });

        if (recommendations.size === 0) {
            return '✅ Code quality looks good! Continue following best practices.';
        }

        return Array.from(recommendations)
            .map((rec, index) => `${index + 1}. ${rec}`)
            .join('\n');
    }
}
