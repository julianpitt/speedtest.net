#!/usr/bin/env node
'use strict';

const { writeFileSync, existsSync, mkdirSync } = require('fs');

console.log('\nRunning post build script...\n');

try {
  // Ensure directories exist
  if (!existsSync('dist/cjs')) {
    mkdirSync('dist/cjs', { recursive: true });
  }
  if (!existsSync('dist/esm')) {
    mkdirSync('dist/esm', { recursive: true });
  }

  // Create package.json for CommonJS build
  writeFileSync(
    'dist/cjs/package.json',
    JSON.stringify({ type: 'commonjs' }, null, 2)
  );

  // Create package.json for ESM build
  writeFileSync(
    'dist/esm/package.json',
    JSON.stringify({ type: 'module' }, null, 2)
  );

  console.log('✅ Post build script succeeded! Generated nested package.json files for dual module support');
} catch (e) {
  console.error('❌ Post build script failed:', e);
  process.exit(1);
}