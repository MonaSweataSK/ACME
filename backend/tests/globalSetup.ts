import { execSync } from 'child_process';
import path from 'path';

export default function setup() {
  const testDbPath = path.join(__dirname, '../prisma/test.db');
  const testDbUrl = `file:${testDbPath}`;

  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  
  execSync(`${npxCmd} prisma db push --accept-data-loss`, {
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: 'inherit'
  });
}
