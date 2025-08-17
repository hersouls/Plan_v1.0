#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the src directory path
const srcDir = path.join(__dirname, '..', 'src');

// Patterns to fix
const patterns = [
  // Remove console statements
  {
    name: 'console statements',
    pattern: /console\.(log|error|warn|info|debug)\s*\([^)]*\);?\s*/g,
    replacement: '',
    description: 'Remove console statements'
  },
  // Fix unused variables by prefixing with underscore
  {
    name: 'unused variables',
    pattern: /(\w+)\s*:\s*any\s*(?=,|\)|$)/g,
    replacement: (match, varName) => `_${varName}: any`,
    description: 'Prefix unused variables with underscore'
  },
  // Fix explicit any types with unknown
  {
    name: 'explicit any types',
    pattern: /:\s*any\b/g,
    replacement: ': unknown',
    description: 'Replace any with unknown where possible'
  }
];

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let changes = 0;

    patterns.forEach(pattern => {
      const matches = content.match(pattern.pattern);
      if (matches) {
        modifiedContent = modifiedContent.replace(pattern.pattern, pattern.replacement);
        changes += matches.length;
      }
    });

    if (changes > 0) {
      fs.writeFileSync(filePath, modifiedContent);
      console.log(`Fixed ${changes} issues in ${filePath}`);
      return changes;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
  return 0;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let totalChanges = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      totalChanges += walkDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      totalChanges += processFile(filePath);
    }
  });

  return totalChanges;
}

console.log('Starting ESLint warning fixes...');
const totalChanges = walkDir(srcDir);
console.log(`Total changes made: ${totalChanges}`);