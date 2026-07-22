import assert from "node:assert/strict";
import test from "node:test";
import { LENORMAND_CARD_SLUGS } from "./lenormandSlugs";

test("lenormand deck has 36 cards with sequential slugs", () => {
  assert.equal(LENORMAND_CARD_SLUGS.length, 36);
  assert.equal(LENORMAND_CARD_SLUGS[0], "rider");
  assert.equal(LENORMAND_CARD_SLUGS[35], "cross");
});

test("lenormand slugs align with didot-1890 asset numbering", () => {
  LENORMAND_CARD_SLUGS.forEach((slug, index) => {
    const id = index + 1;
    const padded = String(id).padStart(2, "0");
    assert.match(`${padded}-${slug}`, /^\d{2}-[a-z]+$/);
  });
});
