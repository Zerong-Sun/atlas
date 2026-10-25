import assert from "node:assert/strict";
import { test } from "node:test";
import { getReadyMethods } from "./index.ts";
import { METHOD_STORIES, getHexagramStory } from "./readingStories.ts";
import { getTarotCardStory } from "./tarotStories.ts";

test("each available method teaches with a concrete story", () => {
  for (const method of getReadyMethods()) {
    assert.ok(METHOD_STORIES[method.id]?.includes("小故事："), method.id);
  }
});

test("all 64 hexagrams and 78 tarot cards have their own teaching scene", () => {
  const hexStories = Array.from({ length: 64 }, (_, index) => getHexagramStory(index + 1, "卦"));
  assert.equal(new Set(hexStories).size, 64);
  assert.ok(hexStories.every(Boolean));
  const tarotIds = ["fool", "magician", "high-priestess", "empress", "emperor", "hierophant", "lovers", "chariot", "strength", "hermit", "wheel", "justice", "hanged-man", "death", "temperance", "devil", "tower", "star", "moon", "sun", "judgement", "world"];
  const ranks = ["ace", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "page", "knight", "queen", "king"];
  for (const suit of ["wands", "cups", "swords", "pentacles"]) for (const rank of ranks) tarotIds.push(`${suit}-${rank}`);
  assert.equal(tarotIds.length, 78);
  assert.ok(tarotIds.every(id => !getTarotCardStory(id, id).includes("读者先观察")));
});
