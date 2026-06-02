import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const manifest = join(dirname(fileURLToPath(import.meta.url)), "../../../corpus/manifests/corpus_v0_1.yaml");
if (!existsSync(manifest)) { console.error("Missing", manifest); process.exit(1); }
console.log("Manifest OK:", manifest);
