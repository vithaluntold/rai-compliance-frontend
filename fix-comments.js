#!/usr/bin/env node

// More aggressive uncomment script
const fs = require('fs');
const path = require('path');

console.log('Searching for and fixing commented code patterns...\n');

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
  let originalContent = content;
  let fileChanges = 0;
  
  // Look for lines that start with // and contain actual code
  const lines = content.split('\n');
  const newLines = lines.map(line => {
    const trimmed = line.trim();
    
    // Skip actual comments (those that start with // and contain natural language)
    if (trimmed.startsWith('//') && 
        !trimmed.includes('const ') &&
        !trimmed.includes('function ') &&
        !trimmed.includes('return ') &&
        !trimmed.includes('import ') &&
        !trimmed.includes('export ') &&
        !trimmed.includes('.push(') &&
        !trimmed.includes('router.') &&
        !trimmed.includes('console.') &&
        !trimmed.includes('if (') &&
        !trimmed.includes('} else') &&
        !trimmed.includes('<') &&
        !trimmed.includes('interface ') &&
        !trimmed.includes('type ')) {
      return line; // Keep actual comments
    }
    
    // Uncomment code that was incorrectly commented
    if (trimmed.startsWith('// const ')) {
      fileChanges++;
      return line.replace('// const ', 'const ');
    }
    if (trimmed.startsWith('// function ')) {
      fileChanges++;
      return line.replace('// function ', 'function ');
    }
    if (trimmed.startsWith('// return ')) {
      fileChanges++;
      return line.replace('// return ', 'return ');
    }
    if (trimmed.startsWith('// import ')) {
      fileChanges++;
      return line.replace('// import ', 'import ');
    }
    if (trimmed.startsWith('// export ')) {
      fileChanges++;
      return line.replace('// export ', 'export ');
    }
    if (trimmed.startsWith('// router.')) {
      fileChanges++;
      return line.replace('// router.', 'router.');
    }
    if (trimmed.startsWith('// if (')) {
      fileChanges++;
      return line.replace('// if (', 'if (');
    }
    if (trimmed.startsWith('// } else')) {
      fileChanges++;
      return line.replace('// } else', '} else');
    }
    if (trimmed.startsWith('// }')) {
      fileChanges++;
      return line.replace('// }', '}');
    }
    if (trimmed.startsWith('// <') && trimmed.includes('>')) {
      fileChanges++;
      return line.replace(/^(\s*)\/\/ (<.*)$/, '$1$2');
    }
    if (trimmed.startsWith('// interface ')) {
      fileChanges++;
      return line.replace('// interface ', 'interface ');
    }
    if (trimmed.startsWith('// type ')) {
      fileChanges++;
      return line.replace('// type ', 'type ');
    }
    
    return line;
  });
  
  content = newLines.join('\n');
  
  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${fileChanges} commented lines in ${filePath}`);
    totalChanges += fileChanges;
  }
});

console.log(`\nTotal files processed: ${tsFiles.length}`);
console.log(`Total lines uncommented: ${totalChanges}`);