#!/usr/bin/env node
/**
 * M4 text deepen — patches events.json + codex.json in place.
 * - Entry bodies → 300–500 zh (append city-specific paragraphs)
 * - Site bodies → ≥150 zh
 * - Codex bodies → ≥80 zh readable paragraphs
 * - Damascus 3-beat dialogue tree
 * Does NOT regenerate Battuta cities or wipe hand-written codex wholesale.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "assets/data");

const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const write = (f, data) =>
  fs.writeFileSync(path.join(DATA, f), JSON.stringify(data, null, 2) + "\n");

const zhLen = (s) => [...String(s || "")].length;

function clampZh(s, min = 300, max = 500) {
  let t = String(s || "").trim();
  if (zhLen(t) > max) {
    const arr = [...t];
    t = arr.slice(0, max - 1).join("") + "…";
  }
  return t;
}

function ensureRange(body, extraZh, extraEn, min = 300, max = 500) {
  let zh = body.zh || "";
  let en = body.en || "";
  if (zhLen(zh) < min && extraZh) {
    zh = (zh + (zh.endsWith("。") || zh.endsWith(".") ? "" : "。") + extraZh).replace(/。。/g, "。");
  }
  if ((en.length < Math.floor(min * 1.6)) && extraEn) {
    en = (en + (en.endsWith(".") ? " " : ". ") + extraEn).replace(/\.\./g, ".");
  }
  zh = clampZh(zh, min, max);
  return { zh, en };
}

function padSite(body, extraZh, extraEn, min = 150) {
  let zh = body.zh || "";
  let en = body.en || "";
  if (zhLen(zh) < min && extraZh) {
    zh = (zh + (zh.endsWith("。") ? "" : "。") + extraZh).replace(/。。/g, "。");
  }
  if (en.length < 180 && extraEn) {
    en = (en + (en.endsWith(".") ? " " : ". ") + extraEn).replace(/\.\./g, ".");
  }
  if (zhLen(zh) > 420) zh = [...zh].slice(0, 419).join("") + "…";
  return { zh, en };
}

/** City-specific entry appendices (zh / en) */
const ENTRY_EXTRA = {
  venice: {
    zh: "你在里亚尔托桥下数货船的桅杆，听见亚美尼亚商人用破碎的威尼斯话报胡椒价钱。圣马可广场上鸽子抢食，书记们把东行所需的担保誊成两份——一份留给共和国，一份随船走。夜色落在运河时，你才明白：这座城不生产丝绸，却靠记录与信用把半个地中海织进账本。写下来的见闻，比金币更耐潮。",
    en: "Under the Rialto you count masts and hear Armenian traders quote pepper in broken Venetian. On St. Mark's, clerks copy eastbound sureties in duplicate — one for the Republic, one for the ship. At dusk on the canals you understand: this city weaves half the Mediterranean into ledgers of credit. Written notes outlast damp gold."
  },
  acre: {
    zh: "城墙上的十字军旗已褪色，港湾里却仍挤满热那亚与威尼斯的船。圣殿骑士核对你的路引，像核对一枚会说话的印章。市场尽头有人低声出售往巴格达的向导名单；教堂钟声与宣礼声几乎叠在同一刻。阿卡是拉丁余晖最后一站——过了此门，法律、度量衡与神明的称呼都会改口。",
    en: "Crusader banners on the walls have faded, yet Genoese and Venetian hulls still crowd the harbor. Templars check your pass like a speaking seal. At the market's end someone whispers a list of guides to Baghdad; church bells and the call to prayer nearly coincide. Acre is the last Latin afterglow — beyond it, law, weights, and the names of God all change."
  },
  tabriz: {
    zh: "大不里士的市集分层如岩：上层卖丝绸与青金石，下层卖马具与干果。蒙古驿吏骑马穿过人群，金牌在胸前晃。你学着先问「哪条路税轻」，再问「哪条路土匪少」。夜里客栈炉火边，波斯诗人与亚美尼亚书记争辩同一座山的名字——你把两种写法都记进册子，免得日后被关卡嘲笑。",
    en: "Tabriz's bazaar is layered like rock: silk and lapis above, tack and dried fruit below. Mongol couriers ride through with paizas flashing. You learn to ask which road taxes less before which has fewer bandits. By the inn fire a Persian poet and Armenian clerk dispute one mountain's name — you record both spellings so no checkpoint can mock you later."
  },
  baghdad: {
    zh: "底格里斯河把城切成记忆与废墟两半。学者仍在图书馆门口争论亚里士多德，商队却绕开被毁的桥墩另寻渡口。你在香料巷闻见沉香与樟脑，也闻见尘土里未散尽的焦味。哈里发的荣光已淡，可账房里的数字仍精确——谁掌握度量，谁就掌握过河的权利。把见闻写短些，留给渡船的时间。",
    en: "The Tigris cuts the city into memory and ruin. Scholars still argue Aristotle at library doors while caravans bypass wrecked piers. In the spice lane you smell agarwood and camphor — and ash that never quite left the dust. Caliphal glory has faded; the counting-house numbers have not. Whoever holds the measures holds the right to cross."
  },
  hormuz: {
    zh: "霍尔木兹的热气像一口锅盖。珍珠、马匹与印度棉布在同一条潮线上交易；水手用手指比划季风何时转向。你第一次看见船不用桨、只靠天吃饭的规矩：错过风讯等于错过一整季的命。税官查舱比查灵魂更仔细。记下潮汐与税则——在这里，航海历比祈祷书更常被翻开。",
    en: "Hormuz heat sits like a lid. Pearls, horses, and Indian cotton trade on one tide-line; sailors mark the monsoon turn with their fingers. You first see ships that eat wind, not oars: miss the season and you miss a year of life. Customs men search holds harder than souls. Note tides and tariffs — here the sailing calendar is opened more than the prayer book."
  },
  balkh: {
    zh: "巴尔赫被称为众城之母，如今更像众城之墓。绿洲边缘的墙基露出旧砖，牧人在废殿影里挤奶。你仍能辨认佛寺改清真寺再改驿站的层层痕迹。商队在此休整驼峰，像翻一本被撕掉章节的书。有人说东去的路从这里才真正开始——因为西边的繁华你已见过，东边的空旷要靠脚去量。",
    en: "Balkh is called mother of cities; it feels more like their tomb. Old brick shows at oasis walls; herders milk in the shade of ruined halls. You still read layers: temple to mosque to yam. Caravans rest humps here as if turning a book with chapters torn out. Some say the eastward road truly begins here — western glory you have seen; eastern emptiness you must measure with feet."
  },
  samarkand: {
    zh: "撒马尔罕的蓝瓦在日光下几乎刺眼。帖木儿尚未以后世之名震慑世界，但这座城已会用花园与天文仪招待远客。你在雷吉斯坦广场听人用三种语言叫卖同一匹布。夜里星盘的铜臂转动，学者把你的生辰换算成他们的黄道——你不懂全部演算，却记下「数字也能当路引」。",
    en: "Samarkand's blue tiles nearly blind in daylight. Timur's later fame has not yet frozen the world, yet the city already greets strangers with gardens and astrolabes. On the Registan three tongues sell one bolt of cloth. At night a copper arm of the star-plate turns; a scholar translates your birth into their zodiac. You cannot follow every sum, but you note that numbers can be a pass."
  },
  kashgar: {
    zh: "喀什噶尔是两山夹出的集散口：南路玉石，北路皮毛，城里则是葡萄干与刀鞘。你学会在巴扎用手势谈价，也学会在清真寺外放下刀。向导警告：从此向东，水比银贵，谎比水更多。把水袋装满，把话少说——沙漠会惩罚饶舌的人，也会奖励把井位写清楚的人。",
    en: "Kashgar is a funnel between ranges: jade south, furs north, raisins and knife-sheaths in town. You bargain by gesture in the bazaar and leave blades outside the mosque. Guides warn: eastward, water costs more than silver, and lies outnumber wells. Fill the skins; speak less — the desert punishes chatter and rewards those who write wells clearly."
  },
  khotan: {
    zh: "和田的玉在河床里像冷月亮。织工把蚕丝拉成能穿过戒指的薄绢，僧人以梵文与于阗文同时抄经。你看见一座佛寺的泥塑金身缺了一只手，香客仍叩首如仪。夜里风沙拍窗，像有人在门外翻旧籍。把玉的成色与丝的经纬都记下来——货物会说话，只要你肯当翻译。",
    en: "Khotan's jade lies in the riverbed like cold moons. Weavers draw silk thin enough for a ring; monks copy sutras in Sanskrit and Khotanese together. A clay Buddha lacks one hand; pilgrims still bow. Night sand taps the shutters like someone turning old pages outside. Record jade grades and silk counts — goods speak if you translate."
  },
  lop: {
    zh: "罗布是进入大漠前最后一口正经水。村民教你辨认海市蜃楼与真湖的差别：真湖边上有鸟粪，假湖边上只有焦渴。夜里听见像鼓又像哭的声音，老人说是沙在走。你把驼铃的节奏写进笔记，好在迷路时用耳代替眼。从此每一步都像在借命——借给风，也借给自己的谨慎。",
    en: "Lop is the last honest water before the desert. Villagers teach mirage from true lake: birds leave guano at the real shore; thirst alone at the false. Night sounds like drum and weeping; elders say the sand is walking. You note camel-bell rhythm so ears can replace eyes when lost. Every step hereafter borrows life — from the wind, and from your own caution."
  },
  shangdu: {
    zh: "上都的宫墙在草原上画出整齐的直角。蒙古贵族骑马较猎，色目工匠在作坊里打金银器。你被允许远远看见帐殿的白毡与孔雀羽扇，却不能靠近御案。翻译官反复叮嘱：先报职衔，再报来意，最后才呈礼物。盛世的礼仪像另一座关卡——过得去，才配谈更远的汗八里。",
    en: "Shangdu's palace walls cut clean right angles on the steppe. Mongol nobles hunt on horseback; Western craftsmen work gold and silver. You may glimpse white felt and peacock fans from afar, never the imperial desk. Interpreters repeat: rank first, errand second, gifts last. Court etiquette is another checkpoint — clear it before Khanbaliq."
  },
  khanbaliq: {
    zh: "汗八里的大街宽到可容九车并行。色目、汉人、蒙古人各走各的规矩，市场却把大家绑在同一杆秤上。你在会同馆外排队呈文，看使者把各国土物列成清单。宫城角楼的影投在护城河上，像一句写不完的序言。把所见写成可核对的条目——大汗的世界太大，只有细节能证明你真的来过。",
    en: "Khanbaliq avenues fit nine carts abreast. Semu, Han, and Mongol keep separate customs; the market binds them to one scale. Outside the hostel for envoys you queue to present papers and watch tribute lists grow. Corner towers throw shadows on the moat like an unfinished preface. Write what can be checked — the Khan's world is too large; only detail proves you came."
  },
  hangzhou: {
    zh: "杭州的湖面像一面被温柔擦过的铜镜。画舫上丝竹声与商贩叫卖混在一起，桥洞下乌篷船接踵而过。你尝到醋鱼与龙井，也看见纸钞在酒肆里比银锭更受欢迎。有人说此城富过半个欧洲——你不敢断言，只把桥的数量与丝绸铺的招牌抄进册子。东南的繁华是另一种关山：用享乐考验远行人的克制。",
    en: "Hangzhou's lake is a gently polished bronze mirror. Music from painted boats mixes with hawkers; black-awning craft pass under bridges. You taste vinegar fish and Dragon Well tea, and see paper notes preferred to silver in wine-houses. Some say the city out-riches half of Europe — you will not swear it, only copy bridge counts and silk-shop signs. Southeastern ease is another pass: it tests a traveler's restraint."
  },
  quanzhou: {
    zh: "刺桐港的桅林比寺院的塔林更密。波斯船、马来船、汉船并泊，码头上泰米尔语与阿拉伯语抢道。天妃宫的香火旺得像要熏干整条潮水。你看见市舶司验货盖印，像给海打证明。从此若再西还，风与神都要重新商量——把船籍、货单与潮汛写成三联，才算对得起这一趟入海的见闻。",
    en: "Zayton's mast-forest outnumbers temple pagodas. Persian, Malay, and Han ships share the quay; Tamil and Arabic jostle on the docks. Tianfei's incense seems thick enough to dry the tide. The shipping office stamps cargo like a passport for the sea. If you ever sail west again, wind and gods must renegotiate — write registry, manifest, and tide in triplicate to honor this maritime note."
  },
  tangier: {
    zh: "丹吉尔的风里有大西洋的咸与直布罗陀的窄。白图泰从这里出发时，也许只想完成一次朝觐，却被路本身改写成更长的契约。你在港市听见安达卢西亚流亡者的歌，也看见南下沙漠的驼队整装。把启程写得郑重些：每一本游记都假装自己知道终点，其实终点是走出来的。",
    en: "Tangier's wind carries Atlantic salt and the Strait's narrowness. When Ibn Battuta left, he may have meant only the Hajj; the road rewrote that into a longer contract. You hear Andalusian exile songs and watch desert caravans kit out. Write departures with care: every travel book pretends to know its end; the end is walked into being."
  },
  cairo: {
    zh: "开罗把尼罗河当成自己的脉搏。马穆鲁克骑士的马蹄敲在石街，抄经生的墨香飘出艾资哈尔的走廊。你看见粮船卸麦，也看见法官在树荫下审商队逃税案。白图泰称此城为诸城之母之一——母城的规矩多：施舍有序，学问有阶，市集有眼线。学会在拥挤里听见关键的句子，比学会讨价更重要。",
    en: "Cairo takes the Nile as its pulse. Mamluk hooves strike stone; ink from al-Azhar drifts in the corridors. Grain boats unload wheat; a judge tries a customs case under a tree. Battuta named it among mother-cities — and mothers have rules: ordered charity, ranked learning, watchful markets. Hearing key sentences in a crowd matters more than haggling."
  },
  damascus: {
    zh: "大马士革的玫瑰水味能顺着巷子走很远。倭马亚清真寺的院子里，学者与香客并肩洗脚。你看见大马士革钢刃在光下泛出水纹，也看见朝觐商队在城外编队。这里是叙利亚的心脏，也是东去波斯、南下麦加的换乘站。把街名与门名写准——迷路的人常把神学争论当成路标，结果走得更远。",
    en: "Damascus rosewater travels far down alleys. In the Umayyad courtyard scholars and pilgrims wash feet side by side. Damascene steel shows water-patterns in the light; Hajj caravans form outside the walls. This is Syria's heart and a transfer for Persia east and Mecca south. Write street and gate names true — the lost often treat theological debate as a signpost and wander farther."
  },
  mecca: {
    zh: "麦加的热与虔诚叠在一起，使人不敢随便说话。围绕天房的人流像缓慢的银河，你被卷入其中，才懂「方向」有时不是地图而是心。白图泰在此完成朝觐的核心礼仪，却把更多页留给路上的人。你记下水的配给、帐篷的等级、以及谁在夜间诵经到天明——圣城的秩序，是用无数细小的忍让撑住的。",
    en: "Mecca stacks heat and devotion until speech feels unsafe. The flow around the Kaaba is a slow galaxy; pulled into it, you learn that direction is sometimes heart, not map. Battuta completed the core rites here and still gave more pages to people on the road. Note water rations, tent ranks, and who recites till dawn — the Holy City's order is held by countless small yields."
  },
  delhi: {
    zh: "德里的宫廷像一座不断改建的迷宫。苏丹的赏赐可以一夜使人暴富，也可以一夜使人失踪。你在德里看见中亚马匹与印度棉布同场交易，也看见苏菲道堂里的安静与校场上的喧闹对峙。白图泰在此做官又离开——官位是驿站，不是家。把赏罚的传闻写成条件句，比写成神话更有用。",
    en: "Delhi's court is a maze under perpetual remodel. A sultan's gift can enrich overnight or erase a name. Central Asian horses trade beside Indian cotton; Sufi quiet faces parade-ground noise. Battuta held office here and left — office is a yam, not a home. Write rumors of reward and punishment as conditionals; they beat myths for use."
  },
  calicut: {
    zh: "卡利卡特的胡椒气味能粘在头发上好几天。印度洋的船在此换货：中国瓷器、阿拉伯马、马来香料。扎莫林的官吏用椰子叶登记关税，精确得像潮汐表。你看见不同信仰的商人在同一条船上分红，只为季风不允许拖延。把风向、货种与关税三件事写在同一页——海路的诚实，是用准时证明的。",
    en: "Calicut pepper clings to hair for days. Indian Ocean ships swap Chinese porcelain, Arabian horses, Malay spices. The Zamorin's clerks tally duty on palm leaf as precise as a tide table. Merchants of many faiths share one hull because the monsoon forbids delay. Put wind, cargo, and tariff on one page — sea honesty is proven by being on time."
  }
};

