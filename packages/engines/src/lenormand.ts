import type { LenormandInput, LenormandSpread } from "@atlas/shared-types";
import { shuffleWithSeed } from "./seed.ts";

export const LENORMAND_CARDS = [
  { id: 1, name: "骑士", keywords: ["行动", "消息", "改变"] },
  { id: 2, name: "三叶草", keywords: ["幸运", "机遇", "快乐"] },
  { id: 3, name: "船", keywords: ["旅行", "自由", "探索"] },
  { id: 4, name: "房子", keywords: ["家庭", "安全", "稳定"] },
  { id: 5, name: "树", keywords: ["健康", "成长", "持久"] },
  { id: 6, name: "云", keywords: ["困惑", "延迟", "不确定"] },
  { id: 7, name: "蛇", keywords: ["欺骗", "危险", "诱惑"] },
  { id: 8, name: "棺材", keywords: ["结束", "转变", "释放"] },
  { id: 9, name: "花束", keywords: ["礼物", "美好", "欢迎"] },
  { id: 10, name: "镰刀", keywords: ["切断", "突然", "决定"] },
  { id: 11, name: "鞭子", keywords: ["重复", "冲突", "动力"] },
  { id: 12, name: "鸟", keywords: ["交流", "社交", "伴侣"] },
  { id: 13, name: "小孩", keywords: ["新开始", "天真", "学习"] },
  { id: 14, name: "狐狸", keywords: ["狡猾", "策略", "工作"] },
  { id: 15, name: "熊", keywords: ["力量", "保护", "主导"] },
  { id: 16, name: "星星", keywords: ["希望", "灵感", "目标"] },
  { id: 17, name: "鹳", keywords: ["变化", "进步", "搬迁"] },
  { id: 18, name: "狗", keywords: ["忠诚", "友谊", "支持"] },
  { id: 19, name: "塔", keywords: ["权威", "孤立", "目标"] },
  { id: 20, name: "花园", keywords: ["社交", "社区", "公共"] },
  { id: 21, name: "山", keywords: ["障碍", "挑战", "耐心"] },
  { id: 22, name: "十字路口", keywords: ["选择", "机会", "方向"] },
  { id: 23, name: "老鼠", keywords: ["损失", "焦虑", "消耗"] },
  { id: 24, name: "心", keywords: ["爱情", "情感", "关怀"] },
  { id: 25, name: "戒指", keywords: ["承诺", "循环", "连接"] },
  { id: 26, name: "书", keywords: ["知识", "秘密", "学习"] },
  { id: 27, name: "信", keywords: ["消息", "文件", "沟通"] },
  { id: 28, name: "男人", keywords: ["男性", "人物", "行动"] },
  { id: 29, name: "女人", keywords: ["女性", "人物", "情感"] },
  { id: 30, name: "百合", keywords: ["平静", "和谐", "纯洁"] },
  { id: 31, name: "太阳", keywords: ["成功", "活力", "乐观"] },
  { id: 32, name: "月亮", keywords: ["直觉", "情感", "潜意识"] },
  { id: 33, name: "钥匙", keywords: ["解决", "关键", "开启"] },
  { id: 34, name: "鱼", keywords: ["财富", "流动", "丰富"] },
  { id: 35, name: "锚", keywords: ["稳定", "目标", "持久"] },
  { id: 36, name: "十字架", keywords: ["负担", "责任", "考验"] },
] as const;

export type LenormandCard = (typeof LENORMAND_CARDS)[number];

export interface LenormandDrawnCard {
  id: number;
  name: string;
  keywords: readonly string[];
  position: string;
  gridRow?: number;
  gridCol?: number;
}

export interface LenormandPairReading {
  cardA: string;
  cardB: string;
  reading: string;
}

export interface LenormandResult {
  spread: LenormandSpread;
  question?: string;
  cards: LenormandDrawnCard[];
  pairs: LenormandPairReading[];
  centerTheme?: string;
}

const SPREAD_POSITIONS: Record<LenormandSpread, string[]> = {
  three: ["过去/背景", "核心主题", "趋势/建议"],
  five: ["核心", "上方影响", "下方基础", "左方过去", "右方趋势"],
  nine: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
};

const NINE_GRID: Array<[number, number]> = [
  [0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2],
];

const COMBO_RULES: Record<string, string> = {
  "骑士+心": "情感方面将有新消息或行动到来。",
  "骑士+钥匙": "关键突破或重要消息即将出现。",
  "船+房子": "搬迁、远行与家庭根基之间的拉扯。",
  "蛇+心": "关系中可能有复杂动机，宜保持清醒。",
  "云+太阳": "困惑之后可见明朗，但需等待时机。",
  "鱼+钥匙": "财务或资源方面找到解法。",
  "十字架+锚": "责任与稳定并存，需长期承担。",
  "老鼠+鱼": "资源有损耗，注意小额流失。",
  "塔+花园": "机构、权威与公众场合的互动。",
};

function pairKey(a: string, b: string): string {
  return `${a}+${b}`;
}

function lookupPair(a: string, b: string): string | undefined {
  return COMBO_RULES[pairKey(a, b)] ?? COMBO_RULES[pairKey(b, a)];
}

function buildPairs(cards: LenormandDrawnCard[]): LenormandPairReading[] {
  const pairs: LenormandPairReading[] = [];
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const reading = lookupPair(cards[i]!.name, cards[j]!.name);
      if (reading) {
        pairs.push({ cardA: cards[i]!.name, cardB: cards[j]!.name, reading });
      }
    }
  }
  if (cards.length >= 2 && pairs.length === 0) {
    pairs.push({
      cardA: cards[0]!.name,
      cardB: cards[1]!.name,
      reading: `${cards[0]!.name}修饰${cards[1]!.name}，二者相邻互动需结合问题语境理解。`,
    });
  }
  return pairs;
}

export function drawLenormand(input: LenormandInput = {}): LenormandResult {
  const spread = input.spread ?? "three";
  const seed = input.seed ?? new Date().toISOString();
  const positions = SPREAD_POSITIONS[spread];
  const shuffled = shuffleWithSeed([...LENORMAND_CARDS], seed);
  const picked = shuffled.slice(0, positions.length);

  const cards: LenormandDrawnCard[] = picked.map((card, i) => {
    const base: LenormandDrawnCard = { ...card, position: positions[i]! };
    if (spread === "nine") {
      const [row, col] = NINE_GRID[i]!;
      return { ...base, gridRow: row, gridCol: col };
    }
    return base;
  });

  const centerTheme =
    spread === "nine"
      ? cards.find((c) => c.gridRow === 1 && c.gridCol === 1)?.name
      : spread === "three"
        ? cards[1]?.name
        : cards[0]?.name;

  return {
    spread,
    question: input.question,
    cards,
    pairs: buildPairs(cards),
    centerTheme,
  };
}
