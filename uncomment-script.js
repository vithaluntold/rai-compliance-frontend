#!/usr/bin/env node

// Script to uncomment code that was incorrectly commented out
const fs = require('fs');
const path = require('path');

console.log('Searching for and uncommenting incorrectly commented code...\n');

function getAllTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      getAllTsFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const tsFiles = getAllTsFiles('./');
let totalChanges = 0;

tsFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanges = 0;
  let originalContent = content;
  
  // Uncomment incorrectly commented variable declarations
  content = content.replace(/(\s+)\/\/ const (\w+) = ([^;]+);/g, '$1const $2 = $3;');
  
  // Uncomment incorrectly commented function calls
  content = content.replace(/(\s+)\/\/ (\w+)\([^)]*\);/g, '$1$2($3);');
  
  // Uncomment incorrectly commented return statements
  content = content.replace(/(\s+)\/\/ return ([^;]+);/g, '$1return $2;');
  
  // Uncomment incorrectly commented imports
  content = content.replace(/\/\/ import ([^;]+);/g, 'import $1;');
  
  // Uncomment incorrectly commented exports
  content = content.replace(/\/\/ export ([^;]+);/g, 'export $1;');
  
  // Uncomment incorrectly commented interface/type definitions
  content = content.replace(/\/\/ (interface|type) ([^{]+{[^}]*})/g, '$1 $2');
  
  // Uncomment incorrectly commented JSX elements
  content = content.replace(/(\s+)\/\/ (<[^>]*>[^<]*<\/[^>]*>)/g, '$1$2');
  
  // Uncomment incorrectly commented function definitions
  content = content.replace(/\/\/ (function \w+\([^)]*\)[^{]*{)/g, '$1');
  content = content.replace(/\/\/ (const \w+ = \([^)]*\) => {)/g, '$1');
  
  // Uncomment incorrectly commented conditional statements
  content = content.replace(/(\s+)\/\/ (if \([^)]+\) {)/g, '$1$2');
  content = content.replace(/(\s+)\/\/ (} else {)/g, '$1$2');
  content = content.replace(/(\s+)\/\/ (})/g, '$1$2');
  
  // Uncomment incorrectly commented router calls
  content = content.replace(/(\s+)\/\/ router\.push\([^)]+\);/g, '$1router.push($2);');
  
  // Fix specific patterns that were broken
  content = content.replace(/\/\/ router\.push\(`\/extraction\/\$\{documentId\}\`\);/g, 'router.push(`/extraction/${documentId}`);');
  
  if (content !== originalContent) {
    const lines = originalContent.split('\n').length;
    const newLines = content.split('\n').length;
    fileChanges = Math.abs(lines - newLines);
    
    fs.writeFileSync(filePath, content);
    console.log(`Uncommented code in ${filePath}`);
    totalChanges += fileChanges;
  }
});

console.log(`\nTotal files processed: ${tsFiles.length}`);
console.log(`Total changes made: ${totalChanges}`);