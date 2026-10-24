import { listPackage, extractFile } from '@electron/asar';
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('..', import.meta.url));
const release = path.join(root, 'release');
const { version } = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const bundles = [
  ['macOS-universal', 'ZhuxiangAtlas-darwin-universal/ZhuxiangAtlas.app/Contents/Resources/app.asar'],
  ['Windows-x64', 'ZhuxiangAtlas-win32-x64/resources/app.asar'],
];
const results = [];
for (const [platform, relative] of bundles) {
  const asar = path.join(release, relative);
  const files = listPackage(asar);
  assert.equal(JSON.parse(extractFile(asar, 'package.json')).version, version);
  for (const name of ['main.cjs', 'protocol.cjs', 'llm-proxy.cjs', 'web/index.html', 'web/release.json']) {
    assert.ok(files.includes('/' + name), `${platform}: missing ${name}`);
  }
  const metadata = JSON.parse(extractFile(asar, 'web/release.json'));
  assert.equal(metadata.release, `atlas-v${version}`);
  assert.equal(metadata.version, version);
  assert.equal(metadata.sourceCommit, execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim());
  assert.ok(Number.isFinite(Date.parse(metadata.builtAt)));
  assert.ok(!files.some((file) => /(^|\/)(\.env[^/]*|node_modules|test|tests|\.git)(\/|$)/.test(file)));
  assert.ok(!extractFile(asar, 'web/index.html').toString().includes('fonts.googleapis.com'));
  const zip = path.join(release, `Atlas-v${version}-${platform}.zip`);
  execFileSync('unzip', ['-tq', zip], { stdio: 'pipe' });
  const data = await readFile(zip);
  results.push({ platform, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex'), files: files.length, sourceCommit: metadata.sourceCommit, mainSha256: createHash('sha256').update(extractFile(asar, 'main.cjs')).digest('hex') });
}
assert.equal(results[0].mainSha256, results[1].mainSha256);
const exe = await readFile(path.join(release, 'ZhuxiangAtlas-win32-x64/ZhuxiangAtlas.exe'));
assert.equal(exe.toString('ascii', 0, 2), 'MZ');
const pe = exe.readUInt32LE(0x3c);
assert.equal(exe.toString('ascii', pe, pe + 4), 'PE\0\0');
assert.equal(exe.readUInt16LE(pe + 4), 0x8664, 'Windows executable must be x64');
const app = path.join(release, 'ZhuxiangAtlas-darwin-universal/ZhuxiangAtlas.app');
const archs = execFileSync('lipo', ['-archs', path.join(app, 'Contents/MacOS/ZhuxiangAtlas')], { encoding: 'utf8' }).trim();
assert.ok(archs.includes('x86_64') && archs.includes('arm64'));
execFileSync('codesign', ['--verify', '--deep', '--strict', app]);
await writeFile(path.join(release, 'verification.json'), JSON.stringify({ version, zipIntegrity: true, macArchitectures: archs, windowsMachine: 'AMD64', results }, null, 2));
await writeFile(path.join(release, 'SHA256SUMS.txt'), results.map((result) => `${result.sha256}  Atlas-v${version}-${result.platform}.zip`).join('\n') + '\n');
console.log(JSON.stringify({ passed: true, version, results }, null, 2));
