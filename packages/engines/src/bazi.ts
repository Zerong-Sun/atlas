import { Solar } from "lunar-javascript";
import type { EngineInput } from "./index.js";
import { selectBaziClassics } from "./bazi-classics.js";

/* ── Constants ── */
export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const ELEMENT_ORDER = ["木", "火", "土", "金", "水"] as const;
type Element = (typeof ELEMENT_ORDER)[number];

const PILLAR_LABELS: Record<string, string> = {
  year: "年柱", month: "月柱", day: "日柱", hour: "时柱",
};

const stemElement: Record<string, Element> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土",
  庚: "金", 辛: "金", 壬: "水", 癸: "水",
};
const branchElement: Record<string, Element> = {
  寅: "木", 卯: "木", 巳: "火", 午: "火", 辰: "土", 戌: "土", 丑: "土", 未: "土",
  申: "金", 酉: "金", 子: "水", 亥: "水",
};
const stemPolarity: Record<string, "阳" | "阴"> = {
  甲: "阳", 乙: "阴", 丙: "阳", 丁: "阴", 戊: "阳", 己: "阴",
  庚: "阳", 辛: "阴", 壬: "阳", 癸: "阴",
};
const branchPolarity: Record<string, "阳" | "阴"> = {
  子: "阳", 丑: "阴", 寅: "阳", 卯: "阴", 辰: "阳", 巳: "阴",
  午: "阳", 未: "阴", 申: "阳", 酉: "阴", 戌: "阳", 亥: "阴",
};

/* ── Hidden Stems (藏干) ── */
const HIDDEN_STEMS: Record<string, string[]> = {
  子: ["癸"],
  丑: ["己", "癸", "辛"],
  寅: ["甲", "丙", "戊"],
  卯: ["乙"],
  辰: ["戊", "乙", "癸"],
  巳: ["丙", "庚", "戊"],
  午: ["丁", "己"],
  未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"],
  酉: ["辛"],
  戌: ["戊", "辛", "丁"],
  亥: ["壬", "甲"],
};

/* ── Branch combinations (六合) ── */
const BRANCH_SIX_COMBOS: Record<string, { partner: string; element: Element }> = {
  子: { partner: "丑", element: "土" },
  丑: { partner: "子", element: "土" },
  寅: { partner: "亥", element: "木" },
  亥: { partner: "寅", element: "木" },
  卯: { partner: "戌", element: "火" },
  戌: { partner: "卯", element: "火" },
  辰: { partner: "酉", element: "金" },
  酉: { partner: "辰", element: "金" },
  巳: { partner: "申", element: "水" },
  申: { partner: "巳", element: "水" },
  午: { partner: "未", element: "土" },
  未: { partner: "午", element: "土" },
};

/* ── Branch clashes (六冲) ── */
const BRANCH_CLASHES: Record<string, string> = {
  子: "午", 丑: "未", 寅: "申", 卯: "酉", 辰: "戌", 巳: "亥",
  午: "子", 未: "丑", 申: "寅", 酉: "卯", 戌: "辰", 亥: "巳",
};

/* ── Day Master personality descriptions ── */
const DAY_MASTER_TRAITS: Record<string, {
  nature: string;
  strength: string;
  weakness: string;
  advice: string;
}> = {
  甲: { nature: "如参天大树，正直向上，有领导力和开拓精神。", strength: "意志坚定，有担当，善于规划，具领袖气质。", weakness: "固执己见，不善变通，容易给人压迫感。", advice: "适当柔化态度，学会借力，避免独断专行。" },
  乙: { nature: "如花草藤蔓，柔韧灵活，善借势而行。", strength: "适应力强，善于合作，温和体贴，审时度势。", weakness: "优柔寡断，易受他人影响，缺乏主见。", advice: "培养独立判断力，在关键问题上坚持立场。" },
  丙: { nature: "如太阳烈火，热情奔放，感染力强。", strength: "乐观积极，才华外显，善于表达，充满正能量。", weakness: "三分钟热度，虚荣浮躁，不善理财。", advice: "培养持久力，注意积蓄，避免铺张浪费。" },
  丁: { nature: "如灯烛之火，温文内敛，洞察入微。", strength: "心思细腻，善于观察，重情重义，有艺术天赋。", weakness: "多愁善感，容易焦虑，过度敏感。", advice: "扩大心胸格局，减少内心纠结，多付诸行动。" },
  戊: { nature: "如高山大地，厚重稳实，包容万象。", strength: "踏实可靠，信守承诺，有大局观，厚积薄发。", weakness: "反应较慢，固执保守，不善表达情感。", advice: "适当提高灵活性，勇于尝试新事物。" },
  己: { nature: "如田园沃土，滋养万物，谦和包容。", strength: "温和善良，乐于助人，适应力强，注重细节。", weakness: "多虑多疑，缺乏自信，容易被人利用。", advice: "建立自信，设立边界，减少过度付出。" },
  庚: { nature: "如刀剑矿金，刚毅果断，义气分明。", strength: "意志坚决，执行力强，正义感强，勇于改革。", weakness: "锋芒太露，容易伤人，冲动急躁。", advice: "以柔克刚，学会以退为进，涵养包容心。" },
  辛: { nature: "如珠玉饰品，精致内敛，品味高雅。", strength: "审美力强，追求完美，心思灵巧，自尊心强。", weakness: "过于在意外表，挑剔苛刻，内心脆弱。", advice: "减少完美主义倾向，接纳不完美。" },
  壬: { nature: "如江河大海，奔放豪迈，智慧通达。", strength: "聪明机智，善于变通，胸怀宽广，有远见。", weakness: "不安定，好高骛远，情绪起伏大。", advice: "聚焦目标，控制冲动，持之以恒。" },
  癸: { nature: "如雨露甘泉，润物无声，聪慧灵敏。", strength: "直觉敏锐，善于学习，想象力丰富，适应力强。", weakness: "犹豫不决，缺乏行动力，容易悲观。", advice: "增强行动力，减少空想，培养乐观心态。" },
};

