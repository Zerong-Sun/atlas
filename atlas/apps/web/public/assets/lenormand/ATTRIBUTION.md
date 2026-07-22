# Lenormand Card Attribution

## Active deck: Classic Dondorf (individual scans)

- **Style**: 19th-century German Petit Lenormand (Dondorf / Wahrsagekarten tradition)
- **Format**: 36 separate card JPEGs (350×550), no sheet cropping
- **Digitization**: [taluowa.com](https://www.taluowa.com) — URL list in [look-fate/tarot-lab](https://github.com/look-fate/tarot-lab) (`Script/simple-lenormand.txt`)
- **Underlying art**: Public domain (19th-century card designs)

Refresh: `npm run fetch-lenormand` in `packages/corpus-scripts`.

## Alternate decks

| Deck | Command | Directory | Notes |
|------|---------|-----------|-------|
| British Museum Dondorf 1896,0501.308 | `npm run fetch-lenormand:bm` | `bm-dondorf-308/` | Extracted from 2 BM Commons photos; **CC BY-NC-SA 4.0** |
| Game of Hope 1799 | `npm run fetch-lenormand:game-of-hope` | `game-of-hope-1799/` | Sheet-cropped, may clip edges |
| Ch. Didot c.1890 (Yale IIIF) | `npm run fetch-lenormand:didot` | `didot-1890/` | Sheet-cropped, may clip edges |

### British Museum deck (bm-dondorf-308)

- **Museum object**: [1896,0501.308](https://www.britishmuseum.org/collection/object/P_1896-0501-308) — complete pack of 36 Mlle. Lenormand fortune-telling cards, B. Dondorf chromolithograph
- **Source photos** (Wikimedia Commons):
  - [Print, playing-card (BM 1896,0501.308)](https://commons.wikimedia.org/wiki/File:Print,_playing-card_(BM_1896,0501.308).jpg)
  - [Print, playing-card (BM 1896,0501.308 1)](https://commons.wikimedia.org/wiki/File:Print,_playing-card_(BM_1896,0501.308_1).jpg)
- **Extraction**: OpenCV template matching against reference faces; cards are cropped from scattered layouts (not individual BM catalogue files)
- **Photo license**: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — British Museum — **non-commercial use**
- **Card art**: Public domain (19th century)

## Card numbering

Standard Petit Lenormand order (1–36):

| # | File | 中文 |
|---|------|------|
| 1 | 01-rider.jpg | 骑士 |
| 2 | 02-clover.jpg | 三叶草 |
| 3 | 03-ship.jpg | 船 |
| 4 | 04-house.jpg | 房子 |
| 5 | 05-tree.jpg | 树 |
| 6 | 06-cloud.jpg | 云 |
| 7 | 07-snake.jpg | 蛇 |
| 8 | 08-coffin.jpg | 棺材 |
| 9 | 09-bouquet.jpg | 花束 |
| 10 | 10-scythe.jpg | 镰刀 |
| 11 | 11-whip.jpg | 鞭子 |
| 12 | 12-birds.jpg | 鸟 |
| 13 | 13-child.jpg | 小孩 |
| 14 | 14-fox.jpg | 狐狸 |
| 15 | 15-bear.jpg | 熊 |
| 16 | 16-stars.jpg | 星星 |
| 17 | 17-stork.jpg | 鹳 |
| 18 | 18-dog.jpg | 狗 |
| 19 | 19-tower.jpg | 塔 |
| 20 | 20-garden.jpg | 花园 |
| 21 | 21-mountain.jpg | 山 |
| 22 | 22-crossroads.jpg | 十字路口 |
| 23 | 23-mice.jpg | 老鼠 |
| 24 | 24-heart.jpg | 心 |
| 25 | 25-ring.jpg | 戒指 |
| 26 | 26-book.jpg | 书 |
| 27 | 27-letter.jpg | 信 |
| 28 | 28-man.jpg | 男人 |
| 29 | 29-woman.jpg | 女人 |
| 30 | 30-lily.jpg | 百合 |
| 31 | 31-sun.jpg | 太阳 |
| 32 | 32-moon.jpg | 月亮 |
| 33 | 33-key.jpg | 钥匙 |
| 34 | 34-fish.jpg | 鱼 |
| 35 | 35-anchor.jpg | 锚 |
| 36 | 36-cross.jpg | 十字架 |

## License note

Historic Lenormand artwork is public domain. Hosted scans are used for non-commercial educational divination UI. Verify rights for your deployment — especially the BM deck (NC license on photographs).
