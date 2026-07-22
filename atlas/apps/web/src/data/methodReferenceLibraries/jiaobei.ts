import { getMethodDeepLibrary } from "../methodDeepLibraries";
import { groupDeepSymbols, pattern, toEntry } from "./builders";
import type { MethodReferenceLibrary } from "./types";

const deep = getMethodDeepLibrary("jiaobei")!;

export const JIAOBEI_REFERENCE: MethodReferenceLibrary = {
  id: "jiaobei",
  title: "掷筊问事库",
  symbolGroups: groupDeepSymbols(deep.symbols, [
    { id: "results", label: "杯象结果", groups: ["结果", "确认"] },
    { id: "question", label: "问句校准", groups: ["核心", "问型"] },
    { id: "context", label: "场域语境", groups: ["语境", "场域"] },
    { id: "flow", label: "仪式流程", groups: ["流程"] },
    { id: "rules", label: "规则边界", groups: ["规则", "复盘", "边界", "应用", "器具"] },
  ]),
  questionTypes: [
    { type: "是非决策", focus: "是否可行、是否该做", usefulGod: "圣杯、阴杯、三圣杯", readingKey: "问句须非黑即白；圣杯允、阴杯否、笑杯重问。" },
    { type: "行动确认", focus: "已定方案求确认", usefulGod: "三圣杯、再掷确认", readingKey: "三圣杯为强确认，仍非绝对保证。" },
    { type: "婚嫁请示", focus: "婚期、对象、仪式", usefulGod: "圣杯、吉事问", readingKey: "吉事问宜庄重，场域宜正式。" },
    { type: "事业请示", focus: "开业、转职、签约", usefulGod: "圣杯、次数限制", readingKey: "重大事项三掷为限，结合现实。" },
    { type: "出行请示", focus: "远行、搬迁时机", usefulGod: "圣杯、阴杯", readingKey: "阴杯宜改期，非强行出发。" },
    { type: "健康方向", focus: "就医、疗养方向", usefulGod: "圣杯、正信", readingKey: "只作参考，医疗以专业为准。" },
    { type: "问题校准", focus: "笑杯后重述问句", usefulGod: "笑杯、问句", readingKey: "笑杯示问未准，修正再掷。" },
    { type: "还愿闭环", focus: "事成后答谢", usefulGod: "感恩还愿、记录", readingKey: "还愿作仪式闭环，非交易。" },
  ],
  analysisSteps: [
    "检问：是否是非题、是否清楚、是否可回答。",
    "准备：净手净心，禀告来意与请示对象。",
    "初掷：得圣杯、笑杯或阴杯，记录。",
    "再确认：重要事可再掷，最多三掷。",
    "三圣杯：连续三圣杯为强确认。",
    "笑杯：修正问句，非责怪神明。",
    "阴杯：暂停、改条件，不宜强求。",
    "复盘：记录问句、结果、时间，结合现实行动。",
  ],
  relations: [
    toEntry("圣杯", "结果", "一阴一阳，神明允准。", "可行动但仍有条件。"),
    toEntry("笑杯", "结果", "两阳，问未准或时机未到。", "修正问句再掷。"),
    toEntry("阴杯", "结果", "两阴，暂不允许。", "宜暂停，不宜强迫。"),
    toEntry("三圣杯", "确认", "连续三次圣杯。", "强确认，仍结合现实。"),
    toEntry("三掷限", "规则", "同一问最多三掷。", "防强迫与卦乱。"),
    toEntry("隔日再问", "规则", "同一事需冷却。", "尊重神意与心理。"),
    toEntry("神意人意", "边界", "区分投射与回应。", "勿把愿望当圣杯。"),
    toEntry("场域", "语境", "庙堂家祭野祭层次不同。", "正式事宜正式场。"),
  ],
  patterns: [
    pattern("sheng-bei", "单圣杯", "结果格", "吉", "一阴一阳。", "当前允准，可行。", "可推进。", "仍看条件。", "行动但留余地。"),
    pattern("xiao-bei", "笑杯", "结果格", "平", "两阳面。", "问未准，需重述。", "修正问句。", "非拒绝。", "重写再问。"),
    pattern("yin-bei", "阴杯", "结果格", "凶", "两阴面。", "暂不允许。", "暂停改条件。", "非永久否。", "尊重停止。"),
    pattern("san-sheng", "三圣杯", "确认格", "大吉", "连续三圣杯。", "强确认。", "重大事可行动。", "非绝对。", "仍现实评估。"),
    pattern("sheng-xiao-sheng", "圣笑圣", "序列", "平", "允而未定。", "需澄清细节。", "再确认。", "勿急。", "补问子问题。"),
    pattern("xiao-xiao", "连续笑杯", "序列", "凶", "问句严重不清。", "停止强问。", "重写分解。", "可能不宜筊。", "换问法或换占。"),
    pattern("yin-yin", "连续阴杯", "序列", "凶", "强烈否。", "宜止。", "改方案。", "隔日可再问。", "接受否。"),
    pattern("li-bei", "立杯", "特殊", "平", "杯竖立 rare。", "特殊神意。", "慎重解读。", "各庙口径不同。", "请教庙方。"),
    pattern("fei-gong-wen", "非共文问", "问句", "凶", "问句非是非或含多事。", "笑杯概率高。", "拆问。", "一事一筊。", "简化问句。"),
    pattern("qiang-wen", "强迫三掷后仍阴", "规则", "凶", "超三掷或阴后仍问。", "心乱。", "停止。", "尊重规则。", "冷却隔日。"),
    pattern("jia-ji", "吉事圣杯", "应用", "吉", "婚嫁开业等。", "可推进仪式。", "仍备Plan B。", "非保证。", "筹备落实。"),
    pattern("xiong-shi-yin", "凶事阴杯", "应用", "平", "诉讼迁葬等得阴。", "宜谨慎。", "多方案。", "阴非绝路。", "专业咨询。"),
    pattern("huan-yuan", "还愿闭环", "流程", "吉", "事成后答谢。", "仪式完整。", "心诚。", "非交易。", "感恩记录。"),
    pattern("ji-lu", "记录复盘", "复盘", "吉", "记问句结果时间。", "便于回顾。", "学过程。", "无则易忘。", "日记一行。"),
  ],
  ruleGroups: [
    { label: "问句法则", rules: [{ title: "是非清晰", steps: ["一事一问，是非分明。", "不可多问合一。", "不可强求答案。"], note: "笑杯常示问句问题。" }] },
    { label: "投掷规则", rules: [{ title: "三掷为限", steps: ["同一问题最多三掷。", "阴杯宜停，笑杯宜改问。", "三圣杯为强确认。"], note: "防强迫焦虑。" }] },
    { label: "正信边界", rules: [{ title: "仪式辅助", steps: ["筊杯辅助决策非替代。", "医疗法律财务靠专业。", "区分神意与心理投射。"], note: "正信不正迷。" }] },
  ],
  classicNotes: [
    { source: "民间信仰", principle: "圣杯允准", paraphrase: "一阴一阳为神明应允之常见说法。", application: "结果区清晰三色定义。", caution: "各地口径略异。" },
    { source: "民间信仰", principle: "笑杯问未准", paraphrase: "笑杯示问题不清或时机未到。", application: "引导重写问句。", caution: "非神明怒。" },
    { source: "庙宇礼仪", principle: "禀告再掷", paraphrase: "先礼后筊，自报姓名事由。", application: "流程步骤展示。", caution: "场域禁忌尊重。" },
    { source: "庙宇礼仪", principle: "三掷为限", paraphrase: "同一事不过三，防不敬与乱心。", application: "产品限制三掷。", caution: "心诚优于多掷。" },
    { source: "现代心理", principle: "决策仪式", paraphrase: "仪式帮助暂停与聚焦。", application: "作决策辅助框架。", caution: "非逃避责任。" },
    { source: "现代伦理", principle: "不替代专业", paraphrase: "健康法律须专业意见。", application: "免责声明清晰。", caution: "忌恐吓式神意。" },
  ],
};
