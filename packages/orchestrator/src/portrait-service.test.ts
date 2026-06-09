import assert from "node:assert/strict";
import { test } from "node:test";
import { buildPortraitTraditions } from "./portrait-service.ts";

test("buildPortraitTraditions returns entries for complete profile", () => {
  const traditions = buildPortraitTraditions({
    userId: "u1",
    birthDate: "1990-05-15",
    birthTime: "08:30",
    gender: "male",
    disabledTraditions: [],
    onboardingCompleted: true,
  });
  assert.ok(traditions.bazi);
  assert.ok(traditions.western);
  assert.ok(traditions.tarot);
  assert.ok(traditions.iching);
  assert.doesNotMatch(traditions.western!, /太阳.+。太阳/);
  assert.doesNotMatch(traditions.bazi!, /日主.+。日主/);
});
