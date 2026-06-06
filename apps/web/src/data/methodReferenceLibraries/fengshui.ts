import { getMethodDeepLibrary } from "../methodDeepLibraries";
import { groupDeepSymbols, pattern, toEntry } from "./builders";
import type { MethodReferenceLibrary } from "./types";

const deep = getMethodDeepLibrary("fengshui")!;

export const FENGSHUI_REFERENCE: MethodReferenceLibrary = {
  id: "fengshui",
  title: "风水布局分析库",
  symbolGroups: groupDeepSymbols(deep.symbols, [
    { id: "xing", label: "形峦四象", groups: ["形峦"] },
    { id: "liqi", label: "理气方位", groups: ["理气"] },
    { id: "space", label: "空间功能", groups: ["空间"] },
    { id: "wuxing", label: "五行环境", groups: ["五行", "环境"] },
    { id: "system", label: "体系技法", groups: ["九宫", "系统", "化解"] },
  ]),
  questionTypes: [
    { type: "住宅布局", focus: "卧室、厨房、大门、动线", usefulGod: "门主、明堂、青龙白虎、八宅", readingKey: "先形峦后理气，门主纳气，动线顺则气顺。" },
    { type: "工作区专注", focus: "书桌、文昌、背靠采光", usefulGod: "文昌位、书桌、靠山", readingKey: "文昌宜静，背靠实墙，避免背门。" },
    { type: "商铺动线", focus: "纳气、财位、客流", usefulGod: "明堂、财位、气口", readingKey: "明堂开阔纳客，财位不压、不污。" },
    { type: "流年调整", focus: "当年飞星、五黄太岁", usefulGod: "飞星、五黄、太岁方", readingKey: "逐年调整，五黄宜化不宜动土。" },
    { type: "化煞化解", focus: "路冲、尖角、反弓", usefulGod: "形煞、化煞、屏风植物", readingKey: "形煞先认，再选可行化解，非恐吓。" },
    { type: "五行平衡", focus: "材质色彩补泄", usefulGod: "五行木火土金水", readingKey: "缺则补、过则泄，平衡优于单催。" },
    { type: "卧室休息", focus: "主卧、床向、卫生间", usefulGod: "主卧、水火、玄武", readingKey: "床宜稳靠，厕不宜中宫压床。" },
    { type: "家宅整体", focus: "坐向、外局、内局", usefulGod: "形势、理气、八宅", readingKey: "外局大于内局，坐向定基调。" },
  ],
  analysisSteps: [
    "定目标：明确改善目的（财、学、健康、关系）。",
    "观外局：形峦、路水、尖角、明堂、靠山。",
    "定坐向：罗盘或大致方位，定宅命匹配。",
    "看内局：大门、动线、厨房厕卧、关键房间。",
    "理气层：财位文昌桃花、飞星流年、五黄太岁。",
    "五行调：材质色彩补泄，水火既济。",
    "化煞：形煞识别与可行化解方案。",
    "方案：可执行调整 + 观察周期 + 复盘。",
  ],
  relations: [
    toEntry("青龙高", "形峦", "左侧略高或饱满，主贵人护佑。", "住宅左侧宜有建筑或树，不宜陷。"),
    toEntry("白虎驯", "形峦", "右侧略低或驯服，主力量平衡。", "白虎过强则压力，宜柔化。"),
    toEntry("明堂聚", "形峦", "前方开阔而聚，非散而冲。", "商铺住宅均重明堂纳气。"),
    toEntry("靠山稳", "形峦", "后方有靠，主安全与支持。", "沙发床宜有靠，忌背窗。"),
    toEntry("气口纳", "理气", "门窗为气口，纳气方向与清洁度。", "气口忌对煞、忌阻塞。"),
    toEntry("动线顺", "空间", "人流路径顺畅，忌穿堂、直冲。", "穿堂则气散，宜曲则聚。"),
    toEntry("飞星叠", "理气", "流年飞星落宫变化，需逐年看。", "五黄二黑需化，八白九紫可借。"),
    toEntry("八宅配", "系统", "东四西四宅命与方位匹配。", "不匹配则调睡向或办公位。"),
  ],
  patterns: [
    pattern("chuan-tang", "穿堂煞", "形煞", "凶", "大门对后门或窗，气直穿。", "气散不聚，财与健康易泄。", "设屏风、玄关或改门向。", "非绝凶，可化解。", "加玄关缓冲，避免直线穿风。"),
    pattern("lu-chong", "路冲", "形煞", "凶", "道路直冲门或窗。", "冲击煞气，宜避或化。", "植物、屏风、改门。", "严重路冲需专业评估。", "勿恐吓，给可行方案。"),
    pattern("jian-jiao", "尖角煞", "形煞", "凶", "外部尖角对射床位或 desk。", "压力、口舌、睡眠干扰。", "移床、植物、凸镜（慎用）。", "镜子需专业，忌乱挂。", "优先移位置。"),
    pattern("cai-wei-ju", "财位聚", "理气", "吉", "财位无压、无厕、无乱。", "资源可聚，经营有重心。", "清理财位，常明常净。", "财位非扫一次即灵。", "行为+环境同步。"),
    pattern("wen-chang-jing", "文昌静", "理气", "吉", "文昌位安静、有靠、有光。", "利学习考试专注。", "书桌对文昌，忌厕压。", "文昌在流年会转。", "按年微调。"),
    pattern("wu-huang", "五黄临", "飞星", "大凶", "五黄飞临某宫当年。", "忌动土、忌红黄火。", "铜器、白色、静止化。", "每年位置变。", "查当年飞星盘调整。"),
    pattern("tai-sui", "太岁方", "流年", "凶", "当年太岁方位忌动土冲犯。", "动土易有阻滞。", "太岁方宜静。", "装修需择日。", "重大工程结合专业。"),
    pattern("huo-shui", "水火不调", "空间", "凶", "厨房厕相邻床，水火相冲。", "健康关系易扰。", "改门、隔离、五行通关。", "现代户型常犯。", "优先改动线。"),
    pattern("men-chuang", "门对窗", "理气", "凶", "卧室门对窗或床对门。", "气不稳，睡眠浅。", "屏风、帘、改床向。", "常见可改。", "小调整先试。"),
    pattern("ba-zai-pei", "八宅相配", "系统", "吉", "宅命与吉方匹配。", "睡向、办公位在吉方。", "东四东、西四西。", "需知宅命。", "吉方优先布置。"),
    pattern("xuan-kong", "玄空飞星", "系统", "平", "三元九运与飞星组合。", "长期趋势与流年叠加。", "专业层，产品可简化展示。", "流派差异大。", "标注采用口径。"),
    pattern("ming-tang-kai", "明堂开阔", "形峦", "吉", "前方开阔明亮。", "机会承接、视野清晰。", "利事业商铺。", "过散则无聚。", "开阔但要有界。"),
    pattern("kao-shan", "有靠布局", "形峦", "吉", "座后有实墙或高物。", "稳定、支持、睡眠。", "沙发床desk宜靠。", "靠窗则虚。", "优先实靠。"),
    pattern("hua-sha-zhi", "化煞得宜", "化解", "吉", "形煞识别后用植物屏风等化解。", "煞减则气顺。", "可行、美观、安全。", "忌乱用镜子。", "简单可行优先。"),
  ],
  ruleGroups: [
    { label: "形峦优先", rules: [{ title: "外后内", steps: ["先观外局山水路冲。", "再看内局门主动线。", "形峦不正则理气难补。"], note: "风水首重可见环境。" }] },
    { label: "理气应用", rules: [{ title: "财位文昌", steps: ["财位宜聚、宜明，忌压忌污。", "文昌宜静宜靠，忌厕厨压。", "桃花位忌乱，宜社交空间。"], note: "流年飞星需逐年更新。" }] },
    { label: "调整原则", rules: [{ title: "可行化解", steps: ["方案须用户可执行。", "不替代建筑结构安全评估。", "调整后设观察周期复盘。"], note: "风水是环境优化非改命。" }] },
  ],
  classicNotes: [
    { source: "《葬书》郭璞", principle: "气乘风则散", paraphrase: "气需聚，风直则散，故重藏风聚气。", application: "穿堂、直风为忌，宜曲则聚。", caution: "古代语境需现代转译。" },
    { source: "《阳宅十书》", principle: "门为气口", paraphrase: "大门纳气，门主定基调。", application: "优先分析门向与门内动线。", caution: "城市公寓门向有限，重内局。" },
    { source: "《八宅明镜》", principle: "宅命相配", paraphrase: "东四西四命宜各就吉方。", application: "提供八宅简表与睡向建议。", caution: "流派有差异，标注口径。" },
    { source: "《沈氏玄空学》", principle: "飞星时空", paraphrase: "理气随元运与流年变化。", application: "流年模块展示五黄等提示。", caution: "玄空专业性强，宜简化。" },
    { source: "现代实务", principle: "环境心理学", paraphrase: "采光通风动线影响实际居住质量。", application: "与形峦结合，给可执行建议。", caution: "不夸大风水效果。" },
    { source: "现代实务", principle: "安全优先", paraphrase: "结构、电气、消防优于风水调整。", application: "重大工程转介专业。", caution: "忌恐吓式卖化解。" },
  ],
};
