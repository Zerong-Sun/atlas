#!/usr/bin/env python3
"""
Convert metropolis site stubs (choice.look) into rich mechanism-based events
matching the Zayton/Lop template pattern.

Each site gets 2-3 choices with costs, conditions, and game effects.
Keeps existing event IDs (ev-{city}-a/b/c), body text, and lore metadata.
Replaces choices array and writes descriptive i18n labels.

Usage: python tools/lore/build_rich_sites.py
"""

import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ======================================================================
# Rich choice definitions for all 10 metropolises (not Zayton or Lop)
# Each choice has:
#   id         - short slug for the i18n key (e.g. "merchants")
#   labelEn    - descriptive English label in Yule-Cordier voice
#   labelZh    - Chinese label (only short strings per LORE_PIPELINE.md §4)
#   needs      - optional conditions
#   effects    - game effects array
#
# i18n key format: ev.{city}.{slot}.choice.{id}
# ======================================================================

RICH_DEFS = {

    # ===================================================================
    # TAURIS (大不里士) — The Ilkhan's commercial crossroads
    # ===================================================================
    "tauris": {
        "a": {  # "The Ilkhan's City"
            "choices": [
                {
                    "id": "merchants",
                    "labelEn": "Ask the foreign merchants about the roads ahead",
                    "labelZh": "向外国商人打听前路",
                    "effects": [
                        {"op": "reveal_map", "value": "baldacum", "reason": "foreign-merchants-named-the-roads"},
                        {"op": "reveal_map", "value": "trapezus", "reason": "foreign-merchants-named-the-roads"},
                        {"op": "codex", "value": "cx-tauris", "reason": "heard-the-merchants-talk"}
                    ]
                },
                {
                    "id": "pearls",
                    "labelEn": "Buy a Tabriz pearl in the Great Bazaar",
                    "labelZh": "在大巴扎买一颗大不里士珍珠",
                    "needs": {"coins": {"min": 800}},
                    "effects": [
                        {"op": "coins", "value": -800, "reason": "bought-a-tabriz-pearl"},
                        {"op": "goods", "id": "tabriz-pearls", "value": 1, "reason": "bought-a-tabriz-pearl"},
                        {"op": "sticker", "value": "st-tauris-pearl", "reason": "first-persian-pearl"}
                    ]
                },
                {
                    "id": "view",
                    "labelEn": "Climb the hill to see the whole city",
                    "labelZh": "爬上山顶瞰全城",
                    "effects": [
                        {"op": "days", "value": 1, "reason": "climbed-the-hill-over-tauris"},
                        {"op": "sticker", "value": "st-tauris-view", "reason": "saw-the-plain-from-the-hill"},
                        {"op": "codex", "value": "cx-tauris", "reason": "looked-out-from-the-ilkhan-palace"}
                    ]
                }
            ]
        },
        "b": {  # "The Merchant Quarters"
            "choices": [
                {
                    "id": "latin",
                    "labelEn": "Speak with the Genoese merchants in their fondaco",
                    "labelZh": "与热那亚商人交谈",
                    "needs": {"language": "persian"},
                    "effects": [
                        {"op": "reputation", "value": 2, "scope": "band", "id": "west_asia", "reason": "spoke-with-the-latin-merchants"},
                        {"op": "reveal_map", "value": "constantinopolis", "reason": "genoese-described-the-west-road"},
                        {"op": "codex", "value": "cx-tauris", "reason": "learned-the-trade-routes"}
                    ]
                },
                {
                    "id": "dragoman",
                    "labelEn": "Hire a dragoman and learn the Persian tongue",
                    "labelZh": "雇一名通译学波斯语",
                    "needs": {"coins": {"min": 2000}},
                    "effects": [
                        {"op": "coins", "value": -2000, "reason": "hired-a-dragoman"},
                        {"op": "language", "value": "persian", "reason": "a-season-in-the-bazaars"},
                        {"op": "days", "value": 20, "reason": "a-season-in-the-bazaars"},
                        {"op": "codex", "value": "cx-tauris", "reason": "the-dragoman-named-every-quarter"}
                    ]
                },
                {
                    "id": "browse",
                    "labelEn": "Walk the covered market and listen",
                    "labelZh": "漫步室内市场侧耳细听",
                    "effects": [
                        {"op": "codex", "value": "cx-tauris", "reason": "walked-the-covered-market"},
                        {"op": "reveal_map", "value": "caffa", "reason": "armenian-traders-named-the-north-road"}
                    ]
                }
            ]
        },
        "c": {  # "The Garden Suburbs"
            "choices": [
                {
                    "id": "rest",
                    "labelEn": "Rest a fortnight in the gardens among the jasmine",
                    "labelZh": "在花园里休憩半月",
                    "effects": [
                        {"op": "days", "value": 14, "reason": "rested-in-the-gardens"},
                        {"op": "fate", "id": "rapport", "value": 2, "reason": "a-fortnight-of-peace"}
                    ]
                },
                {
                    "id": "fruit",
                    "labelEn": "Buy dried apricots and pistachios for the road",
                    "labelZh": "买些杏脯和开心果备路上吃",
                    "needs": {"coins": {"min": 120}},
                    "effects": [
                        {"op": "coins", "value": -120, "reason": "bought-dried-apricots-and-pistachios"},
                        {"op": "item", "value": "it-dried-fruit", "reason": "provisioned-from-the-orchards"}
                    ]
                },
                {
                    "id": "wander",
                    "labelEn": "Walk the qanats and learn how the water comes",
                    "labelZh": "沿坎儿井走看水从何来",
                    "effects": [
                        {"op": "sticker", "value": "st-tauris-gardens", "reason": "walked-the-qanats"},
                        {"op": "codex", "value": "cx-tauris", "reason": "learned-how-the-water-comes"}
                    ]
                }
            ]
        }
    },

    # ===================================================================
    # BALDACUM (报达/Baghdad) — The fallen seat of the Caliph
    # ===================================================================
    "baldacum": {
        "a": {  # "The Caliph's Palace"
            "choices": [
                {
                    "id": "explore",
                    "labelEn": "Explore the ruined halls of the Caliph",
                    "labelZh": "探哈里发废弃的宫殿",
                    "effects": [
                        {"op": "days", "value": 2, "reason": "searched-the-ruined-palace"},
                        {"op": "codex", "value": "cx-baldacum", "reason": "walked-the-caliphs-halls"},
                        {"op": "reveal_map", "value": "basora", "reason": "saw-the-tigris-road-from-the-palace"}
                    ]
                },
                {
                    "id": "treasure",
                    "labelEn": "Bribe the old warden and search the treasury rubble",
                    "labelZh": "贿赂老看守翻寻宝库废墟",
                    "needs": {"coins": {"min": 500}},
                    "effects": [
                        {"op": "coins", "value": -500, "reason": "bribes-in-the-ruins"},
                        {"op": "goods", "id": "damascus-steel", "value": 1, "reason": "found-a-blade-in-the-treasure-rubble"},
                        {"op": "codex", "value": "cx-baldacum", "reason": "searched-the-treasury"}
                    ]
                },
                {
                    "id": "listen",
                    "labelEn": "Hire a guard to tell you what this place once was",
                    "labelZh": "雇一名守卫讲这宫殿旧日模样",
                    "effects": [
                        {"op": "days", "value": 1, "reason": "heard-the-guards-tale"},
                        {"op": "sticker", "value": "st-baldacum-palace", "reason": "stood-where-the-caliph-stood"},
                        {"op": "codex", "value": "cx-baldacum", "reason": "the-guard-told-of-the-caliphs-height"}
                    ]
                }
            ]
        },
        "b": {  # "The Bazaars of Baudas"
            "choices": [
                {
                    "id": "brocade",
                    "labelEn": "Buy a length of Baghdad brocade worked with gold",
                    "labelZh": "买一段金线织成的报达锦",
                    "needs": {"coins": {"min": 2500}},
                    "effects": [
                        {"op": "coins", "value": -2500, "reason": "bought-baghdad-brocade"},
                        {"op": "goods", "id": "baghdad-brocade", "value": 1, "reason": "bought-baghdad-brocade"},
                        {"op": "sticker", "value": "st-baldacum-brocade", "reason": "first-silk-of-baudas"}
                    ]
                },
                {
                    "id": "spices",
                    "labelEn": "Ask the spice-sellers where their wares come from",
                    "labelZh": "问香料商他们的货从哪来",
                    "effects": [
                        {"op": "reveal_map", "value": "ormus", "reason": "spice-merchants-named-the-sea-road"},
                        {"op": "reveal_map", "value": "basora", "reason": "date-merchants-named-the-river-road"},
                        {"op": "codex", "value": "cx-baldacum", "reason": "learned-what-comes-through-baudas"}
                    ]
                },
                {
                    "id": "sherbet",
                    "labelEn": "Drink sherbet with the money-changers and listen",
                    "labelZh": "与兑钱商共饮果子露听听行情",
                    "effects": [
                        {"op": "days", "value": 1, "reason": "drank-sherbet-with-the-changers"},
                        {"op": "reputation", "value": 1, "scope": "city", "id": "baldacum", "reason": "kept-company-with-the-coin-changers"},
                        {"op": "codex", "value": "cx-baldacum", "reason": "the-changers-told-of-the-trade"}
                    ]
                }
            ]
        },
        "c": {  # "The Fall of the City"
            "choices": [
                {
                    "id": "listen",
                    "labelEn": "Hear the full tale of how Hulagu took the city",
                    "labelZh": "听旭烈兀破城始末",
                    "effects": [
                        {"op": "codex", "value": "cx-baldacum", "reason": "heard-the-full-tale"},
                        {"op": "sticker", "value": "st-baldacum-fall", "reason": "heard-the-tale-of-the-fall"}
                    ]
                },
                {
                    "id": "search",
                    "labelEn": "Search for a coin from before the sack",
                    "labelZh": "找一枚破城前的旧钱",
                    "effects": [
                        {"op": "coins", "value": -200, "reason": "bribes-for-the-old-warden"},
                        {"op": "item", "value": "it-old-coin", "reason": "found-a-coin-from-before-the-fall"},
                        {"op": "codex", "value": "cx-baldacum", "reason": "the-warden-showed-the-hidden-places"}
                    ]
                },
                {
                    "id": "record",
                    "labelEn": "Write down the story while it is still told",
                    "labelZh": "趁还有人讲述记下这个故事",
                    "effects": [
                        {"op": "days", "value": 2, "reason": "writing-down-the-tale"},
                        {"op": "codex", "value": "cx-baldacum", "reason": "preserved-the-tale-of-the-fall"},
                        {"op": "sticker", "value": "st-baldacum-fall", "reason": "wrote-down-the-tale"}
                    ]
                }
            ]
        }
    },

    # ===================================================================
    # ORMUS (忽鲁谟斯) — Spice hub on the Persian Gulf
    # ===================================================================
    "ormus": {
        "a": {  # "The Harbor Fort"
            "choices": [
                {
                    "id": "toll",
                    "labelEn": "Pay the harbor toll and pass through properly",
                    "labelZh": "缴纳港税堂堂正正入关",
                    "needs": {"coins": {"min": 300}},
                    "effects": [
                        {"op": "coins", "value": -300, "reason": "paid-the-harbor-toll"},
                        {"op": "reputation", "value": 1, "scope": "city", "id": "ormus", "reason": "paid-the-toll-properly"},
                        {"op": "codex", "value": "cx-ormus", "reason": "learned-the-port-laws"}
                    ]
                },
                {
                    "id": "pearl_diver",
                    "labelEn": "Talk to the pearl-divers on the quay",
                    "labelZh": "与码头的采珠人交谈",
                    "effects": [
                        {"op": "reveal_map", "value": "calatu", "reason": "divers-named-the-next-port"},
                        {"op": "codex", "value": "cx-ormus", "reason": "heard-the-pearl-divers-tales"}
                    ]
                },
                {
                    "id": "watch_ships",
                    "labelEn": "Stand on the fort wall and count the ships",
                    "labelZh": "站在堡墙上数船",
                    "effects": [
                        {"op": "days", "value": 1, "reason": "watched-the-ships-from-the-fort"},
                        {"op": "sticker", "value": "st-ormus-fort", "reason": "stood-in-the-harbor-fort"},
                        {"op": "codex", "value": "cx-ormus", "reason": "counted-the-ships-at-hormos"}
                    ]
                }
            ]
        },
        "b": {  # "The Spice Market"
            "choices": [
                {
                    "id": "pepper",
                    "labelEn": "Buy pepper at the monsoon price",
                    "labelZh": "按季风价买胡椒",
                    "needs": {"coins": {"min": 15000}},
                    "effects": [
                        {"op": "coins", "value": -15000, "reason": "bought-pepper-at-monsoon-price"},
                        {"op": "goods", "id": "pepper", "value": 1, "reason": "bought-pepper-at-monsoon-price"},
                        {"op": "codex", "value": "cx-ormus", "reason": "learned-the-spice-prices"}
                    ]
                },
                {
                    "id": "ginger",
                    "labelEn": "Buy dried ginger from an Indian dhow",
                    "labelZh": "从印度船买干姜",
                    "needs": {"coins": {"min": 300}},
                    "effects": [
                        {"op": "coins", "value": -300, "reason": "bought-dried-ginger"},
                        {"op": "goods", "id": "ginger", "value": 1, "reason": "bought-dried-ginger"},
                        {"op": "sticker", "value": "st-ormus-spice", "reason": "first-spice-from-the-indies"}
                    ]
                },
                {
                    "id": "trade_routes",
                    "labelEn": "Learn the spice routes from the Indian merchants",
                    "labelZh": "向印度商人学习香料航线",
                    "effects": [
                        {"op": "reveal_map", "value": "calatu", "reason": "spice-traders-named-the-ports"},
                        {"op": "reveal_map", "value": "cobinan", "reason": "caravan-masters-named-the-inland-road"},
                        {"op": "codex", "value": "cx-ormus", "reason": "learned-the-spice-routes"}
                    ]
                }
            ]
        },
        "c": {  # "The Wind of Death"
            "choices": [
                {
                    "id": "guide",
                    "labelEn": "Pay a guide who knows the wind patterns",
                    "labelZh": "雇一名懂风信的向导",
                    "needs": {"coins": {"min": 150}},
                    "effects": [
                        {"op": "coins", "value": -150, "reason": "hired-a-guide-who-knows-the-wind"},
                        {"op": "days", "value": 2, "reason": "learned-the-wind-patterns"},
                        {"op": "codex", "value": "cx-ormus", "reason": "the-guide-taught-the-wind-signs"}
                    ]
                },
                {
                    "id": "wait",
                    "labelEn": "Wait out the wind in an underground chamber",
                    "labelZh": "在地下室熬过这阵热风",
                    "effects": [
                        {"op": "days", "value": 3, "reason": "waited-out-the-wind-underground"},
                        {"op": "fate", "id": "travel", "value": 1, "reason": "endured-the-wind-of-death"}
                    ]
                },
                {
                    "id": "observe",
                    "labelEn": "Watch how the people of Hormos survive the wind",
                    "labelZh": "看忽鲁谟斯人怎么熬过这阵风",
                    "effects": [
                        {"op": "codex", "value": "cx-ormus", "reason": "watched-how-the-people-survive"},
                        {"op": "sticker", "value": "st-ormus-wind", "reason": "felt-the-wind-of-death"}
                    ]
                }
            ]
        }
    },

    # ===================================================================
    # SAMARCANDA (撒马尔罕) — The Blue City, garden of the world
    # ===================================================================
    "samarcanda": {
        "a": {  # "The Blue City"
            "choices": [
                {
                    "id": "madrasa",
                    "labelEn": "Visit the madrasas of the Registan",
                    "labelZh": "参观列吉斯坦的经学院",
                    "effects": [
                        {"op": "days", "value": 2, "reason": "visited-the-madrasas"},
                        {"op": "codex", "value": "cx-samarcanda", "reason": "studied-at-the-registan"},
                        {"op": "fate", "id": "rapport", "value": 1, "reason": "wisdom-of-the-blue-city"}
                    ]
                },
                {
                    "id": "dome",
                    "labelEn": "Stand beneath the turquoise dome of the Gur-i-Mir",
                    "labelZh": "站在古尔-埃米尔绿松石穹顶下",
                    "effects": [
                        {"op": "sticker", "value": "st-samarcanda-dome", "reason": "stood-beneath-the-gur-i-mir"},
                        {"op": "codex", "value": "cx-samarcanda", "reason": "saw-the-tomb-of-timur"}
                    ]
                },
                {
                    "id": "gardens",
                    "labelEn": "Walk the canal-lined streets and greet the scholars",
                    "labelZh": "沿水渠漫步向学者致意",
                    "effects": [
                        {"op": "sticker", "value": "st-samarcanda-gardens", "reason": "walked-the-canals"},
                        {"op": "reputation", "value": 1, "scope": "city", "id": "samarcanda", "reason": "admired-as-a-scholar"},
                        {"op": "codex", "value": "cx-samarcanda", "reason": "walked-the-garden-city"}
                    ]
                }
            ]
        },
        "b": {  # "The Paper-Makers' Quarter"
            "choices": [
                {
                    "id": "paper",
                    "labelEn": "Buy a sheaf of Samarcand paper",
                    "labelZh": "买一叠撒马尔罕纸",
                    "needs": {"coins": {"min": 500}},
                    "effects": [
                        {"op": "coins", "value": -500, "reason": "bought-samarcand-paper"},
                        {"op": "goods", "id": "paper", "value": 1, "reason": "bought-samarcand-paper"},
                        {"op": "sticker", "value": "st-samarcanda-paper", "reason": "owned-the-worlds-best-paper"}
                    ]
                },
                {
                    "id": "learn",
                    "labelEn": "Watch the paper-makers at their craft",
                    "labelZh": "看造纸匠的工艺",
                    "effects": [
                        {"op": "days", "value": 1, "reason": "watched-the-paper-makers"},
                        {"op": "codex", "value": "cx-samarcanda", "reason": "learned-the-paper-secret"}
                    ]
                },
                {
                    "id": "manuscript",
                    "labelEn": "Buy an illuminated manuscript from a calligrapher",
                    "labelZh": "买一本书法家手抄的彩饰经卷",
                    "needs": {"coins": {"min": 1000}},
                    "effects": [
                        {"op": "coins", "value": -1000, "reason": "bought-a-calligrapher-manuscript"},
                        {"op": "item", "value": "it-illuminated-manuscript", "reason": "bought-a-calligrapher-manuscript"}
                    ]
                }
            ]
        },
        "c": {  # "The Miraculous Stone"
            "choices": [
                {
                    "id": "touch",
                    "labelEn": "Press your forehead to the weeping stone",
                    "labelZh": "以额触那会流泪的石头",
                    "effects": [
                        {"op": "fate", "id": "rapport", "value": 1, "reason": "pressed-forehead-to-the-stone"},
                        {"op": "codex", "value": "cx-samarcanda", "reason": "felt-the-weeping-stone"}
                    ]
                },
                {
                    "id": "pray",
                    "labelEn": "Pray in the great mosque for the road ahead",
                    "labelZh": "在大清真寺为前路祈祷",
                    "effects": [
                        {"op": "fate", "id": "travel", "value": 1, "reason": "prayed-for-the-road-ahead"},
                        {"op": "codex", "value": "cx-samarcanda", "reason": "prayed-at-the-great-mosque"}
                    ]
                },
                {
                    "id": "watch_pilgrims",
                    "labelEn": "Ask the mullahs when the stone last wept",
                    "labelZh": "问毛拉这石头上次几时流泪",
                    "effects": [
                        {"op": "sticker", "value": "st-samarcanda-stone", "reason": "saw-the-pilgrims-touch-the-stone"},
                        {"op": "codex", "value": "cx-samarcanda", "reason": "heard-when-the-stone-last-wept"}
                    ]
                }
            ]
        }
    },

    # ===================================================================
    # BALC (巴里黑/Balkh) — Ruins of Bactra, mother of cities
    # ===================================================================
    "balc": {
        "a": {  # "The Ruins of Bactra"
            "choices": [
                {
                    "id": "explore",
                    "labelEn": "Search the ruins where Alexander married Roxana",
                    "labelZh": "在亚历山大娶罗克珊娜的地方寻访废墟",
                    "effects": [
                        {"op": "days", "value": 2, "reason": "searched-the-ruins-of-bactra"},
                        {"op": "codex", "value": "cx-balc", "reason": "walked-where-alexander-walked"},
                        {"op": "reveal_map", "value": "samarcanda", "reason": "saw-the-road-from-the-old-walls"}
                    ]
                },
                {
                    "id": "fragment",
                    "labelEn": "Pick up a carved stone from the old city",
                    "labelZh": "捡一块旧城的雕刻残石",
                    "effects": [
                        {"op": "item", "value": "it-bactrian-fragment", "reason": "picked-up-a-carved-stone"},
                        {"op": "sticker", "value": "st-balc-ruins", "reason": "held-a-stone-from-bactra"},
                        {"op": "codex", "value": "cx-balc", "reason": "found-a-fragment-of-the-old-city"}
                    ]
                },
                {
                    "id": "listen",
                    "labelEn": "Ask an old man what this city was in its height",
                    "labelZh": "问一个老人这城最盛时是什么样子",
                    "effects": [
                        {"op": "codex", "value": "cx-balc", "reason": "heard-the-tale-of-alexander"},
                        {"op": "sticker", "value": "st-balc-ruins", "reason": "heard-the-story-of-bactras-height"}
                    ]
                }
            ]
        },
        "b": {  # "The Caravanserai of Balc"
            "choices": [
                {
                    "id": "lapis",
                    "labelEn": "Buy a block of raw lapis lazuli from Badakhshan",
                    "labelZh": "买一块巴达赫尚的青金石原石",
                    "needs": {"coins": {"min": 800}},
                    "effects": [
                        {"op": "coins", "value": -800, "reason": "bought-raw-lapis-lazuli"},
                        {"op": "goods", "id": "lapis", "value": 1, "reason": "bought-raw-lapis-lazuli"},
                        {"op": "sticker", "value": "st-balc-lapis", "reason": "first-lapis-from-badakhshan"}
                    ]
                },
                {
                    "id": "ruby",
                    "labelEn": "Buy a balas ruby — worth a ship in Venice",
                    "labelZh": "买一颗巴剌红宝石——在威尼斯值一条船",
                    "needs": {"coins": {"min": 4000}},
                    "effects": [
                        {"op": "coins", "value": -4000, "reason": "bought-a-balas-ruby"},
                        {"op": "goods", "id": "balas-ruby", "value": 1, "reason": "bought-a-balas-ruby"},
                        {"op": "sticker", "value": "st-balc-ruby", "reason": "a-stone-worth-a-ship-in-venice"}
                    ]
                },
                {
                    "id": "talk_traders",
                    "labelEn": "Ask the caravan masters where the roads go",
                    "labelZh": "问商队首领路通往何处",
                    "effects": [
                        {"op": "reveal_map", "value": "badashan", "reason": "traders-named-the-lapis-mines"},
                        {"op": "reveal_map", "value": "samarcanda", "reason": "traders-named-the-next-great-city"},
                        {"op": "codex", "value": "cx-balc", "reason": "learned-the-trade-of-the-caravanserai"}
                    ]
                }
            ]
        },
        "c": {  # "The Shrine of the Magi"
            "choices": [
                {
                    "id": "offering",
                    "labelEn": "Leave incense at the fire that has never gone out",
                    "labelZh": "在那盏从未熄灭的火前献香",
                    "needs": {"coins": {"min": 200}},
                    "effects": [
                        {"op": "coins", "value": -200, "reason": "left-incense-at-the-fire-temple"},
                        {"op": "fate", "id": "rapport", "value": 1, "reason": "honoured-the-ancient-flame"},
                        {"op": "codex", "value": "cx-balc", "reason": "stood-before-the-eternal-fire"}
                    ]
                },
                {
                    "id": "sleep",
                    "labelEn": "Sleep at the Tomb of the Magi and wait for a dream",
                    "labelZh": "在三贤墓旁睡一晚等一个梦",
                    "effects": [
                        {"op": "days", "value": 1, "reason": "slept-at-the-tomb-of-the-magi"},
                        {"op": "codex", "value": "cx-balc", "reason": "dreamed-at-the-shrine"},
                        {"op": "sticker", "value": "st-balc-magi", "reason": "slept-where-the-magi-sleep"}
                    ]
                },
                {
                    "id": "chant",
                    "labelEn": "Listen to the Magi chant at dawn",
                    "labelZh": "在黎明听祆教祭司诵唱",
                    "effects": [
                        {"op": "sticker", "value": "st-balc-magi", "reason": "heard-the-ancient-hymns"},
                        {"op": "codex", "value": "cx-balc", "reason": "watched-the-magi-chant-at-dawn"}
                    ]
                }
            ]
        }
    },

    # ===================================================================
    # CASCAR (喀什噶尔) — Garden oasis on the Silk Road
    # Note: 758 words — thin chapter, lean harder on authored/hybrid
    # ===================================================================
    "cascar": {
        "a": {  # "The Garden of the Tarim"
            "choices": [
                {
                    "id": "melon",
                    "labelEn": "Buy a Cascar melon — the sweetest in the world",
                    "labelZh": "买一个喀什噶尔蜜瓜——天下最甜",
                    "needs": {"coins": {"min": 50}},
                    "effects": [
                        {"op": "coins", "value": -50, "reason": "bought-a-cascar-melon"},
                        {"op": "item", "value": "it-cascar-melon", "reason": "the-sweetest-melon-in-the-world"}
                    ]
                },
                {
                    "id": "orchard",
                    "labelEn": "Walk the orchards watered by mountain snow",
                    "labelZh": "走在雪山融水浇灌的果园中",
                    "effects": [
                        {"op": "days", "value": 1, "reason": "walked-the-orchards-of-cascar"},
                        {"op": "sticker", "value": "st-cascar-garden", "reason": "tasted-the-garden-of-the-tarim"},
                        {"op": "codex", "value": "cx-cascar", "reason": "walked-the-oasis"}
                    ]
                },
                {
                    "id": "grapes",
                    "labelEn": "Buy dried grapes from a vineyard on the mountain slope",
                    "labelZh": "从山坡葡萄园买些葡萄干",
                    "needs": {"coins": {"min": 100}},
                    "effects": [
                        {"op": "coins", "value": -100, "reason": "bought-dried-grapes"},
                        {"op": "item", "value": "it-cascar-raisins", "reason": "bought-dried-grapes"}
                    ]
                }
            ]
        },
        "b": {  # "The Carpet Bazaar"
            "choices": [
                {
                    "id": "carpet",
                    "labelEn": "Buy a carpet that can pass through a finger-ring",
                    "labelZh": "买一张能穿过指环的地毯",
                    "needs": {"coins": {"min": 3000}},
                    "effects": [
                        {"op": "coins", "value": -3000, "reason": "bought-a-cascar-carpet"},
                        {"op": "goods", "id": "persian-carpet", "value": 1, "reason": "bought-a-cascar-carpet"},
                        {"op": "sticker", "value": "st-cascar-carpet", "reason": "a-carpet-that-passes-through-a-ring"}
                    ]
                },
                {
                    "id": "learn_weave",
                    "labelEn": "Watch a weaver and learn the prayers in the patterns",
                    "labelZh": "看织工织毯学图案里的祈祷词",
                    "effects": [
                        {"op": "days", "value": 1, "reason": "watched-the-carpet-weavers"},
                        {"op": "codex", "value": "cx-cascar", "reason": "learned-the-prayers-in-the-patterns"}
                    ]
                },
                {
                    "id": "dyes",
                    "labelEn": "Buy the secret dye-stuffs from the dyers",
                    "labelZh": "向染匠买那些秘传染料",
                    "needs": {"coins": {"min": 150}},
                    "effects": [
                        {"op": "coins", "value": -150, "reason": "bought-secret-dye-stuffs"},
                        {"op": "item", "value": "it-carpet-dyes", "reason": "bought-dyer-secrets"}
                    ]
                }
            ]
        },
        "c": {  # "The Shrine of the Seven Sleepers"
            "choices": [
                {
                    "id": "muslim",
                    "labelEn": "Enter through the mosque and hear the Muslim tale",
                    "labelZh": "从清真寺一侧进入听穆斯林传说",
                    "effects": [
                        {"op": "reputation", "value": 2, "scope": "band", "id": "central_asia", "reason": "prayed-with-the-muslim-pilgrims"},
                        {"op": "codex", "value": "cx-cascar", "reason": "heard-the-muslim-tale-of-the-sleepers"}
                    ]
                },
                {
                    "id": "christian",
                    "labelEn": "Enter through the chapel and hear the Christian tale",
                    "labelZh": "从小教堂一侧进入听基督徒传说",
                    "effects": [
                        {"op": "reputation", "value": 2, "scope": "band", "id": "central_asia", "reason": "prayed-with-the-christian-pilgrims"},
                        {"op": "codex", "value": "cx-cascar", "reason": "heard-the-christian-tale-of-the-sleepers"}
                    ]
                },
                {
                    "id": "both",
                    "labelEn": "Stay overnight in the cave and listen for their breathing",
                    "labelZh": "在洞中过一夜听沉睡者呼吸",
                    "effects": [
                        {"op": "days", "value": 1, "reason": "stayed-overnight-in-the-cave"},
                        {"op": "sticker", "value": "st-cascar-sleepers", "reason": "heard-the-sleepers-breathe"},
                        {"op": "codex", "value": "cx-cascar", "reason": "heard-both-tales-of-the-sleepers"}
                    ]
                }
            ]
        }
    },

    # ===================================================================
    # COTAN (于阗/Khotan) — Jade rivers and silk looms
    # Note: 540 words — thin chapter, hybrid/authored
    # ===================================================================
    "cotan": {
        "a": {  # "The Jade Rivers"
            "choices": [
                {
                    "id": "jade",
                    "labelEn": "Buy a piece of mutton-fat jade — worth its weight in gold",
                    "labelZh": "买一块羊脂白玉——价比黄金",
                    "needs": {"coins": {"min": 2000}},
                    "effects": [
                        {"op": "coins", "value": -2000, "reason": "bought-mutton-fat-jade"},
                        {"op": "goods", "id": "jade", "value": 1, "reason": "bought-mutton-fat-jade"},
                        {"op": "sticker", "value": "st-cotan-jade", "reason": "first-piece-of-cotan-jade"}
                    ]
                },
                {
                    "id": "wade",
                    "labelEn": "Wade into the cold river and feel for jade with your feet",
                    "labelZh": "踏入冰冷的河水用脚探玉",
                    "effects": [
                        {"op": "days", "value": 1, "reason": "waded-the-jade-rivers"},
                        {"op": "codex", "value": "cx-cotan", "reason": "felt-for-jade-with-bare-feet"}
                    ]
                },
                {
                    "id": "watch",
                    "labelEn": "Watch the divers from the bank and learn their craft",
                    "labelZh": "在岸边看采玉人学他们的技艺",
                    "effects": [
                        {"op": "sticker", "value": "st-cotan-rivers", "reason": "watched-the-jade-divers"},
                        {"op": "codex", "value": "cx-cotan", "reason": "learned-where-the-jade-comes-from"}
                    ]
                }
            ]
        },
        "b": {  # "The Silk Looms of Cotan"
            "choices": [
                {
                    "id": "silk",
                    "labelEn": "Buy a bolt of Cotan silk — finer than human hair",
                    "labelZh": "买一匹于阗丝——细过人发",
                    "needs": {"coins": {"min": 1500}},
                    "effects": [
                        {"op": "coins", "value": -1500, "reason": "bought-a-bolt-of-cotan-silk"},
                        {"op": "goods", "id": "silk", "value": 1, "reason": "bought-a-bolt-of-cotan-silk"},
                        {"op": "sticker", "value": "st-cotan-silk", "reason": "silk-finer-than-human-hair"}
                    ]
                },
                {
                    "id": "weave",
                    "labelEn": "Sit with the women at the looms and learn their song",
                    "labelZh": "坐在织机旁与女工一起学她们的歌",
                    "effects": [
                        {"op": "days", "value": 1, "reason": "watched-the-silk-weavers"},
                        {"op": "codex", "value": "cx-cotan", "reason": "learned-the-weavers-song"}
                    ]
                },
                {
                    "id": "dyes",
                    "labelEn": "Buy dye samples — saffron, indigo, madder, cochineal",
                    "labelZh": "买染料样本——番红花靛蓝茜草胭脂虫",
                    "needs": {"coins": {"min": 120}},
                    "effects": [
                        {"op": "coins", "value": -120, "reason": "bought-dye-samples"},
                        {"op": "item", "value": "it-dye-sample", "reason": "bought-dyer-secrets"}
                    ]
                }
            ]
        },
        "c": {  # "The Buddha Dust"
            "choices": [
                {
                    "id": "explore",
                    "labelEn": "Dig in the buried city of a thousand monasteries",
                    "labelZh": "在千寺之城的废墟中挖掘",
                    "effects": [
                        {"op": "days", "value": 3, "reason": "dug-in-the-buried-city"},
                        {"op": "codex", "value": "cx-cotan", "reason": "saw-the-buried-monasteries"},
                        {"op": "sticker", "value": "st-cotan-buddha", "reason": "touched-the-buddha-dust"}
                    ]
                },
                {
                    "id": "fragment",
                    "labelEn": "Collect a painted fragment — a bodhisattva's hand",
                    "labelZh": "拾一片彩绘残片——菩萨的手",
                    "effects": [
                        {"op": "item", "value": "it-buddha-fragment", "reason": "collected-a-painted-fragment"},
                        {"op": "codex", "value": "cx-cotan", "reason": "held-a-piece-of-the-old-cotan"}
                    ]
                },
                {
                    "id": "listen_elder",
                    "labelEn": "Ask an elder why the people drink the dust as medicine",
                    "labelZh": "问老人为何以尘土入药",
                    "effects": [
                        {"op": "codex", "value": "cx-cotan", "reason": "heard-the-elders-tales"},
                        {"op": "sticker", "value": "st-cotan-buddha", "reason": "heard-of-the-thousand-monasteries"}
                    ]
                }
            ]
        }
    },

    # ===================================================================
    # CHANDU (上都/Shangdu) — The Kaan's summer palace
    # ===================================================================
    "chandu": {
        "a": {  # "The Cane Palace"
            "choices": [
                {
                    "id": "enter",
                    "labelEn": "Bribe the guards and step inside the gilded cane palace",
                    "labelZh": "贿赂守卫踏入金竹宫殿",
                    "needs": {"coins": {"min": 500}},
                    "effects": [
                        {"op": "coins", "value": -500, "reason": "bribed-for-entry-to-the-palace"},
                        {"op": "codex", "value": "cx-chandu", "reason": "stood-inside-the-cane-palace"},
                        {"op": "sticker", "value": "st-chandu-palace", "reason": "entered-the-kaans-summer-palace"}
                    ]
                },
                {
                    "id": "admire",
                    "labelEn": "Admire the palace from the meadow outside",
                    "labelZh": "在宫外草地上欣赏这座竹宫",
                    "effects": [
                        {"op": "sticker", "value": "st-chandu-palace", "reason": "saw-the-gilded-cane-palace"},
                        {"op": "codex", "value": "cx-chandu", "reason": "studied-the-cane-construction"}
                    ]
                },
                {
                    "id": "sketch",
                    "labelEn": "Spend a day sketching the palace in detail",
                    "labelZh": "花一天把这宫殿细细画下来",
                    "effects": [
                        {"op": "days", "value": 1, "reason": "sketched-the-palace"},
                        {"op": "sticker", "value": "st-chandu-palace", "reason": "sketched-the-cane-palace"},
                        {"op": "codex", "value": "cx-chandu", "reason": "recorded-the-palace-in-detail"}
                    ]
                }
            ]
        },
        "b": {  # "The Kaan's Game Park"
            "choices": [
                {
                    "id": "walk",
                    "labelEn": "Walk the edge of the sixteen-mile wall",
                    "labelZh": "沿十六里宫墙走一走",
                    "effects": [
                        {"op": "days", "value": 1, "reason": "walked-the-park-edge"},
                        {"op": "sticker", "value": "st-chandu-park", "reason": "saw-the-kaans-game-park"},
                        {"op": "codex", "value": "cx-chandu", "reason": "walked-the-sixteen-mile-wall"}
                    ]
                },
                {
                    "id": "horses",
                    "labelEn": "Find a gap in the wall and watch the sacred white mares",
                    "labelZh": "在墙缝间窥看那千匹神白马",
                    "effects": [
                        {"op": "sticker", "value": "st-chandu-mares", "reason": "saw-the-white-mares"},
                        {"op": "codex", "value": "cx-chandu", "reason": "saw-the-sacred-herd"}
                    ]
                },
                {
                    "id": "falcon",
                    "labelEn": "Hire a falconer and hunt with the Kaan's own birds",
                    "labelZh": "雇一名鹰师借大汗的猎鹰打一次猎",
                    "needs": {"coins": {"min": 800}},
                    "effects": [
                        {"op": "coins", "value": -800, "reason": "hired-a-falconer-for-a-day"},
                        {"op": "sticker", "value": "st-chandu-park", "reason": "hunted-with-the-kaans-falconers"},
                        {"op": "codex", "value": "cx-chandu", "reason": "learned-the-kaans-hunting-grounds"}
                    ]
                }
            ]
        },
        "c": {  # "The Meadow of the Milky Kine"
            "choices": [
                {
                    "id": "watch_mares",
                    "labelEn": "Watch the monks milk the white mares at dawn",
                    "labelZh": "黎明看僧人给白马挤奶",
                    "effects": [
                        {"op": "sticker", "value": "st-chandu-mares", "reason": "watched-the-sacred-mares"},
                        {"op": "codex", "value": "cx-chandu", "reason": "saw-the-milking-of-the-white-mares"}
                    ]
                },
                {
                    "id": "offering",
                    "labelEn": "Pour an offering to the Eternal Blue Sky",
                    "labelZh": "斟一杯献给永恒蓝天",
                    "needs": {"coins": {"min": 100}},
                    "effects": [
                        {"op": "coins", "value": -100, "reason": "offering-to-the-eternal-blue-sky"},
                        {"op": "fate", "id": "travel", "value": 1, "reason": "honoured-the-mongol-spirits"}
                    ]
                },
                {
                    "id": "listen",
                    "labelEn": "Ask a monk what the ceremony means",
                    "labelZh": "问一个僧人这仪式是什么意思",
                    "effects": [
                        {"op": "codex", "value": "cx-chandu", "reason": "heard-the-tale-of-genghis-khan"},
                        {"op": "sticker", "value": "st-chandu-mares", "reason": "heard-the-old-mongol-rites"}
                    ]
                }
            ]
        }
    },

    # ===================================================================
    # CAMBALUC (大都/Dadu) — Seat of the Great Khan
    # ===================================================================
    "cambaluc": {
        "a": {  # "The Palace of the Great Khan"
            "choices": [
                {
                    "id": "audience",
                    "labelEn": "Present yourself at the Kaan's court with gifts",
                    "labelZh": "携礼觐见大汗",
                    "needs": {"coins": {"min": 3000}},
                    "effects": [
                        {"op": "coins", "value": -3000, "reason": "gifts-for-the-kaans-court"},
                        {"op": "reputation", "value": 2, "scope": "band", "id": "china", "reason": "presented-at-the-kaans-court"},
                        {"op": "sticker", "value": "st-cambaluc-court", "reason": "stood-in-the-great-hall"},
                        {"op": "codex", "value": "cx-cambaluc", "reason": "saw-the-jade-throne"}
                    ]
                },
                {
                    "id": "admire",
                    "labelEn": "Stand before the great hall and marvel at its size",
                    "labelZh": "站在大殿前惊叹它的宏伟",
                    "effects": [
                        {"op": "sticker", "value": "st-cambaluc-court", "reason": "saw-the-palace-from-outside"},
                        {"op": "codex", "value": "cx-cambaluc", "reason": "marvelled-at-the-great-hall"}
                    ]
                },
                {
                    "id": "talk_guards",
                    "labelEn": "Talk to the Kaan's guards about the empire",
                    "labelZh": "与大汗的卫兵聊聊帝国",
                    "effects": [
                        {"op": "codex", "value": "cx-cambaluc", "reason": "heard-the-guards-accounts"},
                        {"op": "reveal_map", "value": "kinsay", "reason": "guards-described-the-south-road"}
                    ]
                }
            ]
        },
        "b": {  # "The Twelve Suburbs"
            "choices": [
                {
                    "id": "silk",
                    "labelEn": "Buy silk at the Cambaluc price",
                    "labelZh": "按大都价买丝绸",
                    "needs": {"coins": {"min": 2000}},
                    "effects": [
                        {"op": "coins", "value": -2000, "reason": "bought-silk-at-cambaluc-price"},
                        {"op": "goods", "id": "silk", "value": 1, "reason": "bought-silk-at-cambaluc-price"},
                        {"op": "codex", "value": "cx-cambaluc", "reason": "traded-in-the-twelve-suburbs"}
                    ]
                },
                {
                    "id": "count",
                    "labelEn": "Count the cart-loads of silk entering the city in a day",
                    "labelZh": "数一日之内有多少车丝绸进城",
                    "effects": [
                        {"op": "days", "value": 1, "reason": "counted-the-carts-entering-the-city"},
                        {"op": "sticker", "value": "st-cambaluc-suburbs", "reason": "counted-a-thousand-cartloads"},
                        {"op": "codex", "value": "cx-cambaluc", "reason": "measured-the-commerce-of-cambaluc"}
                    ]
                },
                {
                    "id": "granary",
                    "labelEn": "Visit the public granaries — no one goes hungry here",
                    "labelZh": "参观义仓——这里没人挨饿",
                    "effects": [
                        {"op": "reputation", "value": 1, "scope": "city", "id": "cambaluc", "reason": "distributed-from-the-public-granaries"},
                        {"op": "codex", "value": "cx-cambaluc", "reason": "learned-the-kaans-charity"}
                    ]
                }
            ]
        },
        "c": {  # "The Mountain of Green Jade"
            "choices": [
                {
                    "id": "walk",
                    "labelEn": "Walk among the transplanted trees on the green hill",
                    "labelZh": "在绿丘移栽的树木间漫步",
                    "effects": [
                        {"op": "days", "value": 1, "reason": "walked-the-green-hill"},
                        {"op": "sticker", "value": "st-cambaluc-hill", "reason": "climbed-the-mountain-of-green-jade"},
                        {"op": "codex", "value": "cx-cambaluc", "reason": "walked-among-the-transplanted-trees"}
                    ]
                },
                {
                    "id": "evening",
                    "labelEn": "Climb the hill at sunset and see the whole city",
                    "labelZh": "日落时登丘望整座大都",
                    "effects": [
                        {"op": "fate", "id": "rapport", "value": 1, "reason": "sat-alone-at-sunset"},
                        {"op": "sticker", "value": "st-cambaluc-hill", "reason": "stood-where-the-kaan-stands-alone"},
                        {"op": "codex", "value": "cx-cambaluc", "reason": "saw-the-city-from-the-green-hill"}
                    ]
                },
                {
                    "id": "gardener",
                    "labelEn": "Talk to the gardeners who water the trees by hand",
                    "labelZh": "与用手提桶浇树的园丁交谈",
                    "effects": [
                        {"op": "codex", "value": "cx-cambaluc", "reason": "heard-the-gardeners-tales"},
                        {"op": "reveal_map", "value": "chandu", "reason": "gardeners-described-the-north-road"}
                    ]
                }
            ]
        }
    },

    # ===================================================================
    # KINSAY (行在/Hangzhou) — City of Heaven, finest in the world
    # ===================================================================
    "kinsay": {
        "a": {  # "The Twelve Thousand Bridges"
            "choices": [
                {
                    "id": "boat",
                    "labelEn": "Hire a boat and spend the day on the canals",
                    "labelZh": "雇一条船在运河上待一天",
                    "needs": {"coins": {"min": 200}},
                    "effects": [
                        {"op": "coins", "value": -200, "reason": "hired-a-boat-for-the-day"},
                        {"op": "days", "value": 1, "reason": "traversed-the-canals"},
                        {"op": "sticker", "value": "st-kinsay-canals", "reason": "crossed-the-twelve-thousand-bridges"},
                        {"op": "codex", "value": "cx-kinsay", "reason": "sailed-the-city-of-heaven"}
                    ]
                },
                {
                    "id": "walk",
                    "labelEn": "Walk the bridges and see if you can count them all",
                    "labelZh": "走过桥看能不能数清",
                    "effects": [
                        {"op": "days", "value": 1, "reason": "walked-the-bridges"},
                        {"op": "sticker", "value": "st-kinsay-canals", "reason": "counted-the-bridges"},
                        {"op": "codex", "value": "cx-kinsay", "reason": "measured-the-city-built-on-water"}
                    ]
                },
                {
                    "id": "tower",
                    "labelEn": "Climb the drum-tower and see the hundred canals below",
                    "labelZh": "登上鼓楼看脚下百条水巷",
                    "effects": [
                        {"op": "sticker", "value": "st-kinsay-canals", "reason": "saw-the-hundred-canals"},
                        {"op": "reveal_map", "value": "suju", "reason": "from-the-tower-you-saw-the-next-city"},
                        {"op": "codex", "value": "cx-kinsay", "reason": "climbed-the-drum-tower"}
                    ]
                }
            ]
        },
        "b": {  # "The Ten Great Markets"
            "choices": [
                {
                    "id": "pepper",
                    "labelEn": "Buy two sacks of pepper from the customs house",
                    "labelZh": "从海关买两袋胡椒",
                    "needs": {"coins": {"min": 20000}},
                    "effects": [
                        {"op": "coins", "value": -20000, "reason": "bought-pepper-at-kinsay"},
                        {"op": "goods", "id": "pepper", "value": 2, "reason": "bought-pepper-at-kinsay"},
                        {"op": "codex", "value": "cx-kinsay", "reason": "traded-in-the-ten-great-squares"}
                    ]
                },
                {
                    "id": "bath",
                    "labelEn": "Bathe in perfumed water and dine on ten courses",
                    "labelZh": "在香汤中沐浴享用十道菜",
                    "needs": {"coins": {"min": 100}},
                    "effects": [
                        {"op": "coins", "value": -100, "reason": "bathed-in-perfumed-water"},
                        {"op": "days", "value": 1, "reason": "bathed-and-dined-at-the-market"},
                        {"op": "sticker", "value": "st-kinsay-markets", "reason": "bathed-in-the-ten-markets"},
                        {"op": "codex", "value": "cx-kinsay", "reason": "lived-a-day-in-the-markets"}
                    ]
                },
                {
                    "id": "count_pepper",
                    "labelEn": "Count the forty cart-loads of pepper passing the customs",
                    "labelZh": "数一日经过海关的四十车胡椒",
                    "effects": [
                        {"op": "sticker", "value": "st-kinsay-markets", "reason": "counted-the-pepper-carts"},
                        {"op": "reveal_map", "value": "zayton", "reason": "merchants-named-the-sea-ports"},
                        {"op": "codex", "value": "cx-kinsay", "reason": "learned-the-daily-consumption"}
                    ]
                }
            ]
        },
        "c": {  # "The Pleasure Boats of the West Lake"
            "choices": [
                {
                    "id": "boat",
                    "labelEn": "Hire a pleasure boat with musicians and wine",
                    "labelZh": "雇一艘有乐师和酒的画舫",
                    "needs": {"coins": {"min": 500}},
                    "effects": [
                        {"op": "coins", "value": -500, "reason": "hired-a-pleasure-boat"},
                        {"op": "days", "value": 1, "reason": "sailed-the-west-lake"},
                        {"op": "sticker", "value": "st-kinsay-lake", "reason": "floated-on-the-west-lake"},
                        {"op": "codex", "value": "cx-kinsay", "reason": "saw-the-lanterns-on-the-water"}
                    ]
                },
                {
                    "id": "watch",
                    "labelEn": "Stand on the shore and watch the floating palaces",
                    "labelZh": "站在岸边看那些浮在水上的宫殿",
                    "effects": [
                        {"op": "sticker", "value": "st-kinsay-lake", "reason": "watched-the-pleasure-boats"},
                        {"op": "codex", "value": "cx-kinsay", "reason": "heard-the-pipa-on-the-lake"}
                    ]
                },
                {
                    "id": "moonlight",
                    "labelEn": "Wait for moonlight — the most beautiful thing in the empire",
                    "labelZh": "等到月出——帝国最美的景象",
                    "effects": [
                        {"op": "fate", "id": "rapport", "value": 2, "reason": "saw-the-lake-by-moonlight"},
                        {"op": "sticker", "value": "st-kinsay-lake", "reason": "watched-the-moon-on-the-west-lake"},
                        {"op": "codex", "value": "cx-kinsay", "reason": "saw-the-most-beautiful-thing-in-the-empire"}
                    ]
                }
            ]
        }
    },
}

