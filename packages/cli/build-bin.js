import fs from 'fs';
import path from 'path';

const binDir = path.resolve('bin');
if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });

const files = [
  { name: 'baseline-check.js', importPath: '../dist/cli.js' },
  { name: 'baseline-upgrade.js', importPath: '../dist/upgrade.js' },
];

files.forEach(f => {
  const filePath = path.join(binDir, f.name);

  const content = `#!/usr/bin/env node
// Auto-generated stub to run CLI from dist
(async () => {
  try {e
    await import("${f.importPath}");
  } catch (err) {
    console.error('Failed to run CLI:', err);
    process.exit(1);
  }
})();
`;

  fs.writeFileSync(filePath, content);

  // Make executable on Unix systems
  try {
    fs.chmodSync(filePath, 0o755);
  } catch (err) {
    // On Windows, chmod may fail; ignore
  }
});

console.log('✅ Bin files created and made executable.');
