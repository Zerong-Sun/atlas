export interface BaziClassicEntry {
  id: string;
  title: string;
  chapter: string;
  fullText: string;
  analysis: string;
  tags: string[];
}

export const BAZI_CLASSICS_LIBRARY: BaziClassicEntry[] = [
  {
    id: "ditiansui-tiangan",
    title: "滴天髓",
    chapter: "通神论",
    fullText: "欲识三元万法宗，先观帝载与神功。",
    analysis:
      "此条强调八字判断要先看天干地支承载的整体气势，再谈具体十神与吉凶。用于本盘时，先列四柱、月令、日主，再看流年是否引动原局。",
    tags: ["总论", "四柱", "格局"],
  },
  {
    id: "ziping-yueling",
    title: "子平真诠",
    chapter: "论用神",
    fullText: "八字用神，专求月令。",
    analysis:
      "月令代表出生时节之气，是判断旺衰与取用的起点。列表中的月柱和五行分布，需优先结合月令，不宜只按五行数量机械判断。",
    tags: ["月令", "用神", "旺衰"],
  },
  {
    id: "sanming-wuxing",
    title: "三命通会",
    chapter: "论五行",
    fullText: "五行者，往来乎天地之间而不穷者也。",
    analysis:
      "五行不是静态数量，而是生克流通。五行列表展示的是显性分布，真正解释还要看生、克、泄、耗、扶是否成势。",
    tags: ["五行", "生克", "流通"],
  },
  {
    id: "yuanhai-riyuan",
    title: "渊海子平",
    chapter: "论日为主",
    fullText: "日为主，专论财官；月为提纲，分辨贵贱。",
    analysis:
      "日柱代表命局中心，日干为日主。当前界面以日主为核心列出四柱和流年关系，流年只是一年外部气候，不能脱离原局独断。",
    tags: ["日主", "财官", "月令"],
  },
];

export function selectBaziClassics(tags: string[], limit = 4): BaziClassicEntry[] {
  const wanted = new Set(tags);
  const scored = BAZI_CLASSICS_LIBRARY.map((entry) => ({
    entry,
    score: entry.tags.reduce((sum, tag) => sum + (wanted.has(tag) ? 1 : 0), 0),
  }));
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry);
}
