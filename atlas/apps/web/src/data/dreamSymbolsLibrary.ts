export interface DreamSymbolEntry {
  symbol: string;
  chineseView: string;
  jungianView: string;
  reflectionPrompt: string;
  safetyNote?: string;
}

const BASE_SYMBOLS: DreamSymbolEntry[] = [
  { symbol: "水", chineseView: "情感流动、财运、生活变化；清浊对应顺滞。", jungianView: "潜意识与情感容量。", reflectionPrompt: "最近有什么正在流动、失控或等待疏通？" },
  { symbol: "门", chineseView: "机遇、转折、阻碍。", jungianView: "心理过渡与改变的阈限。", reflectionPrompt: "哪扇门需要推开，哪扇门需要关上？" },
  { symbol: "飞行", chineseView: "上升、开阔、突破。", jungianView: "超越限制与自由渴望。", reflectionPrompt: "你想突破哪种现实重力？" },
  { symbol: "考试", chineseView: "压力、自我检视、过关。", jungianView: "能力与道德评估。", reflectionPrompt: "你正在经历哪种人生测试？" },
  { symbol: "牙齿脱落", chineseView: "传统上常被视作健康/亲缘警示，现代宜转作压力象征。", jungianView: "衰老、失控、表达焦虑。", reflectionPrompt: "你害怕失去哪种力量？", safetyNote: "若伴随口腔问题请就医，勿仅依梦占。" },
  { symbol: "镜子", chineseView: "自省、认知偏差、人际误会。", jungianView: "自我认知与人格面向。", reflectionPrompt: "镜中形象与你现实自我有何差异？" },
  { symbol: "火", chineseView: "变革、热情、危机。", jungianView: "创造力与破坏性情绪。", reflectionPrompt: "什么需要点燃，什么需要降温？" },
  { symbol: "追捕", chineseView: "逃避、压力、恐惧源。", jungianView: "阴影追逐与心理防御。", reflectionPrompt: "你在回避哪个影子？" },
  { symbol: "道路", chineseView: "顺利、崎岖、选择。", jungianView: "人生旅程与方向。", reflectionPrompt: "当前导航指向哪里？" },
  { symbol: "房子", chineseView: "家庭、根基、心理结构。", jungianView: "内心建筑与意识房间。", reflectionPrompt: "哪个内在房间需要整理？" },
  { symbol: "钥匙", chineseView: "解法、开启、资源。", jungianView: "进入潜意识的通道。", reflectionPrompt: "你正在寻找什么解锁方式？" },
  { symbol: "动物", chineseView: "本能、力量、关系投射。", jungianView: "原型力量与阴影本能。", reflectionPrompt: "这个动物唤醒了什么原始特质？" },
];

const EXTRA_SYMBOLS: DreamSymbolEntry[] = [
  "蛇", "龙", "鱼", "鸟", "猫", "狗", "马", "牛", "虎", "狼",
  "花", "树", "山", "河", "海", "雨", "雪", "风", "雷", "电",
  "桥", "楼", "电梯", "楼梯", "车", "船", "飞机", "火车", "路", "墙",
  "钱", "金", "玉", "刀", "剑", "血", "病", "医院", "学校", "老师",
  "婴儿", "老人", "陌生人", "朋友", "父母", "孩子", "婚礼", "葬礼", "食物", "饭",
  "衣服", "裸体", "头发", "眼睛", "手", "脚", "坠落", "迷路", "黑暗", "光",
  "电话", "消息", "书", "数字", "颜色", "死亡", "复活", "战争", "逃跑", "隐藏",
].map((symbol) => ({
  symbol,
  chineseView: `${symbol}在梦占中常作象征读解，需结合梦者情境，不宜孤立断言吉凶。`,
  jungianView: `${symbol}可视为潜意识意象，反映当前心理能量与未整合部分。`,
  reflectionPrompt: `梦中出现的「${symbol}」让你联想到现实生活中的什么？`,
}));

export const DREAM_SYMBOLS: DreamSymbolEntry[] = [...BASE_SYMBOLS, ...EXTRA_SYMBOLS];

export function matchDreamSymbols(text: string): DreamSymbolEntry[] {
  const lower = text.toLowerCase();
  return DREAM_SYMBOLS.filter((s) => text.includes(s.symbol) || lower.includes(s.symbol));
}

export function searchDreamSymbols(query: string, limit = 8): DreamSymbolEntry[] {
  const q = query.trim();
  if (!q) return [];
  return DREAM_SYMBOLS.filter((s) => s.symbol.includes(q)).slice(0, limit);
}
