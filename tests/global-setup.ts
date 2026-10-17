import { execSync } from 'node:child_process';

// Build once so build-output tests read a fresh dist/.
export default function setup() {
  execSync('npm run build', { stdio: 'pipe' });
}
