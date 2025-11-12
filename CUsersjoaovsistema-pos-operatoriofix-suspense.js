const fs = require('fs');
const path = require('path');

const files = [
  'app/cadastro-medico/page.tsx',
  'app/auth/error/page.tsx',
  'app/termos/[tipo]/page.tsx'
];

files.forEach(filePath => {
  const fullPath = path.join('C:', 'Users', 'joaov', 'sistema-pos-operatorio', filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if already has Suspense
  if (content.includes('Suspense')) {
    console.log(`Skipping ${filePath} - already has Suspense`);
    return;
  }
  
  // Add Suspense to imports
  content = content.replace(
    /from "react"/,
    ', Suspense } from "react"'
  ).replace(
    /import \{ /,
    'import { Suspense, '
  );
  
  // Find the export default function
  const exportMatch = content.match(/export default function (\w+)\(/);
  if (!exportMatch) {
    console.log(`Skipping ${filePath} - no default export found`);
    return;
  }
  
  const funcName = exportMatch[1];
  const newFuncName = funcName.replace('Page', 'Content');
  
  // Rename the main function
  content = content.replace(
    `export default function ${funcName}(`,
    `function ${newFuncName}(`
  );
  
  // Add wrapper with Suspense at the end
  const wrapperCode = `\n\nexport default function ${funcName}() {\n  return (\n    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-lg">Carregando...</div></div>}>\n      <${newFuncName} />\n    </Suspense>\n  )\n}\n`;
  
  content = content + wrapperCode;
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Fixed ${filePath}`);
});

console.log('All files fixed!');
