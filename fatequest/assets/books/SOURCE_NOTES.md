# Public-domain sources for desk books and secondary corpora

Confirmed for this tree (US public-domain / classical Chinese):

| Corpus file | Edition | Status |
|---|---|---|
| marco-polo-lore.json | Yule–Cordier (Gutenberg) | integrated |
| ibn-battuta / fadlan / jubayr | existing pipeline editions | integrated |
| rubruck-lore.json | Rockhill, Hakluyt Society, 1900 | curated excerpts |
| odoric-lore.json | Yule, Cathay and the Way Thither, 1866 | curated excerpts |
| conti-lore.json | Major, India in the Fifteenth Century, 1857 | curated excerpts |
| tafur-lore.json | Letts, Broadway Travellers, 1926 | PD in US (pre-1929); desk excerpts |
| yingya-shenglan-lore.json | 张升《瀛涯胜览集》classical Chinese | regenerated from ZH txt |
| mendes-pinto-lore.json | EN/PT excerpt | **desk_only** — do not bind cities |
| daoyi-zhilue / zhenla / xingcha / changchun / yelu-xiyou | classical Chinese | chronicle / codex |
| mandeville-lore.json | medieval wonder tradition | **legend only** (`origin: authored`) |

`passages_yingya.json` holds secondary harbour voices. Primary `passages.json`
and city `lore.ref` are not overwritten when Polo/Battuta already cite the city;
use `altRefs` on city records instead.