const SITE_EXTRA = {
  market: {
    zh: "你沿着摊位记下度量衡与暗语：同一种货在巷口与巷尾可以差出一个脚夫的工钱。问价之前先问产地，问产地之前先看秤是否公平。市集是一座城的呼吸——急促时有谣言，平稳时有信用。",
    en: "Along the stalls you note measures and cant: the same good can differ by a porter's wage from lane-mouth to lane-end. Ask origin before price; check the scale before origin. A market is a city's breath — rumors when hurried, credit when calm."
  },
  faith: {
    zh: "你在门槛外学当地的小规矩：何处脱鞋，何时沉默，怎样把施舍放进箱子而不像施舍。信仰场所不卖路引，却常常决定你能不能被当作「自己人」。把礼仪写成清单，比写成感想更不易失礼。",
    en: "Outside the threshold you learn local minutiae: where to bare feet, when to be silent, how to give alms without performing charity. Shrines do not sell passes, yet often decide whether you count as kin. Write etiquette as a list; it offends less than feelings."
  },
  craft: {
    zh: "作坊里的节奏比市集诚实：锤子、织机、磨轮都会泄露手艺的年头。你问原料从哪条路来，成品往哪条路去——工匠的回答常常比官员的告示更接近真相。把一道工序记清楚，等于多懂一种不会说谎的语言。",
    en: "Workshop rhythm is more honest than the bazaar: hammer, loom, and wheel betray years of craft. Ask which road brings materials and which takes finished goods — artisans often answer closer to truth than official notices. One clear process is another language that rarely lies."
  },
  tree: {
    zh: "对话像过河：每一问都是一块踏石。你留意对方省略的名字与加重的口气——真正的关键往往藏在「顺便」两个字后面。把问答写成可回溯的链条，日后才能知道自己在哪一步改了命运。",
    en: "Dialogue is a crossing: each question a stepping-stone. Note omitted names and stressed tones — the real key often hides after 'by the way.' Write the chain so you can later see which step changed your road."
  },
  other: {
    zh: "你把眼前细节写成可核对的条目：方位、气味、价钱、谁先开口。远行的书不是靠惊叹撑住的，而是靠这些能复查的钉子。",
    en: "You pin details that can be checked: bearing, smell, price, who spoke first. Travel books stand on such nails, not on wonder alone."
  }
};

