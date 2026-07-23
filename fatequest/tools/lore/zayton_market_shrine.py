#!/usr/bin/env python3
"""
Fill PLAN P2-A gaps for Zayton:
  A4 — 12 Zayton-market-specific commodity descriptions (from Polo chapter)
  A5 — standalone shrine description (~150 chars)
  奇事 — wonder observation from Polo

Voice: Yule-Cordier register per LORE_PIPELINE.md §4
Usage: python tools/lore/zayton_market_shrine.py
"""

import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ================================================================
# A4: 12 market-flavour descriptions for Zayton's quay
# Each ties the commodity to the Polo chapter's language:
# tithe, freight rates, hundred shiploads, merchants of Manzi & India
# ================================================================
MARKET_ITEMS_EN = {
    "market.zayton.item.silk": (
        "Bales of raw Manzi silk, stacked eight-high in the customs shed, "
        "waiting to be weighed and taxed. The Kaan's clerks nick a corner of "
        "every bale to check the grade; finer than any the Persians spin."
    ),
    "market.zayton.item.porcelain": (
        "The white ware of Jingdezhen, packed in straw and sawdust, carried "
        "down the rivers on flat-bottomed boats. A percentage of every crate "
        "is broken in transit, and the merchants have already figured that cost "
        "into the price you pay."
    ),
    "market.zayton.item.dehua-porcelain": (
        "Blanc de Chine out of the Dehua kilns — unglazed on the surface, "
        "warm as ivory. The Arab merchants call it 'the fat of the earth' and "
        "pay the forty-four in the hundred freight without complaint."
    ),
    "market.zayton.item.tea": (
        "Tea pressed into bricks and stamped with the producer's chop. "
        "The quayside merchants will trade a brick for a sack of pepper "
        "straight across, and both sides consider it a bargain."
    ),
    "market.zayton.item.lacquerware": (
        "Black and cinnabar-red lacquer from the workshops of Fuju, cured "
        "in the damp heat of the coastal summer. The Indian merchants prize it "
        "for the way candlelight moves across the surface like oil on dark water."
    ),
    "market.zayton.item.rhubarb": (
        "The dried root of the Tangut rhubarb — worth more pound for pound "
        "than cinnamon in the apothecaries of Venice. The warehousemen weigh it "
        "on the same brass scales they use for pearls."
    ),
    "market.zayton.item.ginger": (
        "Preserved ginger in clay jars sealed with wax, bound for the galleys "
        "of Hormuz and Aden. The spice merchants say a ship without ginger is "
        "a ship that will lose half its crew to the flux."
    ),
    "market.zayton.item.cinnabar": (
        "Cinnabar from the mountain mines of the south, sold in both the raw "
        "stone and the ground powder — the latter in small stoppered bottles "
        "because the wind off the haven will carry it away by the grain."
    ),
    "market.zayton.item.paper-money": (
        "The Kaan's own currency, printed on mulberry-bark sheets with the "
        "imperial seal in vermilion. The quay-side money-changers will swap "
        "silver for paper at a rate that changes with the tide."
    ),
    "market.zayton.item.hangzhou-fan": (
        "Folding fans from Kinsay, their ribs of sandalwood, their leaves "
        "painted with calligraphy. A merchant who buys a crate of these at "
        "Zayton can sell them in Damascus for ten times the price."
    ),
    "market.zayton.item.sugar": (
        "Cane sugar from the plantations of Fuju, shipped up the coast in "
        "cone-shaped loaves wrapped in palm-leaf. A cone of sugar is the "
        "universal gift at the quay; no deal is closed without one."
    ),
    "market.zayton.item.musk": (
        "The musk-pod from the deer of the Tibetan marches, brought down to "
        "Zayton by caravan through the passes. A single pod, no bigger than "
        "a walnut, will scent a cargo of silk for a month."
    ),
}

# Market overview (the quay as a place)
MARKET_OVERVIEW_EN = (
    "The quay of Zayton runs the length of the water and is never quiet. "
    "Pepper comes ashore in sacks the height of a man; there are pearls "
    "weighed out in little brass scales, and lignaloes and sandalwood stacked "
    "like cordwood. You must know that the merchant pays dearly here: the "
    "Kaan takes a tithe of everything, ten in the hundred, and the ship's "
    "charge on top of it — thirty in the hundred on small wares, forty on "
    "bulky goods, and four and forty on pepper. Between the freight and the "
    "Kaan's due a man pays out a good half of what his cargo is worth. And "
    "yet on the other half he makes so great a profit that he is always glad "
    "to come back with more."
)

# ================================================================
# A5: Standalone shrine description (~150 chars, Polo-voice)
# ================================================================
SHRINE_DESC_EN = (
    "Above the anchorage, on a hill that catches the first light off the "
    "sea, stands the temple of the sea-goddess. Her gilded figure looks "
    "south across the water; at her feet, the shipmasters burn paper and set "
    "out dishes of rice. The gongs call the faithful three times a day — at "
    "dawn, at noon, and when the tide turns. No ship out of Zayton sails "
    "without a man climbing this hill first."
)

