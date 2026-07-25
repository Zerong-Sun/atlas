/* 商品表 · goods catalog (GDD §9.1 MVP 60)
   贴图映射见 assets/art/GOODS_ART_MAP.json；运行时由 FQ.itemArt() 解析。 */
window.FQ = window.FQ || {};

/* sync art stems — keep aligned with GOODS_ART_MAP.json */
FQ.GOODS_ART = {
  silk: "item-silk", spice: "item-spice", glass: "item-glass",
  pepper: "ic-extra-hot-pepper", frankincense: "ic-ritual-candle", cotton: "ic-extra-spool-of-thread",
  porcelain: "ic-place-teapot", tea: "ic-place-tea", paper: "ic-ritual-scroll",
  jade: "ic-extra-white-diamond", turquoise: "ic-misc-diamond", pearl: "ic-extra-white-diamond",
  carpet: "ic-ritual-basket", horse: "ic-travel-horse", camel: "ic-travel-bactrian",
  fur: "ic-place-bed", rhubarb: "ic-misc-leaf", dates: "ic-misc-seed",
  wine: "ic-place-wine", "olive-oil": "ic-ritual-amphora", wool: "ic-extra-spool-of-thread",
  silver: "ic-ritual-coin", "gold-dust": "ic-dream-treasure", ivory: "ic-dream-tooth",
  coral: "ic-misc-orn-star", indigo: "ic-misc-leaf", lapis: "ic-extra-white-diamond",
  steel: "ic-tower-swords", incense: "ic-ritual-candle", aloeswood: "ic-ritual-lantern",
  sandalwood: "ic-ritual-candle", nutmeg: "ic-extra-hot-pepper", cloves: "ic-misc-seed",
  saffron: "ic-misc-seed", ginger: "ic-extra-hot-pepper", lacquer: "ic-place-classical",
  fan: "ic-ritual-lantern", salt: "ic-tower-drop", herbs: "ic-misc-leaf",
  felt: "ic-place-bed", tin: "ic-ritual-coin", gems: "ic-misc-diamond",
  ruby: "ic-extra-white-diamond", books: "ic-misc-books", relic: "ic-place-church",
  icons: "ic-place-shrine", "dehua-porcelain": "ic-place-teapot", "murano-glass": "item-glass",
  "samarkand-tile": "ic-place-classical", "damascus-steel": "ic-creature-dagger",
  "hangzhou-fan": "ic-ritual-lantern", "khotan-jade": "ic-extra-white-diamond",
  "zayton-pepper": "ic-extra-hot-pepper", brocade: "ic-extra-spool-of-thread",
  tutia: "ic-tower-pill", melon: "ic-misc-seed", "coconut-oil": "ic-ritual-amphora",
  ebony: "ic-misc-leaf", ambergris: "ic-ritual-fog", "silk-brocade": "item-silk",
  "paiza-silk": "ic-ritual-scroll"
};
FQ.TOOL_ART = { compass: "item-compass", crystal: "item-crystal", beads: "item-beads" };
FQ.TOKEN_ART = {
  lampoil: "item-lampoil", astrolabe: "item-astrolabe",
  paiza: "item-paiza", mazucharm: "item-mazucharm"
};

