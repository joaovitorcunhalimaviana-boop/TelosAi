#!/usr/bin/env node

/**
 * API Verification Script
 * Verifies that all API endpoints and utilities are properly created
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function checkFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);

  if (exists) {
    const stats = fs.statSync(fullPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`${COLORS.green}✓${COLORS.reset} ${filePath} (${sizeKB} KB)`);
    return true;
  } else {
    console.log(`${COLORS.red}✗${COLORS.reset} ${filePath} ${COLORS.red}(MISSING)${COLORS.reset}`);
    return false;
  }
}

function checkDirectory(dirPath) {
  const fullPath = path.join(process.cwd(), dirPath);
  const exists = fs.existsSync(fullPath);

  if (exists) {
    console.log(`${COLORS.green}✓${COLORS.reset} ${dirPath}/`);
    return true;
  } else {
    console.log(`${COLORS.red}✗${COLORS.reset} ${dirPath}/ ${COLORS.red}(MISSING)${COLORS.reset}`);
    return false;
  }
}

console.log(`\n${COLORS.blue}=== API Verification Script ===${COLORS.reset}\n`);

// Check API endpoints
console.log(`${COLORS.yellow}API Endpoints:${COLORS.reset}`);
const endpoints = [
  'app/api/paciente/[id]/route.ts',
  'app/api/paciente/[id]/completeness/route.ts',
  'app/api/paciente/[id]/timeline/route.ts',
  'app/api/pacientes/route.ts',
  'app/api/dashboard/stats/route.ts',
];

let endpointsOk = true;
endpoints.forEach(file => {
  if (!checkFile(file)) endpointsOk = false;
});

// Check utility libraries
console.log(`\n${COLORS.yellow}Utility Libraries:${COLORS.reset}`);
const libraries = [
  'lib/api-utils.ts',
  'lib/api-validation.ts',
  'lib/api-middleware.ts',
];

let librariesOk = true;
libraries.forEach(file => {
  if (!checkFile(file)) librariesOk = false;
});

// Check documentation
console.log(`\n${COLORS.yellow}Documentation:${COLORS.reset}`);
const docs = [
  'docs/API_DOCUMENTATION.md',
  'docs/API_IMPLEMENTATION_REPORT.md',
  'docs/API_QUICK_REFERENCE.md',
];

let docsOk = true;
docs.forEach(file => {
  if (!checkFile(file)) docsOk = false;
});

// Check existing files
console.log(`\n${COLORS.yellow}Existing Files (should not be affected):${COLORS.reset}`);
const existing = [
  'prisma/schema.prisma',
  'lib/prisma.ts',
  'package.json',
];

let existingOk = true;
existing.forEach(file => {
  if (!checkFile(file)) existingOk = false;
});

// Summary
console.log(`\n${COLORS.blue}=== Summary ===${COLORS.reset}`);

const allOk = endpointsOk && librariesOk && docsOk && existingOk;

console.log(`Endpoints: ${endpointsOk ? COLORS.green + '✓' : COLORS.red + '✗'}${COLORS.reset} (${endpoints.length} files)`);
console.log(`Libraries: ${librariesOk ? COLORS.green + '✓' : COLORS.red + '✗'}${COLORS.reset} (${libraries.length} files)`);
console.log(`Documentation: ${docsOk ? COLORS.green + '✓' : COLORS.red + '✗'}${COLORS.reset} (${docs.length} files)`);
console.log(`Existing Files: ${existingOk ? COLORS.green + '✓' : COLORS.red + '✗'}${COLORS.reset} (${existing.length} files)`);

if (allOk) {
  console.log(`\n${COLORS.green}All files verified successfully!${COLORS.reset} ✨\n`);
  process.exit(0);
} else {
  console.log(`\n${COLORS.red}Some files are missing!${COLORS.reset} ❌\n`);
  process.exit(1);
}
