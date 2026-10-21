import { packager } from '@electron/packager';
import { Data } from 'resedit';
import { readFile, writeFile, mkdir, readdir, copyFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const target = process.argv[2] || 'all';
if (!['all', 'mac', 'win'].includes(target)) throw new Error('Use package.mjs [all|mac|win]');
const out = path.join(root, 'release');
await mkdir(out, { recursive: true });
// Convert the existing Atlas icon to platform formats; no new artwork is generated.
const icons = path.join(out, 'icons');
const iconset = path.join(icons, 'Atlas.iconset');
await mkdir(iconset, { recursive: true });
const sourceIcon = path.join(root, '../apps/mobile/assets/icon.png');
for (const size of [16, 32, 128, 256, 512]) {
  execFileSync('sips', ['-z', String(size), String(size), sourceIcon, '--out', path.join(iconset, `icon_${size}x${size}.png`)], { stdio: 'ignore' });
  if (size < 512) execFileSync('sips', ['-z', String(size * 2), String(size * 2), sourceIcon, '--out', path.join(iconset, `icon_${size}x${size}@2x.png`)], { stdio: 'ignore' });
}
execFileSync('iconutil', ['-c', 'icns', iconset, '-o', path.join(icons, 'Atlas.icns')]);
const ico = new Data.IconFile();
for (const size of [16, 32, 128, 256]) {
  const png = await readFile(path.join(iconset, `icon_${size}x${size}.png`));
  ico.icons.push({ data: Data.RawIconItem.from(png, size, size, 32) });
}
await writeFile(path.join(icons, 'Atlas.ico'), new Uint8Array(ico.generate()));
const base = {
  dir: path.join(root, 'build'), out, name: 'ZhuxiangAtlas',
  executableName: 'ZhuxiangAtlas', appBundleId: 'com.atlas.desktop',
  appVersion: pkg.version, electronVersion: pkg.devDependencies.electron,
  asar: true, overwrite: true, prune: false,
};
if (target !== 'win') {
  const [folder] = await packager({ ...base, platform: 'darwin', arch: 'universal', icon: path.join(icons, 'Atlas.icns'),
    extendInfo: { CFBundleDisplayName: '诸象 Atlas' },
  });
  const app = path.join(folder, 'ZhuxiangAtlas.app');
  // Ad-hoc signing preserves Apple Silicon integrity requirements; this is not notarization.
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' });
  execFileSync('codesign', ['--verify', '--deep', '--strict', app], { stdio: 'inherit' });
  await copyFile(path.join(root, 'INSTALL.zh-CN.txt'), path.join(folder, '安装说明.txt'));
  execFileSync('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', folder, path.join(out, `Atlas-v${pkg.version}-macOS-universal.zip`)], { stdio: 'inherit' });
}
if (target !== 'mac') {
  const [folder] = await packager({ ...base, platform: 'win32', arch: 'x64', icon: path.join(icons, 'Atlas.ico'),
    windowsMetadata: { ProductName: '诸象 Atlas', FileDescription: pkg.description },
  });
  await copyFile(path.join(root, 'INSTALL.zh-CN.txt'), path.join(folder, '安装说明.txt'));
  execFileSync('/usr/bin/zip', ['-q', '-r', path.join(out, `Atlas-v${pkg.version}-Windows-x64.zip`), path.basename(folder)], { cwd: out, stdio: 'inherit' });
}
const sums = [];
for (const name of (await readdir(out)).filter((file) => file.endsWith('.zip')).sort()) {
  const data = await readFile(path.join(out, name));
  sums.push(`${createHash('sha256').update(data).digest('hex')}  ${name}`);
}
await writeFile(path.join(out, 'SHA256SUMS.txt'), sums.join('\n') + '\n');
console.log(sums.join('\n'));
