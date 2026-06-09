import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_UI_PREFS } from "./uiPrefs.ts";

test("DEFAULT_UI_PREFS enables all experience toggles by default", () => {
  assert.equal(DEFAULT_UI_PREFS.mysticMotion, true);
  assert.equal(DEFAULT_UI_PREFS.classicMode, true);
  assert.equal(DEFAULT_UI_PREFS.safeMode, true);
});
