import { build } from 'esbuild';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
const gitSha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();

console.log(`BUILD REVISION: ${gitSha}`);
console.log('BUILDING FRONTEND...');
execSync('npx vite build', { stdio: 'inherit' });

console.log('BUILDING BACKEND...');

await build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  define: {
    'process.env.APP_BUILD_REVISION': JSON.stringify(gitSha),
  },
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/index.js',
  packages: 'external',
  logLevel: 'info',
});