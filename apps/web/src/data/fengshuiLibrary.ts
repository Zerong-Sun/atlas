export const FENGSHUI_STARS: Record<string, { element: string; nature: string; reading: string }> = {
  一白: { element: "水", nature: "桃花/文昌", reading: "宜学习沟通，忌水患过盛。" },
  二黑: { element: "土", nature: "病符", reading: "宜静不宜动，注意健康与土气。" },
  三碧: { element: "木", nature: "是非", reading: "注意口舌争执，宜以和为贵。" },
  四绿: { element: "木", nature: "文昌", reading: "利学习创作，宜明亮通风。" },
  五黄: { element: "土", nature: "廉贞/凶", reading: "大凶位，忌动土噪音，宜化泄。" },
  六白: { element: "金", nature: "偏财", reading: "利权威事业，宜整洁金属。" },
  七赤: { element: "金", nature: "破军", reading: "注意口舌刀光，宜化解金气。" },
  八白: { element: "土", nature: "正财", reading: "当运财星，宜活跃但不过满。" },
  九紫: { element: "火", nature: "喜庆", reading: "利婚嫁名誉，宜暖色灯光。" },
};

export const FENGSHUI_MOUNTAINS: Record<string, { element: string; note: string }> = {
  子: { element: "水", note: "正北" }, 癸: { element: "水", note: "北偏" },
  丑: { element: "土", note: "东北" }, 艮: { element: "土", note: "东北" },
  寅: { element: "木", note: "东北" }, 甲: { element: "木", note: "东偏" },
  卯: { element: "木", note: "正东" }, 乙: { element: "木", note: "东偏" },
  辰: { element: "土", note: "东南" }, 巽: { element: "木", note: "东南" },
  巳: { element: "火", note: "东南" }, 丙: { element: "火", note: "南偏" },
  午: { element: "火", note: "正南" }, 丁: { element: "火", note: "南偏" },
  未: { element: "土", note: "西南" }, 坤: { element: "土", note: "西南" },
  申: { element: "金", note: "西南" }, 庚: { element: "金", note: "西偏" },
  酉: { element: "金", note: "正西" }, 辛: { element: "金", note: "西偏" },
  戌: { element: "土", note: "西北" }, 乾: { element: "金", note: "西北" },
  亥: { element: "水", note: "西北" }, 壬: { element: "水", note: "北偏" },
};

export const FENGSHUI_MING_GUA: Record<number, { direction: string; group: string }> = {
  1: { direction: "北", group: "东四命" },
  3: { direction: "东", group: "东四命" },
  4: { direction: "东南", group: "东四命" },
  9: { direction: "南", group: "东四命" },
  2: { direction: "西南", group: "西四命" },
  6: { direction: "西北", group: "西四命" },
  7: { direction: "西", group: "西四命" },
  8: { direction: "东北", group: "西四命" },
};

export function getStarReading(star: string): string {
  return FENGSHUI_STARS[star]?.reading ?? "结合山向与流年综合判断。";
}
