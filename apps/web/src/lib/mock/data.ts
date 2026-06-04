import type {
  CitationSnapshot,
  DailyBrief,
  ReadingReport,
  Tradition,
  UserProfile,
} from "@atlas/shared-types";

export const MOCK_PROFILE: UserProfile = {
  userId: "local-mock-user",
  displayName: "示例用户",
  birthDate: "1990-06-15",
  birthTime: "14:30",
  birthPlace: "北京",
  birthLat: 39.9,
  birthLng: 116.4,
  timezone: "Asia/Shanghai",
  disabledTraditions: [],
  onboardingCompleted: true,
  corpusVersionPin: "corpus_v0_1",
};

export const MOCK_PORTRAIT = {
  bazi: "日主庚金，金水相生，宜静思后动。",
  western: "太阳双子、月亮天蝎，思维敏锐、情感深沉。",
  tarot: "愚者能量活跃，适合开启新议题。",
  iching: "本命卦象偏谦，宜守正待时。",
};

const MOCK_CITATIONS: CitationSnapshot[] = [
  {
    chunkId: "mock-chunk-1",
    original: "君子以厚德载物。",
    translationZh: "君子以深厚的德行承载万物。",
    annotationZh: "《周易》坤卦象辞",
    application: "当前议题宜稳扎稳打，以包容心态面对变动。",
    traceId: "mock-trace-1",
  },
  {
    chunkId: "mock-chunk-2",
    original: "知止而后有定。",
    translationZh: "知道适可而止，才能心神安定。",
    application: "各体系均提示：先明确边界，再作决断。",
    traceId: "mock-trace-2",
  },
];

export function buildMockReading(questionText: string, traditions: Tradition[]): ReadingReport {
  const readingId = `mock-${Date.now()}`;
  return {
    readingId,
    questionId: `q-${readingId}`,
    traditions: traditions.filter((t) => t !== "dream"),
    sections: [
      {
        type: "summary",
        title: "结论摘要",
        content:
          "多体系对照显示：短期宜观察、中期可布局。核心张力在于「进取」与「守成」的平衡。",
      },
      {
        type: "advice",
        title: "行动建议",
        content: "本周可做一次书面复盘；重大决定建议延后至信息更完整时。",
      },
      {
        type: "cautions",
        title: "风险提醒",
        content:
          "本解读仅供文化探索与自我反思，不构成医疗、法律或投资建议。涉及健康与财务请咨询专业人士。",
      },
      ...traditions
        .filter((t) => t !== "dream")
        .map((tradition) => ({
          type: "tradition_analysis" as const,
          title: tradition,
          tradition,
          content: `【${tradition}】针对「${questionText.slice(0, 20)}…」：结构显示内外节奏不一，宜先理顺优先级再行动。`,
        })),
    ],
    citations: MOCK_CITATIONS,
    consensus:
      "八字与周易均强调「守正待时」；西洋占星与塔罗则提示「信息仍在汇聚」，不宜仓促定论。",
    divergence:
      "塔罗倾向即刻行动，而八字建议静观一季——差异在于对「时机成熟度」的判断不同。",
    degraded: false,
    traceId: `trace-${readingId}`,
    createdAt: new Date().toISOString(),
  };
}

export const MOCK_DAILY_BRIEF: DailyBrief = {
  date: new Date().toISOString().slice(0, 10),
  theme: "静观蓄势",
  traditionSummaries: {
    bazi: "流日金水相生，宜文书、策划类事务。",
    western: "月亮进入天蝎，情绪深度增加，适合内省。",
    tarot: "今日牌意偏「隐士」——独处可得洞见。",
    iching: "日卦示「渐」，循序渐进为佳。",
  },
  classicQuote: MOCK_CITATIONS[0],
  suitable: ["阅读", "复盘", "整理档案"],
  avoid: ["冲动签约", "情绪化决断"],
};

export const MOCK_LIBRARY_ENTRIES = [
  {
    id: "1",
    slug: "qian",
    labelZh: "乾卦",
    tradition: "iching" as Tradition,
    definitionZh: "元亨利贞。象征创始、刚健与进取之气。",
  },
  {
    id: "2",
    slug: "ten-gods",
    labelZh: "十神",
    tradition: "bazi" as Tradition,
    definitionZh: "比肩、劫财、食神等十种关系符号，用于描述日主与他柱的生克。",
  },
  {
    id: "3",
    slug: "sun-1h",
    labelZh: "太阳在第一宫",
    tradition: "western" as Tradition,
    definitionZh: "自我表达强烈，重视个人意志与外在形象。",
  },
  {
    id: "4",
    slug: "fool",
    labelZh: "愚者",
    tradition: "tarot" as Tradition,
    definitionZh: "新旅程的开端，保持开放与信任，亦需留意脚下。",
  },
];

export const MOCK_READING_HISTORY: ReadingReport[] = [
  buildMockReading("近期职业方向如何抉择？", ["bazi", "western", "iching"]),
];

export const MOCK_DREAM_TREND = {
  periodDays: 7,
  topSymbols: [
    { symbol: "水", count: 3 },
    { symbol: "门", count: 2 },
    { symbol: "路", count: 2 },
  ],
  summary: "近七日梦境重复「水」「门」意象，或指向情绪流动与抉择关口。",
};
