import type {
  CitationSnapshot,
  DailyBrief,
  ReadingReport,
  StructuredFacts,
  Tradition,
  UserProfile,
} from "@atlas/shared-types";
import { buildEntryId, resolveDayColor } from "@/theme/tokens";

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
  const readingTraditions = traditions.filter((t) => t !== "dream");
  return {
    readingId,
    questionId: `q-${readingId}`,
    traditions: readingTraditions,
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
      ...readingTraditions.map((tradition) => ({
          type: "tradition_analysis" as const,
          title: tradition,
          tradition,
          content: `【${tradition}】针对「${questionText.slice(0, 20)}…」：结构显示内外节奏不一，宜先理顺优先级再行动。`,
        })),
    ],
    citations: MOCK_CITATIONS,
    structuredFacts: buildMockStructuredFacts(readingTraditions),
    consensus:
      "八字与周易均强调「守正待时」；西洋占星与塔罗则提示「信息仍在汇聚」，不宜仓促定论。",
    divergence:
      "塔罗倾向即刻行动，而八字建议静观一季——差异在于对「时机成熟度」的判断不同。",
    degraded: false,
    traceId: `trace-${readingId}`,
    createdAt: new Date().toISOString(),
  };
}

function buildMockStructuredFacts(traditions: Tradition[]): StructuredFacts[] {
  const year = new Date().getFullYear();
  const catalog: Partial<Record<Tradition, Record<string, unknown>>> = {
    bazi: {
      dayMaster: "庚金",
      summary: "日主庚金，格局偏重金水，宜以秩序、表达与复盘作为近期抓手。",
      pillarList: [
        { key: "year", label: "年柱", value: "庚午", stem: "庚", stemElement: "金", branch: "午", branchElement: "火" },
        { key: "month", label: "月柱", value: "壬午", stem: "壬", stemElement: "水", branch: "午", branchElement: "火" },
        { key: "day", label: "日柱", value: "庚申", stem: "庚", stemElement: "金", branch: "申", branchElement: "金" },
        { key: "hour", label: "时柱", value: "癸未", stem: "癸", stemElement: "水", branch: "未", branchElement: "土" },
      ],
      elementList: [
        { element: "木", count: 0, role: "待补" },
        { element: "火", count: 2, role: "压力" },
        { element: "土", count: 1, role: "承载" },
        { element: "金", count: 3, role: "本气" },
        { element: "水", count: 2, role: "输出" },
      ],
      annualFortunes: Array.from({ length: 5 }, (_, index) => {
        const itemYear = year - 2 + index;
        return {
          year: itemYear,
          pillar: ["甲辰", "乙巳", "丙午", "丁未", "戊申"][index],
          tenGod: ["偏财", "正财", "七杀", "正官", "偏印"][index],
          isCurrent: itemYear === year,
          note: itemYear === year ? "今年宜稳住主线，先清理资源与承诺。" : "阶段节奏以观察和调整为主。",
        };
      }),
      classics: [
        {
          id: "sanming-1",
          title: "三命通会",
          chapter: "论日主",
          fullText: "庚金带煞，刚健为体，得火炼而成器，得水润而有声。",
          analysis: "综合解析：金重时不宜硬冲，需借火炼其形、借水开其用。",
        },
      ],
    },
    western: {
      summary: "太阳双子、月亮天蝎，上升天秤；思考敏捷，情绪深层，表达需要更清晰的边界。",
      ascendant: { sign: "天秤", degree: 12 },
      planetList: [
        { key: "sun", label: "太阳", sign: "双子", degree: 24, house: 9, longitude: 84, element: "风", modality: "变动" },
        { key: "moon", label: "月亮", sign: "天蝎", degree: 8, house: 2, longitude: 218, element: "水", modality: "固定" },
        { key: "mercury", label: "水星", sign: "巨蟹", degree: 2, house: 10, longitude: 92, element: "水", modality: "基本" },
        { key: "venus", label: "金星", sign: "金牛", degree: 18, house: 8, longitude: 48, element: "土", modality: "固定" },
        { key: "mars", label: "火星", sign: "狮子", degree: 11, house: 11, longitude: 131, element: "火", modality: "固定" },
      ],
      elementBalance: { 火: 1, 土: 1, 风: 1, 水: 2 },
      modalityBalance: { 基本: 1, 固定: 3, 变动: 1 },
      aspects: [
        { planetA: "太阳", planetB: "月亮", aspect: "梅花", orb: 2.1 },
        { planetA: "水星", planetB: "火星", aspect: "六合", orb: 3.4 },
      ],
    },
    tarot: {
      spread: "three_card",
      cards: [
        { position: "过去/成因", name: "隐士", reversed: false, keywords: ["内省", "沉淀", "寻找方向"] },
        { position: "现在/核心", name: "正义", reversed: false, keywords: ["权衡", "规则", "边界"] },
        { position: "趋势/建议", name: "星币八", reversed: true, keywords: ["练习", "修正", "避免机械重复"] },
      ],
      summary: "隐士、正义与逆位星币八提示：先校准判断，再改善执行方式。",
    },
    iching: {
      primary: { number: 15, name: "谦", lines: ["yin", "yin", "yang", "yin", "yin", "yin"], judgment: "亨，君子有终。", image: "地中有山，谦；君子以裒多益寡。" },
      changing: { number: 46, name: "升", lines: ["yin", "yang", "yin", "yin", "yin", "yin"], judgment: "元亨，用见大人，勿恤，南征吉。", image: "地中生木，升；君子以顺德，积小以高大。" },
      method: "mock_demo",
      summary: "本卦谦，变卦升：以低位蓄力，循序上升。",
    },
  };

  return traditions
    .map((tradition) => ({ tradition, facts: catalog[tradition] }))
    .filter((item): item is StructuredFacts => Boolean(item.facts));
}

const _mockDate = new Date().toISOString().slice(0, 10);
const _mockDayColor = resolveDayColor(_mockDate);
const _mockEntryId = buildEntryId(_mockDate);

export const MOCK_DAILY_BRIEF: DailyBrief = {
  date: _mockDate,
  theme: "静观蓄势，待机而动",
  traditionSummaries: {
    bazi: "流日庚金得令，金水相生旺势渐显。宜文书、策划、整理档案类事务；午时后行动效率更佳，避免辰时冲动决策。",
    western: "月亮入天蝎，情感深潜期——表层平静之下暗流涌动。适合独自梳理长期目标，与亲近之人深谈胜过泛泛社交。",
    tarot: "今日抽得「隐士」正位：向内探寻，积累洞见，暂缓向外输出。独处时间是能量，非消耗。",
    iching: "日卦呈「渐」（风山渐）：鸿渐于陆，征吉。循序渐进，不可急功，步步为营即是胜道。",
  },
  classicQuote: MOCK_CITATIONS[0]!,
  suitable: ["阅读与复盘", "整理计划文档", "与信任之人深谈", "学习新技能"],
  avoid: ["冲动签约或承诺", "情绪化决断", "多线程同步启动"],
  dayColor: { id: _mockDayColor.id, nameEn: _mockDayColor.nameEn, a: _mockDayColor.a, b: _mockDayColor.b },
  slip: { entryId: _mockEntryId },
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
