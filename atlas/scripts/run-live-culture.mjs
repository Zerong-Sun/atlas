import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const electron = fileURLToPath(new URL('../desktop/node_modules/electron/cli.js', import.meta.url));
const test = fileURLToPath(new URL('../desktop/test/live-culture.cjs', import.meta.url));
const result = spawnSync(process.execPath, [electron, test], {
  stdio: 'inherit', env: {...process.env, ATLAS_LIVE_TEST: '1'},
});
process.exitCode = result.status ?? 1;
