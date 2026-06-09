import type { LotSign } from "@atlas/engines/lot";

export type { LotSign };

const GRADES: LotSign["grade"][] = ["上签", "中签", "下签"];
const CATEGORIES: LotSign["categories"][] = [
  ["career"], ["love"], ["health"], ["general"], ["career", "general"], ["love", "general"],
];

const GUANYIN_THEMES = [
  "慈悲化解", "静守待时", "心诚则灵", "云开见月", "行稳致远", "随缘自在",
  "勤修福田", "宽以待人", "守正不移", "柳暗花明", "退一步安", "积善成德",
  "戒急用忍", "内外清明", "信愿行足", "转危为安", "守拙保身", "春风化雨",
  "一念向善", "照见本心", "忍辱波罗蜜", "诸恶莫作", "众善奉行", "因果不虚",
  "放下执著", "返观自省", "和气致祥", "静水深流", "光明在望", "福慧双修",
];

const GUANDI_THEMES = [
  "忠义为本", "果断前行", "守信立世", "威武不屈", "义字当头", "单刀赴会",
  "过五关斩六将", "千里寻兄", "秉烛达旦", "威震华夏", "刚正不阿", "义释曹操",
  "守诺如金", "勇者不惧", "智勇双全", "兄弟同心", "正气凛然", "斩奸除恶",
  "赤心报国", "不骄不躁", "势如破竹", "稳操胜券", "先难后易", "守城待援",
  "以义制利", "慎战而胜", "厚积薄发", "旗开得胜", "化敌为友", "功成不居",
];

const MAZU_THEMES = [
  "护佑航行", "风平浪静", "转舵避凶", "海天同庆", "慈航普渡", "遇难呈祥",
  "顺风得利", "潮信有时", "渔盐得利", "阖家平安", "归航有望", "暗礁已除",
  "妈祖庇佑", "舟行万里", "化险为夷", "潮起潮落", "心向光明", "守望相助",
  "海不扬波", "利涉大川", "渔火平安", "港湾可归", "顺风张帆", "避浪而行",
  "天后恩泽", "行船有信", "潮平岸阔", "护佑商旅", "遇难成祥", "福泽绵长",
];

function buildTempleSigns(
  temple: LotSign["temple"],
  themes: string[],
  prefix: string
): LotSign[] {
  return themes.map((theme, i) => {
    const num = i + 1;
    const grade = GRADES[i % 3]!;
    const categories = CATEGORIES[i % CATEGORIES.length]!;
    return {
      id: `${prefix}-${num}`,
      temple,
      number: num,
      grade,
      title: `${theme}`,
      poem: [
        `${theme}意自长，`,
        `第${num}签问行藏。`,
        grade === "上签" ? "云开星斗现，" : grade === "中签" ? "守己待时昌，" : "且把步量详，",
        "心正路自广。",
      ],
      story: `此签取${temple === "guanyin" ? "观音" : temple === "guandi" ? "关帝" : "妈祖"}信仰中「${theme}」的象征意，供反思参考。`,
      categories,
      plainReading: `签意侧重「${theme}」。当前宜先厘清自身能控与不可控之界，再定进退。`,
      advice: [
        "把签文当作反思提示，而非必然预言。",
        grade === "下签" ? "宜保守观察，避免重大冲动决策。" : "可小步试探，保留调整空间。",
        "结合现实信息与专业意见再做判断。",
      ],
      safetyNotes: ["不涉及医疗、法律、投资之确定性结论。"],
      sourceReference: `自研${temple}签诗风格条目 #${num}`,
    };
  });
}

export const LOT_SIGNS: LotSign[] = [
  ...buildTempleSigns("guanyin", GUANYIN_THEMES, "gy"),
  ...buildTempleSigns("guandi", GUANDI_THEMES, "gd"),
  ...buildTempleSigns("mazu", MAZU_THEMES, "mz"),
];

export const LOT_TEMPLE_LABELS: Record<LotSign["temple"] | "mixed", string> = {
  guanyin: "观音签",
  guandi: "关帝签",
  mazu: "妈祖签",
  mixed: "混合摇签",
};

export function getLotSignById(id: string): LotSign | undefined {
  return LOT_SIGNS.find((s) => s.id === id);
}

export function filterLotSigns(temple?: LotSign["temple"] | "mixed"): LotSign[] {
  if (!temple || temple === "mixed") return LOT_SIGNS;
  return LOT_SIGNS.filter((s) => s.temple === temple);
}
