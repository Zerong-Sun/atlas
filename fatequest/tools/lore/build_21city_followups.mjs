#!/usr/bin/env node
/**
 * P5 · 21 city exploration deepening.
 *
 * For each city-tier node, attach multi-round follow-up pages to selected
 * site events (at least one per city; both sites for chamba/badashan/tanpiju).
 * Idempotent: re-running refreshes followup records, queue hooks, and story
 * sections without duplicating keys.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const SITE_PATH = join(ROOT, "content/tables/events/site.json");
const OUT_PATH = join(ROOT, "content/tables/events/followups_21city.json");
const MATRIX_PATH = join(ROOT, "docs/21_CITY_DEEPENING_MATRIX.md");
const STORY_DIR = join(ROOT, "content/story");

const slug = (id) => id.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
const key = (id, suffix) => `ev.${slug(id)}.${suffix}`;

/** Targets: site letter(s) to deepen per city. */
const TARGETS = {
  // B1 west_asia + steppe
  kerman: ["a"],
  camadi: ["a"],
  tenduc: ["a"],
  // B2 central_asia (badashan hub: both)
  badashan: ["a", "b"],
  camul: ["a"],
  keshimur: ["a"],
  taican: ["a"],
  // B3 china (tanpiju hub: both)
  tanpiju: ["a", "b"],
  campichu: ["a"],
  chinangli: ["a"],
  kenjanfu: ["a"],
  saianfu: ["a"],
  siju: ["a"],
  sinju: ["a"],
  suju: ["a"],
  // B4 india + maritime (chamba hub: both)
  chamba: ["a", "b"],
  aden: ["a"],
  cail: ["a"],
  calatu: ["a"],
  esher: ["a"],
  melibar: ["a"],
};

const HUBS = new Set(["chamba", "badashan", "tanpiju"]);

/**
 * Authored follow-up packs. Each entry: city, site, lore, zhName, enName,
 * texts (title/body/choices/results as [en, zh]), effects for 3 choices.
 * Choice indices 0 and 1 on the parent site receive queue_event.
 */
