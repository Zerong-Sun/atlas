"""Negative regression checks for source attribution and portable reading links."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("reading_audit", ROOT / "tools/lore/audit_reading_cards.py")
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class ReadingCardAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cards = audit.read("assets/books/reading_cards.json")["cards"]
        cls.events = {}
        for path in (ROOT / "content/tables/events").glob("*.json"):
            for event in json.loads(path.read_text(encoding="utf-8"))["records"]:
                cls.events[event["id"]] = event
        cls.corpora = {b["corpus"] for b in audit.read("content/tables/books.json")["records"]}

    def test_current_cards(self):
        for card in self.cards:
            with self.subTest(card=card["id"]):
                audit.validate_card(card, self.events, self.corpora)

    def test_raw_anchor_must_exist_in_original_file(self):
        card = copy.deepcopy(self.cards[0])
        card["source"]["rawAnchor"] = "nonexistent original text"
        with self.assertRaisesRegex(AssertionError, "original-text anchor"):
            audit.validate_card(card, self.events, self.corpora)

    def test_raw_file_must_be_portable(self):
        card = copy.deepcopy(self.cards[0])
        card["source"]["rawFile"] = "../outside-book.txt"
        with self.assertRaisesRegex(AssertionError, "escapes repository"):
            audit.validate_card(card, self.events, self.corpora)

    def test_book_reference_cannot_change_without_detection(self):
        events = copy.deepcopy(self.events)
        events[self.cards[0]["eventIds"][0]]["lore"]["ref"]["book"] = "marco-polo"
        with self.assertRaisesRegex(AssertionError, "book mismatch"):
            audit.validate_card(self.cards[0], events, self.corpora)

    def test_normalization_is_documented(self):
        card = copy.deepcopy(self.cards[1])
        card.pop("normalizationNote", None)
        card["source"].pop("normalizationNote", None)
        with self.assertRaisesRegex(AssertionError, "undocumented source normalization"):
            audit.validate_card(card, self.events, self.corpora)

    def test_source_needed_cannot_claim_wired_content(self):
        card = copy.deepcopy(self.cards[3])
        card["eventIds"] = [self.cards[0]["eventIds"][0]]
        with self.assertRaisesRegex(AssertionError, "unwired card links live events"):
            audit.validate_card(card, self.events, self.corpora)

    def test_test_link_must_exist(self):
        card = copy.deepcopy(self.cards[0])
        card["tests"] = ["tests/not-a-real-regression.gd"]
        with self.assertRaisesRegex(AssertionError, "missing source file"):
            audit.validate_card(card, self.events, self.corpora)


if __name__ == "__main__":
    unittest.main()