/* tier: regional | specialty · origin: band id or city id */
FQ.GOODS = {
  /* —— 地中海 / 基督之境 chr —— */
  glass:       { ic: "🏺", zh: "琉璃", en: "Glassware", tier: "regional", origin: ["chr", "isl"] },
  "murano-glass": { ic: "🏺", zh: "穆拉诺玻璃", en: "Murano Glass", tier: "specialty", origin: ["venice"] },
  wool:        { ic: "🧶", zh: "羊毛呢绒", en: "Wool Cloth", tier: "regional", origin: ["chr"] },
  "olive-oil": { ic: "🏺", zh: "橄榄油", en: "Olive Oil", tier: "regional", origin: ["chr"] },
  wine:        { ic: "🍷", zh: "葡萄酒", en: "Wine", tier: "regional", origin: ["chr"] },
  relic:       { ic: "⛪", zh: "圣物", en: "Holy Relic", tier: "regional", origin: ["chr"] },
  books:       { ic: "📚", zh: "手抄书", en: "Manuscript", tier: "regional", origin: ["chr"] },
  silver:      { ic: "🪙", zh: "银器", en: "Silverware", tier: "regional", origin: ["chr"] },
  cotton:      { ic: "🧵", zh: "棉布", en: "Cotton Cloth", tier: "regional", origin: ["chr", "india"] },
  coral:       { ic: "✦", zh: "珊瑚", en: "Coral", tier: "regional", origin: ["chr", "mazu"] },

  /* —— 中东 / 新月之境 isl —— */
  spice:       { ic: "🌶️", zh: "香料", en: "Spice", tier: "regional", origin: ["isl", "india", "mazu"] },
  pepper:      { ic: "🌶️", zh: "胡椒", en: "Pepper", tier: "regional", origin: ["isl", "india", "mazu"] },
  frankincense:{ ic: "🕯️", zh: "乳香", en: "Frankincense", tier: "regional", origin: ["isl"] },
  incense:     { ic: "🕯️", zh: "熏香", en: "Incense", tier: "regional", origin: ["isl", "con"] },
  carpet:      { ic: "🧺", zh: "地毯", en: "Carpet", tier: "regional", origin: ["isl", "con"] },
  paper:       { ic: "📜", zh: "纸张", en: "Paper", tier: "regional", origin: ["isl", "con"] },
  horse:       { ic: "🐴", zh: "骏马", en: "Horse", tier: "regional", origin: ["isl", "con"] },
  turquoise:   { ic: "💎", zh: "绿松石", en: "Turquoise", tier: "regional", origin: ["isl"] },
  brocade:     { ic: "🧵", zh: "织金锦", en: "Gold Brocade", tier: "regional", origin: ["isl"] },
  tutia:       { ic: "💊", zh: "眼药", en: "Tutia Eye-Salve", tier: "regional", origin: ["isl"] },
  "damascus-steel": { ic: "🗡️", zh: "大马士革钢", en: "Damascus Steel", tier: "specialty", origin: ["mosul"] },
  dates:       { ic: "🌾", zh: "椰枣", en: "Dates", tier: "regional", origin: ["isl"] },

  /* —— 中亚 con / 草原 —— */
  camel:       { ic: "🐫", zh: "骆驼", en: "Camel", tier: "regional", origin: ["isl", "con"] },
  fur:         { ic: "🛏️", zh: "皮毛", en: "Furs", tier: "regional", origin: ["con"] },
  felt:        { ic: "🛏️", zh: "毡毯", en: "Felt", tier: "regional", origin: ["con"] },
  steel:       { ic: "⚔️", zh: "钢刃", en: "Steel Blades", tier: "regional", origin: ["isl", "con"] },
  lapis:       { ic: "💎", zh: "青金石", en: "Lapis Lazuli", tier: "regional", origin: ["con"] },
  gems:        { ic: "💎", zh: "宝石", en: "Gemstones", tier: "regional", origin: ["con", "india"] },
  melon:       { ic: "🍈", zh: "甜瓜", en: "Melons", tier: "regional", origin: ["isl"] },
  indigo:      { ic: "🍃", zh: "靛蓝", en: "Indigo", tier: "regional", origin: ["isl", "india"] },
  "samarkand-tile": { ic: "🏛️", zh: "蓝釉陶砖", en: "Blue Glazed Tile", tier: "specialty", origin: ["samarkand"] },
  rhubarb:     { ic: "🌿", zh: "大黄", en: "Rhubarb", tier: "regional", origin: ["con"] },

  /* —— 中国儒道之境 con —— */
  silk:        { ic: "🧵", zh: "丝绸", en: "Silk", tier: "regional", origin: ["con"] },
  "silk-brocade": { ic: "🧵", zh: "熟绢", en: "Finished Silk", tier: "regional", origin: ["con"] },
  porcelain:   { ic: "🏺", zh: "瓷器", en: "Porcelain", tier: "regional", origin: ["con"] },
  "dehua-porcelain": { ic: "🏺", zh: "德化白瓷", en: "Dehua White Porcelain", tier: "specialty", origin: ["quanzhou"] },
  tea:         { ic: "🍵", zh: "茶", en: "Tea", tier: "regional", origin: ["con"] },
  lacquer:     { ic: "🏛️", zh: "漆器", en: "Lacquerware", tier: "regional", origin: ["con"] },
  fan:         { ic: "🪭", zh: "扇子", en: "Folding Fan", tier: "regional", origin: ["con"] },
  "hangzhou-fan": { ic: "🪭", zh: "湖上绢扇", en: "West Lake Silk Fan", tier: "specialty", origin: ["hangzhou"] },
  salt:        { ic: "🧂", zh: "盐", en: "Salt", tier: "regional", origin: ["con"] },
  herbs:       { ic: "🌿", zh: "药材", en: "Herbs", tier: "regional", origin: ["con", "isl", "india"] },
  jade:        { ic: "💎", zh: "玉石", en: "Jade", tier: "regional", origin: ["con"] },
  "khotan-jade": { ic: "💎", zh: "于阗玉", en: "Khotan Jade", tier: "specialty", origin: ["khotan"] },
  "paiza-silk": { ic: "📜", zh: "通行证织物", en: "Paiza Silk", tier: "regional", origin: ["con"] },

  /* —— 印度 / 南洋 mazu —— */
  nutmeg:      { ic: "🌶️", zh: "肉豆蔻", en: "Nutmeg", tier: "regional", origin: ["mazu", "india"] },
  cloves:      { ic: "🌱", zh: "丁香", en: "Cloves", tier: "regional", origin: ["mazu"] },
  saffron:     { ic: "🌾", zh: "藏红花", en: "Saffron", tier: "regional", origin: ["isl", "india"] },
  ginger:      { ic: "🫚", zh: "姜", en: "Ginger", tier: "regional", origin: ["mazu", "india"] },
  aloeswood:   { ic: "🏮", zh: "沉香", en: "Aloeswood", tier: "regional", origin: ["mazu"] },
  sandalwood:  { ic: "🕯️", zh: "檀香", en: "Sandalwood", tier: "regional", origin: ["mazu", "india"] },
  pearl:       { ic: "🫧", zh: "珍珠", en: "Pearls", tier: "regional", origin: ["mazu"] },
  tin:         { ic: "🪙", zh: "锡", en: "Tin", tier: "regional", origin: ["mazu"] },
  ebony:       { ic: "🪵", zh: "乌木", en: "Ebony", tier: "regional", origin: ["mazu", "india"] },
  "coconut-oil": { ic: "🏺", zh: "椰油", en: "Coconut Oil", tier: "regional", origin: ["mazu"] },
  "zayton-pepper": { ic: "🌶️", zh: "刺桐胡椒", en: "Zayton Pepper", tier: "specialty", origin: ["quanzhou"] },
  ambergris:   { ic: "🌫️", zh: "龙涎香", en: "Ambergris", tier: "regional", origin: ["mazu"] },

  /* —— 跨区贵重品 —— */
  ivory:       { ic: "🦷", zh: "象牙", en: "Ivory", tier: "regional", origin: ["india", "mazu"] },
  "gold-dust": { ic: "💰", zh: "金沙", en: "Gold Dust", tier: "regional", origin: ["india", "con"] },
  ruby:        { ic: "💎", zh: "红宝石", en: "Ruby", tier: "regional", origin: ["india", "con"] },
  icons:       { ic: "🛕", zh: "圣像画", en: "Icon Panel", tier: "regional", origin: ["chr", "isl"] }
};

FQ.goodsArtStem = function (id, kind) {
  kind = kind || (FQ.TOOLS && FQ.TOOLS[id] ? "tool" : FQ.TOKENS && FQ.TOKENS[id] ? "token" : "goods");
  if (kind === "tool" && FQ.TOOL_ART[id]) return FQ.TOOL_ART[id];
  if (kind === "token" && FQ.TOKEN_ART[id]) return FQ.TOKEN_ART[id];
  if (FQ.GOODS_ART[id]) return FQ.GOODS_ART[id];
  return "item-" + id;
};

FQ.goodsArt = function (id, emoji, cls, kind) {
  return FQ.art(FQ.goodsArtStem(id, kind), emoji, cls);
};
