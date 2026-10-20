"""Review evidence must never silently transfer to replacement artwork."""
import hashlib
import importlib.util
import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("art_inventory", HERE / "build_art_inventory.py")
inventory = importlib.util.module_from_spec(spec)
spec.loader.exec_module(inventory)


class SnapshotTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.records = json.loads((HERE / "art_visual_review_snapshot.json").read_text())["records"]

    def test_historical_observations_match_or_require_re_review(self):
        self.assertEqual(len(self.records), 81)
        for path, record in self.records.items():
            with self.subTest(path=path):
                sha = hashlib.sha256((inventory.ROOT / path).read_bytes()).hexdigest()
                result = inventory.visual_observation(path, sha, self.records)
                if sha == record["sha256"]:
                    self.assertTrue(result["visual_review"].startswith("agent_visual_"))
                    self.assertIn("human art/history signoff pending", result["note"])
                else:
                    self.assertEqual(result["visual_review"], "needs_re_review")
                    self.assertEqual(result["content_status"], "changed_asset_unreviewed")

    def test_same_filename_new_hash_requires_review(self):
        for path in self.records:
            with self.subTest(path=path):
                result = inventory.visual_observation(path, "0" * 64, self.records)
                self.assertEqual(result["visual_review"], "needs_re_review")
                self.assertEqual(result["content_status"], "changed_asset_unreviewed")

    def test_unknown_path_does_not_receive_a_review(self):
        self.assertIsNone(inventory.visual_observation("assets/art/new-art.webp", "0" * 64, self.records))

    def test_identical_bytes_at_new_path_do_not_inherit_identity(self):
        record = next(iter(self.records.values()))
        self.assertIsNone(inventory.visual_observation("assets/art/different-person.webp", record["sha256"], self.records))


if __name__ == "__main__":
    unittest.main()
