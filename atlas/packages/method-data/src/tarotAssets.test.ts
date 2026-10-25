import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

test("tarot manifest names 78 nonempty, valid local WebP images", () => {
  const directory = fileURLToPath(new URL("../assets/tarot/", import.meta.url).href);
  const manifest = JSON.parse(readFileSync(fileURLToPath(new URL("../assets/tarot/manifest.json", import.meta.url).href), "utf8")) as {
    cards: Array<{ id: string; file: string; bytes: number }>;
  };
  assert.equal(manifest.cards.length, 78);
  assert.equal(new Set(manifest.cards.map((card) => card.id)).size, 78);
  assert.deepEqual(
    new Set(readdirSync(directory).filter((file) => file.endsWith(".webp"))),
    new Set(manifest.cards.map((card) => card.file)),
  );
  for (const card of manifest.cards) {
    assert.equal(card.file, `${card.id}.webp`);
    const path = `${directory}/${card.file}`;
    assert.equal(statSync(path).size, card.bytes, card.id);
    const bytes = readFileSync(path);
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF", card.id);
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP", card.id);
  }
});