function siteKind(id) {
  if (/market|bazaar/.test(id)) return "market";
  if (/faith|temple|shrine|mosque/.test(id)) return "faith";
  if (/craft|inn|workshop/.test(id)) return "craft";
  if (/tree|paiza/.test(id)) return "tree";
  return "other";
}

function cityFromEvent(ev) {
  if (ev.at && ev.at[0]) return ev.at[0];
  if (ev.when && ev.when.cities && ev.when.cities[0]) return ev.when.cities[0];
  const m = String(ev.id).match(/^ev-([a-z]+)-/);
  return m ? m[1] : null;
}

function deepenEvents(events) {
  let entryN = 0, siteN = 0;
  for (const ev of events) {
    const city = cityFromEvent(ev);
    if (ev.kind === "entry") {
      const ex = ENTRY_EXTRA[city] || {
        zh: "你把城门、税卡、水源与宿处四件事写进册子，并留下一句给未来的自己：见闻若不能复核，就只是路上的风。远行不是收集地名，而是学会在陌生规矩里仍保持可被信任的记录。",
        en: "You record gate, customs, water, and lodging, and leave a line for your future self: notes that cannot be checked are only wind. Travel is not collecting names but remaining a trustworthy record among strange rules."
      };
      const next = ensureRange(ev.body, ex.zh, ex.en, 300, 500);
      if (next.zh !== ev.body.zh || next.en !== ev.body.en) {
        ev.body = next;
        entryN++;
      }
      if (!ev.lore) ev.lore = {};
      if (!ev.lore.ref) {
        ev.lore.ref = {
          book: /tangier|cairo|damascus|mecca|delhi|calicut/.test(city || "")
            ? "ibn-battuta" : "marco-polo",
          chapterId: city || "unknown"
        };
      }
      if (!ev.lore.placeId) ev.lore.placeId = city;
    } else if (ev.kind === "site") {
      const kind = siteKind(ev.id);
      const ex = SITE_EXTRA[kind] || SITE_EXTRA.other;
      const next = padSite(ev.body, ex.zh, ex.en, 150);
      if (next.zh !== ev.body.zh || next.en !== ev.body.en) {
        ev.body = next;
        siteN++;
      }
    }
  }
  return { entryN, siteN };
}

