#!/usr/bin/env python3
"""Verify curated reading cards against raw sources, chapters and wired events."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STATUSES = {"wired", "playable_sample", "source_needed", "source_verified_not_wired"}


def source_path(path):
    assert isinstance(path, str) and path, "missing source path"
    relative = Path(path)
    assert not relative.is_absolute() and ".." not in relative.parts, "source path escapes repository"
    resolved = (ROOT / relative).resolve()
    assert resolved.is_relative_to(ROOT.resolve()) and resolved.is_file(), f"missing source file: {path}"
    return resolved


def read(path):
    return json.loads(source_path(path).read_text(encoding="utf-8"))


def validate_card(card, events, book_corpora):
    card_id = card["id"]
    status = card["status"]
    assert status in STATUSES, card_id + ": unknown status"
    event_ids = card["eventIds"]
    assert len(event_ids) == len(set(event_ids)), card_id + ": duplicate event link"
    if status in {"wired", "playable_sample"}:
        assert event_ids, card_id + ": wired card has no events"
    else:
        assert not event_ids, card_id + ": unwired card links live events"
    for test in card["tests"]:
        assert source_path(test).suffix == ".gd", card_id + ": invalid regression link"
    if event_ids:
        assert card["tests"], card_id + ": wired card has no regression links"
    source = card["source"]
    if source is not None:
        assert isinstance(source, dict), card_id + ": invalid source metadata"
        assert source["book"] in book_corpora, card_id + ": unknown book corpus"
        raw = source_path(source["rawFile"]).read_text(encoding="utf-8")
        raw_anchor = source.get("rawAnchor", source["anchor"])
        assert raw_anchor and raw_anchor in raw, card_id + ": missing original-text anchor"
        if raw_anchor != source["anchor"]:
            assert source.get("normalizationNote"), card_id + ": undocumented source normalization"
        chapters = read(source["chapterFile"])["chapters"]
        matches = [c for c in chapters if c["id"] == source["chapterId"]]
        assert len(matches) == 1, card_id + ": missing or duplicate source chapter"
        body = matches[0]["rawBody"]
        assert source["anchor"] and source["anchor"] in body, card_id + ": missing chapter anchor"
        assert hashlib.sha256(body.encode()).hexdigest() == source["chapterSha256"], \
            card_id + ": source changed; review card"
        assert body[:body.index(source["anchor"])].count("\n\n") == source["paragraphIndex"], \
            card_id + ": paragraph index mismatch"
    else:
        assert status not in {"wired", "source_verified_not_wired"}, card_id + ": verified source is missing"
    for event_id in event_ids:
        assert event_id in events, card_id + ": unknown event"
        event = events[event_id]
        lore = event.get("lore", {})
        if source:
            assert lore.get("origin") == "source", event_id + ": source origin mismatch"
            ref = lore.get("ref", {})
            assert ref.get("book") == source["book"], event_id + ": book mismatch"
            assert ref.get("chapterId") == source["chapterId"], event_id + ": chapter mismatch"
            corpus = read(f"assets/books/{source['book']}-lore.json")
            story = next((s for s in corpus["stories"] if s["id"] == lore.get("storyId")), None)
            assert story and story.get("source", {}).get("chapterId") == source["chapterId"], \
                event_id + ": corpus story mismatch"
        else:
            assert lore.get("origin") == "authored", event_id + ": invented source"
        cities = event.get("when", {}).get("cities", [])
        if cities:
            assert card["place"] in cities, event_id + ": card/event location mismatch"
    return source is not None


def main():
    cards = read("assets/books/reading_cards.json")["cards"]
    ids = [c["id"] for c in cards]
    assert len(ids) == len(set(ids)), "duplicate reading-card id"
    events = {}
    for path in (ROOT / "content/tables/events").glob("*.json"):
        for event in json.loads(path.read_text(encoding="utf-8"))["records"]:
            assert event["id"] not in events, "duplicate event: " + event["id"]
            events[event["id"]] = event
    corpora = {book["corpus"] for book in read("content/tables/books.json")["records"]}
    checked = sum(validate_card(card, events, corpora) for card in cards)
    corpus = read("assets/books/ibn-battuta-lore.json")
    tunis = next(p for p in corpus["places"] if p["id"] == "tunis")
    assert "Alexandria" not in tunis["body"] and "It hisses" not in tunis["body"]
    judge = next(s for s in corpus["stories"] if s["id"] == "judge-of-alexandria-omen")
    assert judge["source"]["chapterId"] == "battuta-c001"
    assert judge["body"].startswith("At Alexandria,")
    print(f"READING_CARDS: PASS ({len(cards)} cards, {checked} raw and chapter source anchors)")


if __name__ == "__main__":
    main()
