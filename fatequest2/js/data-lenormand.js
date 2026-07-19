/* Petit Lenormand — 36 cards, real 19th-century Dondorf scans in
   assets/decks/lenormand/ (public domain; see assets/decks/LENORMAND_ATTRIBUTION.md).
   Bilingual one-line meanings in the plain-spoken Lenormand voice:
   small cards for near things — errands, letters, roads, neighbors. */
window.FQ = window.FQ || {};

FQ.LENORMAND = [
  { n: 1,  f: "01-rider",      zh: "骑士",   en: "The Rider",    mZh: "消息在路上，很快就到。",             mEn: "News is on its way — and it rides fast." },
  { n: 2,  f: "02-clover",     zh: "三叶草", en: "The Clover",   mZh: "小小的好运，抓住要趁早。",           mEn: "A small luck; take it while it's green." },
  { n: 3,  f: "03-ship",       zh: "帆船",   en: "The Ship",     mZh: "远行与生意，财富自远方来。",         mEn: "Voyages and trade; fortune from afar." },
  { n: 4,  f: "04-house",      zh: "房屋",   en: "The House",    mZh: "家宅安稳，事情落回自家门内。",       mEn: "The house holds; matters come home to rest." },
  { n: 5,  f: "05-tree",       zh: "大树",   en: "The Tree",     mZh: "缓慢生长的事，关乎根基与健康。",     mEn: "Slow growth — roots, health, the long game." },
  { n: 6,  f: "06-cloud",      zh: "乌云",   en: "The Clouds",   mZh: "一时迷雾，别在阴天下定论。",         mEn: "Passing confusion; decide nothing under this sky." },
  { n: 7,  f: "07-snake",      zh: "蛇",     en: "The Snake",    mZh: "绕行的路与暗处的心思，须得留神。",   mEn: "A winding path, a hidden motive — step carefully." },
  { n: 8,  f: "08-coffin",     zh: "棺椁",   en: "The Coffin",   mZh: "一件事到头了，收拾好再出发。",       mEn: "Something ends; box it up before you go on." },
  { n: 9,  f: "09-bouquet",    zh: "花束",   en: "The Bouquet",  mZh: "礼物与善意，值得体面地收下。",       mEn: "A gift, an invitation — accept it graciously." },
  { n: 10, f: "10-scythe",     zh: "镰刀",   en: "The Scythe",   mZh: "快而突然的一刀，收割或了断。",       mEn: "Swift and sudden — a harvest or a cut." },
  { n: 11, f: "11-whip",       zh: "鞭子",   en: "The Whip",     mZh: "反复的争执与磨损，别恋战。",         mEn: "Repeated strife wears the rope; don't linger in it." },
  { n: 12, f: "12-birds",      zh: "飞鸟",   en: "The Birds",    mZh: "闲话与小忙乱，两三日即散。",         mEn: "Chatter and small flutters; gone in a day or two." },
  { n: 13, f: "13-child",      zh: "孩童",   en: "The Child",    mZh: "新的开始，还小，先别催它长大。",     mEn: "A new small start — don't rush it to grow." },
  { n: 14, f: "14-fox",        zh: "狐狸",   en: "The Fox",      mZh: "机巧的活计，也可能是机巧的人。",     mEn: "Clever work — or a clever someone. Verify." },
  { n: 15, f: "15-bear",       zh: "巨熊",   en: "The Bear",     mZh: "力量与胃口，掌事者出现了。",         mEn: "Strength and appetite; a person of weight steps in." },
  { n: 16, f: "16-stars",      zh: "星辰",   en: "The Stars",    mZh: "夜路有方向，愿望有回音。",           mEn: "The night road has bearings; wishes echo back." },
  { n: 17, f: "17-stork",      zh: "鹳鸟",   en: "The Stork",    mZh: "迁徙与改换，屋檐要换一处了。",       mEn: "Migration and change; the nest moves eaves." },
  { n: 18, f: "18-dog",        zh: "忠犬",   en: "The Dog",      mZh: "可靠的朋友就在近旁。",               mEn: "A loyal friend stands near." },
  { n: 19, f: "19-tower",      zh: "高塔",   en: "The Tower",    mZh: "官府、规程与孤高，按章程走。",       mEn: "Institutions and lone heights; go by the book." },
  { n: 20, f: "20-garden",     zh: "花园",   en: "The Garden",   mZh: "公众场合与社交，去人群里走走。",     mEn: "The public garden — go where the people are." },
  { n: 21, f: "21-mountain",   zh: "高山",   en: "The Mountain", mZh: "一时受阻，绕行或等雪化。",           mEn: "A block for now; go around, or wait for thaw." },
  { n: 22, f: "22-crossroads", zh: "岔路",   en: "The Crossroads", mZh: "两条以上的路，必须自己选。",       mEn: "More roads than one — the choosing is yours." },
  { n: 23, f: "23-mice",       zh: "群鼠",   en: "The Mice",     mZh: "小处的损耗在啃东西，早点补漏。",     mEn: "Small losses gnaw; mend the leak early." },
  { n: 24, f: "24-heart",      zh: "红心",   en: "The Heart",    mZh: "心意是真的，值得温柔以待。",         mEn: "The feeling is real; handle it gently." },
  { n: 25, f: "25-ring",       zh: "指环",   en: "The Ring",     mZh: "约定与契合，环环相扣。",             mEn: "A bond, a contract — link joins link." },
  { n: 26, f: "26-book",       zh: "书卷",   en: "The Book",     mZh: "还有未揭开的一页，先去求知。",       mEn: "A page not yet turned; seek the knowledge first." },
  { n: 27, f: "27-letter",     zh: "信笺",   en: "The Letter",   mZh: "白纸黑字的消息，落笔为凭。",         mEn: "Word in writing; ink is the witness." },
  { n: 28, f: "28-man",        zh: "旅人",   en: "The Man",      mZh: "一位与此事相关的男子。",             mEn: "A man who figures in the matter." },
  { n: 29, f: "29-woman",      zh: "仕女",   en: "The Woman",    mZh: "一位与此事相关的女子。",             mEn: "A woman who figures in the matter." },
  { n: 30, f: "30-lily",       zh: "百合",   en: "The Lily",     mZh: "清净与长者之智，宜从容。",           mEn: "Peace, age, and wisdom; keep your calm." },
  { n: 31, f: "31-sun",        zh: "太阳",   en: "The Sun",      mZh: "大晴天，放手去做正当的事。",         mEn: "Full daylight — do the right thing boldly." },
  { n: 32, f: "32-moon",       zh: "月亮",   en: "The Moon",     mZh: "声名与心绪随月盈亏，顺其起落。",     mEn: "Repute and mood wax and wane; ride the phases." },
  { n: 33, f: "33-key",        zh: "钥匙",   en: "The Key",      mZh: "门开得了，答案是「可以」。",         mEn: "The door will open; the answer is yes." },
  { n: 34, f: "34-fish",       zh: "游鱼",   en: "The Fish",     mZh: "流动的财源，钱要活水养。",           mEn: "Flowing means; money likes moving water." },
  { n: 35, f: "35-anchor",     zh: "船锚",   en: "The Anchor",   mZh: "停泊之处已到，可以安心扎根。",       mEn: "Safe harbor reached; you may set anchor." },
  { n: 36, f: "36-cross",      zh: "十字",   en: "The Cross",    mZh: "一副要背一阵子的担子，背得动。",     mEn: "A burden to carry a while — and you can." }
];

FQ.lenCard = n => FQ.LENORMAND[n - 1];
FQ.drawLenormand = function (count) {
  const idx = FQ.LENORMAND.map((_, i) => i);
  const out = [];
  for (let i = 0; i < count; i++) out.push(FQ.LENORMAND[idx.splice(FQ.rand(idx.length), 1)[0]]);
  return out;
};
