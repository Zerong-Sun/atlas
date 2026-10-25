import assert from "node:assert/strict";
import { test } from "node:test";
import { absoluteHeading, bearingDetails, bearingFromPoint, normalizeBearing, sittingFromFacing } from "./instruments.ts";

test("luopan keeps north clockwise and sitting opposite facing", () => {
  for (const [degree, mountain, facing] of [[0, "子", 180], [90, "卯", 270], [180, "午", 0], [270, "酉", 90]] as const) {
    const result = bearingDetails(degree);
    assert.equal(result.mountain, mountain);
    assert.equal(result.facing, facing);
  }
  assert.equal(bearingDetails(7.49).mountain, "子");
  assert.equal(bearingDetails(7.5).mountain, "癸");
  assert.equal(normalizeBearing(-90), 270);
  assert.equal(bearingFromPoint(1, 0), 90);
  assert.equal(sittingFromFacing(90), 270);
  assert.equal(sittingFromFacing(179.8), 0);
  assert.equal(sittingFromFacing(359.8), 180);
});

test("relative device orientation is never presented as magnetic north", () => {
  assert.equal(absoluteHeading({ absolute: false, alpha: 40 }), null);
  assert.equal(absoluteHeading({ absolute: true, alpha: 90 }), 270);
  assert.equal(absoluteHeading({ webkitCompassHeading: 90, alpha: null }), 90);
  assert.equal(absoluteHeading({ webkitCompassHeading: 90, alpha: null, beta: 50 }), null);
});
