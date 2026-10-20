class_name IChingOrder
extends RefCounted

## Shared conversion between the engine's line mask and the visual/content
## numbering used by the King Wen sequence.
##
## The cast engine stores six lines bottom-to-top in one bit mask: bit 0 is
## the bottom line and a set bit means yang.  The content table is indexed
## zero-based in King Wen order, while deck filenames use the printed
## one-based number (01..64).  These are three different representations and
## must not be passed through `% 64` as if they were interchangeable.

const TRIGRAM_INDEX_BY_BITS := {
	0: 7, # 坤 ☷
	1: 6, # 艮 ☶
	2: 5, # 坎 ☵
	3: 4, # 巽 ☴
	4: 3, # 震 ☳
	5: 2, # 离 ☲
	6: 1, # 兑 ☱
	7: 0, # 乾 ☰
}

## Rows are lower trigrams; columns are upper trigrams.  Trigram order is
## 乾、兑、离、震、巽、坎、艮、坤, matching the historical web implementation.
const KING_WEN_BY_TRIGRAM := [
	[1, 43, 14, 34, 9, 5, 26, 11],
	[10, 58, 38, 54, 61, 60, 41, 19],
	[13, 49, 30, 55, 37, 63, 22, 36],
	[25, 17, 21, 51, 42, 3, 27, 24],
	[44, 28, 50, 32, 57, 48, 18, 46],
	[6, 47, 64, 40, 59, 29, 4, 7],
	[33, 31, 56, 62, 53, 39, 52, 15],
	[12, 45, 35, 16, 20, 8, 23, 2],
]


static func king_wen_number(mask: int) -> int:
	if mask < 0 or mask > 63:
		return -1
	var lower_bits := mask & 7
	var upper_bits := (mask >> 3) & 7
	var lower := int(TRIGRAM_INDEX_BY_BITS.get(lower_bits, -1))
	var upper := int(TRIGRAM_INDEX_BY_BITS.get(upper_bits, -1))
	if lower < 0 or upper < 0:
		return -1
	return int(KING_WEN_BY_TRIGRAM[lower][upper])


## Content table and i18n records use zero-based King Wen order (`hex-0` is
## 乾).  Returns -1 for an invalid mask.
static func content_index(mask: int) -> int:
	var number := king_wen_number(mask)
	return number - 1 if number > 0 else -1
