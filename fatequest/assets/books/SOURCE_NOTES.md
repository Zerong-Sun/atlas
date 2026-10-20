# Book-source inventory and review status

**2026-10-20 audit correction.** The former blanket “confirmed public-domain”
heading was not supported for every edition in this tree. Corpus metadata names
a 2012 translation for Fadlan and a 1952 / 2020 edition for Jubayr. Their edition
usage basis must be checked individually; an ancient author's date does not
establish the status of the stored translation. This inventory is not a legal
clearance record.

Full inventory, missing originals, OCR defects and review tasks:
[`BOOK_SOURCE_AUDIT_2026-10-20.md`](../../docs/library_audit/BOOK_SOURCE_AUDIT_2026-10-20.md).
统一的游记卡片、来源标签和翻译提示词见
[`TEXT_STYLE_PROMPTS.md`](../../docs/library_audit/TEXT_STYLE_PROMPTS.md)。

| Corpus file | Edition | Status |
|---|---|---|
| marco-polo-lore.json | Yule–Cordier (Gutenberg) | raw text and chapters present; used in game; passage review incomplete |
| ibn-battuta-lore.json | Samuel Lee, 1829 abridgement | raw text and chapters present; 3 source-card anchors checked, not the whole corpus |
| ibn-fadlan-lore.json | Lunde & Stone, Penguin, 2012 (per metadata) | edition usage basis pending; anthology authors and dates need separation |
| ibn-jubayr-lore.json | Broadhurst, 1952 / Bloomsbury 2020 (per metadata) | edition usage basis and passage review pending |
| rubruck-lore.json | Rockhill, Hakluyt Society, 1900 (declared) | 5 excerpt records; full local original absent |
| odoric-lore.json | Yule, Cathay and the Way Thither, 1866 (declared) | 4 excerpt records; full local original absent |
| conti-lore.json | Major, India in the Fifteenth Century, 1857 (declared) | 4 excerpt records; full local original absent |
| tafur-lore.json | Letts, Broadway Travellers, 1926 (declared) | 3 excerpt records; full local original absent; prior territorial rights claim not revalidated |
| yingya-shenglan-lore.json | 张升《瀛涯胜览集》classical Chinese | ZH text present; EN chapter IDs differ; OCR and cross-language anchors need review |
| mendes-pinto-lore.json | EN/PT machine-translated selection | **desk_only** — 8 records contain replacement characters; do not bind cities |
| daoyi-zhilue / zhenla / xingcha / changchun / yelu-xiyou | classical Chinese, editions not fully specified | 12 short records in total; original texts/page anchors absent in active book library |
| mandeville-lore.json | composite medieval wonder tradition, precise edition pending | **legend only** (`origin: authored`); 2 excerpts, not a complete book |

Local counts: 16 corpora, 462 place/story records; only 6 corpora have both raw
text and chapter files, 8 appear on the desk. “Integrated” in a table is a
declared integration state, not evidence of complete extraction, editorial
review or rights clearance. Edition declarations above are transcribed from
repository metadata, not independently certified here.

`passages_yingya.json` holds secondary harbour voices. Primary `passages.json`
and city `lore.ref` are not overwritten when Polo/Battuta already cite the city;
use `altRefs` on city records instead.