const PACKS = [
  // ─── B1 ───────────────────────────────────────────────────────────
  {
    city: "kerman", site: "a", zhName: "起儿漫", enName: "Kerman",
    lore: { placeId: "kingdom-of-kerman", origin: "source", ref: { book: "marco-polo", chapterId: "v1-b1-c017" } },
    texts: {
      title: ["Kerman: The Master of the Forge", "起儿漫：炉边的师傅"],
      body: [
        "A smith who has worked the ondanique blades of Kerman for thirty years draws you from the quarry path into the shade of his forge. He does not sell you stone; he asks what you mean to do with the turquoise you carry, and whether you have heard how the harness-makers of this city fit steel and leather for the desert road. The fire is low; he will speak only once.",
        "一位在起儿漫打制昂丹尼钢刃三十年的铁匠，把你从矿径上拉进炉边的阴影。他不卖给你石头；他问你打算拿手头的绿松石做什么，又问你是否听说过本城鞍匠如何为沙漠路配钢与皮革。炉火已低，他只肯讲这一回。",
      ],
      choices: [
        ["Buy a small ondanique fitting at the smith's own price", "按师傅的定价买下一小件昂丹尼钢配件"],
        ["Ask which road from the turquoise hills reaches Ormus", "追问绿松石山通往忽鲁谟斯的路"],
        ["Promise to speak well of Kerman's craft in the cities west", "答应在西去的城中为起儿漫的手艺说好话"],
      ],
      results: [
        ["The smith sells you a steel fitting at his list price, no bargaining. It is small enough for a saddle-bag and strong enough for the next desert march.", "师傅按定价卖给你一件钢配件，不许还价。它小得能塞进鞍囊，却够撑过下一段沙漠行军。"],
        ["He marks the road to Ormus in charcoal on a scrap of hide: the passes, the water, the days between. Ormus is no longer only a name.", "他用炭笔在一块皮上标出通往忽鲁谟斯的路：山口、水源、驿站之间的日子。忽鲁谟斯不再只是一个名字。"],
        ["He accepts your promise and asks nothing else. In Kerman your word now carries a little more weight among those who heard it.", "他收下你的承诺，不再多要。在起儿漫，听见这句话的人已把你的名字多记了一分。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "damascus-steel", value: 1, reason: "bought-ondanique-fitting-at-forge" }, { op: "codex", value: "cx-kerman", reason: "learned-the-forge-craft" }],
      [{ op: "reveal_map", value: "ormus", reason: "smith-named-the-road-to-ormus" }, { op: "codex", value: "cx-kerman", reason: "mapped-the-turquoise-road" }],
      [{ op: "reputation", value: 1, scope: "city", id: "kerman", reason: "promised-to-praise-kerman-craft" }, { op: "days", value: 1, reason: "waited-at-the-forge" }],
    ],
  },
  {
    city: "camadi", site: "a", zhName: "卡玛迪", enName: "Camadi",
    lore: { placeId: "camadi", origin: "source", ref: { book: "marco-polo", chapterId: "v1-b1-c018" } },
    texts: {
      title: ["Camadi: The Elders of the Ruined Plain", "卡玛迪：废墟平原上的长老"],
      body: [
        "Among the broken walls of Camadi an elder who remembers the raids sits in the shade of a date palm and will not let you pass with only a glance. He says the plain still keeps roads that the raiders never burned — roads toward Kerman, toward Cobinan, and toward the gulf. If you mean to ride out of this ruin, he asks that you listen to the measure of the days.",
        "在卡玛迪残墙之间，一位记得劫掠岁月的长老坐在枣树荫下，不让你只看一眼就走。他说平原上仍有劫匪未烧毁的路——通往起儿漫，通往科比南，通往海湾。若你要从这废墟上路，他要你先听清日子的尺度。",
      ],
      choices: [
        ["Buy a sack of dates at the elders' price for the next march", "按长老的定价买下一袋枣子供下一段路"],
        ["Ask him to name the inland road that reaches Calatu", "请他点名通往卡拉图的内陆路"],
        ["Sit a day and hear how Camadi fell", "坐上一天，听卡玛迪如何陷落"],
      ],
      results: [
        ["The elders sell you dates at a fair weight. The sack will keep you through the hot descent, and the account of Camadi goes with it.", "长老按公道分量卖给你枣子。这袋果能撑过炎热的下坡，卡玛迪的旧事也随它同行。"],
        ["He draws the inland road toward Calatu in the dust: wells, tolls, and the days between. The gulf fortress is now on your map.", "他在尘土上画出通往卡拉图的内陆路：水井、关卡、驿站之间的日子。海湾要塞已出现在你的舆图上。"],
        ["You wait a day under the palm while he tells how the plain was ravaged. The story costs time, but Camadi is no longer a nameless ruin.", "你在枣树下坐了一日，听他讲平原如何被蹂躏。故事耗费时日，卡玛迪却不再是无名的废墟。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "dates", value: 1, reason: "bought-dates-from-camadi-elders" }, { op: "codex", value: "cx-camadi", reason: "provisioned-at-the-ruined-plain" }],
      [{ op: "reveal_map", value: "calatu", reason: "elder-named-the-road-to-calatu" }, { op: "codex", value: "cx-camadi", reason: "learned-the-inland-gulf-road" }],
      [{ op: "days", value: 1, reason: "heard-how-camadi-fell" }, { op: "reputation", value: 1, scope: "city", id: "camadi", reason: "listened-to-the-elders" }],
    ],
  },
  {
    city: "tenduc", site: "a", zhName: "天德州", enName: "Tenduc",
    lore: { placeId: "tenduc", origin: "source", ref: { book: "marco-polo", chapterId: "v1-b1-c059" } },
    texts: {
      title: ["Tenduc: After the Nestorian Service", "天德州：景教礼拜之后"],
      body: [
        "When the Nestorian service ends, a priest of King George's line draws you aside beside the wooden screen. He says the road east to Cambaluc is not only a yam of horses — it is a chain of churches and post-houses that still remember Prester John's name. He will open one door for you if you choose carefully.",
        "景教礼拜结束，乔治王一系的一位祭司把你引到木屏风旁。他说东去汗八里的路不只是驿马之链——仍有一串教会与驿站记着祭司王约翰的名字。你若谨慎选择，他愿为你开一扇门。",
      ],
      choices: [
        ["Ask him to mark the yam road toward Cambaluc", "请他标出通往汗八里的驿路"],
        ["Offer a small gift for the church and ask a blessing for the road", "为教堂献上一份薄礼，求一条路的祝福"],
        ["Wait a day to copy the priests' list of post-houses", "等一日，抄下祭司所记的驿站名单"],
      ],
      results: [
        ["He marks Cambaluc and the southern post-road on a scrap of parchment. The yam eastward is no longer blind.", "他在羊皮纸上标出汗八里与南面驿路。东去的驿站不再盲目。"],
        ["Your gift is accepted without ceremony. The church remembers your name, and a little favour goes with you on the steppe road.", "礼物被收下，并无繁文。教堂记下你的名字，草原路上多了一分照应。"],
        ["You wait a day while a scribe copies the post-house list. The waiting costs time, but the next departure is measured.", "你等了一日，书记抄完驿站名单。等待耗费时日，下一次启程却有了尺度。"],
      ],
    },
    effects: [
      [{ op: "reveal_map", value: "cambaluc", reason: "priest-marked-the-yam-to-cambaluc" }, { op: "reveal_map", value: "cacanfu", reason: "priest-named-the-southern-post-road" }, { op: "codex", value: "cx-tenduc", reason: "learned-the-nestorian-post-chain" }],
      [{ op: "coins", value: -120, reason: "offered-to-the-nestorian-church" }, { op: "reputation", value: 1, scope: "city", id: "tenduc", reason: "gift-to-the-nestorian-church" }],
      [{ op: "days", value: 1, reason: "copied-the-post-house-list" }, { op: "fate", id: "travel", value: 1, reason: "the-priests-measure-of-the-yam" }],
    ],
  },
  // ─── B2 ───────────────────────────────────────────────────────────
  {
    city: "badashan", site: "a", zhName: "巴达哈伤", enName: "Badashan",
    lore: { placeId: "badashan", origin: "source", ref: { book: "marco-polo", chapterId: "v1-b1-c029" } },
    texts: {
      title: ["Badashan: The Lapis Brokers' Second Page", "巴达哈伤：青金石经纪人的第二页"],
      body: [
        "In the highland bāzār a broker who deals only in rough lapis lays his ledger on the carpet and turns a page you were not meant to see. It names the mines, the tolls to Balc, and the days to Taican and Keshimur. He will sell you stone, or he will sell you the road — but not both for the same coin.",
        "高地巴扎里，一位只做粗青金石买卖的经纪人把账本摊在毯子上，翻开你本不该看见的一页。上面写着矿口、通往巴里黑的关卡，以及到塔伊坎与克什米尔的日子。他可以卖你石头，也可以卖你道路——却不肯用同一枚钱两样都给。",
      ],
      choices: [
        ["Buy a block of lapis at the ledger price", "按账本价格买下一块青金石"],
        ["Follow the margin road toward Balc", "照页边所画的路走向巴里黑"],
        ["Wait a day for the brokers' report to be copied", "等一日，等经纪人抄完当日报告"],
      ],
      results: [
        ["He sells you raw lapis at his list price. The stone is real, and the highland market lets you leave with it.", "他按定价卖给你粗青金石。石头是真的，高地市集放你带着它离开。"],
        ["The road to Balc is now clear: tolls, watered pastures, the two passes. You will not ride into Bactra blind.", "通往巴里黑的路已清晰：关卡、有水的牧场、两道山口。你不会盲目前往巴克特拉。"],
        ["You wait a day while a scribe copies the day's reports. The waiting costs time, but the ledger's lessons stay with you.", "你等了一日，书记抄完当日报告。等待耗费时日，账本上的教训却留在你身上。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "lapis", value: 1, reason: "bought-lapis-at-broker-ledger-price" }, { op: "codex", value: "cx-badashan", reason: "bought-at-the-highland-ledger" }],
      [{ op: "reveal_map", value: "balc", reason: "broker-drew-the-road-to-balc" }, { op: "codex", value: "cx-badashan", reason: "learned-the-tolls-to-bactra" }],
      [{ op: "days", value: 1, reason: "waited-for-broker-report" }, { op: "fate", id: "wealth", value: 1, reason: "studied-the-lapis-ledger" }],
    ],
  },
  {
    city: "badashan", site: "b", zhName: "巴达哈伤", enName: "Badashan",
    lore: { placeId: "badashan", origin: "source", ref: { book: "marco-polo", chapterId: "v1-b1-c029" } },
    texts: {
      title: ["Badashan: The Prince's Tongue and the Ruby Road", "巴达哈伤：王子的语言与红宝石路"],
      body: [
        "After the audience, a court clerk who keeps the mountain tongue draws you into a side chamber. He says every prince of the royal blood claims descent that opens doors — and that a traveller who learns a few words of the highland speech may buy balas rubies without being cheated, or find the road to Keshimur without a guide's full price.",
        "觐见之后，一位通晓山语的宫廷书记把你引到侧室。他说王族血脉的自称能开门——而学会几句高地话的旅人，买红宝石时不易受骗，去克什米尔时也不必付向导的全价。",
      ],
      choices: [
        ["Pay for a day's lesson in the mountain tongue", "付一日学费，学几句山语"],
        ["Ask which pass leads toward Keshimur and Cabul", "追问通往克什米尔与喀布尔的山口"],
        ["Buy a balas ruby at the court clerk's measured price", "按书记的公道价买下一枚红宝石"],
      ],
      results: [
        ["You spend the day on the highland speech. The words are few, but in Badashan your name now carries a little more weight.", "你花一日学高地话。字句不多，在巴达哈伤你的名字却多了一分分量。"],
        ["He names Taican and Keshimur and the days between. The mountain road east is on your map.", "他点出塔伊坎、克什米尔与其间的日子。东去的山路已上你的舆图。"],
        ["The clerk sells you a balas ruby at a price that would buy a horse in lesser markets. The stone is sealed with the court's mark.", "书记按能在小市买一匹马的价钱卖给你红宝石。石头盖着宫廷的印记。"],
      ],
    },
    effects: [
      [{ op: "coins", value: -200, reason: "paid-for-mountain-tongue-lesson" }, { op: "reputation", value: 2, scope: "city", id: "badashan", reason: "learned-the-highland-speech" }, { op: "fate", id: "rapport", value: 1, reason: "spoke-the-princes-tongue" }],
      [{ op: "reveal_map", value: "keshimur", reason: "clerk-named-the-pass-to-keshimur" }, { op: "reveal_map", value: "taican", reason: "clerk-named-the-road-to-taican" }, { op: "codex", value: "cx-badashan", reason: "mapped-the-ruby-passes" }],
      [{ op: "coins", value: -2200, reason: "bought-balas-ruby-at-court-price" }, { op: "goods", id: "balas-ruby", value: 1, reason: "bought-balas-ruby-at-court-price" }, { op: "codex", value: "cx-badashan", reason: "carried-a-court-sealed-ruby" }],
    ],
  },
  {
    city: "camul", site: "a", zhName: "哈密", enName: "Camul",
    lore: { placeId: "camul", origin: "source", ref: { book: "marco-polo", chapterId: "v1-b1-c041" } },
    texts: {
      title: ["Camul: The Melon Sellers' Desert Measure", "哈密：瓜商的沙漠尺度"],
      body: [
        "Between the two deserts a melon seller who has crossed both sands sits you down beside his stall and will not take your coin until you hear the measure of the next marches. He names Lop and Sachiu as if they were neighbours, and asks whether you mean to buy fruit for the road or knowledge of the wells.",
        "夹在两片沙漠之间，一位走过两边沙海的瓜商拉你坐在摊边，不听完下一段路的尺度就不收你的钱。他把罗卜与沙州说得像邻村，问你是要买上路的果子，还是要买水井的知识。",
      ],
      choices: [
        ["Buy melons at his road price for the next desert", "按他的路价买下瓜子供下一段沙漠"],
        ["Ask him to name the wells toward Lop and Sachiu", "请他点名通往罗卜与沙州的水井"],
        ["Wait a day for the caravan that knows the eastern fog", "等一日，等那支熟悉东边雾气的商队"],
      ],
      results: [
        ["He sells you melons at a fair weight. The fruit will keep on the sand, and the oasis account goes with it.", "他按公道分量卖给你瓜。果子能在沙上保存，绿洲的账目也随它同行。"],
        ["Lop and Sachiu are marked on your map with the wells between. The next desert is no longer a blank.", "罗卜与沙州连同其间的水井已标上你的舆图。下一段沙漠不再是空白。"],
        ["You wait a day for the eastern caravan. The waiting costs time, but the fog road is no longer a rumour alone.", "你等了一日东行商队。等待耗费时日，雾中之路却不再只是传闻。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "melons", value: 1, reason: "bought-melons-at-camul-road-price" }, { op: "fate", id: "travel", value: 1, reason: "provisioned-for-the-desert" }],
      [{ op: "reveal_map", value: "lop", reason: "seller-named-the-wells-to-lop" }, { op: "reveal_map", value: "sachiu", reason: "seller-named-the-wells-to-sachiu" }, { op: "codex", value: "cx-camul", reason: "learned-the-oasis-desert-measure" }],
      [{ op: "days", value: 1, reason: "waited-for-eastern-caravan" }, { op: "reveal_map", value: "etzina", reason: "caravan-named-etzina" }],
    ],
  },
  {
    city: "keshimur", site: "a", zhName: "克什米尔", enName: "Keshimur",
    lore: { placeId: "keshimur", origin: "source", ref: { book: "marco-polo", chapterId: "v1-b1-c031" } },
    texts: {
      title: ["Keshimur: The Idol Keepers' Counsel", "克什米尔：偶像守护者的劝告"],
      body: [
        "Beside the speaking idols a keeper who has watched travellers for many seasons draws you into the temple court. He says the enchantments of Keshimur are not for sale — but the road to Cabul and the road back to Badashan are, if you listen without mockery. He asks what you intend to carry away from this valley.",
        "会说话的偶像旁，一位看过许多季旅人的守护者把你引到寺庭。他说克什米尔的法术不卖——但通往喀布尔与回到巴达哈伤的路可以讲给你听，只要你不嘲笑。他问你打算从这山谷带走什么。",
      ],
      choices: [
        ["Listen to the tale of the speaking idols without scoffing", "不讥讽地听完会说话偶像的故事"],
        ["Ask which road leads toward Cabul and Delhi", "追问通往喀布尔与德里的路"],
        ["Hire a valley guide for the next mountain march", "为下一段山路雇一名山谷向导"],
      ],
      results: [
        ["The keeper accepts your silence as respect. The account of Keshimur's idols goes into your book, and a small turn of fortune favours you.", "守护者把你的沉默当作敬意。克什米尔偶像的记述写入你的行纪，时运也待你稍好些。"],
        ["He names Cabul and the days beyond. Delhi is still distant, but the first road is on your map.", "他点出喀布尔与更远的日子。德里仍远，第一段路却已上舆图。"],
        ["A guide takes your coin and your pace. The mountain weather is no longer wholly unknown.", "向导收下你的钱与你的脚步。山中天气不再全然未知。"],
      ],
    },
    effects: [
      [{ op: "days", value: 1, reason: "listened-at-the-idol-court" }, { op: "codex", value: "cx-keshimur", reason: "heard-the-speaking-idols-tale" }, { op: "fate", id: "rapport", value: 1, reason: "respected-the-idol-keepers" }],
      [{ op: "reveal_map", value: "cabul", reason: "keeper-named-the-road-to-cabul" }, { op: "reveal_map", value: "delli", reason: "keeper-named-the-road-toward-delhi" }, { op: "codex", value: "cx-keshimur", reason: "mapped-the-valley-exits" }],
      [{ op: "coins", value: -400, reason: "hired-keshimur-valley-guide" }, { op: "reputation", value: 1, scope: "city", id: "keshimur", reason: "hired-a-local-guide" }, { op: "fate", id: "travel", value: 1, reason: "guided-through-mountain-weather" }],
    ],
  },
  {
    city: "taican", site: "a", zhName: "塔伊坎", enName: "Taican",
    lore: { placeId: "taican", origin: "source", ref: { book: "marco-polo", chapterId: "v1-b1-c028" } },
    texts: {
      title: ["Taican: The Corn Masters' Road Book", "塔伊坎：粮商的路册"],
      body: [
        "In the fortified corn market a master who prices grain for every caravan that leaves Taican opens a road book beside the scales. He says Badashan and Balc are written there in measures of days and loads — and that a traveller who buys cotton without hearing the book rides out half-blind.",
        "在设防的粮市里，一位为每支出城商队定价粮食的主人在秤旁翻开路册。他说巴达哈伤与巴里黑都写在里面，以日子与载量为尺度——买棉花却不听路册的旅人，出城时只睁半只眼。",
      ],
      choices: [
        ["Buy cotton cloth at the market's measured price", "按市集公道价买下棉布"],
        ["Ask him to read the road toward Balc and Badashan", "请他读出通往巴里黑与巴达哈伤的路"],
        ["Wait a day while the grain prices are posted", "等一日，等粮价张榜"],
      ],
      results: [
        ["You leave with cotton at a fair weight. The cloth will sell or serve on the next march.", "你按公道分量带走棉布。布料可在下一段路上转卖或自用。"],
        ["Balc and Badashan are named with the days between. The corn roads are on your map.", "巴里黑与巴达哈伤连同其间的日子被点名。运粮之路已上你的舆图。"],
        ["You wait a day for the posting. The waiting costs time, but the market's counsel stays with you.", "你等了一日张榜。等待耗费时日，市集的劝告却留在你身上。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "cotton-cloth", value: 1, reason: "bought-cotton-at-taican-measured-price" }, { op: "reputation", value: 1, scope: "city", id: "taican", reason: "provisioned-at-the-corn-market" }],
      [{ op: "reveal_map", value: "balc", reason: "corn-master-named-balc" }, { op: "reveal_map", value: "badashan", reason: "corn-master-named-badashan" }, { op: "codex", value: "cx-taican", reason: "read-the-corn-road-book" }],
      [{ op: "days", value: 1, reason: "waited-for-grain-posting" }, { op: "codex", value: "cx-taican", reason: "watched-the-corn-prices" }],
    ],
  },
  // ─── B3 ───────────────────────────────────────────────────────────
  {
    city: "tanpiju", site: "a", zhName: "潭州", enName: "Tanpiju",
    lore: { placeId: "tanpiju", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c079" } },
    texts: {
      title: ["Tanpiju: A Day from Kinsay, a Second Page", "潭州：离行在一日，第二页"],
      body: [
        "In the gardens a day's journey from Kinsay a steward who keeps the mulberry accounts draws you under a verandah. He says Tanpiju is rich because Kinsay is near — and that the tea road south and the fan road toward Fuju are written in his books if you care to ask.",
        "离行在一日路程的园林里，一位掌管桑账的管事把你引到廊下。他说潭州之富，因行在在近——南去的茶路与通往福州的扇路都写在他的账上，只要你肯问。",
      ],
      choices: [
        ["Buy tea at the steward's garden price", "按管事的园价买下茶叶"],
        ["Ask which road leads toward Fuju and the coast", "追问通往福州与海岸的路"],
        ["Walk the mulberry rows for a day and note the season", "在桑田间走一日，记下时令"],
      ],
      results: [
        ["He sells you tea at a price that would cost more in Kinsay itself. The leaves are sealed for the road.", "他按比行在本市更公道的价钱卖给你茶。叶子已封好上路。"],
        ["Fuju and Chinghinju are marked on your map. The coastal road is no longer only a rumour from Kinsay.", "福州与常州已标上你的舆图。沿海之路不再只是行在传来的传闻。"],
        ["You spend a day among the mulberries. The season is noted, and a small turn of fortune favours you.", "你在桑间走了一日。时令已记，时运也待你稍好些。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "tea", value: 1, reason: "bought-tea-at-tanpiju-garden-price" }, { op: "codex", value: "cx-tanpiju", reason: "bought-garden-tea-near-kinsay" }],
      [{ op: "reveal_map", value: "fuju", reason: "steward-named-the-road-to-fuju" }, { op: "reveal_map", value: "chinginju", reason: "steward-named-chinginju" }, { op: "codex", value: "cx-tanpiju", reason: "mapped-the-coast-road-from-tanpiju" }],
      [{ op: "days", value: 1, reason: "walked-the-mulberry-rows" }, { op: "fate", id: "travel", value: 1, reason: "noted-the-mulberry-season" }],
    ],
  },
  {
    city: "tanpiju", site: "b", zhName: "潭州", enName: "Tanpiju",
    lore: { placeId: "tanpiju", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c079" } },
    texts: {
      title: ["Tanpiju: Under Kinsay, the Market's Counsel", "潭州：隶于行在，市集的劝告"],
      body: [
        "In the rich market under Kinsay a lacquer merchant who has buried kin according to the local rite sits you down among the fans and boxes. He says the funeral road and the trade road are the same streets — and that a traveller who buys lacquer without hearing the custom walks half-blind through Tanpiju.",
        "在隶于行在的富市里，一位按本地礼俗葬过亲人的漆器商把你拉到扇子与漆匣之间坐下。他说丧礼之路与贸易之路是同一条街——买漆器却不听风俗的旅人，在潭州只睁半只眼。",
      ],
      choices: [
        ["Buy a lacquerware piece at his measured price", "按他的公道价买下一件漆器"],
        ["Ask how the dead are burned and what it costs a stranger", "追问火葬之礼，以及外乡人要付什么"],
        ["Buy a Hangzhou fan and ask the road back to Kinsay", "买一把杭州扇，并问回行在的路"],
      ],
      results: [
        ["He sells you lacquer at a fair price. The piece is sealed and ready for the canal road.", "他按公道价卖给你漆器。物件已封好，可走运河路。"],
        ["You learn the rite and leave a small offering. In Tanpiju your name now carries a little more weight.", "你学会礼俗并留下薄奠。在潭州你的名字多了一分分量。"],
        ["The fan is yours, and Kinsay is marked clearly as a day's journey north-west. You will not miss the road home to the great city.", "扇子归你，行在标作西北一日之路。你不会错过回大城的路。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "lacquerware", value: 1, reason: "bought-lacquer-at-tanpiju-market" }, { op: "codex", value: "cx-tanpiju", reason: "bought-lacquer-under-kinsay" }],
      [{ op: "coins", value: -200, reason: "funeral-offering-at-tanpiju" }, { op: "reputation", value: 1, scope: "city", id: "tanpiju", reason: "respected-the-funeral-custom" }, { op: "codex", value: "cx-tanpiju", reason: "learned-the-burning-rite" }],
      [{ op: "goods", id: "hangzhou-fan", value: 1, reason: "bought-hangzhou-fan-at-tanpiju" }, { op: "reveal_map", value: "kinsay", reason: "merchant-named-the-day-to-kinsay" }],
    ],
  },
  {
    city: "campichu", site: "a", zhName: "甘州", enName: "Campichu",
    lore: { placeId: "campichu", origin: "source", ref: { book: "marco-polo", chapterId: "v1-b1-c044" } },
    texts: {
      title: ["Campichu: The Tangut Seat's Second Counsel", "甘州：唐古特治所的第二劝告"],
      body: [
        "In the capital of Tangut a clerk of the governor's court who has sealed caravan papers for twenty years draws you from the market into a side room. He says Caracoron and Etzina are not merely names on a map — they are the measure of how far a Tangut passport will carry you before the desert takes over.",
        "在唐古特的治所，一位盖了二十年商队文书的吏员把你从市集引到侧室。他说哈剌和林与亦集乃不只是图上的名字——它们是唐古特路引在沙漠接管之前能带你走多远的尺度。",
      ],
      choices: [
        ["Ask him to seal a note naming the road to Caracoron", "请他在文书上点名通往哈剌和林的路"],
        ["Buy a chest of tea at the court caravan price", "按宫廷商队价买下一箱茶"],
        ["Wait a day for the passport office to open again", "等一日，等路引房重新开门"],
      ],
      results: [
        ["Caracoron is marked on your map with the clerk's seal beside it. The northern road is no longer a rumour.", "哈剌和林标上你的舆图，旁有吏员印记。北路不再是传闻。"],
        ["You leave with tea at a price the desert caravans accept. The chest is sealed for the next march.", "你按沙漠商队认的价钱带走茶叶。箱子已封好上路。"],
        ["You wait a day for the office. The waiting costs time, but Etzina is named before you go.", "你等了一日路引房。等待耗费时日，亦集乃却在你走前被点名。"],
      ],
    },
    effects: [
      [{ op: "reveal_map", value: "caracoron", reason: "clerk-sealed-the-road-to-caracoron" }, { op: "codex", value: "cx-campichu", reason: "learned-the-tangut-passport-measure" }],
      [{ op: "goods", id: "tea", value: 1, reason: "bought-tea-at-campichu-caravan-price" }, { op: "codex", value: "cx-campichu", reason: "provisioned-at-the-tangut-seat" }],
      [{ op: "days", value: 1, reason: "waited-for-passport-office" }, { op: "reveal_map", value: "etzina", reason: "clerk-named-etzina" }, { op: "fate", id: "travel", value: 1, reason: "tangut-road-counsel" }],
    ],
  },
  {
    city: "chinangli", site: "a", zhName: "济南", enName: "Chinangli",
    lore: { placeId: "chinangli", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c061" } },
    texts: {
      title: ["Chinangli: The River Brokers' Ledger", "济南：河商的账本"],
      body: [
        "On the quay of the great river a broker who prices silk and spice for boats bound to Cambaluc opens his ledger beside the water. He says the river is a road that remembers every toll — and that a traveller who buys silk without hearing the days to Cacanfu and Chandu rides half-blind upstream.",
        "大河码头上，一位为开往汗八里的船定价丝与香料的经纪人在水边翻开账本。他说这条河是记得每一道关卡的路——买丝却不问到河间与上都要几日的旅人，逆流时只睁半只眼。",
      ],
      choices: [
        ["Buy a bolt of silk at the river ledger price", "按河账价格买下一匹丝"],
        ["Ask him to name the water road toward Cambaluc", "请他点名通往汗八里的水路"],
        ["Spend a day counting spice chests with the clerks", "与书吏一起清点一日香料箱"],
      ],
      results: [
        ["He sells you silk at a price the upstream markets will recognize. The bolt is sealed for the boat.", "他按上游市集认得出的价钱卖给你丝。布匹已封好上船。"],
        ["Cambaluc and Cacanfu are marked on your map. The river road north is clear.", "汗八里与河间已标上你的舆图。北去的水路清晰。"],
        ["You spend a day among the chests. Chandu is named in the talk, and a small turn of fortune favours you.", "你在箱子间过了一日。闲话里点到上都，时运也待你稍好些。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "silk", value: 1, reason: "bought-silk-at-chinangli-river-price" }, { op: "reveal_map", value: "cacanfu", reason: "broker-named-cacanfu" }],
      [{ op: "reveal_map", value: "cambaluc", reason: "broker-named-the-water-road-to-cambaluc" }, { op: "codex", value: "cx-chinangli", reason: "learned-the-river-tolls" }],
      [{ op: "days", value: 1, reason: "counted-spice-chests" }, { op: "reveal_map", value: "chandu", reason: "clerks-named-chandu" }, { op: "fate", id: "wealth", value: 1, reason: "studied-the-river-ledger" }],
    ],
  },
  {
    city: "kenjanfu", site: "a", zhName: "西安", enName: "Kenjanfu",
    lore: { placeId: "kenjanfu", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c041" } },
    texts: {
      title: ["Kenjanfu: Among the Mulberry Plains", "西安：桑田之间"],
      body: [
        "West of the city a silk steward who walks the mulberry plains every morning draws you under a row of trees. He says Kenjanfu's wealth is leaf and worm — and that the roads to Cachanfu, Saianfu, and the north are written in the season of the harvest if you care to listen.",
        "城西一位每日清晨巡桑的丝务管事把你引到树行下。他说西安之富在叶与蚕——通往河中、襄阳与北方的路，都写在收获的时令里，只要你肯听。",
      ],
      choices: [
        ["Buy silk at the plain's harvest price", "按平原收获价买下丝绸"],
        ["Ask which road leads toward Saianfu", "追问通往襄阳的路"],
        ["Walk the gardens a day and note the mulberry season", "在园林走一日，记下桑时"],
      ],
      results: [
        ["He sells you silk at a price the workshops accept. The bolt is ready for the western road.", "他按作坊认的价钱卖给你丝。布匹已备好走西路。"],
        ["Saianfu is marked on your map with the days between. The industrial road west is clear.", "襄阳连同其间的日子已标上舆图。西去的工业之路清晰。"],
        ["You spend a day among the trees. Cachanfu is named in the talk, and fortune bends a little your way.", "你在树间过了一日。闲话里点到河中，时运也稍稍偏向你。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "silk", value: 1, reason: "bought-silk-at-kenjanfu-harvest-price" }, { op: "codex", value: "cx-kenjanfu", reason: "bought-silk-on-the-mulberry-plain" }],
      [{ op: "reveal_map", value: "saianfu", reason: "steward-named-the-road-to-saianfu" }, { op: "codex", value: "cx-kenjanfu", reason: "mapped-the-western-industrial-road" }],
      [{ op: "days", value: 1, reason: "walked-mulberry-gardens" }, { op: "reveal_map", value: "cachanfu", reason: "steward-named-cachanfu" }, { op: "fate", id: "travel", value: 1, reason: "noted-the-mulberry-season" }],
    ],
  },
  {
    city: "saianfu", site: "a", zhName: "襄阳", enName: "Saianfu",
    lore: { placeId: "very-noble-city-of-saianfu", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c070" } },
    texts: {
      title: ["Saianfu: The Twelve Cities' Clerk", "襄阳：十二城的书吏"],
      body: [
        "In the noble city that rules twelve others a clerk who keeps the tribute lists of the subordinate towns draws you into the magistrate's outer court. He says Saianfu's silk and ginger roads are the same roads that feed those twelve — and that a traveller who buys without hearing the list rides half-blind toward Sinjumatu and Cachanfu.",
        "在辖十二城的贵邑里，一位掌管属城贡单的书吏把你引到官署外庭。他说襄阳的丝路与姜路，正是养活那十二城的同一条路——买货却不听名册的旅人，去新州码头与河中时只睁半只眼。",
      ],
      choices: [
        ["Buy silk at the magistrate's measured price", "按官府公道价买下丝绸"],
        ["Ask which of the twelve roads leads toward Sinjumatu", "追问十二路中哪条通往新州码头"],
        ["Spend a day with the weavers and hear the circuit names", "与织工共度一日，听巡回城名"],
      ],
      results: [
        ["You leave with silk sealed for the circuit road. The price is fair, and Saianfu's name goes with the bolt.", "你带走封好走巡回路的丝。价钱公道，襄阳之名随布匹同行。"],
        ["Sinjumatu and Cachanfu are marked on your map. The rich circuit is no longer a blank.", "新州码头与河中已标上舆图。富庶的巡回不再是空白。"],
        ["You spend a day among the looms. Kenjanfu is named in the talk, and fortune bends a little your way.", "你在织机间过了一日。闲话里点到西安，时运也稍稍偏向你。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "silk", value: 1, reason: "bought-silk-at-saianfu-magistrate-price" }, { op: "codex", value: "cx-saianfu", reason: "bought-silk-in-the-twelve-city-seat" }],
      [{ op: "reveal_map", value: "sinjumatu", reason: "clerk-named-sinjumatu" }, { op: "reveal_map", value: "cachanfu", reason: "clerk-named-cachanfu" }, { op: "codex", value: "cx-saianfu", reason: "mapped-the-twelve-city-roads" }],
      [{ op: "days", value: 1, reason: "spent-day-with-weavers" }, { op: "reveal_map", value: "kenjanfu", reason: "weavers-named-kenjanfu" }, { op: "fate", id: "wealth", value: 1, reason: "heard-the-circuit-names" }],
    ],
  },
  {
    city: "siju", site: "a", zhName: "徐州", enName: "Siju",
    lore: { placeId: "siju", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c064" } },
    texts: {
      title: ["Siju: The Sugar Workshops' Second Page", "徐州：糖坊的第二页"],
      body: [
        "In the workshops south of Piju a sugar master who has shipped chests to Coigangiu and Coiganju draws you beside the boiling pans. He says Siju's manufactures are nothing without the canal days written on his wall — and that a traveller who buys sugar without hearing those days rides half-blind toward the grain towns.",
        "邳州以南的作坊里，一位把糖箱运到淮安与高邮的糖坊主人把你拉到煮锅旁。他说徐州的工艺若没有墙上写着的运河日子便一文不值——买糖却不问那些日子的旅人，去粮镇时只睁半只眼。",
      ],
      choices: [
        ["Buy sugar at the workshop's measured price", "按作坊公道价买下糖"],
        ["Ask which canal road leads toward Coigangiu", "追问通往淮安的运河路"],
        ["Spend a day counting grain sacks with the clerks", "与书吏一起清点一日粮袋"],
      ],
      results: [
        ["He sells you sugar sealed for the canal. The price is fair, and Siju's name goes with the chest.", "他卖给你封好走运河的糖。价钱公道，徐州之名随箱子同行。"],
        ["Coigangiu and Paukin are marked on your map. The canal south is clear.", "淮安与宝应已标上舆图。南去的运河清晰。"],
        ["You spend a day among the sacks. Coiganju is named in the talk, and fortune bends a little your way.", "你在粮袋间过了一日。闲话里点到高邮，时运也稍稍偏向你。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "sugar", value: 1, reason: "bought-sugar-at-siju-workshop" }, { op: "reveal_map", value: "coigangiu", reason: "master-named-coigangiu" }],
      [{ op: "reveal_map", value: "paukin", reason: "master-named-paukin" }, { op: "codex", value: "cx-siju", reason: "learned-the-canal-days" }],
      [{ op: "days", value: 1, reason: "counted-grain-sacks" }, { op: "reveal_map", value: "coiganju", reason: "clerks-named-coiganju" }, { op: "fate", id: "wealth", value: 1, reason: "studied-the-sugar-wall" }],
    ],
  },
  {
    city: "sinju", site: "a", zhName: "镇江", enName: "Sinju",
    lore: { placeId: "sinju", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c071" } },
    texts: {
      title: ["Sinju: On the Greatest River", "镇江：在最大的河上"],
      body: [
        "On the quay of the Kian a toll clerk who has counted tea chests for the Great Kaan's ports draws you under a shed. He says Sinju stands where the greatest river in the world turns trade into paper-money — and that Caiju, Nanghin, and Chinghianfu are written in his toll book if you care to ask.",
        "在江边码头，一位为可汗港口清点茶箱的税吏把你引到棚下。他说镇江正站在世界最大河流把贸易换成交钞的地方——瓜洲、南京与镇江府都写在他的税册上，只要你肯问。",
      ],
      choices: [
        ["Buy tea at the river toll price", "按河税价买下茶叶"],
        ["Ask which water road leads toward Caiju", "追问通往瓜洲的水路"],
        ["Spend a day at the toll house and hear the port names", "在税房过一日，听港口之名"],
      ],
      results: [
        ["He sells you tea sealed for the river. The price includes the toll you would have paid anyway.", "他卖给你封好走水路的茶。价钱里已含你本来要付的税。"],
        ["Caiju and Nanghin are marked on your map. The river road is clear.", "瓜洲与南京已标上舆图。水路清晰。"],
        ["You spend a day at the toll house. Chinghianfu is named, and fortune bends a little your way.", "你在税房过了一日。镇江府被点名，时运也稍稍偏向你。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "tea", value: 1, reason: "bought-tea-at-sinju-toll-price" }, { op: "codex", value: "cx-sinju", reason: "bought-tea-on-the-kian" }],
      [{ op: "reveal_map", value: "caiju", reason: "clerk-named-caiju" }, { op: "reveal_map", value: "nanghin", reason: "clerk-named-nanghin" }, { op: "codex", value: "cx-sinju", reason: "mapped-the-kian-ports" }],
      [{ op: "days", value: 1, reason: "spent-day-at-toll-house" }, { op: "reveal_map", value: "chinghianfu", reason: "clerks-named-chinghianfu" }, { op: "fate", id: "wealth", value: 1, reason: "studied-the-river-toll-book" }],
    ],
  },
  {
    city: "suju", site: "a", zhName: "苏州", enName: "Suju",
    lore: { placeId: "suju", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c075" } },
    texts: {
      title: ["Suju: Gold Brocade and the Sixty-Mile Circuit", "苏州：金锦与六十里城郭"],
      body: [
        "In the great city of some sixty miles' circuit a brocade merchant who has sold gold-thread cloth to Kinsay draws you into a counting house beside the canal. He says Suju's silk roads and the bridge roads are the same streets — and that Chinghianfu and Chinghinju are written in his ledgers if you mean to leave with more than a bolt.",
        "在周回约六十里的大城里，一位把金线锦卖到行在的商人把你引到运河边的账房。他说苏州的丝路与桥路是同一条街——镇江府与常州都写在他的账上，若你想带走的不只是一匹布。",
      ],
      choices: [
        ["Buy a length of gold brocade at his measured price", "按他的公道价买下一幅金锦"],
        ["Ask which bridge road leads toward Kinsay", "追问通往行在的桥路"],
        ["Walk the circuit bridges a day and hear the canal talk", "沿城桥走一日，听运河上的话"],
      ],
      results: [
        ["He sells you brocade sealed for the canal. The thread catches the light like the markets of Kinsay.", "他卖给你封好走运河的金锦。线光如行在市集。"],
        ["Kinsay is marked on your map as the great market south. The bridge road is clear.", "行在标作南方大市。桥路清晰。"],
        ["You spend a day on the bridges. Chinghianfu is named in the talk, and fortune bends a little your way.", "你在桥上过了一日。闲话里点到镇江府，时运也稍稍偏向你。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "silk", value: 1, reason: "bought-gold-brocade-at-suju" }, { op: "codex", value: "cx-suju", reason: "bought-brocade-in-the-sixty-mile-city" }],
      [{ op: "reveal_map", value: "kinsay", reason: "merchant-named-the-bridge-road-to-kinsay" }, { op: "codex", value: "cx-suju", reason: "mapped-the-canal-to-kinsay" }],
      [{ op: "days", value: 1, reason: "walked-suju-bridges" }, { op: "reveal_map", value: "chinghianfu", reason: "canal-talk-named-chinghianfu" }, { op: "fate", id: "wealth", value: 1, reason: "heard-the-sixty-mile-circuit" }],
    ],
  },
  // ─── B4 ───────────────────────────────────────────────────────────
  {
    city: "chamba", site: "a", zhName: "占城", enName: "Chamba",
    lore: { placeId: "great-country-called-chamba", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b3-c005" } },
    texts: {
      title: ["Chamba: After the Elephant Tribute", "占城：象贡之后"],
      body: [
        "When the clerks have finished counting the elephant tribute, a harbour pilot who has sailed the tribute ships to Zayton draws you onto the mole. He says Chamba's wealth is not only ivory — it is the sea road west-south-west of Zayton, and the names of Pentam and Fuju if you mean to follow the Kaan's ships home.",
        "书吏点完象贡之后，一位把贡船开到刺桐的港引把你拉上防波堤。他说占城之富不只在象牙——更在刺桐西南西的海路，以及宾童龙与福州之名，若你打算跟着可汗的船回家。",
      ],
      choices: [
        ["Buy sandalwood at the tribute harbour price", "按贡港价买下檀香"],
        ["Ask him to mark the sea road toward Zayton", "请他标出海路通往刺桐"],
        ["Watch the tribute harbour a day and hear the pilots' talk", "在贡港看一日，听引水员的话"],
      ],
      results: [
        ["He sells you sandalwood sealed for the next monsoon. The scent stays in the hold.", "他卖给你封好等季风的檀香。香气留在货舱里。"],
        ["Zayton is marked on your map with the monsoon days between. The tribute road is clear.", "刺桐连同季风之间的日子已标上舆图。朝贡海路清晰。"],
        ["You spend a day on the mole. Pentam is named in the talk, and fortune bends a little your way.", "你在防波堤上过了一日。闲话里点到宾童龙，时运也稍稍偏向你。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "sandalwood", value: 1, reason: "bought-sandalwood-at-chamba-tribute-harbour" }, { op: "codex", value: "cx-chamba", reason: "bought-sandalwood-after-the-elephant-tribute" }],
      [{ op: "reveal_map", value: "zayton", reason: "pilot-marked-the-sea-road-to-zayton" }, { op: "codex", value: "cx-chamba", reason: "learned-the-tribute-sea-road" }],
      [{ op: "days", value: 1, reason: "watched-tribute-harbour" }, { op: "reveal_map", value: "pentam", reason: "pilots-named-pentam" }, { op: "fate", id: "rapport", value: 1, reason: "heard-the-kings-embassy-talk" }],
    ],
  },
  {
    city: "chamba", site: "b", zhName: "占城", enName: "Chamba",
    lore: { placeId: "great-country-called-chamba", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b3-c005" } },
    texts: {
      title: ["Chamba: The Idolater Court and the Pepper Quay", "占城：偶像王廷与胡椒码头"],
      body: [
        "At the idolater court a pepper broker who serves both the king and the foreign ships draws you from the audience into the shade of the quay sheds. He says Chamba pays tribute in elephants but trades in pepper — and that Fuju and the islands are written in his monsoon book if you mean to sail west-south-west of Zayton with more than a story.",
        "在偶像王廷，一位既伺候国王又伺候番舶的胡椒经纪人把你从觐见处引到码头棚荫下。他说占城以象进贡，以胡椒贸易——福州与诸岛都写在他的季风册上，若你打算带着比故事更多的东西从刺桐西南西出航。",
      ],
      choices: [
        ["Buy pepper at the court broker's price", "按宫廷经纪人价买下胡椒"],
        ["Ask which sea road leads toward Fuju", "追问通往福州的海路"],
        ["Visit the court a day and hear the king's sea talk", "在王廷待一日，听国王论海"],
      ],
      results: [
        ["He sells you pepper sealed for the monsoon. The price is the court's own list.", "他卖给你封好等季风的胡椒。价钱是宫廷本价。"],
        ["Fuju is marked on your map. The sea road north is clear.", "福州已标上舆图。北去的海路清晰。"],
        ["You spend a day at court. The king's talk names the islands, and fortune bends a little your way.", "你在王廷过了一日。国王的话点到诸岛，时运也稍稍偏向你。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "pepper", value: 1, reason: "bought-pepper-at-chamba-court-price" }, { op: "codex", value: "cx-chamba", reason: "bought-pepper-at-the-idolater-court" }],
      [{ op: "reveal_map", value: "fuju", reason: "broker-named-the-sea-road-to-fuju" }, { op: "codex", value: "cx-chamba", reason: "mapped-the-monsoon-to-fuju" }],
      [{ op: "days", value: 1, reason: "visited-chamba-court" }, { op: "reputation", value: 1, scope: "city", id: "chamba", reason: "heard-at-the-idolater-court" }, { op: "fate", id: "travel", value: 1, reason: "the-kings-sea-counsel" }],
    ],
  },
  {
    city: "aden", site: "a", zhName: "亚丁", enName: "Aden",
    lore: { placeId: "aden", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b3-c036" } },
    texts: {
      title: ["Aden: The Camel Masters' Ledger", "亚丁：驼队主人的账本"],
      body: [
        "On the quay where India's ships discharge into lighters, a camel master who has walked the thirty-day road to the river of Alexandria lays his ledger beside the pepper sheds. He says Aden is the gate of Egypt's spice — and that Dufar and Cambaet are written in the margin if you mean to leave the harbour with more than a sack.",
        "在印度大船卸货到驳船的码头上，一位走过三十日至亚历山大河的驼队主人把账本摊在胡椒棚旁。他说亚丁是埃及香料的大门——佐法尔与坎贝都写在页边，若你想带着比一袋货更多的东西离开港口。",
      ],
      choices: [
        ["Buy Malabar pepper at the camel master's price", "按驼队主人的定价买下马拉巴胡椒"],
        ["Ask him to mark the roads that leave the harbour", "请他标出离港的各条路"],
        ["Walk the sheds a day and watch the lighters load", "在货棚走一日，看驳船装货"],
      ],
      results: [
        ["He sells you pepper sealed for the camel road. The sack will keep through the thirty days.", "他卖给你封好走驼路的胡椒。袋子能撑过那三十日。"],
        ["Dufar and Cambaet are marked on your map. The harbour exits are clear.", "佐法尔与坎贝已标上舆图。离港之路清晰。"],
        ["You spend a day among the bales. The camel road to Alexandria is noted, and fortune bends a little your way.", "你在货包间过了一日。通往亚历山大的驼路已记，时运也稍稍偏向你。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "pepper", value: 1, reason: "bought-pepper-at-aden-camel-master-price" }, { op: "codex", value: "cx-aden", reason: "bought-pepper-for-the-alexandria-road" }],
      [{ op: "reveal_map", value: "dufar", reason: "camel-master-named-dufar" }, { op: "reveal_map", value: "cambaet", reason: "camel-master-named-cambaet" }, { op: "fate", id: "travel", value: 1, reason: "learned-the-harbour-exits" }],
      [{ op: "days", value: 1, reason: "watched-pepper-lighters" }, { op: "codex", value: "cx-aden", reason: "noted-the-camel-road-to-alexandria" }],
    ],
  },
  {
    city: "cail", site: "a", zhName: "加异勒", enName: "Cail",
    lore: { placeId: "cail", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b3-c021" } },
    texts: {
      title: ["Cail: The Horse Quay's Second Page", "加异勒：马码头的第二页"],
      body: [
        "On the quay where western ships land horses, a charger broker who serves King Ashar's harbour draws you into the shade of the landing sheds. He says Cail is where Hormos horses meet Maabar cotton — and that Melibar, Coilum, and Samara are written in his landing book if you mean to ride or sail onward.",
        "在西来船只卸马的码头上，一位为阿沙王港口服务的战马经纪人把你引到卸货棚荫下。他说加异勒正是忽鲁谟斯的马遇见马八儿的棉布之处——马拉巴、俱蓝与撒马拉都写在他的登岸册上，若你打算继续骑马或出航。",
      ],
      choices: [
        ["Buy a charger at the harbour's measured price", "按港口公道价买下一匹战马"],
        ["Ask which sea road leads toward Melibar and Coilum", "追问通往马拉巴与俱蓝的海路"],
        ["Watch the landing a day and hear the brother-kings named", "看一日卸马，听五兄弟王之名"],
      ],
      results: [
        ["He sells you a charger fit for the Maabar road. The price is steep, and the horse is sound.", "他卖给你一匹适合马八儿路的战马。价钱不低，马却结实。"],
        ["Melibar and Coilum are marked on your map. The pepper coast is clear.", "马拉巴与俱蓝已标上舆图。胡椒海岸清晰。"],
        ["You spend a day at the landing. Samara is named in the talk, and fortune bends a little your way.", "你在卸马处过了一日。闲话里点到撒马拉，时运也稍稍偏向你。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "arabian-horse", value: 1, reason: "bought-charger-at-cail-harbour" }, { op: "codex", value: "cx-cail", reason: "bought-a-charger-on-the-horse-quay" }],
      [{ op: "reveal_map", value: "melibar", reason: "broker-named-melibar" }, { op: "reveal_map", value: "coilum", reason: "broker-named-coilum" }, { op: "codex", value: "cx-cail", reason: "mapped-the-pepper-coast-from-cail" }],
      [{ op: "days", value: 1, reason: "watched-horse-landing" }, { op: "reveal_map", value: "samara", reason: "landing-talk-named-samara" }, { op: "fate", id: "travel", value: 1, reason: "heard-the-brother-kings" }],
    ],
  },
  {
    city: "calatu", site: "a", zhName: "卡拉图", enName: "Calatu",
    lore: { placeId: "gulf-of-calatu", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b3-c039" } },
    texts: {
      title: ["Calatu: The Gulf Fortress Wall-Walk", "卡拉图：海湾要塞的墙巡"],
      body: [
        "On the walls of the gulf fortress a watch captain who has counted ships for the Melic of Hormos draws you along the parapet. He says Calatu is six hundred miles from the open sea and yet every pepper ship from Dufar and every inland caravan from Camadi must answer to this mole — if you mean to leave with more than a glance at the gulf.",
        "在海湾要塞墙上，一位为忽鲁谟斯的马立克点过船只的守将带你沿女墙走。他说卡拉图离外海六百里，然而来自佐法尔的每艘胡椒船与来自卡玛迪的每支内陆商队都须应答这道防波堤——若你想带走的不只是对海湾的一瞥。",
      ],
      choices: [
        ["Buy pepper at the fortress mole price", "按要塞码头价买下胡椒"],
        ["Ask which inland road leads toward Camadi", "追问通往卡玛迪的内陆路"],
        ["Count the ships a day and hear Ormus named", "点一日船，听忽鲁谟斯之名"],
      ],
      results: [
        ["He sells you pepper sealed for the gulf. The price includes the mole fee.", "他卖给你封好走海湾的胡椒。价钱里已含码头费。"],
        ["Camadi is marked on your map with the inland days. The plain road is clear.", "卡玛迪连同内陆日子已标上舆图。平原之路清晰。"],
        ["You spend a day counting masts. Ormus and Dufar are named, and fortune bends a little your way.", "你点了一日桅杆。忽鲁谟斯与佐法尔被点名，时运也稍稍偏向你。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "pepper", value: 1, reason: "bought-pepper-at-calatu-mole" }, { op: "codex", value: "cx-calatu", reason: "bought-pepper-at-the-gulf-fortress" }],
      [{ op: "reveal_map", value: "camadi", reason: "captain-named-the-inland-road-to-camadi" }, { op: "codex", value: "cx-calatu", reason: "mapped-the-inland-from-calatu" }],
      [{ op: "days", value: 1, reason: "counted-ships-on-the-wall" }, { op: "reveal_map", value: "ormus", reason: "wall-talk-named-ormus" }, { op: "reveal_map", value: "dufar", reason: "wall-talk-named-dufar" }, { op: "fate", id: "travel", value: 1, reason: "studied-the-gulf-traffic" }],
    ],
  },
  {
    city: "esher", site: "a", zhName: "施赫尔", enName: "Esher",
    lore: { placeId: "esher", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b3-c037" } },
    texts: {
      title: ["Esher: The Soldan's Haven, a Second Page", "施赫尔：苏丹的港湾，第二页"],
      body: [
        "In the haven four hundred miles from Aden a frankincense merchant who farms the Soldan's white incense draws you from the mole into his storehouse. He says Esher's revenue is smoke and gum — and that Aden, Dufar, and Axuma are written in his coast book if you mean to sail or ride with more than a glance at the harbour.",
        "在离亚丁四百里的港湾里，一位替苏丹经营白乳香的商人把你从防波堤引到库房。他说施赫尔的岁入是烟与脂——亚丁、佐法尔与阿克苏姆都写在他的海岸册上，若你想带着比一瞥港口更多的东西出航或上路。",
      ],
      choices: [
        ["Buy frankincense at the Soldan's coast price", "按苏丹海岸价买下乳香"],
        ["Ask which sea road leads toward Aden and Dufar", "追问通往亚丁与佐法尔的海路"],
        ["Watch the ships a day and hear Axuma named", "看一日船，听阿克苏姆之名"],
      ],
      results: [
        ["He sells you frankincense sealed for the next monsoon. The gum is white and the price is the coast's own.", "他卖给你封好等季风的乳香。脂是白的，价钱是海岸本价。"],
        ["Aden and Dufar are marked on your map. The frankincense coast is clear.", "亚丁与佐法尔已标上舆图。乳香海岸清晰。"],
        ["You spend a day on the mole. Axuma is named in the talk, and fortune bends a little your way.", "你在防波堤上过了一日。闲话里点到阿克苏姆，时运也稍稍偏向你。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "frankincense", value: 1, reason: "bought-frankincense-at-esher-coast-price" }, { op: "codex", value: "cx-esher", reason: "bought-frankincense-at-the-soldans-haven" }],
      [{ op: "reveal_map", value: "aden", reason: "merchant-named-aden" }, { op: "reveal_map", value: "dufar", reason: "merchant-named-dufar" }, { op: "codex", value: "cx-esher", reason: "mapped-the-frankincense-coast" }],
      [{ op: "days", value: 1, reason: "watched-esher-harbour" }, { op: "reveal_map", value: "axuma", reason: "harbour-talk-named-axuma" }, { op: "fate", id: "wealth", value: 1, reason: "studied-the-soldans-coast-book" }],
    ],
  },
  {
    city: "melibar", site: "a", zhName: "马拉巴", enName: "Melibar",
    lore: { placeId: "kingdom-of-melibar", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b3-c025" } },
    texts: {
      title: ["Melibar: The Pepper Coast Watch", "马拉巴：胡椒海岸的守望"],
      body: [
        "On the west-facing pepper coast a watchman who has counted corsair sails for twenty monsoons draws you under a palm shed. He says Melibar pays tribute to no man — but Cail, Coilum, and Maabar are written in his watch book if you mean to buy pepper without sailing blind into the next haven.",
        "在西向的胡椒海岸，一位点了二十个季风海盗帆影的守望者把你引到棕棚下。他说马拉巴不向任何人纳贡——但加异勒、俱蓝与马八儿都写在他的守望册上，若你想买胡椒却不盲目前往下一港。",
      ],
      choices: [
        ["Buy pepper at the coast watch price", "按海岸守望价买下胡椒"],
        ["Ask which road leads toward Cail and Coilum", "追问通往加异勒与俱蓝的路"],
        ["Watch the corsair horizon a day and hear Maabar named", "望一日海盗天际，听马八儿之名"],
      ],
      results: [
        ["He sells you pepper sealed for the next westbound ship. The price is the coast's own list.", "他卖给你封好等西行船的胡椒。价钱是海岸本价。"],
        ["Cail and Coilum are marked on your map. The pepper coast road is clear.", "加异勒与俱蓝已标上舆图。胡椒海岸之路清晰。"],
        ["You spend a day on the watch. Maabar is named in the talk, and fortune bends a little your way.", "你守望了一日。闲话里点到马八儿，时运也稍稍偏向你。"],
      ],
    },
    effects: [
      [{ op: "goods", id: "pepper", value: 1, reason: "bought-pepper-at-melibar-coast-price" }, { op: "reveal_map", value: "cail", reason: "watchman-named-cail" }],
      [{ op: "reveal_map", value: "coilum", reason: "watchman-named-coilum" }, { op: "reveal_map", value: "maabar", reason: "watchman-named-maabar" }, { op: "codex", value: "cx-melibar", reason: "mapped-the-pepper-coast" }, { op: "fate", id: "travel", value: 1, reason: "learned-the-corsair-watch" }],
      [{ op: "days", value: 1, reason: "watched-corsair-horizon" }, { op: "codex", value: "cx-melibar", reason: "noted-the-pepper-coast-watch" }],
    ],
  },
];

function appendStory(unit, entries) {
  for (const lang of ["en", "zh"]) {
    const p = join(STORY_DIR, unit, `${lang}.md`);
    if (!existsSync(p)) throw new Error(`missing story unit: ${unit}/${lang}.md`);
    const langIdx = lang === "en" ? 0 : 1;
    let text = readFileSync(p, "utf8");
    // Strip previously generated followup sections for this unit's packs.
    // Key style matches key(): ev.ev_<city>_<site>_followup.*
    const prefixes = PACKS.filter((x) => x.city === unit).map(
      (x) => `ev.ev_${unit}_${x.site}_followup`,
    );
    if (prefixes.length) {
      const lines = text.split("\n");
      const kept = [];
      let skip = false;
      for (const line of lines) {
        const heading = line.match(/^##\s+(\S+)/)?.[1] ?? "";
        if (heading) skip = prefixes.some((prefix) => heading.startsWith(prefix));
        if (!skip) kept.push(line);
      }
      text = kept.join("\n");
    }
    text = text.replace(/\s+$/, "") + "\n";
    for (const [k, values] of entries) {
      const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const section = new RegExp(`(## ${escaped}\\n\\n)[\\s\\S]*?(?=\\n## |$)`);
      if (section.test(text)) {
        text = text.replace(section, (_m, head) => `${head}${values[langIdx]}\n`);
      } else {
        text += `\n## ${k}\n\n${values[langIdx]}\n`;
      }
    }
    writeFileSync(p, text.replace(/\n{3,}/g, "\n\n"));
  }
}

function buildRecords() {
  const records = [];
  const storyByCity = new Map();
  const matrix = [];

  for (const pack of PACKS) {
    const id = `ev-${pack.city}-${pack.site}-followup`;
    const titleKey = key(id, "title");
    const bodyKey = key(id, "body");
    const choices = pack.texts.choices.map((c, i) => ({
      label: key(id, `choice_${i + 1}`),
      resultText: key(id, `choice_${i + 1}_result`),
      effects: pack.effects[i],
    }));
    records.push({
      id,
      kind: "consequence",
      title: titleKey,
      when: { cities: [pack.city] },
      body: bodyKey,
      once: true,
      choices,
      lore: pack.lore,
    });

    const entries = [
      [titleKey, pack.texts.title],
      [bodyKey, pack.texts.body],
    ];
    for (let i = 0; i < 3; i++) {
      entries.push([choices[i].label, pack.texts.choices[i]]);
      entries.push([choices[i].resultText, pack.texts.results[i]]);
    }
    const list = storyByCity.get(pack.city) ?? [];
    list.push(...entries);
    storyByCity.set(pack.city, list);

    const resultTypes = [...new Set(pack.effects.flat().map((e) => e.op))].join("/");
    matrix.push({
      city: pack.city,
      zh: pack.zhName,
      site: `ev-${pack.city}-${pack.site}`,
      followup: id,
      hub: HUBS.has(pack.city),
      resultTypes,
    });
  }

  for (const [city, entries] of storyByCity) appendStory(city, entries);
  writeFileSync(OUT_PATH, JSON.stringify({ contentVersion: 1, table: "events", records }, null, 2) + "\n");
  return { records, matrix };
}

function patchSiteJson() {
  const site = JSON.parse(readFileSync(SITE_PATH, "utf8"));
  let patched = 0;
  for (const pack of PACKS) {
    const siteId = `ev-${pack.city}-${pack.site}`;
    const followupId = `${siteId}-followup`;
    const rec = site.records.find((r) => r.id === siteId);
    if (!rec) throw new Error(`missing site ${siteId}`);
    // Queue on choices 0 and 1 (third stays instant), matching balc pattern variety.
    for (const i of [0, 1]) {
      const ch = rec.choices?.[i];
      if (!ch) throw new Error(`${siteId} missing choice ${i}`);
      if (!ch.effects) ch.effects = [];
      const has = ch.effects.some((e) => e.op === "queue_event" && e.value === followupId);
      if (!has) {
        ch.effects.push({
          op: "queue_event",
          value: followupId,
          reason: `${pack.city}-${pack.site}-followup`,
        });
        patched++;
      }
    }
  }
  writeFileSync(SITE_PATH, JSON.stringify(site, null, 2) + "\n");
  return patched;
}

function writeMatrix(matrix) {
  const lines = [
    "# 21 City 探索点深化接线矩阵",
    "",
    "本表由 `tools/lore/build_21city_followups.mjs` 生成。每座 `city` 级城市至少 1 个探索点进入多轮互动；枢纽城 `chamba` / `badashan` / `tanpiju` 两点都加深。",
    "",
    "| 城市 | 探索点 | 后续事件 | 枢纽双点 | 结果类型 |",
    "|---|---|---|---|---|",
  ];
  for (const row of matrix) {
    lines.push(
      `| ${row.zh} \`${row.city}\` | \`${row.site}\` | \`${row.followup}\` | ${row.hub ? "是" : "否"} | ${row.resultTypes} |`,
    );
  }
  lines.push(
    "",
    "验收：每城至少 1 个 site 选择 `queue_event` 指向有效 followup；枢纽城两点齐全；中英文 key 由 G30 与主校验器检查。",
    "",
  );
  writeFileSync(MATRIX_PATH, lines.join("\n"));
}

// Verify TARGETS match PACKS
for (const [city, sites] of Object.entries(TARGETS)) {
  for (const s of sites) {
    if (!PACKS.some((p) => p.city === city && p.site === s)) {
      throw new Error(`TARGETS ${city}-${s} missing from PACKS`);
    }
  }
}
if (PACKS.length !== 24) throw new Error(`expected 24 packs, got ${PACKS.length}`);

const { records, matrix } = buildRecords();
const patched = patchSiteJson();
writeMatrix(matrix);
console.log(
  `21-city followups: ${records.length} records, ${patched} queue hooks patched, matrix → ${MATRIX_PATH}`,
);
