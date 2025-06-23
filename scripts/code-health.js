#!/usr/bin/env node

/**
 * This script checks the health of the codebase
 * Usage: node code-health.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

console.log(`${colors.cyan}=====================================${colors.reset}`);
console.log(`${colors.cyan}      AI Dev Team Agent Health Check ${colors.reset}`);
console.log(`${colors.cyan}=====================================${colors.reset}\n`);

// Track overall status
let success = true;

function runCheck(name, command) {
    console.log(`${colors.blue}Running ${name}...${colors.reset}`);
    try {
        const output = execSync(command, { encoding: 'utf8' });
        console.log(`${colors.green}✓ ${name} passed${colors.reset}\n`);
        return true;
    } catch (error) {
        console.log(`${colors.red}✗ ${name} failed${colors.reset}`);
        console.log(`${error.stdout || error.message}\n`);
        return false;
    }
}

// Check TypeScript compilation
success = runCheck('TypeScript compilation', 'npm run compile') && success;

// Check linting
success = runCheck('ESLint', 'npm run lint') && success;

// Check tests
success = runCheck('Tests', 'npm test') && success;

// Check for FIXME and TODO comments
console.log(`${colors.blue}Checking for FIXME and TODO comments...${colors.reset}`);
try {
    const output = execSync('grep -r "FIXME\\|TODO" --include="*.ts" ./src', { encoding: 'utf8' });
    console.log(`${colors.yellow}! Found TODOs or FIXMEs:${colors.reset}`);
    console.log(output);
    console.log(`${colors.yellow}These aren't failures but should be addressed.${colors.reset}\n`);
} catch (error) {
    if (error.status === 1) {
        console.log(`${colors.green}✓ No FIXME or TODO comments found${colors.reset}\n`);
    } else {
        console.log(`${colors.red}Error checking for FIXME/TODO: ${error.message}${colors.reset}\n`);
    }
}

// Check if extension can be packaged
console.log(`${colors.blue}Checking if extension can be packaged...${colors.reset}`);
try {
    // Use --no-dependencies to make it quicker
    execSync('npx @vscode/vsce package --no-dependencies --yarn', { encoding: 'utf8' });
    console.log(`${colors.green}✓ Extension packaging looks good${colors.reset}\n`);
} catch (error) {
    console.log(`${colors.red}✗ Extension packaging failed${colors.reset}`);
    console.log(`${error.stdout || error.message}\n`);
    success = false;
}

// Final summary
if (success) {
    console.log(`${colors.green}✓ All checks passed${colors.reset}`);
} else {
    console.log(`${colors.red}✗ Some checks failed${colors.reset}`);
    process.exit(1);
}
