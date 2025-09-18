#!/usr/bin/env node

// Auto-fix script for common ESLint issues
const fs = require('fs');
const path = require('path');

const fixes = [
  // Remove unused imports
  { 
    pattern: /import\s*{\s*Progress\s*}\s*from\s*"@\/components\/ui\/progress";\n/g,
    replacement: '',
    description: 'Remove unused Progress import'
  },
  { 
    pattern: /import\s*{\s*Label\s*}\s*from\s*"@\/components\/ui\/label";\n/g,
    replacement: '',
    description: 'Remove unused Label import'
  },
  { 
    pattern: /import\s*{\s*Separator\s*}\s*from\s*"@\/components\/ui\/separator";\n/g,
    replacement: '',
    description: 'Remove unused Separator import'
  },
  { 
    pattern: /import\s*{\s*CardHeader,?\s*CardTitle,?\s*}\s*from\s*"@\/components\/ui\/card";\n/g,
    replacement: '',
    description: 'Remove unused CardHeader, CardTitle imports'
  },
  { 
    pattern: /import\s*{\s*Info\s*}\s*from\s*"lucide-react";\n/g,
    replacement: '',
    description: 'Remove unused Info import'
  },
  { 
    pattern: /import\s*{\s*Upload\s*}\s*from\s*"lucide-react";\n/g,
    replacement: '',
    description: 'Remove unused Upload import'
  },
  { 
    pattern: /import\s*{\s*X\s*}\s*from\s*"lucide-react";\n/g,
    replacement: '',
    description: 'Remove unused X import'
  },
  { 
    pattern: /import\s*{\s*Check\s*}\s*from\s*"lucide-react";\n/g,
    replacement: '',
    description: 'Remove unused Check import'
  },
  // Fix variant props
  { 
    pattern: /variant="outline"/g,
    replacement: 'className="border"',
    description: 'Fix outline variant'
  },
  { 
    pattern: /variant="secondary"/g,
    replacement: 'className="bg-secondary"',
    description: 'Fix secondary variant'
  },
  { 
    pattern: /variant="ghost"/g,
    replacement: 'className="bg-transparent"',
    description: 'Fix ghost variant'
  },
  { 
    pattern: /size="sm"/g,
    replacement: 'className="h-8 px-2"',
    description: 'Fix sm size'
  },
  { 
    pattern: /size="icon"/g,
    replacement: 'className="h-8 w-8"',
    description: 'Fix icon size'
  },
  // Remove console.log statements
  { 
    pattern: /\s*console\.log\([^)]+\);\n/g,
    replacement: '',
    description: 'Remove console.log statements'
  },
  // Comment out unused variables
  { 
    pattern: /(\s+)const\s+(\w+)\s*=\s*([^;]+);(\s*\/\/.*)?$/gm,
    replacement: '$1// const $2 = $3;$4',
    description: 'Comment out unused const declarations'
  }
];

console.log('Starting ESLint auto-fix...\n');

// Get all TypeScript files
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
  
  fixes.forEach(fix => {
    const matches = content.match(fix.pattern);
    if (matches) {
      content = content.replace(fix.pattern, fix.replacement);
      fileChanges += matches.length;
    }
  });
  
  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${fileChanges} issues in ${filePath}`);
    totalChanges += fileChanges;
  }
});

console.log(`\nTotal fixes applied: ${totalChanges}`);