import { LENORMAND_CARDS } from "@atlas/engines/lenormand";

export const LENORMAND_MEANINGS = LENORMAND_CARDS.map((c) => ({
  ...c,
  plainMeaning: getPlainMeaning(c.name),
  comboHints: getComboHints(c.name),
}));

function getPlainMeaning(name: string): string {
  const map: Record<string, string> = {
    骑士: "新行动、新消息或改变到来。",
    三叶草: "小幸运与短暂机会。",
    船: "远行、探索或离开原处。",
    房子: "家庭、根基与安全感。",
    树: "健康、长期成长与生命力。",
    云: "模糊、迟滞、看不清。",
    蛇: "潜在风险、复杂动机。",
    棺材: "阶段结束或释放旧物。",
    花束: "愉快互动与礼物。",
    镰刀: "突然变化或果断切除。",
    鞭子: "重复模式、争执或驱动力。",
    鸟: "对话、会议、社交交流。",
    小孩: "新项目、学习、初心。",
    狐狸: "策略、谨慎、工作事务。",
    熊: "权力、保护与资源。",
    星星: "希望、远景与灵感。",
    鹳: "生活变化与升级。",
    狗: "朋友、信任、支持。",
    塔: "机构、权威、距离。",
    花园: "群体、公众场合、活动。",
    山: "阻碍、延迟、难关。",
    十字路口: "多路径与决策点。",
    老鼠: "精力/资源损耗。",
    心: "情感连接与爱。",
    戒指: "契约、关系、重复周期。",
    书: "隐藏信息与学习。",
    信: "书面信息、合同、通知。",
    男人: "男性人物或阳性特质。",
    女人: "女性人物或阴性特质。",
    百合: "和谐、成熟、宁静。",
    太阳: "成功与能量恢复。",
    月亮: "梦境、直觉、情绪波动。",
    钥匙: "关键解法和突破口。",
    鱼: "金钱、资源、流动性。",
    锚: "稳定、长期目标。",
    十字架: "责任、压力和考验。",
  };
  return map[name] ?? `${name}：结合相邻牌与问题语境解读。`;
}

function getComboHints(name: string): string[] {
  const map: Record<string, string[]> = {
    骑士: ["+心：情感消息", "+钥匙：关键突破"],
    船: ["+房子：搬迁与家庭", "+鱼：远方财路"],
    蛇: ["+心：关系复杂", "+钥匙：解开隐患"],
    云: ["+太阳：云后见晴", "+山：迷雾中的阻碍"],
  };
  return map[name] ?? [`作为修饰牌影响相邻牌义`];
}

export const LENORMAND_PAIR_RULES: Array<{ a: string; b: string; reading: string }> = [
  { a: "骑士", b: "心", reading: "情感方面将有新消息或行动到来。" },
  { a: "骑士", b: "钥匙", reading: "关键突破或重要消息即将出现。" },
  { a: "船", b: "房子", reading: "搬迁、远行与家庭根基之间的拉扯。" },
  { a: "蛇", b: "心", reading: "关系中可能有复杂动机，宜保持清醒。" },
  { a: "云", b: "太阳", reading: "困惑之后可见明朗，但需等待时机。" },
  { a: "鱼", b: "钥匙", reading: "财务或资源方面找到解法。" },
  { a: "十字架", b: "锚", reading: "责任与稳定并存，需长期承担。" },
];

export function lookupLenormandPair(a: string, b: string): string | undefined {
  const rule = LENORMAND_PAIR_RULES.find(
    (r) => (r.a === a && r.b === b) || (r.a === b && r.b === a)
  );
  return rule?.reading;
}

export function getLenormandCard(name: string) {
  return LENORMAND_MEANINGS.find((c) => c.name === name);
}