/* ── Element balance interpretations ── */
const ELEMENT_INTERPRETATIONS: Record<Element, {
  excess: string;
  deficient: string;
  balanced: string;
}> = {
  木: { excess: "木气过旺，性格偏刚直倔强，肝胆易出问题。宜以金修剪、以火泄秀。", deficient: "木气不足，缺乏决断力和生机，肝胆筋骨需养护。宜亲近草木，适当补木。", balanced: "木气适中，有生发力和仁爱之心，能规划善执行。" },
  火: { excess: "火气过旺，性急躁动，心血管需留意。宜以水制约、以土泄火。", deficient: "火气不足，缺少热情和行动力，心脏小肠需养护。宜适当运动，培养积极心态。", balanced: "火气适中，热情而不失理智，表达和礼仪得当。" },
  土: { excess: "土气过旺，性格固执迟钝，脾胃消化易出问题。宜以木疏通、以金泄土。", deficient: "土气不足，缺乏稳定性和包容力，脾胃需养护。宜规律作息饮食。", balanced: "土气适中，踏实稳重而不过分保守，信用良好。" },
  金: { excess: "金气过旺，刚硬肃杀，呼吸系统需留意。宜以火锻炼、以水泄金。", deficient: "金气不足，缺乏魄力和执行力，肺和大肠需养护。宜多做呼吸训练。", balanced: "金气适中，果断而不伤人，义气和原则兼顾。" },
  水: { excess: "水气过旺，聪明反被聪明误，肾和泌尿系统需留意。宜以土制约、以木泄水。", deficient: "水气不足，智慧和灵活性欠缺，肾和膀胱需养护。宜多饮水、静养心神。", balanced: "水气适中，智慧通达而不泛滥，进退有度。" },
};

/* ── Major Luck Cycle (大运) calculation ── */
function buildMajorLuckCycles(
  pillars: Record<string, string>,
  gender: "male" | "female",
): Array<{
  startAge: number;
  endAge: number;
  pillar: string;
  stem: string;
  branch: string;
  stemElement: Element;
  branchElement: Element;
  tenGod: string;
  summary: string;
}> {
  const yearStem = pillars.year.charAt(0);
  const yearYang = stemPolarity[yearStem] === "阳";
  const forward = (yearYang && gender === "male") || (!yearYang && gender === "female");

  const monthBranch = pillars.month.charAt(1);
  const monthStem = pillars.month.charAt(0);

  const branchIndex = BRANCHES.indexOf(monthBranch);
  const stemIndex = STEMS.indexOf(monthStem);

  const cycles: Array<{
    startAge: number;
    endAge: number;
    pillar: string;
    stem: string;
    branch: string;
    stemElement: Element;
    branchElement: Element;
    tenGod: string;
    summary: string;
  }> = [];

  const dayMaster = pillars.day.charAt(0);

  for (let i = 1; i <= 8; i++) {
    const bIdx = forward
      ? (branchIndex + i) % 12
      : (branchIndex - i + 12) % 12;
    const sIdx = forward
      ? (stemIndex + i) % 10
      : (stemIndex - i + 10) % 10;

    const branch = BRANCHES[bIdx];
    const stem = STEMS[sIdx];
    const pillar = `${stem}${branch}`;
    const sEl = stemElement[stem];
    const bEl = branchElement[branch];
    const god = tenGod(dayMaster, stem);
    const startAge = i * 10;

    cycles.push({
      startAge,
      endAge: startAge + 9,
      pillar,
      stem,
      branch,
      stemElement: sEl,
      branchElement: bEl,
      tenGod: god,
      summary: luckCycleSummary(dayMaster, stem, god),
    });
  }

  return cycles;
}