function expandCodex(codex) {
  let n = 0;
  const tailZh = "记录宜短而可核：地名、货物、礼仪与通行条件，比惊叹更耐翻阅。远路的知识从来不是一次听全，而是多次对照后才站住。";
  const tailEn = "Keep notes short and checkable: place, goods, etiquette, and pass-conditions outlast wonder. Road-knowledge is rarely heard once; it stands after many cross-checks.";
  for (const c of codex) {
    const zh = c.body?.zh || "";
    const en = c.body?.en || "";
    if (zhLen(zh) >= 120 && en.length >= 120) continue;
    let nzh = zh;
    let nen = en;
    if (zhLen(nzh) < 120) {
      nzh = (nzh + (nzh.endsWith("。") ? "" : "。") + tailZh).replace(/。。/g, "。");
    }
    if (nen.length < 120) {
      nen = (nen + (nen.endsWith(".") ? " " : ". ") + tailEn).replace(/\.\./g, ".");
    }
    if (zhLen(nzh) > 280) nzh = [...nzh].slice(0, 279).join("") + "…";
    if (nzh !== zh || nen !== en) {
      c.body = { zh: nzh, en: nen };
      n++;
    }
  }
  return n;
}

function addDamascusTree(events, cities) {
  const ids = ["ev-damascus-tree-1", "ev-damascus-tree-2", "ev-damascus-tree-3"];
  if (events.some((e) => e.id === ids[0])) {
    console.log("Damascus tree already present — skip create");
  } else {
    const trees = [
      {
        id: "ev-damascus-tree-1",
        kind: "site",
        at: ["damascus"],
        title: { zh: "大马士革香市·一", en: "Damascus Perfume · I" },
        body: {
          zh: "倭马亚清真寺外的香市里，一名叙利亚香料商请你辨别真假玫瑰水：一瓶清、一瓶浊，价格却写反了。围观者起哄，有人赌你的鼻子，有人赌你的良心。空气里玫瑰与沉香缠在一起，像故意要干扰判断。你忽然想起路上学过的一句：香料的诚实，有时要靠光线，不靠叫卖。",
          en: "In the perfume market outside the Umayyad Mosque, a Syrian spicer asks you to tell true rosewater from false: one clear, one cloudy, prices reversed. Onlookers bet on your nose or your conscience. Rose and agarwood tangle in the air as if to confuse judgment. You recall a road proverb: spice honesty sometimes needs light, not shouting."
        },
        choices: [
          {
            label: { zh: "借日光细看液面", en: "Judge by daylight on the surface" },
            effects: [
              { op: "flag", value: "damascus-tree-1" },
              { op: "codex", value: "cx-damascus-tree" },
              { op: "goto", value: "event:ev-damascus-tree-2" }
            ]
          },
          {
            label: { zh: "先问产地文书", en: "Ask for origin papers first" },
            effects: [
              { op: "flag", value: "damascus-tree-1b" },
              { op: "fate", stat: "rapport", value: 1 },
              { op: "goto", value: "event:ev-damascus-tree-2" }
            ]
          },
          {
            label: { zh: "婉拒离开", en: "Decline and leave" },
            effects: [{ op: "days", value: 1 }]
          }
        ]
      },
      {
        id: "ev-damascus-tree-2",
        kind: "site",
        at: ["damascus"],
        title: { zh: "大马士革香市·二", en: "Damascus Perfume · II" },
        body: {
          zh: "香料商承认浊瓶才是新蒸馏的真货，清瓶掺了酒精求卖相。围观者散去一半，剩下的人要你在「当众揭穿」与「私下纠正」之间选一条路。远处宣礼声起，商贩下意识擦手。你意识到：在大马士革，面子有时比瓶子更易碎，而朝觐季节的信誉能卖到麦加城门。",
          en: "The spicer admits the cloudy bottle is freshly distilled truth; the clear one was cut for looks. Half the crowd leaves; the rest ask you to expose him publicly or correct him privately. The call to prayer rises; he wipes his hands. In Damascus, face shatters easier than glass, and Hajj-season credit can sell as far as Mecca's gate."
        },
        choices: [
          {
            label: { zh: "私下纠正，留他体面", en: "Correct him privately" },
            effects: [
              { op: "flag", value: "damascus-tree-2-kind" },
              { op: "fate", stat: "rapport", value: 1 },
              { op: "goto", value: "event:ev-damascus-tree-3" }
            ]
          },
          {
            label: { zh: "当众说破，护买家", en: "Expose him to protect buyers" },
            divination: "lot",
            pass: {
              text: { zh: "众人点头，香料商赔笑补差价。", en: "The crowd nods; he laughs it off and refunds the difference." },
              effects: [
                { op: "flag", value: "damascus-tree-2-public" },
                { op: "coins", value: 2 },
                { op: "goto", value: "event:ev-damascus-tree-3" }
              ]
            },
            fail: {
              text: { zh: "他反咬你是外地奸细，你只好花钱消灾。", en: "He calls you a foreign spy; you pay to end the quarrel." },
              effects: [
                { op: "coins", value: -3 },
                { op: "goto", value: "event:ev-damascus-tree-3" }
              ]
            }
          }
        ]
      },
      {
        id: "ev-damascus-tree-3",
        kind: "site",
        at: ["damascus"],
        title: { zh: "大马士革香市·三", en: "Damascus Perfume · III" },
        body: {
          zh: "傍晚，香料商塞给你一小瓶真玫瑰水，作为「路上识货」的谢礼，并指一条少税的南下朝觐支路。你把支路画进雾图，也把「浊者可能为真」写进图鉴——见闻有时反常识，却更接近作坊里的蒸汽。大马士革教你：香与信，都要经得起光线。",
          en: "At dusk the spicer presses a vial of true rosewater on you — thanks for knowing goods — and points to a lighter-tax side road south toward the Hajj. You sketch the fork into the fog-map and file 'cloudy may be true' in the codex. Damascus teaches: perfume and trust both need light."
        },
        choices: [
          {
            label: { zh: "收下谢礼并记路", en: "Accept the gift and note the road" },
            effects: [
              { op: "flag", value: "damascus-tree-done" },
              { op: "codex", value: "cx-damascus-rose" },
              { op: "revealMap", value: "mecca" },
              { op: "goods", id: "rosewater", value: 1 }
            ]
          },
          {
            label: { zh: "只记路，不受礼", en: "Note the road; refuse the gift" },
            effects: [
              { op: "flag", value: "damascus-tree-done" },
              { op: "codex", value: "cx-damascus-rose" },
              { op: "fate", stat: "rapport", value: 1 },
              { op: "revealMap", value: "mecca" }
            ]
          }
        ]
      }
    ];
    // pad tree bodies to site min
    for (const t of trees) {
      const ex = SITE_EXTRA.tree;
      t.body = padSite(t.body, ex.zh, ex.en, 150);
    }
    events.push(...trees);
    console.log("Added Damascus tree events ×3");
  }

  const city = cities.find((c) => c.id === "damascus");
  if (city) {
    city.sites = ["ev-damascus-market", "ev-damascus-faith", "ev-damascus-tree-1"];
    console.log("Wired damascus.sites → tree-1");
  }

  const codex = read("codex.json");
  const addCx = (id, title, body, category = "travel") => {
    if (codex.some((c) => c.id === id)) return;
    codex.push({
      id,
      category,
      title,
      body,
      lore: { ref: { id }, origin: "ibn-battuta" }
    });
  };
  addCx(
    "cx-damascus-tree",
    { zh: "大马士革·香市断真", en: "Damascus · Testing Perfume" },
    {
      zh: "大马士革香市里，真玫瑰水初馏时常显浑浊，过分清澈反可能掺入酒精求卖相。识货者借日光看液面，并核产地文书。朝觐季信誉可一路卖到麦加城门——香与信，都要经得起光线。",
      en: "In Damascus perfume stalls, true fresh rosewater often looks cloudy; overly clear bottles may be cut for show. Judges use daylight and origin papers. Hajj-season credit can sell to Mecca's gate — perfume and trust both need light."
    },
    "goods"
  );
  addCx(
    "cx-damascus-rose",
    { zh: "大马士革·玫瑰水路引", en: "Damascus · Rosewater Pass" },
    {
      zh: "识破掺假之后，香料商可能指一条南下朝觐的少税支路。玫瑰水既是礼物也是路标：叙利亚的香料网络与朝觐季驿站相互咬合。把支路画进雾图，比把瓶子收进行囊更重要。",
      en: "After a fraud is caught, a spicer may point to a lighter-tax side road south on the Hajj. Rosewater is gift and signpost: Syrian spice nets mesh with pilgrimage yams. Sketching the fork into the fog-map matters more than pocketing the vial."
    },
    "travel"
  );
  write("codex.json", codex);
}

function main() {
  const events = read("events.json");
  const cities = read("cities.json");
  const { entryN, siteN } = deepenEvents(events);
  console.log(`Deepened entries: ${entryN}, sites: ${siteN}`);
  addDamascusTree(events, cities);
  write("events.json", events);
  write("cities.json", cities);

  let codex = read("codex.json");
  const cxN = expandCodex(codex);
  write("codex.json", codex);
  console.log(`Expanded codex rows: ${cxN}`);

  // summary lengths
  const ev2 = read("events.json");
  const ents = ev2.filter((e) => e.kind === "entry");
  const lens = ents.map((e) => zhLen(e.body.zh));
  console.log(
    `Entry zh len min/avg/max: ${Math.min(...lens)} / ${Math.round(lens.reduce((a, b) => a + b, 0) / lens.length)} / ${Math.max(...lens)}`
  );
  const sites = ev2.filter((e) => e.kind === "site");
  const sl = sites.map((e) => zhLen(e.body.zh));
  console.log(
    `Site zh len min/avg: ${Math.min(...sl)} / ${Math.round(sl.reduce((a, b) => a + b, 0) / sl.length)} (under150=${sl.filter((n) => n < 150).length})`
  );
}

main();
