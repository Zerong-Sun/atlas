export const MAJOR_ARCANA = [
  { id: 0, name: "愚者", keywords: ["开始", "冒险", "天真"] },
  { id: 1, name: "魔术师", keywords: ["意志", "技能", "专注"] },
  { id: 2, name: "女祭司", keywords: ["直觉", "潜意识", "神秘"] },
  { id: 3, name: "皇后", keywords: ["丰饶", "滋养", "创造"] },
  { id: 4, name: "皇帝", keywords: ["结构", "权威", "稳定"] },
  { id: 5, name: "教皇", keywords: ["传统", "教导", "信念"] },
  { id: 6, name: "恋人", keywords: ["选择", "关系", "价值"] },
  { id: 7, name: "战车", keywords: ["前进", "控制", "胜利"] },
  { id: 8, name: "力量", keywords: ["勇气", "耐心", "内在力量"] },
  { id: 9, name: "隐者", keywords: ["内省", "独处", "智慧"] },
  { id: 10, name: "命运之轮", keywords: ["周期", "转变", "机遇"] },
  { id: 11, name: "正义", keywords: ["公平", "因果", "决定"] },
  { id: 12, name: "倒吊人", keywords: ["暂停", "换位", "牺牲"] },
  { id: 13, name: "死神", keywords: ["结束", "转化", "新生"] },
  { id: 14, name: "节制", keywords: ["平衡", "调和", "耐心"] },
  { id: 15, name: "恶魔", keywords: ["束缚", "欲望", "阴影"] },
  { id: 16, name: "塔", keywords: ["突变", "觉醒", "崩塌"] },
  { id: 17, name: "星星", keywords: ["希望", "灵感", "疗愈"] },
  { id: 18, name: "月亮", keywords: ["幻觉", "不安", "潜意识"] },
  { id: 19, name: "太阳", keywords: ["成功", "活力", "清晰"] },
  { id: 20, name: "审判", keywords: ["觉醒", "评估", "召唤"] },
  { id: 21, name: "世界", keywords: ["完成", "整合", "成就"] },
];

const POSITIONS = ["过去/成因", "现在/核心", "趋势/建议"];

function seededRandom(seed: string): () => number {
  let state = hashSeed(seed);
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function drawTarotSpread(seed: string): Record<string, unknown> {
  const rand = seededRandom(seed);
  const deck = [...MAJOR_ARCANA];
  const drawn: Array<{ card: typeof MAJOR_ARCANA[0]; reversed: boolean; position: string }> = [];

  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(rand() * deck.length);
    const card = deck.splice(idx, 1)[0];
    drawn.push({
      card,
      reversed: rand() > 0.7,
      position: POSITIONS[i],
    });
  }

  return {
    spread: "three_card",
    cards: drawn.map((d) => ({
      name: d.card.name,
      reversed: d.reversed,
      position: d.position,
      keywords: d.card.keywords,
    })),
    summary: drawn.map((d) => `${d.position}：${d.card.name}${d.reversed ? "（逆位）" : ""}`).join("；"),
  };
}