function luckCycleSummary(dayMaster: string, stem: string, god: string): string {
  const dmElement = stemElement[dayMaster];
  const sElement = stemElement[stem];
  const tips: string[] = [];

  if (god === "正官" || god === "七杀") {
    tips.push("事业、地位、压力临运");
  } else if (god === "正印" || god === "偏印") {
    tips.push("学业、贵人、保护力量增强");
  } else if (god === "正财" || god === "偏财") {
    tips.push("财运、务实、物质机会增多");
  } else if (god === "食神" || god === "伤官") {
    tips.push("才华表达、创作灵感活跃");
  } else if (god === "比肩" || god === "劫财") {
    tips.push("人际竞争、合作与独立并行");
  }

  if (generates(sElement, dmElement)) {
    tips.push("天干生扶日主，有贵人暗助");
  }
  if (controls(sElement, dmElement)) {
    tips.push("天干克制日主，注意外部约束");
  }

  return tips.join("；") || `${god}运，${sElement}气行干`;
}

/* ── Deity / Sha (神煞) calculation ── */
interface Deity {
  name: string;
  type: "吉" | "凶" | "中性";
  meaning: string;
}

function calcDeities(pillars: Record<string, string>): Deity[] {
  const dayBranch = pillars.day.charAt(1);
  const yearBranch = pillars.year.charAt(1);
  const monthBranch = pillars.month.charAt(1);
  const hourBranch = pillars.hour.charAt(1);
  const dayMaster = pillars.day.charAt(0);
  const allBranches = [yearBranch, monthBranch, dayBranch, hourBranch];
  const result: Deity[] = [];

  /* 天乙贵人 */
  const TIANYI: Record<string, string[]> = {
    甲: ["丑", "未"], 戊: ["丑", "未"],
    乙: ["子", "申"], 己: ["子", "申"],
    丙: ["亥", "酉"], 丁: ["亥", "酉"],
    庚: ["丑", "未"], 辛: ["寅", "午"],
    壬: ["卯", "巳"], 癸: ["卯", "巳"],
  };
  const tianyiSet = new Set(TIANYI[dayMaster] ?? []);
  if (allBranches.some((b) => tianyiSet.has(b))) {
    result.push({
      name: "天乙贵人",
      type: "吉",
      meaning: "逢凶化吉之神，主得贵人相助、社会地位较好。入命则聪明智慧、人缘佳。",
    });
  }

  /* 文昌 */
  const WENCHANG: Record<string, string> = {
    甲: "巳", 乙: "午", 丙: "申", 丁: "酉", 戊: "申", 己: "酉",
    庚: "亥", 辛: "子", 壬: "寅", 癸: "卯",
  };
  if (allBranches.includes(WENCHANG[dayMaster])) {
    result.push({
      name: "文昌",
      type: "吉",
      meaning: "主聪明好学、才华出众，利考试、文书、学术研究。",
    });
  }

  /* 驿马 */
  const YIMA: Record<string, string> = {
    子: "寅", 丑: "亥", 寅: "申", 卯: "巳", 辰: "寅", 巳: "亥",
    午: "申", 未: "巳", 申: "寅", 酉: "亥", 戌: "寅", 亥: "巳",
  };
  if (allBranches.includes(YIMA[dayBranch])) {
    result.push({
      name: "驿马",
      type: "中性",
      meaning: "主动态变化、远行搬迁、事业变动频繁。吉则迁升，凶则奔波。",
    });
  }

  /* 桃花 */
  const TAOHUA: Record<string, string> = {
    子: "酉", 丑: "午", 寅: "卯", 卯: "子", 辰: "酉", 巳: "午",
    午: "卯", 未: "子", 申: "酉", 酉: "午", 戌: "卯", 亥: "子",
  };
  if (allBranches.includes(TAOHUA[dayBranch])) {
    result.push({
      name: "桃花",
      type: "中性",
      meaning: "主异性缘佳、魅力出众。吉则人缘旺、感情丰富；凶则感情纠纷。",
    });
  }

  /* 华盖 */
  const HUAGAI: Record<string, string> = {
    子: "辰", 丑: "丑", 寅: "戌", 卯: "未", 辰: "辰", 巳: "丑",
    午: "戌", 未: "未", 申: "辰", 酉: "丑", 戌: "戌", 亥: "未",
  };
  if (allBranches.includes(HUAGAI[dayBranch])) {
    result.push({
      name: "华盖",
      type: "中性",
      meaning: "主孤高、好学、有宗教或艺术倾向。入命则才华内敛，喜独处深思。",
    });
  }

  /* 天德 */
  if (allBranches.includes("寅") && monthBranch === "寅") {
    result.push({ name: "天德", type: "吉", meaning: "月令带天德，主逢凶化吉、品德端正、贵人暗助。" });
  }

  /* 金舆 */
  const JINYU: Record<string, string> = {
    甲: "辰", 乙: "巳", 丙: "未", 丁: "申", 戊: "未", 己: "申",
    庚: "戌", 辛: "亥", 壬: "丑", 癸: "寅",
  };
  if (allBranches.includes(JINYU[dayMaster])) {
    result.push({
      name: "金舆",
      type: "吉",
      meaning: "主富贵安逸、车马之福，古代为乘车之贵人。现代可理解为生活品质较好。",
    });
  }

  /* 将星 */
  const JIANGXING: Record<string, string> = {
    子: "子", 丑: "酉", 寅: "午", 卯: "卯", 辰: "子", 巳: "酉",
    午: "午", 未: "卯", 申: "子", 酉: "酉", 戌: "午", 亥: "卯",
  };
  if (allBranches.includes(JIANGXING[dayBranch])) {
    result.push({
      name: "将星",
      type: "吉",
      meaning: "主领导才能、组织力强、有统率之能。入命则做事有魄力、可掌权柄。",
    });
  }

  /* 空亡 */
  const KONGWANG = calcKongWang(pillars.day);
  const kwHits = allBranches.filter((b) => KONGWANG.includes(b));
  if (kwHits.length > 0) {
    result.push({
      name: "空亡",
      type: "凶",
      meaning: `日柱${pillars.day}空亡为${kwHits.join("、")}。主虚无、不实、事与愿违之象，但入宗教哲学反主悟性高。`,
    });
  }

  return result;
}

