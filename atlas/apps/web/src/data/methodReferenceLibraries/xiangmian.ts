import { getMethodDeepLibrary } from "../methodDeepLibraries";
import { groupDeepSymbols, pattern, toEntry } from "./builders";
import type { MethodReferenceLibrary } from "./types";

const deep = getMethodDeepLibrary("xiangmian")!;

export const XIANGMIAN_REFERENCE: MethodReferenceLibrary = {
  id: "xiangmian",
  title: "面相分析库",
  symbolGroups: groupDeepSymbols(deep.symbols, [
    { id: "santing", label: "三停", groups: ["三停"] },
    { id: "wuguan", label: "五官", groups: ["五官"] },
    { id: "shier", label: "十二宫", groups: ["十二宫"] },
    { id: "qise", label: "气色神态", groups: ["气色", "神态"] },
    { id: "wen", label: "纹路结构", groups: ["纹路", "痣相", "动态", "结构"] },
  ]),
  questionTypes: [
    { type: "整体气象", focus: "三停比例、气色、第一印象", usefulGod: "三停、印堂、气色", readingKey: "三停匀则运稳，气色看当下状态。" },
    { type: "事业能力", focus: "执行力、领导力、社会角色", usefulGod: "官禄宫、额头、鼻相", readingKey: "额官禄看事业，鼻看财执。" },
    { type: "财务模式", focus: "理财、聚财、风险", usefulGod: "财帛宫、准头、鼻翼", readingKey: "准头鼻翼看财，不宜单看鼻大即富。" },
    { type: "关系表达", focus: "沟通、亲密、合作", usefulGod: "夫妻宫、口眼、眉毛", readingKey: "奸门看婚姻，口眼看表达。" },
    { type: "健康节律", focus: "压力、疲劳、调养", usefulGod: "疾厄宫、山根、气色", readingKey: "只作趋势；山根疾厄看承载，不作诊断。" },
    { type: "阶段变化", focus: "近期运势波动", usefulGod: "印堂、气色、动态", readingKey: "印堂窄暗示近期压力，气色变则运变。" },
    { type: "自我修正", focus: "优势开发与行为调整", usefulGod: "骨相皮相、动态", readingKey: "皮相后天可修，重行为非定命。" },
    { type: "合作表达", focus: "谈判、信任、第一印象", usefulGod: "眼神、口相、奴仆宫", readingKey: "眼神清明增信，口相看承诺习惯。" },
  ],
  analysisSteps: [
    "定域：明确观察领域（事业、关系、健康等）。",
    "三停：上停早年、中停中年、下停晚运，看比例与饱满。",
    "五官：眉眼口鼻耳，定性情与能力倾向。",
    "十二宫：对应生活领域，整体合看不单宫。",
    "气色神态：看当下状态，优于静态照片。",
    "纹路痣相：作辅助，不夺整体。",
    "动态：交谈表情比定格照更真。",
    "建议：优势、修正、边界，不作医疗诊断。",
  ],
  relations: [
    toEntry("三停匀", "结构", "上中下比例协调，人生阶段较稳。", "三停偏则某阶段突出或薄弱。"),
    toEntry("印堂宽", "十二宫", "心胸开阔，近期运较顺。", "印堂窄暗则压力期。"),
    toEntry("山根断", "十二宫", "鼻梁起点低陷，体质或继承弱。", "作提醒非定命，可调养。"),
    toEntry("准头圆", "财帛", "鼻头圆润，聚财执行较稳。", "尖薄则财来财去。"),
    toEntry("奸门纹", "夫妻", "眼尾奸门有纹，关系需经营。", "光则和，杂则争。"),
    toEntry("眼神聚", "神态", "专注有力，可信度高。", "游离则心神不定。"),
    toEntry("骨相定", "结构", "骨骼结构定先天格局。", "皮相气色看后天与当下。"),
    toEntry("左右差", "结构", "面部不对称示内外张力。", "需结合整体，不单断。"),
  ],
  patterns: [
    pattern("santing-jun", "三停匀称", "格局", "吉", "上中下停比例协调。", "人生各阶段较均衡。", "整体发展稳。", "无突出专才则宜广。", "发挥均衡优势。"),
    pattern("shang-ting-guang", "上停饱满", "格局", "吉", "额头宽阔饱满。", "早年运、智慧、事业起点佳。", "利学术管理。", "过宽则空想。", "落地执行。"),
    pattern("zhong-ting-qi", "中停有力", "格局", "吉", "眉眼鼻区饱满有神。", "中年执行力、关系处理强。", "利事业高峰。", "鼻破则财损。", "护财护关系。"),
    pattern("xia-ting-cheng", "下停承载", "格局", "吉", "口颏饱满。", "晚年承载、福禄、表达。", "利传承享受。", "薄则晚运需备。", "早做储备。"),
    pattern("yin-tang-an", "印堂暗沉", "气色", "凶", "印堂窄、暗、乱。", "近期压力、阻滞。", "宜休整、减事。", "可随气色转。", "降速复盘。"),
    pattern("bi-xiang-cai", "鼻相财格", "财帛", "吉", "准头圆、鼻翼收、山根顺。", "理财执行较稳。", "利经营。", "鼻孔露则难聚。", "控支出。"),
    pattern("yan-shen-qing", "眼神清明", "神态", "吉", "眼有神、不浮。", "专注、可信、洞察。", "利谈判领导。", "过锐则伤人。", "柔化表达。"),
    pattern("jian-men-za", "奸门杂纹", "夫妻", "凶", "奸门乱纹、斑。", "关系需经营，易争。", "沟通边界。", "可修可转。", "主动沟通。"),
    pattern("fa-ling-shen", "法令深", "十二宫", "平", "法令纹深。", "责任、权威、社会角色重。", "利管理。", "早显则压力早。", "接责有界。"),
    pattern("er-xiang-hou", "耳相厚", "五官", "吉", "耳厚大垂。", "先天禀赋、接收力。", "利学习倾听。", "单耳不作主断。", "善听。"),
    pattern("mei-luan", "眉乱", "五官", "凶", "眉毛乱、断。", "性情急、决策散。", "宜整理节奏。", "可修眉象征性。", "列优先级。"),
    pattern("kou-da-xing", "口大心宽", "五官", "吉", "口型适中偏大、唇色润。", "表达、享受、福禄。", "利销售沟通。", "无收则承诺多。", "言出必行。"),
    pattern("qing-bai", "青白气色", "气色", "凶", "面色青白。", "惊吓、风寒、精力低。", "休息调养。", "不作病名。", "就医若持续。"),
    pattern("hong-run", "红润气色", "气色", "吉", "面色红润有光泽。", "气血旺、当下运顺。", "可推进事。", "红过则火。", "顺势不冒进。"),
  ],
  ruleGroups: [
    { label: "观察顺序", rules: [{ title: "整体到局部", steps: ["先看三停气色整体。", "再五官十二宫。", "最后纹路痣相辅助。"], note: "不单宫孤断。" }] },
    { label: "动静结合", rules: [{ title: "动态优先", steps: ["交谈中观察眼神表情。", "静态照作参考。", "气色变化快于骨相。"], note: "不作身份歧视。" }] },
    { label: "伦理边界", rules: [{ title: "非诊断", steps: ["不判疾病、不判命运定数。", "倾向+修正建议。", "外貌描述中性尊重。"], note: "文化文本非医学。" }] },
  ],
  classicNotes: [
    { source: "《麻衣神相》", principle: "三停定运", paraphrase: "上停主早，中停主中，下停主晚。", application: "三停模块为入口。", caution: "古代等级语需现代转译。" },
    { source: "《柳庄相法》", principle: "气色主当下", paraphrase: "气色变则运变，速于骨相。", application: "强调近期观察与复盘。", caution: "气色受睡眠健康影响。" },
    { source: "《神相全编》", principle: "十二宫对应", paraphrase: "面部各区域对应生活领域。", application: "十二宫标签对应模块。", caution: "整体合看。" },
    { source: "《水镜集》", principle: "眼神为窗", paraphrase: "眼为心神之窗，眼神定可信。", application: "动态观察眼神。", caution: "勿以貌取人绝对化。" },
    { source: "现代心理", principle: "自我呈现", paraphrase: "表情姿态可训练，非全定。", application: "给行为修正建议。", caution: "避免外貌焦虑。" },
    { source: "现代伦理", principle: "尊重边界", paraphrase: "面相为文化观察非评判工具。", application: "中性语言，无歧视。", caution: "禁止就业婚恋歧视建议。" },
  ],
};
