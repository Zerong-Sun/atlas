import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = resolve(root, 'apps/web/dist');
const manifest = JSON.parse(await readFile(join(dist, '.vite/manifest.json'), 'utf8'));
const budget = JSON.parse(await readFile(join(root, 'web-budgets.json'), 'utf8'));
const files = new Set();
const seen = new Set();
function visit(key) {
  if (seen.has(key)) return;
  seen.add(key);
  const chunk = manifest[key];
  if (!chunk) throw new Error(`Missing manifest dependency: ${key}`);
  files.add(chunk.file);
  for (const css of chunk.css ?? []) files.add(css);
  for (const dependency of chunk.imports ?? []) visit(dependency);
}
const entries = Object.entries(manifest).filter(([, v]) => v.isEntry);
if (!entries.length) throw new Error('No entry in build manifest');
for (const [key] of entries) visit(key);
const compressed = async (file) => gzipSync(await readFile(join(dist, file))).length;
const initialGzip = (await Promise.all([...files].map(compressed))).reduce((a, b) => a + b, 0);
const chunks = await Promise.all([...new Set(Object.values(manifest).map((v) => v.file))]
  .filter((file) => file.endsWith('.js')).map(async (file) => ({ file, bytes: await compressed(file) })));
const biggest = chunks.sort((a, b) => b.bytes - a.bytes)[0];
async function size(dir) {
  let bytes = 0;
  for (const name of await readdir(dir)) {
    const path = join(dir, name); const info = await stat(path);
    bytes += info.isDirectory() ? await size(path) : info.size;
  }
  return bytes;
}
const publicBytes = await size(join(root, 'apps/web/public'));
const result = { initialGzip, largestChunkGzip: biggest.bytes, largestChunk: biggest.file, publicBytes, initialFiles: [...files], budgets: budget };
console.log(JSON.stringify(result, null, 2));
if (initialGzip > budget.initialGzip || biggest.bytes > budget.largestChunkGzip || publicBytes > budget.publicBytes) {
  console.error('Web asset budget exceeded. Inspect the new dependency/asset before changing the reviewed budget.');
  process.exitCode = 1;
}