function calcKongWang(dayPillar: string): string[] {
  const sixty = buildSixtyJiazi();
  const idx = sixty.indexOf(dayPillar);
  if (idx < 0) return [];
  const group = Math.floor(idx / 10);
  const startBranch = (group * 2) % 12;
  return [BRANCHES[startBranch], BRANCHES[(startBranch + 1) % 12]];
}

function buildSixtyJiazi(): string[] {
  const result: string[] = [];
  for (let i = 0; i < 60; i++) {
    result.push(`${STEMS[i % 10]}${BRANCHES[i % 12]}`);
  }
  return result;
}

/* ── Pattern (格局) detection ── */
function detectPattern(pillars: Record<string, string>): {
  name: string;
  description: string;
  advice: string;
} {
  const monthStem = pillars.month.charAt(0);
  const monthBranch = pillars.month.charAt(1);
  const dayMaster = pillars.day.charAt(0);
  const dmElement = stemElement[dayMaster];
  const monthBranchElement = branchElement[monthBranch];

  const hiddenStems = HIDDEN_STEMS[monthBranch] ?? [];
  const dominant = hiddenStems[0] ?? monthStem;
  const dominantElement = stemElement[dominant];

  // Check if day master is same as month branch element (得令)
  const sameElement = dmElement === monthBranchElement;

  // Determine the relationship between dominant hidden stem and day master
  const rel = elementRelation(dmElement, dominantElement);

  if (rel === "self") {
    return {
      name: "建禄格",
      description: `月令${monthBranch}与日主同属${dmElement}，日主得令而旺。`,
      advice: "身旺宜泄秀，以食伤或财星为用。若八字中食伤财星有力，则格局较高。",
    };
  }

  if (rel === "印") {
    return {
      name: "印格",
      description: `月令${monthBranch}藏干${dominant}为日主${dayMaster}之印星。`,
      advice: "印格宜见官杀以成官印相生或杀印相生之局，忌财星破印。",
    };
  }

  if (rel === "财") {
    return {
      name: sameElement ? "正财格" : "偏财格",
      description: `月令${monthBranch}藏干${dominant}为日主${dayMaster}之财星。`,
      advice: "财格宜身旺方能担财，见官星则财官双美，忌比劫夺财。",
    };
  }

  if (rel === "官") {
    return {
      name: sameElement ? "正官格" : "七杀格",
      description: `月令${monthBranch}藏干${dominant}为日主${dayMaster}之官杀。`,
      advice: "官杀格宜身旺，有印化杀则格局高。忌伤官见官。",
    };
  }

  if (rel === "食伤") {
    return {
      name: sameElement ? "食神格" : "伤官格",
      description: `月令${monthBranch}藏干${dominant}为日主${dayMaster}之食伤。`,
      advice: "食伤格宜配财星（食伤生财），才华可变现。伤官格最忌见正官。",
    };
  }

  return {
    name: "普通格局",
    description: `月令${monthBranch}藏干${dominant}与日主${dayMaster}无特殊格局关系，需综合全局分析。`,
    advice: "宜根据全局五行旺衰取用神，配合大运流年判断。",
  };
}

function elementRelation(dmElement: Element, otherElement: Element): string {
  if (dmElement === otherElement) return "self";
  if (generates(otherElement, dmElement)) return "印";
  if (generates(dmElement, otherElement)) return "食伤";
  if (controls(dmElement, otherElement)) return "财";
  if (controls(otherElement, dmElement)) return "官";
  return "other";
}

