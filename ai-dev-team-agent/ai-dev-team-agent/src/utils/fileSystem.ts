import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class FileSystemHelper {
    /**
     * Read a file from the workspace
     */
    static async readFile(filePath: string): Promise<string> {
        try {
            const uri = vscode.Uri.file(filePath);
            const content = await vscode.workspace.fs.readFile(uri);
            return Buffer.from(content).toString('utf8');
        } catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error}`);
        }
    }

    /**
     * Write content to a file in the workspace
     */
    static async writeFile(filePath: string, content: string): Promise<void> {
        try {
            const uri = vscode.Uri.file(filePath);
            const encoder = new TextEncoder();
            await vscode.workspace.fs.writeFile(uri, encoder.encode(content));
        } catch (error) {
            throw new Error(`Failed to write file ${filePath}: ${error}`);
        }
    }

    /**
     * Check if a file exists
     */
    static async fileExists(filePath: string): Promise<boolean> {
        try {
            const uri = vscode.Uri.file(filePath);
            await vscode.workspace.fs.stat(uri);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Create a directory
     */
    static async createDirectory(dirPath: string): Promise<void> {
        try {
            const uri = vscode.Uri.file(dirPath);
            await vscode.workspace.fs.createDirectory(uri);
        } catch (error) {
            throw new Error(`Failed to create directory ${dirPath}: ${error}`);
        }
    }

    /**
     * List files in a directory
     */
    static async listFiles(dirPath: string): Promise<string[]> {
        try {
            const uri = vscode.Uri.file(dirPath);
            const entries = await vscode.workspace.fs.readDirectory(uri);
            return entries
                .filter(([, type]) => type === vscode.FileType.File)
                .map(([name]) => name);
        } catch (error) {
            throw new Error(`Failed to list files in ${dirPath}: ${error}`);
        }
    }

    /**
     * Get the workspace root path
     */
    static getWorkspaceRoot(): string {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }
        return workspaceFolder.uri.fsPath;
    }

    /**
     * Get relative path from workspace root
     */
    static getRelativePath(filePath: string): string {
        const workspaceRoot = this.getWorkspaceRoot();
        return path.relative(workspaceRoot, filePath);
    }

    /**
     * Get absolute path from workspace root
     */
    static getAbsolutePath(relativePath: string): string {
        const workspaceRoot = this.getWorkspaceRoot();
        return path.join(workspaceRoot, relativePath);
    }

    /**
     * Find files matching a pattern in the workspace
     */
    static async findFiles(pattern: string, exclude?: string): Promise<string[]> {
        try {
            const files = await vscode.workspace.findFiles(pattern, exclude);
            return files.map(uri => uri.fsPath);
        } catch (error) {
            throw new Error(`Failed to find files with pattern ${pattern}: ${error}`);
        }
    }

    /**
     * Watch for file changes
     */
    static watchFile(filePath: string, callback: (uri: vscode.Uri) => void): vscode.Disposable {
        const watcher = vscode.workspace.createFileSystemWatcher(filePath);
        watcher.onDidChange(callback);
        watcher.onDidCreate(callback);
        watcher.onDidDelete(callback);
        return watcher;
    }

    /**
     * Get file extension
     */
    static getFileExtension(filePath: string): string {
        return path.extname(filePath).toLowerCase();
    }

    /**
     * Get file name without extension
     */
    static getFileName(filePath: string): string {
        return path.basename(filePath, path.extname(filePath));
    }

    /**
     * Get directory name
     */
    static getDirName(filePath: string): string {
        return path.dirname(filePath);
    }

    /**
     * Check if path is a directory
     */
    static async isDirectory(dirPath: string): Promise<boolean> {
        try {
            const uri = vscode.Uri.file(dirPath);
            const stat = await vscode.workspace.fs.stat(uri);
            return stat.type === vscode.FileType.Directory;
        } catch {
            return false;
        }
    }

    /**
     * Delete a file
     */
    static async deleteFile(filePath: string): Promise<void> {
        try {
            const uri = vscode.Uri.file(filePath);
            await vscode.workspace.fs.delete(uri);
        } catch (error) {
            throw new Error(`Failed to delete file ${filePath}: ${error}`);
        }
    }

    /**
     * Copy a file
     */
    static async copyFile(sourcePath: string, targetPath: string): Promise<void> {
        try {
            const sourceUri = vscode.Uri.file(sourcePath);
            const targetUri = vscode.Uri.file(targetPath);
            await vscode.workspace.fs.copy(sourceUri, targetUri);
        } catch (error) {
            throw new Error(`Failed to copy file from ${sourcePath} to ${targetPath}: ${error}`);
        }
    }
}