# ======================================================================
# Sticker definitions
# ======================================================================
STICKER_DEFS = {
    "st-tauris-pearl": "A Tabriz Pearl",
    "st-tauris-view": "The Plain from the Ilkhan's Hill",
    "st-tauris-gardens": "The Gardens of Tauris",
    "st-baldacum-palace": "The Caliph's Empty Hall",
    "st-baldacum-brocade": "A Bolt of Baudas Silk",
    "st-baldacum-fall": "The Fall of the City of Baudas",
    "st-ormus-fort": "The Harbor Fort of Hormos",
    "st-ormus-spice": "Spices from the Indies",
    "st-ormus-wind": "The Wind of Death",
    "st-samarcanda-dome": "Beneath the Turquoise Dome",
    "st-samarcanda-gardens": "The Garden of the World",
    "st-samarcanda-paper": "Samarcand Paper",
    "st-samarcanda-stone": "The Weeping Stone",
    "st-balc-ruins": "The Ruins of Bactra",
    "st-balc-lapis": "A Block of Badakhshan Lapis",
    "st-balc-ruby": "A Balas Ruby",
    "st-balc-magi": "The Fire of the Magi",
    "st-cascar-garden": "The Garden of the Tarim",
    "st-cascar-carpet": "A Cascar Carpet",
    "st-cascar-sleepers": "The Cave of the Seven Sleepers",
    "st-cotan-jade": "A Piece of Cotan Jade",
    "st-cotan-silk": "A Bolt of Cotan Silk",
    "st-cotan-rivers": "The Jade Rivers",
    "st-cotan-buddha": "The Buddha Dust",
    "st-chandu-palace": "The Gilded Cane Palace",
    "st-chandu-park": "The Kaan's Game Park",
    "st-chandu-mares": "The Sacred White Mares",
    "st-cambaluc-court": "The Great Hall of the Kaan",
    "st-cambaluc-suburbs": "The Twelve Suburbs of Cambaluc",
    "st-cambaluc-hill": "The Mountain of Green Jade",
    "st-kinsay-canals": "The Twelve Thousand Bridges",
    "st-kinsay-markets": "The Ten Great Markets of Kinsay",
    "st-kinsay-lake": "The West Lake by Moonlight",
}