/* ── Day Master Strength (日主旺衰) ── */
function assessDayMasterStrength(
  pillars: Record<string, string>,
): {
  level: "身强" | "身弱" | "中和偏强" | "中和偏弱" | "中和";
  score: number;
  factors: string[];
} {
  const dayMaster = pillars.day.charAt(0);
  const dmElement = stemElement[dayMaster];
  const factors: string[] = [];
  let score = 0;

  // Month branch (月令) — most important
  const monthBranch = pillars.month.charAt(1);
  const monthElement = branchElement[monthBranch];
  if (monthElement === dmElement) {
    score += 3;
    factors.push(`月令${monthBranch}属${monthElement}，日主得令 (+3)`);
  } else if (generates(monthElement, dmElement)) {
    score += 2;
    factors.push(`月令${monthBranch}生扶日主 (+2)`);
  } else if (controls(dmElement, monthElement)) {
    score -= 1;
    factors.push(`月令${monthBranch}消耗日主 (-1)`);
  } else if (controls(monthElement, dmElement)) {
    score -= 3;
    factors.push(`月令${monthBranch}克制日主 (-3)`);
  } else {
    score -= 1;
    factors.push(`月令${monthBranch}与日主无关 (-1)`);
  }

  // Other pillars
  const otherKeys = ["year", "hour"] as const;
  for (const key of otherKeys) {
    const p = pillars[key];
    const s = p.charAt(0);
    const b = p.charAt(1);
    const sEl = stemElement[s];
    const bEl = branchElement[b];

    if (sEl === dmElement) { score += 1; factors.push(`${PILLAR_LABELS[key]}天干${s}为同类 (+1)`); }
    else if (generates(sEl, dmElement)) { score += 1; factors.push(`${PILLAR_LABELS[key]}天干${s}生扶日主 (+1)`); }
    else if (controls(sEl, dmElement)) { score -= 1; factors.push(`${PILLAR_LABELS[key]}天干${s}克制日主 (-1)`); }

    if (bEl === dmElement) { score += 0.5; factors.push(`${PILLAR_LABELS[key]}地支${b}为同类 (+0.5)`); }
    else if (generates(bEl, dmElement)) { score += 0.5; factors.push(`${PILLAR_LABELS[key]}地支${b}生扶日主 (+0.5)`); }
  }

  // Hidden stems in all branches
  for (const key of ["year", "month", "hour"] as const) {
    const branch = pillars[key].charAt(1);
    const hidden = HIDDEN_STEMS[branch] ?? [];
    for (const h of hidden) {
      if (h === dayMaster) { score += 0.5; }
      else if (generates(stemElement[h], dmElement)) { score += 0.5; }
    }
  }

  let level: "身强" | "身弱" | "中和偏强" | "中和偏弱" | "中和";
  if (score >= 4) level = "身强";
  else if (score >= 2) level = "中和偏强";
  else if (score >= 0) level = "中和";
  else if (score >= -2) level = "中和偏弱";
  else level = "身弱";

  return { level, score: Math.round(score * 10) / 10, factors };
}

/* ── Climate adjustment (调候) ── */
function climateNeeds(dayMaster: Element, monthBranch: string): {
  need: Element | null;
  description: string;
} {
  const monthEl = branchElement[monthBranch];

  if (dayMaster === "木") {
    if (monthEl === "水") return { need: "火", description: "冬月木寒，需火暖局，方有生机。" };
    if (monthEl === "火") return { need: "水", description: "夏月木燥，需水润泽，免枯焦。" };
    return { need: null, description: "木居适令，调候需求不急。" };
  }
  if (dayMaster === "火") {
    if (monthEl === "水") return { need: "木", description: "冬月火弱，需木生火以取暖。" };
    if (monthEl === "火") return { need: "水", description: "夏月火炎，需水制火以调和。" };
    return { need: null, description: "火居适令，调候需求不急。" };
  }
  if (dayMaster === "土") {
    if (monthEl === "水") return { need: "火", description: "冬月土寒，需火暖土。" };
    if (monthEl === "火") return { need: "水", description: "夏月土燥，需水润泽。" };
    return { need: null, description: "土居适令，调候需求不急。" };
  }
  if (dayMaster === "金") {
    if (monthEl === "水") return { need: "火", description: "冬月金寒，需火暖金以成器。" };
    if (monthEl === "火") return { need: "水", description: "夏月金熔，需水淬火降温。" };
    return { need: null, description: "金居适令，调候需求不急。" };
  }
  if (dayMaster === "水") {
    if (monthEl === "水") return { need: "火", description: "冬月水寒，需火暖局。" };
    if (monthEl === "火") return { need: "金", description: "夏月水枯，需金生水。" };
    return { need: null, description: "水居适令，调候需求不急。" };
  }
  return { need: null, description: "" };
}

