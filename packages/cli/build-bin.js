import fs from 'fs';
import path from 'path';

const binDir = path.resolve('bin');
if (!fs.existsSync(binDir)) fs.mkdirSync(binDir);

const files = [
  { name: 'baseline-check.js', importPath: '../dist/cli.js' },
  { name: 'baseline-upgrade.js', importPath: '../dist/upgrade.js' },
];

files.forEach(f => {
  const content = `#!/usr/bin/env node\nimport("${f.importPath}");\n`;
  fs.writeFileSync(path.join(binDir, f.name), content);
});

console.log('Bin files created.');