# ======================================================================
# Item definitions
# ======================================================================
ITEM_DEFS = {
    "it-dried-fruit": "Dried Apricots and Pistachios of Tauris",
    "it-old-coin": "A Coin from Before the Fall of Baudas",
    "it-illuminated-manuscript": "An Illuminated Manuscript from Samarcand",
    "it-bactrian-fragment": "A Carved Stone from Ancient Bactra",
    "it-cascar-melon": "A Cascar Melon",
    "it-cascar-raisins": "Dried Grapes of Cascar",
    "it-carpet-dyes": "Secret Dye-Stuffs of Cascar",
    "it-dye-sample": "Dye Samples of Cotan",
    "it-buddha-fragment": "A Painted Fragment from the Buddha Dust",
}

# ======================================================================
# Build: site.json
# ======================================================================

SITE_PATH = os.path.join(ROOT, "content", "tables", "events", "site.json")
with open(SITE_PATH, "r") as f:
    site_data = json.load(f)

records = site_data["records"]
changed = 0
for rec in records:
    eid = rec["id"]
    parts = eid.split("-")
    if len(parts) < 3:
        continue
    slot = parts[-1]
    city = "-".join(parts[1:-1])
    if city in RICH_DEFS and slot in RICH_DEFS[city]:
        rich = RICH_DEFS[city][slot]
        new_choices = []
        for ch in rich["choices"]:
            key = f"ev.{city}.{slot}.choice.{ch['id']}"
            choice_obj = {"label": key}
            if "needs" in ch:
                choice_obj["needs"] = ch["needs"]
            if "divination" in ch:
                choice_obj["divination"] = ch["divination"]
            if "pass" in ch:
                choice_obj["pass"] = ch["pass"]
            if "fail" in ch:
                choice_obj["fail"] = ch["fail"]
            if "effects" in ch:
                choice_obj["effects"] = ch["effects"]
            new_choices.append(choice_obj)
        rec["choices"] = new_choices
        rec.pop("stub", None)
        changed += 1