/* ── Five-element balance summary ── */
function buildElementAnalysis(
  elements: Record<string, number>,
  dayMaster: string,
): Array<{
  element: Element;
  count: number;
  role: string;
  percentage: number;
  status: "excess" | "balanced" | "deficient" | "absent";
  interpretation: string;
}> {
  const total = Object.values(elements).reduce((a, b) => a + b, 0) || 1;
  const dmElement = stemElement[dayMaster];

  return ELEMENT_ORDER.map((el) => {
    const count = elements[el] ?? 0;
    const pct = Math.round((count / total) * 100);
    const role = elementRole(dayMaster, el);
    let status: "excess" | "balanced" | "deficient" | "absent";
    if (count === 0) status = "absent";
    else if (pct >= 30) status = "excess";
    else if (pct >= 10) status = "balanced";
    else status = "deficient";

    const interp = ELEMENT_INTERPRETATIONS[el];
    let interpretation = interp.balanced;
    if (status === "excess" && dmElement !== el) interpretation = interp.excess;
    if (status === "absent" || status === "deficient") interpretation = interp.deficient;
    if (status === "excess" && dmElement === el) interpretation = `${el}为日主本气，得势过旺。${interp.excess}`;

    return { element: el, count, role, percentage: pct, status, interpretation };
  });
}

/* ── Personality analysis ── */
function buildPersonalityAnalysis(
  dayMaster: string,
  strength: { level: string; score: number },
  elements: Record<string, number>,
): {
  archetype: string;
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  advice: string;
} {
  const dmTraits = DAY_MASTER_TRAITS[dayMaster];
  const dmElement = stemElement[dayMaster];
  const traits: string[] = [dmTraits.nature];

  // Add traits based on element balance
  for (const el of ELEMENT_ORDER) {
    const count = elements[el] ?? 0;
    const pct = count / 8;
    if (pct > 0.3) {
      traits.push(`${el}气偏重，增强与${el}相关的特质。`);
    }
  }

  // Add strength-related traits
  if (strength.level === "身强") {
    traits.push("日主身强，有主见有行动力，但也容易固执。");
  } else if (strength.level === "身弱") {
    traits.push("日主身弱，需借助外力和支持，善于合作但容易被动。");
  }

  return {
    archetype: `日主${dayMaster}（${dmElement}）`,
    traits,
    strengths: dmTraits.strength.split("，"),
    weaknesses: dmTraits.weakness.split("，"),
    advice: dmTraits.advice,
  };
}

/* ── Career / Wealth / Relationship / Health analysis ── */
function buildLifeAspects(
  dayMaster: string,
  strength: { level: string; score: number },
): {
  career: string;
  wealth: string;
  relationship: string;
  health: string;
} {
  const dmElement = stemElement[dayMaster];
  const isStrong = strength.level === "身强" || strength.level === "中和偏强";

  let career = "";
  let wealth = "";
  let relationship = "";
  let health = "";

  // Career based on day master element
  switch (dmElement) {
    case "木": career = "适合教育、文化、出版、农林、医药、环保、设计等领域。木主仁，适合需要创造力和成长力的职业。"; break;
    case "火": career = "适合传媒、演艺、电子、能源、餐饮、美妆、时尚等领域。火主礼，适合需要热情和表现力的职业。"; break;
    case "土": career = "适合房地产、建筑、农业、仓储、会计、公务员等领域。土主信，适合需要稳定和诚信的职业。"; break;
    case "金": career = "适合金融、法律、军警、机械、珠宝、IT硬件等领域。金主义，适合需要果断和纪律的职业。"; break;
    case "水": career = "适合贸易、物流、旅游、水产、传媒、咨询、策划等领域。水主智，适合需要灵活和沟通的职业。"; break;
  }

  // Wealth based on ten god relationship
  if (isStrong) {
    wealth = "日主身旺，有能力担财。适合主动出击、创业投资、积极拓展财源。偏财旺者适合投资和商业经营。";
  } else {
    wealth = "日主身弱，不宜独力承担风险。适合稳定薪资、合作经营、借助团队和贵人之力。先积累实力再图发展。";
  }

  // Relationship
  const genderNeutral = dmElement;
  if (isStrong) {
    relationship = `${genderNeutral}旺日主，感情中较为主动，但也需注意包容和退让。配偶星（官杀/财星）有力则感情顺利。`;
  } else {
    relationship = `${genderNeutral}弱日主，感情中偏向依赖，适合找互补型伴侣。印星旺者重精神交流，财官旺者重现实条件。`;
  }

  // Health
  switch (dmElement) {
    case "木": health = "木主肝胆、筋骨、眼睛。木旺注意肝火，木弱注意胆气不足。"; break;
    case "火": health = "火主心脏、小肠、血液、眼睛。火旺注意心血管，火弱注意血液循环。"; break;
    case "土": health = "土主脾胃、肌肉、口腔。土旺注意脾胃积滞，土弱注意消化不良。"; break;
    case "金": health = "金主肺、大肠、皮肤、骨骼。金旺注意呼吸道，金弱注意肺气虚。"; break;
    case "水": health = "水主肾、膀胱、耳朵、生殖。水旺注意肾湿，水弱注意肾气不足。"; break;
  }

  return { career, wealth, relationship, health };
}

