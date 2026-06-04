import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(__dirname, "../../../..");
export const CORPUS_DIR = join(REPO_ROOT, "corpus");
export const MANIFEST_PATH = join(CORPUS_DIR, "manifests/corpus_v0_1.yaml");
export const SEEDS_DIR = join(CORPUS_DIR, "seeds");
export const OUTPUT_DIR = join(CORPUS_DIR, ".cache");
export const AUDIT_DIR = join(CORPUS_DIR, "audit");
