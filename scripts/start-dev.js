import { spawn } from 'child_process';

console.log('🚀 Starting PEC Leave Portal Backend Server & Frontend Vite App...\n');

const isWin = process.platform === 'win32';

// 1. Start Backend Express Server
const backend = isWin
  ? spawn('cmd.exe', ['/c', 'node backend/src/server.js'], { stdio: 'inherit' })
  : spawn('node', ['backend/src/server.js'], { stdio: 'inherit' });

// 2. Start Vite Dev Server
const frontend = isWin
  ? spawn('cmd.exe', ['/c', 'npx vite'], { stdio: 'inherit' })
  : spawn('npx', ['vite'], { stdio: 'inherit' });

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
