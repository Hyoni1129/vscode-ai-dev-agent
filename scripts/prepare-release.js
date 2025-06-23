#!/usr/bin/env node

/**
 * This script helps with preparing releases
 * Usage: node prepare-release.js <version>
 * Example: node prepare-release.js 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get version from command line
const newVersion = process.argv[2];
if (!newVersion) {
    console.error('Please provide a version number');
    console.error('Usage: node prepare-release.js <version>');
    process.exit(1);
}

// Validate version format (semver)
const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
if (!semverRegex.test(newVersion)) {
    console.error('Invalid version format. Please use semantic versioning (e.g., 1.0.0)');
    process.exit(1);
}

// Update package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const oldVersion = packageJson.version;
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log(`Updated package.json from ${oldVersion} to ${newVersion}`);

// Update CHANGELOG.md
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
const changelog = fs.readFileSync(changelogPath, 'utf8');
const today = new Date().toISOString().split('T')[0];
const newChangelogEntry = `## ${newVersion} (${today})\n\n- TODO: Add release notes\n\n`;
const updatedChangelog = changelog.replace('# Change Log\n\n', `# Change Log\n\n${newChangelogEntry}`);
fs.writeFileSync(changelogPath, updatedChangelog);
console.log(`Updated CHANGELOG.md with entry for version ${newVersion}`);

// Print next steps
console.log('\nNext steps:');
console.log('1. Update the CHANGELOG.md with the actual release notes');
console.log('2. Commit the changes:');
console.log(`   git commit -am "Prepare release ${newVersion}"`);
console.log('3. Create a tag:');
console.log(`   git tag v${newVersion}`);
console.log('4. Push the changes:');
console.log('   git push && git push --tags');
console.log('5. Create the package:');
console.log('   npm run package');