print(f"Updated {changed} site events with rich choices")

with open(SITE_PATH, "w") as f:
    json.dump(site_data, f, indent=2)
    f.write("\n")

# ======================================================================
# Build: i18n entries
# ======================================================================

I18N_PATH = os.path.join(ROOT, "content", "i18n")

i18n_en = {}
i18n_zh = {}

for city, sites in RICH_DEFS.items():
    for slot, sdata in sites.items():
        for ch in sdata["choices"]:
            key = f"ev.{city}.{slot}.choice.{ch['id']}"
            i18n_en[key] = ch["labelEn"]
            i18n_zh[key] = ch["labelZh"]

for sid, sname in STICKER_DEFS.items():
    i18n_en[f"sticker.{sid}.name"] = sname

for iid, iname in ITEM_DEFS.items():
    i18n_en[f"item.{iid}.name"] = iname

# Write en.json
en_path = os.path.join(I18N_PATH, "en.json")
with open(en_path, "r") as f:
    en_data = json.load(f)
n = 0
for k, v in i18n_en.items():
    if en_data.get(k) != v:
        en_data[k] = v
        n += 1
en_data = dict(sorted(en_data.items()))
with open(en_path, "w") as f:
    json.dump(en_data, f, indent=2, ensure_ascii=False)
    f.write("\n")
print(f"en.json: {n} strings written")

# Write zh.json
zh_path = os.path.join(I18N_PATH, "zh.json")
with open(zh_path, "r") as f:
    zh_data = json.load(f)
n = 0
for k, v in i18n_zh.items():
    if zh_data.get(k) != v:
        zh_data[k] = v
        n += 1
zh_data = dict(sorted(zh_data.items()))
with open(zh_path, "w") as f:
    json.dump(zh_data, f, indent=2, ensure_ascii=False)
    f.write("\n")
print(f"zh.json: {n} strings written")

print("\nDone. Run validate.mjs to verify.")