/* ── Helper: compute ten god between any two characters ── */
function tenGod(dayMaster: string, otherStem: string): string {
  const relation = elementRole(dayMaster, stemElement[otherStem]);
  const samePolarity = stemPolarity[dayMaster] === stemPolarity[otherStem];
  switch (relation) {
    case "同类/比劫": return samePolarity ? "比肩" : "劫财";
    case "生我/印": return samePolarity ? "偏印" : "正印";
    case "我生/食伤": return samePolarity ? "食神" : "伤官";
    case "我克/财": return samePolarity ? "偏财" : "正财";
    case "克我/官杀": return samePolarity ? "七杀" : "正官";
    default: return "—";
  }
}

function elementRole(dayMaster: string, element: string): string {
  const masterElement = stemElement[dayMaster];
  if (!masterElement) return "待定";
  if (element === masterElement) return "同类/比劫";
  if (generates(element, masterElement)) return "生我/印";
  if (generates(masterElement, element)) return "我生/食伤";
  if (controls(masterElement, element)) return "我克/财";
  if (controls(element, masterElement)) return "克我/官杀";
  return "待定";
}

function generates(a: string, b: string): boolean {
  return (
    (a === "木" && b === "火") ||
    (a === "火" && b === "土") ||
    (a === "土" && b === "金") ||
    (a === "金" && b === "水") ||
    (a === "水" && b === "木")
  );
}

function controls(a: string, b: string): boolean {
  return (
    (a === "木" && b === "土") ||
    (a === "土" && b === "水") ||
    (a === "水" && b === "火") ||
    (a === "火" && b === "金") ||
    (a === "金" && b === "木")
  );
}

/* ── Build enhanced pillar list with hidden stems & ten gods ── */
function buildPillarList(pillars: Record<string, string>, dayMaster: string) {
  return Object.entries(pillars).map(([key, value]) => {
    const stem = value.charAt(0);
    const branch = value.charAt(1);
    const hidden = HIDDEN_STEMS[branch] ?? [];
    const hiddenWithGods = hidden.map((h) => ({
      stem: h,
      element: stemElement[h],
      polarity: stemPolarity[h],
      tenGod: key === "day" ? "日主" : tenGod(dayMaster, h),
    }));

    return {
      key,
      label: PILLAR_LABELS[key] ?? key,
      value,
      stem,
      branch,
      stemElement: stemElement[stem],
      stemPolarity: stemPolarity[stem],
      branchElement: branchElement[branch],
      branchPolarity: branchPolarity[branch],
      tenGod: key === "day" ? "日主" : tenGod(dayMaster, stem),
      hiddenStems: hiddenWithGods,
    };
  });
}

/* ── Build annual fortunes ── */
function buildAnnualFortunes(dayMaster: string, currentYear: number) {
  const years = Array.from({ length: 7 }, (_, index) => currentYear - 2 + index);
  return years.map((year) => {
    const pillar = getYearPillar(year);
    const stem = pillar.charAt(0);
    const branch = pillar.charAt(1);
    return {
      year,
      pillar,
      stem,
      branch,
      stemElement: stemElement[stem],
      branchElement: branchElement[branch],
      tenGod: tenGod(dayMaster, stem),
      isCurrent: year === currentYear,
      note: annualNote(dayMaster, stem, branch),
    };
  });
}

function annualNote(dayMaster: string, stem: string, branch: string): string {
  const god = tenGod(dayMaster, stem);
  const element = stemElement[stem];
  const notes: string[] = [`${god}透干，${element}气临年`];

  // Check clashes with day branch
  const dayBranchNote = "";
  void dayBranchNote;
  notes.push(`地支${branch}需结合原局合冲刑害再断`);
  return notes.join("。");
}

function getYearPillar(year: number): string {
  return Solar.fromYmdHms(year, 7, 1, 12, 0, 0).getLunar().getEightChar().getYear();
}

function getCurrentYear(timestamp?: string): number {
  const date = timestamp ? new Date(timestamp) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
}