# ================================================================
# 奇事 (Wonder): the hundred shiploads — the marvel of Zayton
# ================================================================
WONDER_EN = (
    "You have heard men speak of Alexandria and her hundred spired "
    "warehouses. Know this: for every shipload of pepper that reaches "
    "Alexandria bound for Christendom, a hundred such come in to this haven "
    "of Zayton — aye, and more too. The ships of India crowd the water so "
    "thickly that their masts, seen from the hill at sunrise, look like a "
    "burnt forest. And it is not only pepper. Precious stones, pearls, "
    "spicery of every kind that grows, silk enough to clothe an empire — "
    "all of it passes through this quay, and the Kaan's clerks are not "
    "finished counting before the next season's fleet appears on the horizon."
)

# ================================================================
# Chinese (short strings only — long-form waits for review pass)
# ================================================================
MARKET_ITEMS_ZH = {
    "market.zayton.item.silk":       "蛮子生丝，捆成八层高堆在海关棚里，等着过秤抽税。",
    "market.zayton.item.porcelain":  "景德镇白瓷，裹着稻草与锯末，从内陆走平底船运来。",
    "market.zayton.item.dehua-porcelain": "德化白瓷——阿拉伯商人管它叫「地之脂」，付四成四的运费也不皱眉。",
    "market.zayton.item.tea":        "茶饼，压成砖，盖着产区印戳。码头上茶砖换胡椒，一比一。",
    "market.zayton.item.lacquerware": "黑红双色漆器，福州坊间所出，在南方沿海的湿气中晾干。",
    "market.zayton.item.rhubarb":    "唐古特大黄的干根——论斤卖，价比威尼斯药铺里的肉桂还贵。",
    "market.zayton.item.ginger":     "糖姜，封在蜡罐里，准备上船往忽鲁谟斯和亚丁。",
    "market.zayton.item.cinnabar":   "朱砂，产自南方山矿，既有原石也卖磨好的粉。",
    "market.zayton.item.paper-money":"大汗的纸钞，印在楮皮纸上，盖着朱红御玺。",
    "market.zayton.item.hangzhou-fan":"杭扇，檀香木为骨，扇面写满行书。一箱扇子在刺桐上船，到大马士革值十倍。",
    "market.zayton.item.sugar":      "蔗糖，福州蔗园所产，压成圆锥裹以棕叶。码头上没有不带糖送出手的买卖。",
    "market.zayton.item.musk":       "麝香，来自藏地高原的麝鹿，经山口由商队驮到刺桐。",
}

MARKET_OVERVIEW_ZH = (
    "刺桐的码头沿着水岸伸展，从无片刻安静。胡椒装进齐人高的麻袋上岸；"
    "珍珠在小小的黄铜天平上过秤；檀香木与沉香木像劈柴一样码着。"
    "你得知道，在这里做买卖可不便宜：大汗征收什一税，十取其十；"
    "船运费再加一层——细货三十取百，粗货四十取百，胡椒四十四取百。"
    "运费加汗税，商人得交出货值的一半。然而剩下那一半的利润就够他高高兴兴地再来一趟。"
)

SHRINE_DESC_ZH = (
    "锚地上方的山丘上，迎着海上第一道光，立着海神天妃的庙。"
    "她贴着金的身像面南望海；脚下，船主们烧纸、摆了米饭。"
    "锣声一日三响——黎明、正午、涨潮时。刺桐出港的船，没有一艘不等一个人先上这座山。"
)

WONDER_ZH = (
    "你听人说过亚历山大港和它百座尖塔的仓库吧。你要知道：凡有一船胡椒运到亚历山大送往基督教世界，"
    "就有一百船——不止——来到这刺桐港。天竺的船挤满了水面，桅杆密如焚过的树林。"
    "不仅是胡椒。宝石、珍珠、天下所有香料、够一个帝国穿的丝绸——全从这码头经过，"
    "而大汗的税吏还没点完上一季的账，下一季的船队已经出现在海平线上。"
)

# ================================================================
# Write to i18n files
# ================================================================
I18N = os.path.join(ROOT, "content", "i18n")

for lang, data in [
    ("en", {
        "city.zayton.market.desc": MARKET_OVERVIEW_EN,
        "city.zayton.shrine.desc": SHRINE_DESC_EN,
        "city.zayton.wonder":      WONDER_EN,
        **MARKET_ITEMS_EN,
    }),
    ("zh", {
        "city.zayton.market.desc": MARKET_OVERVIEW_ZH,
        "city.zayton.shrine.desc": SHRINE_DESC_ZH,
        "city.zayton.wonder":      WONDER_ZH,
        **MARKET_ITEMS_ZH,
    }),
]:
    path = os.path.join(I18N, f"{lang}.json")
    with open(path, "r") as f:
        db = json.load(f)

    n = 0
    for k, v in data.items():
        if db.get(k) != v:
            db[k] = v
            n += 1

    db = dict(sorted(db.items()))
    with open(path, "w") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"{lang}.json: {n} strings written")

print("Done: A4 market (12 items + overview), A5 shrine, 奇事 wonder")
