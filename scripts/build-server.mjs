import { build } from 'esbuild';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));

console.log('BUILDING FRONTEND...');
execSync('npx vite build', { stdio: 'inherit' });

console.log('BUILDING BACKEND...');

await build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/index.js',
  packages: 'external',
  logLevel: 'info',
});