/* ── Main compute function ── */
export interface BaziResult {
  error?: string;
  pillars: Record<string, string> | null;
  pillarList: ReturnType<typeof buildPillarList>;
  dayMaster: string;
  dayMasterElement: Element;
  dayMasterPolarity: "阳" | "阴";
  zodiac: string;
  lunarDate: string;
  summary: string;
  elements: Record<string, number>;
  elementAnalysis: ReturnType<typeof buildElementAnalysis>;
  strength: ReturnType<typeof assessDayMasterStrength>;
  pattern: ReturnType<typeof detectPattern>;
  climate: { need: Element | null; description: string };
  deities: Deity[];
  majorLuck: ReturnType<typeof buildMajorLuckCycles>;
  annualFortunes: ReturnType<typeof buildAnnualFortunes>;
  personality: ReturnType<typeof buildPersonalityAnalysis>;
  aspects: ReturnType<typeof buildLifeAspects>;
  classics: ReturnType<typeof selectBaziClassics>;
  combinations: string[];
}

export function computeBazi(input: EngineInput): BaziResult {
  if (!input.birthDate) {
    return {
      error: "birth_date_required",
      pillars: null,
      pillarList: [],
      dayMaster: "",
      dayMasterElement: "木",
      dayMasterPolarity: "阳",
      zodiac: "",
      lunarDate: "",
      summary: "",
      elements: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
      elementAnalysis: [],
      strength: { level: "中和", score: 0, factors: [] },
      pattern: { name: "", description: "", advice: "" },
      climate: { need: null, description: "" },
      deities: [],
      majorLuck: [],
      annualFortunes: [],
      personality: { archetype: "", traits: [], strengths: [], weaknesses: [], advice: "" },
      aspects: { career: "", wealth: "", relationship: "", health: "" },
      classics: [],
      combinations: [],
    };
  }

  const [y, m, d] = input.birthDate.split("-").map(Number);
  const timeParts = (input.birthTime ?? "12:00").split(":");
  const hour = Number(timeParts[0] ?? 12);
  const minute = Number(timeParts[1] ?? 0);

  const solar = Solar.fromYmdHms(y, m, d, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const pillars: Record<string, string> = {
    year: eightChar.getYear(),
    month: eightChar.getMonth(),
    day: eightChar.getDay(),
    hour: eightChar.getTime(),
  };

  const dayMaster = pillars.day.charAt(0);
  const elements = countElements(pillars);
  const currentYear = getCurrentYear(input.timestamp);
  const pillarList = buildPillarList(pillars, dayMaster);
  const elementAnalysis = buildElementAnalysis(elements, dayMaster);
  const strength = assessDayMasterStrength(pillars);
  const pattern = detectPattern(pillars);
  const dmElement = stemElement[dayMaster];
  const climate = climateNeeds(dmElement, pillars.month.charAt(1));
  const deities = calcDeities(pillars);
  const majorLuck = buildMajorLuckCycles(pillars, "male");
  const annualFortunes = buildAnnualFortunes(dayMaster, currentYear);
  const personality = buildPersonalityAnalysis(dayMaster, strength, elements);
  const aspects = buildLifeAspects(dayMaster, strength);
  const classics = selectBaziClassics(["总论", "月令", "五行", "日主", "格局"]);
  const combinations = detectCombinations(pillars);

  const lunarMonth = lunar.getMonth();
  const lunarDay = lunar.getDay();
  const lunarDate = `${lunar.getYearInChinese()}年${lunarMonth > 0 ? "" : "闰"}${Math.abs(lunarMonth)}月${lunarDay}日`;

  return {
    pillars,
    pillarList,
    dayMaster,
    dayMasterElement: dmElement,
    dayMasterPolarity: stemPolarity[dayMaster],
    zodiac: lunar.getYearShengXiao(),
    lunarDate,
    summary: `日主${dayMaster}（${dmElement}），四柱 ${pillars.year} ${pillars.month} ${pillars.day} ${pillars.hour}`,
    elements,
    elementAnalysis,
    strength,
    pattern,
    climate,
    deities,
    majorLuck,
    annualFortunes,
    personality,
    aspects,
    classics,
    combinations,
  };
}

/* ── Detect branch combinations in the chart ── */
function detectCombinations(pillars: Record<string, string>): string[] {
  const branches = [pillars.year.charAt(1), pillars.month.charAt(1), pillars.day.charAt(1), pillars.hour.charAt(1)];
  const labels = ["年支", "月支", "日支", "时支"];
  const found: string[] = [];

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const a = branches[i];
      const b = branches[j];
      const combo = BRANCH_SIX_COMBOS[a];
      if (combo && combo.partner === b) {
        found.push(`${labels[i]}${a}与${labels[j]}${b}六合，化${combo.element}`);
      }
      if (BRANCH_CLASHES[a] === b) {
        found.push(`${labels[i]}${a}与${labels[j]}${b}相冲`);
      }
    }
  }

  return found;
}

function countElements(pillars: Record<string, string>): Record<string, number> {
  const map: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const p of Object.values(pillars)) {
    const stem = p.charAt(0);
    const branch = p.charAt(1);
    if (stemElement[stem]) map[stemElement[stem]]++;
    if (branchElement[branch]) map[branchElement[branch]]++;
  }
  return map;
}
