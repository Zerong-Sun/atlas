"""Every playable tarot ID is traceable to one public-domain Commons source."""
import hashlib, json, unittest
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/'assets/decks/tarot/DECK_MANIFEST.json'

class TarotProvenanceTests(unittest.TestCase):
    def test_complete_ids_and_sources(self):
        manifest=json.loads(MANIFEST.read_text())
        self.assertEqual(manifest['deck_id'],'rws_commons_public_domain')
        cards=manifest['cards']
        expected={f'major-{i}' for i in range(22)} | {f'{suit}-{i}' for suit in ['wands','cups','swords','pentacles'] for i in range(14)}
        self.assertEqual(len(cards),78)
        self.assertEqual(len(list((ROOT/'assets/decks/tarot/_sources_rws').glob('*.jpg'))),78)
        self.assertEqual({r['id'] for r in cards},expected)
        authored=json.loads((ROOT/'content/tables/divination/tarot_cards.json').read_text())['records']
        self.assertEqual({r['id'] for r in authored},expected)
        self.assertEqual(len({r['output_sha256'] for r in cards}),78)
        for record in cards:
            with self.subTest(card=record['id']):
                self.assertEqual(record['license_statement'],'Public domain')
                self.assertEqual(record['license_evidence']['LicenseShortName']['value'],'Public domain')
                self.assertTrue(record['source_page'].startswith('https://commons.wikimedia.org/wiki/File:'))
                self.assertTrue(record['source_url'].startswith(('https://upload.wikimedia.org/', 'https://thumb.wikimedia.org/')))
                source=ROOT/record['source_path'];output=ROOT/record['path']
                self.assertEqual(hashlib.sha256(source.read_bytes()).hexdigest(),record['source_sha256'])
                self.assertEqual(hashlib.sha1(source.read_bytes()).hexdigest(),record['source_sha1'])
                if record['source_variant'] == 'original':
                    self.assertEqual(record['source_sha1'],record['commons_original_sha1'])
                else:
                    self.assertEqual(record['source_variant'],'commons_thumbnail_960')
                    self.assertIn('/thumb/',record['source_url'])
                    self.assertEqual(record['dimensions'][0],960)
                self.assertEqual(hashlib.sha256(output.read_bytes()).hexdigest(),record['output_sha256'])
                with Image.open(source) as a, Image.open(output) as b:
                    self.assertEqual(a.size,b.size)
                    self.assertEqual(a.convert('RGB').tobytes(),b.convert('RGB').tobytes())
                self.assertEqual(record['human_art_history_signoff'],'pending')

    def test_legacy_profile_is_isolated(self):
        self.assertEqual(len(list((ROOT/'assets/decks/tarot/_legacy_cloud_ridge').glob('*.webp'))),40)
        self.assertEqual(len(list((ROOT/'assets/decks/tarot').glob('tarot-*-full.webp'))),78)

if __name__=='__main__': unittest.main()
