import { getMethodDeepLibrary } from "../methodDeepLibraries";
import { groupDeepSymbols, pattern, toEntry } from "./builders";
import type { MethodReferenceLibrary } from "./types";

const deep = getMethodDeepLibrary("palmistry")!;

export const PALMISTRY_REFERENCE: MethodReferenceLibrary = {
  id: "palmistry",
  title: "手相解读库",
  symbolGroups: groupDeepSymbols(deep.symbols, [
    { id: "main", label: "主线", groups: ["主线"] },
    { id: "sub", label: "副线", groups: ["副线"] },
    { id: "mounts", label: "掌丘", groups: ["掌丘"] },
    { id: "fingers", label: "手指", groups: ["手指"] },
    { id: "tech", label: "技法标记", groups: ["左右", "传统", "技法", "状态", "标记", "气色", "结构"] },
  ]),
  questionTypes: [
    { type: "阶段状态", focus: "当前生命能量与节奏", usefulGod: "生命线、掌色、火星丘", readingKey: "生命线深长则续航强，浅则宜调作息。" },
    { type: "事业路径", focus: "职业方向、稳定性", usefulGod: "事业线、太阳线、木星丘", readingKey: "事业线直清则稳，断则转行期。" },
    { type: "关系模式", focus: "亲密表达、情绪习惯", usefulGod: "感情线、婚姻线、金星丘", readingKey: "感情线看表达，婚姻线看关系段数质量。" },
    { type: "思维学习", focus: "判断方式、专注", usefulGod: "智慧线、水星丘", readingKey: "智慧线长深则思细，短则决断快。" },
    { type: "创造名望", focus: "展示、艺术、公众", usefulGod: "太阳线、太阳丘", readingKey: "太阳线清晰则利展示，岛纹则困扰期。" },
    { type: "左右对照", focus: "先天后天差异", usefulGod: "左手、右手、双掌对照", readingKey: "左先天右后天，差异大则变化剧烈。" },
    { type: "健康节律", focus: "疲劳、恢复", usefulGod: "健康线、生命线、掌色", readingKey: "只作趋势；健康线乱则宜休息。" },
    { type: "长期追踪", focus: "掌纹变化", usefulGod: "主线断裂、岛纹", readingKey: "掌纹会变，宜定期记录对照。" },
  ],
  analysisSteps: [
    "定手：左右手、主次（男左女右或惯用手）。",
    "掌形：土火水风型，定基本气质。",
    "主线：生命、智慧、感情、事业，定四大轴。",
    "副线：太阳、婚姻、健康等，定细分。",
    "掌丘：能量集中处，看优势领域。",
    "手指：比例定意志、领导、沟通等。",
    "标记：岛纹、断裂、十字，看阶段课题。",
    "建议：优势开发、行为调整，不作医疗诊断。",
  ],
  relations: [
    toEntry("生命线深", "状态", "体力续航强，恢复力佳。", "浅则宜调作息。"),
    toEntry("智慧线弯", "主线", "想象直觉强，思维绕。", "直则逻辑线性。"),
    toEntry("感情线分叉", "主线", "情感多轨或表达复杂。", "需沟通清晰。"),
    toEntry("事业线断", "主线", "职业转折或暂停。", "非失败，宜重规划。"),
    toEntry("岛纹", "标记", "该线领域困扰期。", "可修复，掌纹会变。"),
    toEntry("金星丘满", "掌丘", "亲密活力强。", "过满则依赖。"),
    toEntry("木星丘满", "掌丘", "野心领导强。", "过满则专断。"),
    toEntry("双掌异", "技法", "左右主线差异大。", "后天变化剧烈或努力改运。"),
  ],
  patterns: [
    pattern("life-long", "生命线深长", "主线", "吉", "生命线深、长、清。", "续航强，体质佳。", "利长期项目。", "无休息则耗。", "节奏管理。"),
    pattern("life-short", "生命线短", "主线", "平", "生命线短或浅。", "宜重质量非长度。", "提醒调作息。", "非短寿。", "健康习惯。"),
    pattern("head-curved", "智慧线弯", "主线", "平", "智慧线向月丘弯。", "想象直觉强。", "利创意。", "易散。", "结构化管理。"),
    pattern("heart-fork", "感情线分叉", "主线", "平", "感情线末端分叉。", "情感表达多轨。", "关系需清晰。", "非必分。", "沟通边界。"),
    pattern("fate-clear", "事业线清", "主线", "吉", "事业线直深。", "目标清晰，职业稳。", "利专业深耕。", "断则转行。", "断处重规划。"),
    pattern("sun-line", "太阳线显", "副线", "吉", "太阳线清晰。", "展示、艺术、名望。", "利公开表达。", "岛纹则困扰。", "作品落地。"),
    pattern("marriage-fine", "婚姻线细清", "副线", "吉", "婚姻线细而清。", "关系质量重质。", "利深度关系。", "多条则多段。", "不数量化。"),
    pattern("health-chaotic", "健康线乱", "副线", "凶", "健康线杂乱。", "疲劳、需休息。", "调养。", "非病名。", "作息医疗若需。"),
    pattern("island-on-head", "智慧线岛", "标记", "凶", "智慧线有岛。", "思虑困扰、决策难。", "简化选择。", "可过。", "限时决策。"),
    pattern("break-on-life", "生命线断", "标记", "平", "生命线断裂有续。", "阶段大变。", "转型非终。", "续线示恢复。", "适应新章。"),
    pattern("mystic-cross", "神秘十字", "标记", "吉", "木星丘与太阳丘间十字。", "直觉灵性兴趣。", "利研究艺术。", "非必神异。", " grounded 练习。"),
    pattern("simian", "通贯掌", "结构", "平", "智慧感情合一。", "专注强烈，情感思维一体。", "利专才。", "关系需空间。", "沟通练习。"),
    pattern("earth-hand", "土型掌", "结构", "平", "掌方指短。", "务实稳定。", "利执行。", "变则慢。", "接受变化练习。"),
    pattern("left-right-diff", "左右差异大", "技法", "平", "左右主线明显不同。", "后天改变大。", "努力可改。", "记录对照。", "定期复盘。"),
  ],
  ruleGroups: [
    { label: "主次手", rules: [{ title: "左右法", steps: ["左手先天潜能，右手后天呈现。", "惯用手可作主看。", "双掌对照看变化。"], note: "流派略异，标注口径。" }] },
    { label: "主线优先", rules: [{ title: "四线框架", steps: ["生命、智慧、感情、事业定轴。", "副线细分。", "掌丘看能量域。"], note: "岛纹断看阶段非终身。" }] },
    { label: "伦理", rules: [{ title: "非诊断", steps: ["不判疾病寿夭。", "趋势+行为建议。", "掌纹会变。"], note: "尊重隐私。" }] },
  ],
  classicNotes: [
    { source: "《麻衣相法》", principle: "掌为心苗", paraphrase: "掌纹反映习惯与状态，非定命。", application: "强调可变的皮相层。", caution: "古代断语需转译。" },
    { source: "《通典》相掌", principle: "主线为纲", paraphrase: "生命线为体，智慧感情为用。", application: "四线入口清晰。", caution: "不单线定终身。" },
    { source: "西方 palmistry", principle: "丘位行星", paraphrase: "掌丘对应行星能量域。", application: "丘位模块对应展示。", caution: "文化融合标注。" },
    { source: "现代实务", principle: "掌纹变化", paraphrase: "经历可改变纹路。", application: "鼓励长期追踪。", caution: "非医学指标。" },
    { source: "现代心理", principle: "身体自我", paraphrase: "手相可作自我觉察入口。", application: "反思问题非标签。", caution: "避免决定论。" },
    { source: "现代伦理", principle: "不作歧视", paraphrase: "手相不用于雇佣婚恋歧视。", application: "中性描述。", caution: "用户自主解读。" },
  ],
};
