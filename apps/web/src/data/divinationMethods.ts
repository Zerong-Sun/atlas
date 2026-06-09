export type MethodStatus = "ready" | "preview" | "planned";

export type DivinationMethod = {
  id: string;
  title: string;
  subtitle: string;
  tradition: string;
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
    route: "/methods/bazi",
    status: "ready",
    tags: ["四柱", "十神", "流年"],
  },
  {
    id: "bazi-relationship",
    title: "八字缘合",
    subtitle: "两人四柱交叉，看五行互补、日支互动与相处模式。",
    tradition: "术数",
    route: "/methods/bazi-relationship",
    status: "ready",
    tags: ["合盘", "双人", "互动"],
  },
  {
    id: "tarot",
    title: "塔罗抽卡",
    subtitle: "三张牌阵、大阿卡那/全牌组选择，生成牌面与组合解释。",
    tradition: "卡牌",
    route: "/methods/tarot",
    status: "ready",
    tags: ["三牌阵", "大阿卡那", "组合"],
  },
  {
    id: "dream",
    title: "占梦",
    subtitle: "整合中国梦占、荣格象征、民俗文本与限定提示的 LLM 解梦。",
    tradition: "梦占",
    route: "/dream",
    status: "ready",
    tags: ["多流派", "符号", "LLM"],
  },
  { id: "iching", title: "周易六十四卦", subtitle: "铜钱起卦，本卦、变卦与卦辞象辞对照解读。", tradition: "易", route: "/methods/iching", status: "ready", tags: ["本卦", "变卦"] },
  { id: "qimen", title: "奇门遁甲", subtitle: "局盘、九宫、八门、九星、神煞与时空取象。", tradition: "术数", route: "/methods/qimen", status: "ready", tags: ["九宫", "八门"] },
  { id: "ziwei", title: "紫微斗数", subtitle: "命盘十二宫、主星辅星与大限流年。", tradition: "术数", route: "/methods/ziwei", status: "ready", tags: ["十二宫", "大限"] },
  { id: "liuyao", title: "纳甲六爻", subtitle: "铜钱起卦、世应六亲、用神旺衰。", tradition: "易", route: "/methods/liuyao", status: "ready", tags: ["用神", "世应"] },
  { id: "meihua", title: "梅花易数", subtitle: "时空取数、体用生克与外应判断。", tradition: "易", route: "/methods/meihua", status: "preview", tags: ["体用", "外应"] },
  { id: "western", title: "西洋占星", subtitle: "本命盘、行运、相位与宫位解释。", tradition: "星占", route: "/methods/western", status: "ready", tags: ["本命盘", "行运"] },
  { id: "vedic", title: "印度占星", subtitle: "吠陀星盘、Dasha、Nakshatra 与转运。", tradition: "星占", route: "/methods/vedic", status: "preview", tags: ["Dasha", "月宿"] },
  { id: "numerology", title: "数字命理", subtitle: "姓名数、生命灵数与周期主题。", tradition: "数术", route: "/methods/numerology", status: "preview", tags: ["姓名数", "周期"] },
  { id: "runes", title: "卢恩符文", subtitle: "单符、三符与九符阵列解释。", tradition: "符文", route: "/methods/runes", status: "preview", tags: ["符文", "阵列"] },
  { id: "geomancy", title: "土占 Geomancy", subtitle: "十六土占图形、四母四女与法庭图。", tradition: "西方术数", route: "/methods/geomancy", status: "preview", tags: ["十六图", "法庭"] },
  { id: "lot", title: "抽签签诗", subtitle: "签文、解曰、典故与事项分类。", tradition: "签占", route: "/methods/lot", status: "ready", tags: ["签文", "典故"] },
  { id: "jiaobei", title: "杯筊问事", subtitle: "阴阳圣笑杯结果记录与连续问答约束。", tradition: "民俗", route: "/methods/jiaobei", status: "preview", tags: ["圣杯", "问事"] },
  { id: "xiangmian", title: "面相", subtitle: "三停五官、气色与部位解释。", tradition: "相术", route: "/methods/xiangmian", status: "preview", tags: ["三停", "五官"] },
  { id: "palmistry", title: "手相", subtitle: "掌丘、主线、副线与阶段提示。", tradition: "相术", route: "/methods/palmistry", status: "preview", tags: ["掌纹", "掌丘"] },
  { id: "fengshui", title: "风水罗盘", subtitle: "方位、坐向、九宫飞星与空间建议。", tradition: "堪舆", route: "/methods/fengshui", status: "ready", tags: ["方位", "飞星"] },
  { id: "astrodice", title: "占星骰子", subtitle: "行星、星座、宫位三骰组合解释。", tradition: "星占", route: "/methods/astrodice", status: "preview", tags: ["三骰", "组合"] },
  { id: "lenormand", title: "雷诺曼牌", subtitle: "日签、九宫格与牌间语法。", tradition: "卡牌", route: "/methods/lenormand", status: "ready", tags: ["九宫格", "牌语法"] },
  { id: "oracle", title: "神谕卡", subtitle: "自定义牌组、主题抽卡与反思提示。", tradition: "卡牌", route: "/methods/oracle", status: "preview", tags: ["主题", "反思"] },
  { id: "coffee", title: "咖啡渣占卜", subtitle: "杯底图形、位置区间与象征联想。", tradition: "民俗", route: "/methods/coffee", status: "preview", tags: ["图形", "位置"] },
  { id: "scrying", title: "水晶凝视", subtitle: "图像记录、象征归类与冥想式解释。", tradition: "凝视", route: "/methods/scrying", status: "preview", tags: ["图像", "冥想"] },
];

export function getMethod(id: string) {
  return DIVINATION_METHODS.find((method) => method.id === id);
}
