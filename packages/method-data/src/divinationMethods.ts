export type MethodStatus = "ready" | "preview" | "planned";

export type DivinationMethod = {
  id: string;
  title: string;
  subtitle: string;
  tradition: string;
  civilization: string;
  culturalNote: string;
  questionStyle: string;
  aliases?: Partial<Record<"zh-CN" | "zh-TW" | "en-US" | "ja-JP" | "ko-KR", string>>;
  route?: string;
  status: MethodStatus;
  tags: string[];
};

export const DIVINATION_METHODS: DivinationMethod[] = [
  {
    id: "bazi",
    title: "八字命盘",
    subtitle: "姓名、出生时间、出生地点生成四柱、十神、流年与古文释义。",
    tradition: "术数",
    civilization: "中国 / 东亚",
    culturalNote: "把出生时刻视作天地气机的截面，重视结构、五行流动与长期周期。",
    questionStyle: "适合问人生结构、阶段节律、关系角色与长期选择。",
    aliases: { "en-US": "Four Pillars / Ba Zi", "ja-JP": "四柱推命 / 八字", "ko-KR": "사주명리 / 팔자" },
    route: "/methods/bazi",
    status: "ready",
    tags: ["四柱", "十神", "流年"],
  },
  {
    id: "bazi-relationship",
    title: "八字缘合",
    subtitle: "两人四柱交叉，看五行互补、日支互动与相处模式。",
    tradition: "术数",
    civilization: "中国 / 东亚",
    culturalNote: "关系不是单点好坏，而是两套气机如何互动、补足或相冲。",
    questionStyle: "适合问亲密关系、合作关系、长期相处与边界。",
    aliases: { "en-US": "Four Pillars Compatibility" },
    route: "/methods/bazi-relationship",
    status: "ready",
    tags: ["合盘", "双人", "互动"],
  },
  {
    id: "tarot",
    title: "塔罗抽卡",
    subtitle: "三张牌阵、大阿卡那/全牌组选择，生成牌面与组合解释。",
    tradition: "卡牌",
    civilization: "欧洲 / 现代西方神秘学",
    culturalNote: "用图像、叙事和牌阵让当下心理与情境显形，偏重短期反思。",
    questionStyle: "适合问选择、关系动态、心理状态与下一步行动。",
    aliases: { "en-US": "Tarot", "ja-JP": "タロット", "ko-KR": "타로" },
    route: "/methods/tarot",
    status: "ready",
    tags: ["三牌阵", "大阿卡那", "组合"],
  },
  {
    id: "dream",
    title: "占梦",
    subtitle: "整合中国梦占、荣格象征、民俗文本与限定提示的 LLM 解梦。",
    tradition: "梦占",
    civilization: "跨文明 / 民俗与心理传统",
    culturalNote: "不同文化有的把梦视为征兆，有的视为潜意识材料；本产品并列呈现。",
    questionStyle: "适合记录梦境、情绪残留、反复意象和人生阶段主题。",
    aliases: { "en-US": "Dream Interpretation" },
    route: "/dream",
    status: "ready",
    tags: ["多流派", "符号", "LLM"],
  },
  { id: "iching", title: "周易六十四卦", subtitle: "铜钱起卦，本卦、变卦与卦辞象辞对照解读。", tradition: "易", civilization: "中国 / 儒道经典传统", culturalNote: "把变化视为阴阳消长与时位关系，重视时机、位置和守正。", questionStyle: "适合问转折、取舍、行动时机与处境结构。", aliases: { "en-US": "I Ching / Book of Changes" }, route: "/methods/iching", status: "ready", tags: ["本卦", "变卦"] },
  { id: "qimen", title: "奇门遁甲", subtitle: "局盘、九宫、八门、九星、神煞与时空取象。", tradition: "术数", civilization: "中国 / 时空术数", culturalNote: "把空间、时间、方位和行动策略合成一张局盘，偏重择时与布局。", questionStyle: "适合问行动路径、竞争、出行、谈判和局势判断。", aliases: { "en-US": "Qi Men Dun Jia" }, route: "/methods/qimen", status: "ready", tags: ["九宫", "八门"] },
  { id: "ziwei", title: "紫微斗数", subtitle: "命盘十二宫、主星辅星与大限流年。", tradition: "术数", civilization: "中国 / 星曜命盘", culturalNote: "以宫位与星曜叙述人生领域，像一张分宫的人生地图。", questionStyle: "适合问人生领域分布、阶段主题、关系与事业结构。", aliases: { "en-US": "Zi Wei Dou Shu" }, route: "/methods/ziwei", status: "ready", tags: ["十二宫", "大限"] },
  { id: "liuyao", title: "纳甲六爻", subtitle: "铜钱起卦、世应六亲、用神旺衰。", tradition: "易", civilization: "中国 / 易占实践", culturalNote: "把具体问题拆成世应、六亲、用神和动变，重视可验证事件。", questionStyle: "适合问具体事件、得失、应期、关系互动与短中期走向。", route: "/methods/liuyao", status: "ready", tags: ["用神", "世应"] },
  { id: "meihua", title: "梅花易数", subtitle: "时空取数、体用生克与外应判断。", tradition: "易", civilization: "中国 / 象数易", culturalNote: "从偶然数字、时间和外应进入卦象，强调灵活取象。", questionStyle: "适合问突然出现的征兆、即时判断和轻量事件。", route: "/methods/meihua", status: "ready", tags: ["体用", "外应"] },
  { id: "western", title: "西洋占星", subtitle: "本命盘、行运、相位与宫位解释。", tradition: "星占", civilization: "希腊化 / 欧洲 / 现代心理占星", culturalNote: "用行星、宫位和相位描述人格动力与周期，现代语境常连接心理语言。", questionStyle: "适合问自我理解、关系模式、职业方向和阶段压力。", aliases: { "en-US": "Western Astrology" }, route: "/methods/western", status: "ready", tags: ["本命盘", "行运"] },
  { id: "vedic", title: "印度占星", subtitle: "吠陀星盘、Dasha、Nakshatra 与转运。", tradition: "星占", civilization: "印度 / Jyotisha", culturalNote: "强调恒星黄道、月宿和 Dasha 周期，时间感比心理描述更强。", questionStyle: "适合问人生阶段、业力主题、婚姻事业时机与长期周期。", aliases: { "en-US": "Vedic Astrology / Jyotisha" }, route: "/methods/vedic", status: "ready", tags: ["Dasha", "月宿"] },
  { id: "numerology", title: "数字命理", subtitle: "姓名数、生命灵数与周期主题。", tradition: "数术", civilization: "希腊-犹太-现代新灵性", culturalNote: "把姓名与生日转成数字节律，适合跨语言入门但需说明拼写口径。", questionStyle: "适合问人格主题、年度主题、名字象征和轻量自我反思。", route: "/methods/numerology", status: "ready", tags: ["姓名数", "周期"] },
  { id: "runes", title: "卢恩符文", subtitle: "单符、三符与九符阵列解释。", tradition: "符文", civilization: "北欧 / 日耳曼符号传统", culturalNote: "以刻符、声音和神话意象进入判断，质感更像铭刻与誓言。", questionStyle: "适合问意志、挑战、保护、行动姿态和内在力量。", aliases: { "en-US": "Elder Futhark Runes" }, route: "/methods/runes", status: "ready", tags: ["符文", "阵列"] },
  { id: "geomancy", title: "土占 Geomancy", subtitle: "十六土占图形、四母四女与法庭图。", tradition: "西方术数", civilization: "阿拉伯-欧洲地占传统", culturalNote: "由随机点画生成十六图形，进入宫位和法庭图判断，像把土地上的痕迹转成秩序。", questionStyle: "适合问具体事件、得失、位置、人与资源的流向。", aliases: { "en-US": "Geomancy" }, route: "/methods/geomancy", status: "ready", tags: ["十六图", "法庭"] },
  { id: "lot", title: "抽签签诗", subtitle: "签文、解曰、典故与事项分类。", tradition: "签占", civilization: "东亚寺庙与民间信仰", culturalNote: "以签诗、典故和劝诫回应问题，常带有礼俗与伦理修辞。", questionStyle: "适合问日常选择、心愿、行止和需要劝诫的情境。", route: "/methods/lot", status: "ready", tags: ["签文", "典故"] },
  { id: "jiaobei", title: "杯筊问事", subtitle: "阴阳圣笑杯结果记录与连续问答约束。", tradition: "民俗", civilization: "闽台与东亚民间信仰", culturalNote: "以请示、确认和礼仪边界为核心，不是无限追问的随机器。", questionStyle: "适合问是/否、是否可行、是否需要等待或改问。", route: "/methods/jiaobei", status: "ready", tags: ["圣杯", "问事"] },
  { id: "xiangmian", title: "面相", subtitle: "三停五官、气色与部位解释。", tradition: "相术", civilization: "东亚观察术", culturalNote: "以身体观察承载文化象征，必须避免外貌歧视和身份判断。", questionStyle: "适合做自我观察、状态记录和文化学习，不用于评价他人价值。", route: "/methods/xiangmian", status: "ready", tags: ["三停", "五官"] },
  { id: "palmistry", title: "手相", subtitle: "掌丘、主线、副线与阶段提示。", tradition: "相术", civilization: "印度-欧洲-现代民俗", culturalNote: "把掌纹和掌丘作为生命经验的象征地图，跨文化版本差异很大。", questionStyle: "适合问行动习惯、表达方式、关系模式和阶段反思。", aliases: { "en-US": "Palmistry / Chiromancy" }, route: "/methods/palmistry", status: "ready", tags: ["掌纹", "掌丘"] },
  { id: "fengshui", title: "风水罗盘", subtitle: "方位、坐向、九宫飞星与空间建议。", tradition: "堪舆", civilization: "中国 / 空间术数", culturalNote: "把空间视为气的流动场，强调方位、居住、身体感和环境秩序。", questionStyle: "适合问空间调整、居住体验、办公布局和方向选择。", route: "/methods/fengshui", status: "ready", tags: ["方位", "飞星"] },
  { id: "astrodice", title: "占星骰子", subtitle: "行星、星座、宫位三骰组合解释。", tradition: "星占", civilization: "现代西方占星工具", culturalNote: "把复杂星盘压缩成行星-星座-宫位三元句，适合快速启发。", questionStyle: "适合问短问题、当下提示和下一步聚焦点。", route: "/methods/astrodice", status: "ready", tags: ["三骰", "组合"] },
  { id: "lenormand", title: "雷诺曼牌", subtitle: "日签、九宫格与牌间语法。", tradition: "卡牌", civilization: "19 世纪欧洲纸牌占卜", culturalNote: "比塔罗更日常、更事件化，像用小图标拼出一句现实句子。", questionStyle: "适合问具体事件、关系动态、消息、时间线和现实细节。", aliases: { "en-US": "Petit Lenormand" }, route: "/methods/lenormand", status: "ready", tags: ["九宫格", "牌语法"] },
  { id: "oracle", title: "神谕卡", subtitle: "自定义牌组、主题抽卡与反思提示。", tradition: "卡牌", civilization: "现代新灵性 / 自助反思", culturalNote: "更开放、更温和，重点不是预言，而是给情绪和行动一个入口。", questionStyle: "适合问自我照护、内在状态、提醒语和每日练习。", route: "/methods/oracle", status: "ready", tags: ["主题", "反思"] },
  { id: "coffee", title: "咖啡渣占卜", subtitle: "杯底图形、位置区间与象征联想。", tradition: "民俗", civilization: "土耳其 / 地中海 / 中东民俗", culturalNote: "从日常饮食和社交场景进入象征阅读，带有闲谈、祝福和民间叙事感。", questionStyle: "适合问近期氛围、消息、关系和生活小转折。", aliases: { "en-US": "Coffee Ground Reading / Tasseography" }, route: "/methods/coffee", status: "ready", tags: ["图形", "位置"] },
  { id: "scrying", title: "水晶凝视", subtitle: "图像记录、象征归类与冥想式解释。", tradition: "凝视", civilization: "跨文明凝视传统", culturalNote: "通过水、镜、晶体或暗面凝视，让内在图像浮现，偏冥想与投射。", questionStyle: "适合问潜意识意象、冥想主题、情绪形状和创作灵感。", aliases: { "en-US": "Scrying / Crystal Gazing" }, route: "/methods/scrying", status: "ready", tags: ["图像", "冥想"] },
];

/** Legacy preview workbench ids (iching workbench only). */
export const PREVIEW_WORKBENCH_IDS = [] as const;

export type PreviewWorkbenchId = (typeof PREVIEW_WORKBENCH_IDS)[number];

export function isPreviewWorkbench(id: string): id is PreviewWorkbenchId {
  return (PREVIEW_WORKBENCH_IDS as readonly string[]).includes(id);
}

export function getMethod(id: string) {
  return DIVINATION_METHODS.find((method) => method.id === id);
}
