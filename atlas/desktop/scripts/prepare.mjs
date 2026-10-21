import { cp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from '../../node_modules/esbuild/lib/main.js';

const desktop = fileURLToPath(new URL('..', import.meta.url));
const out = path.join(desktop, 'build');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(path.join(desktop, '../apps/web/dist'), path.join(out, 'web'), { recursive: true });
const htmlFile = path.join(out, 'web/index.html');
const html = await readFile(htmlFile, 'utf8');
// Desktop uses native fallback fonts so launch never depends on a font CDN.
await writeFile(htmlFile, html.replace(/<link\b[^>]*href="https:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>/g, ''));
await cp(path.join(desktop, 'src/main.cjs'), path.join(out, 'main.cjs'));
await cp(path.join(desktop, 'src/protocol.cjs'), path.join(out, 'protocol.cjs'));
await build({ entryPoints: [path.join(desktop, '../lib/llm-proxy-handler.ts')], outfile: path.join(out, 'llm-proxy.cjs'), platform: 'node', format: 'cjs', bundle: true, target: 'node22' });
const pkg = JSON.parse(await readFile(path.join(desktop, 'package.json'), 'utf8'));
await writeFile(path.join(out, 'package.json'), JSON.stringify({ name: pkg.name, productName: pkg.productName, version: pkg.version, author: pkg.author, main: 'main.cjs', description: pkg.description }, null, 2));
console.log('Desktop resources prepared. Only compiled web assets and the runtime are included.');
