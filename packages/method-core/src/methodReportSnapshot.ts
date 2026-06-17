import type {
  BaziCompatibilityResult,
  BaziResult,
  FengshuiResult,
  LiuyaoResult,
  LenormandResult,
  QimenResult,
  WesternResult,
  ZiweiResult,
} from "@atlas/engines/types";
import type { BaziInterpretResult, ReadingReport } from "@atlas/shared-types";
import type { QimenInterpretResult } from "@atlas/shared-types";
import type { DreamInterpretation } from "@atlas/api-core";
import { TRADITION_LABELS } from "@atlas/theme";

export type MethodCopilotReportSnapshot = {
  entryId?: string;
  source: "method" | "reading" | "module";
  methodId: string | null;
  title: string;
  summary?: string;
  body: string;
  generatedAt?: string;
};

function entryId(prefix: string, parts: Array<string | number | undefined | null>): string {
  const seed = parts
    .filter((part) => part != null && part !== "")
    .map(String)
    .join("-");
  return seed ? `${prefix}-${seed}` : `${prefix}-${Date.now()}`;
}

const MAX_BODY = 7000;

function truncate(text: string, max = MAX_BODY): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n\n…（报告已截断，仅保留前 ${max} 字）`;
}

function lines(...parts: Array<string | undefined | null | false>): string {
  return parts.filter(Boolean).join("\n");
}

export function buildBaziReportSnapshot(
  result: BaziResult,
  interpretation: BaziInterpretResult | null,
  name?: string,
): MethodCopilotReportSnapshot {
  const title = name?.trim() ? `八字命盘 · ${name.trim()}` : "八字命盘";
  const pillarText = result.pillarList
    .map(
      (p) =>
        `${p.label}：${p.value}（${p.stem}·${p.tenGod} / ${p.branch}，藏干 ${p.hiddenStems.map((h) => `${h.stem}·${h.tenGod}`).join(" ")}）`,
    )
    .join("\n");

  const body = truncate(
    lines(
      `摘要：${result.summary}`,
      `农历：${result.lunarDate} · 生肖：${result.zodiac}`,
      `格局：${result.pattern.name} — ${result.pattern.description}`,
      `日主旺衰：${result.strength.level}（${result.strength.score}）`,
      "",
      "四柱：",
      pillarText,
      "",
      "五行：",
      ...result.elementAnalysis.map((e) => `${e.element} ${e.count}个（${e.percentage}%）${e.role} — ${e.interpretation}`),
      result.combinations.length ? `\n合冲：\n${result.combinations.join("\n")}` : "",
      result.deities.length
        ? `\n神煞：\n${result.deities.map((d) => `${d.name}（${d.type}）：${d.meaning}`).join("\n")}`
        : "",
      "",
      `性格：${result.personality.archetype}`,
      ...result.personality.traits.map((t) => `特质：${t}`),
      "",
      "人生分析：",
      `事业：${result.aspects.career}`,
      `财运：${result.aspects.wealth}`,
      `感情：${result.aspects.relationship}`,
      `健康：${result.aspects.health}`,
      "",
      "大运：",
      ...result.majorLuck.slice(0, 8).map(
        (c) => `${c.startAge}-${c.endAge}岁 ${c.pillar}（${c.tenGod}）${c.summary ? ` — ${c.summary}` : ""}`,
      ),
      interpretation
        ? lines(
            "",
            "规则匹配解读：",
            interpretation.summary,
            ...interpretation.matchedPatterns.map((r) => `格局 ${r.name}：${r.meaning}`),
            ...interpretation.matchedCombos.map((r) => `十神组合 ${r.name}：${r.meaning}`),
            ...interpretation.luckInteractions.map((r) => `运势 ${r.name}：${r.meaning}`),
          )
        : "",
    ),
  );

  const generatedAt = new Date().toISOString();
  return {
    entryId: entryId("bazi", [result.pillarList.map((pillar) => pillar.value).join("")]),
    source: "method",
    methodId: "bazi",
    title,
    summary: result.summary,
    body,
    generatedAt,
  };
}

export function buildBaziRelationshipSnapshot(
  result: BaziCompatibilityResult,
  personAName = "甲",
  personBName = "乙",
): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      `关系类型：${result.relationshipType}`,
      `总评：${result.summary}`,
      "",
      `${personAName}：${result.personA.summary}`,
      `日主 ${result.personA.dayMaster}（${result.personA.dayMasterElement}）· ${result.personA.strength.level}`,
      "",
      `${personBName}：${result.personB.summary}`,
      `日主 ${result.personB.dayMaster}（${result.personB.dayMasterElement}）· ${result.personB.strength.level}`,
      "",
      "维度分析：",
      ...result.dimensions.map((d) => `${d.label}（${d.tone}）：${d.detail}`),
      "",
      `情感模式：${result.emotionPattern}`,
      `沟通风格：${result.communicationStyle}`,
      `长期稳定：${result.longTermStability}`,
      `吸引力：${result.attraction}`,
      "",
      "积极面：",
      ...result.highlights.positive.map((h) => `+ ${h}`),
      "挑战：",
      ...result.highlights.challenges.map((h) => `- ${h}`),
      "",
      "冲突来源：",
      ...result.conflictSources.map((c) => `· ${c}`),
      "现实风险：",
      ...result.practicalRisks.map((r) => `· ${r}`),
      "",
      "修复建议：",
      ...result.repairAdvice.map((a) => `· ${a}`),
    ),
  );

  const generatedAt = new Date().toISOString();
  return {
    entryId: entryId("bazi-rel", [
      result.personA.dayMaster,
      result.personB.dayMaster,
      result.relationshipType,
    ]),
    source: "method",
    methodId: "bazi-relationship",
    title: `八字缘合 · ${personAName} & ${personBName}`,
    summary: result.summary,
    body,
    generatedAt,
  };
}

export function buildTarotReportSnapshot(input: {
  question: string;
  spreadName: string;
  cards: Array<{ position: string; name: string; reversed: boolean }>;
  combo: string;
  interpretation: { summary?: string; pairMatches?: Array<{ meaning?: string }> } | null;
  drawId?: string;
}): MethodCopilotReportSnapshot {
  const cardLines = input.cards.map(
    (c) => `${c.position}：${c.name}${c.reversed ? "（逆位）" : "（正位）"}`,
  );
  const body = truncate(
    lines(
      `问题：${input.question.trim() || "当下趋势"}`,
      `牌阵：${input.spreadName}`,
      "",
      ...cardLines,
      "",
      `组合解释：${input.interpretation?.summary ?? input.combo}`,
      input.interpretation?.pairMatches?.length
        ? lines("", "组合规则：", ...input.interpretation.pairMatches.map((p) => p.meaning ?? ""))
        : "",
    ),
  );

  const generatedAt = new Date().toISOString();
  return {
    entryId: input.drawId ?? entryId("tarot", [input.cards.map((card) => card.name).join("+")]),
    source: "method",
    methodId: "tarot",
    title: "塔罗牌阵",
    summary: input.interpretation?.summary ?? input.combo,
    body,
    generatedAt,
  };
}

type IChingSnapshot = {
  primary: { name: string; number: number; judgment: string; image: string };
  changing: { name: string; number: number; judgment: string };
  summary: string;
};

export function buildIchingReportSnapshot(
  question: string,
  result: IChingSnapshot,
): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      `所问：${question || "未填写"}`,
      result.summary,
      `本卦 ${result.primary.name}：${result.primary.judgment}`,
      `象曰：${result.primary.image}`,
      `变卦 ${result.changing.name}：${result.changing.judgment}`,
    ),
  );

  return {
    entryId: entryId("iching", [result.primary.number, result.changing.number]),
    source: "method",
    methodId: "iching",
    title: `周易 · ${result.primary.name}卦`,
    summary: result.summary,
    body,
    generatedAt: new Date().toISOString(),
  };
}

export function buildLiuyaoReportSnapshot(
  question: string,
  subjectType: string,
  result: LiuyaoResult,
): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      `所问：${question || subjectType}`,
      `事项类型：${subjectType}`,
      `${result.primaryName}卦 → ${result.changedName}卦`,
      `${result.palace}宫 · 世${result.worldLine} 应${result.responseLine} · 用神${result.usefulGod}`,
      `日柱 ${result.dayStem}${result.dayBranch} · 月建 ${result.monthBranch}`,
      "",
      ...result.lines.map(
        (l) =>
          `${l.position}爻 ${l.branch}${l.stem} ${l.relative}${l.isWorld ? "·世" : ""}${l.isResponse ? "·应" : ""} — ${l.strength}${l.isMoving ? "（动）" : ""}`,
      ),
    ),
  );

  return {
    entryId: entryId("liuyao", [result.timestamp]),
    source: "method",
    methodId: "liuyao",
    title: `六爻 · ${result.primaryName}卦`,
    summary: `${result.primaryName} → ${result.changedName}，用神${result.usefulGod}`,
    body,
    generatedAt: result.timestamp,
  };
}

export function buildZiweiReportSnapshot(result: ZiweiResult): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      result.summary,
      `${result.lunarDate} · ${result.chineseDate} · ${result.fiveElementsClass}`,
      "",
      "十二宫：",
      ...result.palaces.map(
        (p) =>
          `${p.name}${p.isSoul ? "（命宫）" : ""}${p.isBody ? "（身宫）" : ""}：${p.majorStars.map((s) => s.name).join(" ") || "空宫"}`,
      ),
      result.decadals.length
        ? lines("", "大限：", ...result.decadals.slice(0, 8).map((d) => `${d.range[0]}-${d.range[1]}岁 · ${d.palace}`))
        : "",
    ),
  );

  const generatedAt = new Date().toISOString();
  return {
    entryId: entryId("ziwei", [result.chineseDate, result.lunarDate]),
    source: "method",
    methodId: "ziwei",
    title: "紫微斗数命盘",
    summary: result.summary,
    body,
    generatedAt,
  };
}

export function buildQimenReportSnapshot(
  question: string,
  questionType: string,
  chart: QimenResult,
  interpretation: QimenInterpretResult,
): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      `所问：${question || questionType}`,
      `事项类型：${questionType}`,
      `${chart.dun}${chart.ju}局 · ${chart.yuan} · ${chart.solarTerm}`,
      interpretation.summary,
      `四柱：${chart.pillars.year} ${chart.pillars.month} ${chart.pillars.day} ${chart.pillars.hour}`,
      `值符 ${chart.zhiFu} @ ${chart.zhiFuPalace} · 值使 ${chart.zhiShi} @ ${chart.zhiShiPalace}`,
      `空亡：${chart.kongWang.join("、")}`,
      interpretation.matchedPatterns.length
        ? lines("", "格局：", ...interpretation.matchedPatterns.map((p) => `${p.name}：${p.meaning}`))
        : "",
      interpretation.relations.length
        ? lines("", "关系：", ...interpretation.relations.map((r) => `${r.name}：${r.meaning}`))
        : "",
      interpretation.timingWindows.length
        ? lines(
            "",
            "应期：",
            ...interpretation.timingWindows.map((t) => `${t.label}（${t.range}）：${t.basis}`),
          )
        : "",
      interpretation.directionAdvice
        ? `方位：${interpretation.directionAdvice.palace} · ${interpretation.directionAdvice.direction} — ${interpretation.directionAdvice.spatial}`
        : "",
    ),
  );

  const generatedAt = new Date().toISOString();
  return {
    entryId: entryId("qimen", [chart.dun, chart.ju, chart.pillars.day, chart.pillars.hour]),
    source: "method",
    methodId: "qimen",
    title: `奇门遁甲 · ${chart.dun}${chart.ju}局`,
    summary: interpretation.summary,
    body,
    generatedAt,
  };
}

export function buildWesternReportSnapshot(result: WesternResult): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      result.summary,
      "",
      "行星落座：",
      ...result.planetList.map((p) => `${p.label} ${p.sign} 第${p.house}宫`),
      result.aspects?.length
        ? lines(
            "",
            "主要相位：",
            ...result.aspects.slice(0, 12).map((a) => `${a.planetA}-${a.planetB} ${a.aspect}`),
          )
        : "",
      result.transits?.length
        ? lines(
            "",
            "行运：",
            ...result.transits.slice(0, 8).map((t) => `${t.transitPlanet} ${t.aspect} ${t.natalPlanet} — ${t.reading}`),
          )
        : "",
    ),
  );

  const generatedAt = new Date().toISOString();
  return {
    entryId: entryId("western", [result.planetList.map((planet) => `${planet.label}${planet.sign}`).join("+")]),
    source: "method",
    methodId: "western",
    title: "西洋占星本命盘",
    summary: result.summary,
    body,
    generatedAt,
  };
}

export function buildFengshuiReportSnapshot(result: FengshuiResult): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      result.summary,
      `坐向 ${result.sittingMountain} · 向 ${result.facingMountain} · 第 ${result.period} 运`,
      result.mingGua ? `命卦 ${result.mingGua.gua} · ${result.mingGua.group}` : "",
      "",
      ...result.palaces.map((p) => `${p.direction}：${p.combined}（流年 ${p.annualStar}）`),
      "",
      "建议：",
      ...result.advice.map((a) => `· ${a}`),
    ),
  );

  const generatedAt = new Date().toISOString();
  return {
    entryId: entryId("fengshui", [result.sittingMountain, result.facingMountain, result.period]),
    source: "method",
    methodId: "fengshui",
    title: "风水飞星盘",
    summary: result.summary,
    body,
    generatedAt,
  };
}

export function buildLenormandReportSnapshot(
  question: string,
  spread: string,
  result: LenormandResult,
  readings: Array<{ card: { position: string; name: string; keywords: readonly string[] }; meaning: string }>,
): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      `问题：${question.trim() || "一般事项"}`,
      `牌阵：${spread}`,
      result.centerTheme ? `中心主题：${result.centerTheme}` : "",
      "",
      ...readings.map((r) => `${r.card.position} ${r.card.name}：${r.meaning}`),
      result.pairs.length ? lines("", "组合：", ...result.pairs.map((p) => `${p.cardA}+${p.cardB}：${p.reading}`)) : "",
    ),
  );

  const generatedAt = new Date().toISOString();
  return {
    entryId: entryId("lenormand", [spread, readings.map((reading) => reading.card.name).join("+")]),
    source: "method",
    methodId: "lenormand",
    title: "雷诺曼牌阵",
    summary: result.centerTheme,
    body,
    generatedAt,
  };
}

export function buildJiaobeiReportSnapshot(
  question: string,
  throws: Array<{ throwIndex: number; outcome: import("@atlas/engines/jiaobei").JiaobeiOutcome; cups: [string, string] }>,
): MethodCopilotReportSnapshot {
  const label = (outcome: import("@atlas/engines/jiaobei").JiaobeiOutcome) => {
    const map = { holy: "圣杯", laugh: "笑杯", yin: "阴杯" } as const;
    return map[outcome];
  };
  const body = truncate(
    lines(
      `问句：${question.trim() || "未指定"}`,
      `掷筊次数：${throws.length}`,
      "",
      ...throws.map(
        (t) =>
          `第 ${t.throwIndex} 掷 · ${label(t.outcome)}（${t.cups[0] === "yang" ? "阳" : "阴"} / ${t.cups[1] === "yang" ? "阳" : "阴"}）`,
      ),
    ),
  );
  const last = throws[throws.length - 1];
  return {
    entryId: entryId("jiaobei", [throws.length, last?.outcome]),
    source: "method",
    methodId: "jiaobei",
    title: "掷筊问卦",
    summary: last ? label(last.outcome) : undefined,
    body,
    generatedAt: new Date().toISOString(),
  };
}

export function buildRunesReportSnapshot(
  question: string,
  spread: string,
  result: import("@atlas/engines/runes").RunesResult,
): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      `问题：${question.trim() || "一般事项"}`,
      `阵式：${spread}`,
      "",
      ...result.runes.map(
        (r) => `${r.position} ${r.glyph} ${r.nameZh}（${r.name}）${r.reversed ? "逆位" : "正位"}：${r.keywords.join("、")}`,
      ),
    ),
  );
  return {
    entryId: entryId("runes", [spread, result.runes.map((r) => r.id).join("+")]),
    source: "method",
    methodId: "runes",
    title: "卢恩符文",
    summary: result.runes.map((r) => r.nameZh).join(" · "),
    body,
    generatedAt: new Date().toISOString(),
  };
}

export function buildAstrodiceReportSnapshot(
  question: string,
  result: import("@atlas/engines/astrodice").AstrodiceResult,
): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      `问题：${question.trim() || "一般事项"}`,
      "",
      result.syntaxLine,
      "",
      `行星：${result.planet.name} — ${result.planet.meaning}`,
      `星座：${result.sign.name} — ${result.sign.meaning}`,
      `宫位：${result.house.name} — ${result.house.meaning}`,
    ),
  );
  return {
    entryId: entryId("astrodice", [result.planet.id, result.sign.id, result.house.id]),
    source: "method",
    methodId: "astrodice",
    title: "占星骰子",
    summary: `${result.planet.name} · ${result.sign.name} · ${result.house.name}`,
    body,
    generatedAt: new Date().toISOString(),
  };
}

export function buildLotReportSnapshot(
  result: ReturnType<typeof import("@atlas/engines").drawLot>,
): MethodCopilotReportSnapshot {
  const { sign } = result;
  const body = truncate(
    lines(
      `第 ${sign.number} 签 · ${sign.grade} · ${sign.title}`,
      "",
      ...sign.poem.map((line) => line),
      sign.story ? `\n典故：${sign.story}` : "",
      "",
      `白话解曰：${sign.plainReading}`,
      "",
      "建议：",
      ...sign.advice.map((a) => `· ${a}`),
    ),
  );

  const generatedAt = new Date().toISOString();
  return {
    entryId: entryId("lot", [sign.number, sign.title]),
    source: "method",
    methodId: "lot",
    title: `签诗 · 第${sign.number}签`,
    summary: sign.plainReading,
    body,
    generatedAt,
  };
}

export function buildDreamReportSnapshot(
  dreamText: string,
  result: DreamInterpretation,
): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      `梦境原文：${dreamText}`,
      "",
      `中国梦占：${result.chinese}`,
      `荣格视角：${result.jungian}`,
      `精神反思：${result.reflection}`,
    ),
  );

  return {
    entryId: result.entryId,
    source: "method",
    methodId: "dream",
    title: "占梦解读",
    summary: result.chinese.slice(0, 120),
    body,
    generatedAt: result.createdAt,
  };
}

export function buildOracleReportSnapshot(
  question: string,
  result: import("@atlas/engines/oracle").OracleResult,
): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      `问题：${question.trim() || "一般事项"}`,
      result.theme ? `主题：${result.theme}` : "",
      "",
      ...result.cards.map((c) => `【${c.position}】${c.name}：${c.meaning}\n肯定语：${c.affirmation}`),
      "",
      result.summary,
    ),
  );
  return {
    entryId: entryId("oracle", [result.spread, result.cards.map((c) => c.id).join("+")]),
    source: "method",
    methodId: "oracle",
    title: "神谕卡",
    summary: result.summary,
    body,
    generatedAt: new Date().toISOString(),
  };
}

export function buildCoffeeReportSnapshot(
  question: string,
  result: import("@atlas/engines/coffee").CoffeeResult,
): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      `问题：${question.trim() || "一般事项"}`,
      "",
      ...result.zones.map((z) => z.reading),
      "",
      result.narrative,
    ),
  );
  return {
    entryId: entryId("coffee", [result.zones.map((z) => z.symbol.id).join("+")]),
    source: "method",
    methodId: "coffee",
    title: "咖啡渣占卜",
    summary: result.summary,
    body,
    generatedAt: new Date().toISOString(),
  };
}

export function buildScryingReportSnapshot(
  question: string,
  result: import("@atlas/engines/scrying").ScryingResult,
): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      `问题：${question.trim() || "一般事项"}`,
      `水晶：${result.crystal.name} — ${result.crystal.meaning}`,
      `颜色：${result.color.name} — ${result.color.meaning}`,
      `形状：${result.shape.name} — ${result.shape.meaning}`,
      `意象：${result.image.name} — ${result.image.meaning}`,
      "",
      result.meditation,
    ),
  );
  return {
    entryId: entryId("scrying", [result.crystal.id, result.color.name, result.shape.name]),
    source: "method",
    methodId: "scrying",
    title: "水晶凝视",
    summary: result.summary,
    body,
    generatedAt: new Date().toISOString(),
  };
}

export function buildNumerologyReportSnapshot(
  result: import("@atlas/engines/numerology").NumerologyResult,
): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      `姓名：${result.name} · 生日：${result.birthDate}`,
      `生命路径 ${result.lifePath}：${result.lifePathMeaning}`,
      `命运数 ${result.destiny}：${result.destinyMeaning}`,
      `个人年 ${result.personalYear}：${result.personalYearMeaning}`,
      "",
      result.summary,
    ),
  );
  return {
    entryId: entryId("numerology", [result.birthDate, result.name, result.personalYear]),
    source: "method",
    methodId: "numerology",
    title: "数字命理",
    summary: result.summary,
    body,
    generatedAt: new Date().toISOString(),
  };
}

export function buildGeomancyReportSnapshot(
  question: string,
  result: import("@atlas/engines/geomancy").GeomancyResult,
): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      `问题：${question.trim() || "一般事项"}`,
      "",
      `四母：${result.mothers.map((m) => m.name).join("、")}`,
      `用神宫：第${result.significator.house}宫 ${result.significator.label} · ${result.significator.figure.name}`,
      result.significator.reading,
      `审判图：${result.judge.name} — ${result.judge.meaning}`,
      `左见证：${result.witnesses[0]!.name} · 右见证：${result.witnesses[1]!.name}`,
      "",
      result.summary,
    ),
  );
  return {
    entryId: entryId("geomancy", [result.judge.key, result.seed.slice(0, 12)]),
    source: "method",
    methodId: "geomancy",
    title: "土占 Geomancy",
    summary: result.summary,
    body,
    generatedAt: new Date().toISOString(),
  };
}

export function buildMeihuaReportSnapshot(
  question: string,
  result: import("@atlas/engines/meihua").MeihuaResult,
): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      `问题：${question.trim() || "一般事项"}`,
      `上卦 ${result.upper.name}（${result.upper.element}）· 下卦 ${result.lower.name}（${result.lower.element}）`,
      `体 ${result.body.name} · 用 ${result.use.name}`,
      `体用关系：${result.relation}`,
      `互卦 ${result.mutualLower.name}${result.mutualUpper.name} · 变卦 ${result.changing.name}`,
      "",
      result.summary,
    ),
  );
  return {
    entryId: entryId("meihua", [result.upper.name, result.lower.name, result.changing.name]),
    source: "method",
    methodId: "meihua",
    title: "梅花易数",
    summary: result.summary,
    body,
    generatedAt: new Date().toISOString(),
  };
}

export function buildVedicReportSnapshot(
  result: import("@atlas/engines/vedic").VedicResult,
): MethodCopilotReportSnapshot {
  const grahaLines = result.grahas.map(
    (g) => `${g.label}：${g.sign} ${g.degree}° · ${g.houseName}`,
  );
  const body = truncate(
    lines(
      `出生：${result.birthDate} ${result.birthTime}${result.birthPlace ? ` · ${result.birthPlace}` : ""}`,
      `月亮星座：${result.moonSign}`,
      `月宿：${result.moonNakshatra.label} 第${result.moonNakshatra.pada}足`,
      `上升 Lagna：${result.ascendantSign} ${result.ascendantDegree}°`,
      `大运：${result.mahadashaLabel}（余约 ${result.mahadashaRemainingYears} 年）`,
      `小运：${result.antardashaLabel}（余约 ${result.antardashaRemainingYears} 年）`,
      "",
      "九星落宫：",
      ...grahaLines,
      "",
      result.note,
      result.summary,
    ),
  );
  return {
    entryId: entryId("vedic", [result.birthDate, result.birthTime, result.birthPlace ?? ""]),
    source: "method",
    methodId: "vedic",
    title: "印度占星",
    summary: result.summary,
    body,
    generatedAt: new Date().toISOString(),
  };
}

export function buildXiangmianReportSnapshot(
  question: string,
  result: import("@atlas/engines/xiangmian").XiangmianResult,
): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      `问题：${question.trim() || "整体气象"}`,
      "",
      ...result.readings.map((r) => `${r.observation}：${r.meaning}（${r.predictionUse}）`),
      "",
      ...result.advice.map((a) => `· ${a}`),
    ),
  );
  return {
    entryId: entryId("xiangmian", [result.readings.map((r) => r.observation).join("+")]),
    source: "method",
    methodId: "xiangmian",
    title: "面相",
    summary: result.summary,
    body,
    generatedAt: new Date().toISOString(),
  };
}

export function buildPalmistryReportSnapshot(
  question: string,
  result: import("@atlas/engines/palmistry").PalmistryResult,
): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      `问题：${question.trim() || "掌纹主题"}`,
      `手别：${result.hand}`,
      "",
      ...result.readings.map((r) => `${r.observation}：${r.meaning}（${r.predictionUse}）`),
      "",
      ...result.advice.map((a) => `· ${a}`),
    ),
  );
  return {
    entryId: entryId("palmistry", [result.hand, result.readings.map((r) => r.observation).join("+")]),
    source: "method",
    methodId: "palmistry",
    title: "手相",
    summary: result.summary,
    body,
    generatedAt: new Date().toISOString(),
  };
}

export type ModuleDraftReading = {
  context: string;
  subjectType: string;
  predictionWindow: string;
  mode: { label: string };
  selectedSymbols: Array<{ name: string; meaning: string; predictionUse: string }>;
  sections: Array<{ title: string; body: string }>;
  axes: Array<{ axis: string; reading: string }>;
  advice: string[];
};

export function buildModuleDraftSnapshot(
  methodId: string,
  moduleTitle: string,
  draft: ModuleDraftReading,
): MethodCopilotReportSnapshot {
  const body = truncate(
    lines(
      `事项：${draft.context}`,
      `类型：${draft.subjectType} · 窗口：${draft.predictionWindow}`,
      `模式：${draft.mode.label}`,
      "",
      "主象：",
      ...draft.selectedSymbols.map((s) => `${s.name}：${s.meaning}（${s.predictionUse}）`),
      "",
      "预测维度：",
      ...draft.axes.map((a) => `${a.axis}：${a.reading}`),
      "",
      "输出段落：",
      ...draft.sections.map((s) => `【${s.title}】\n${s.body}`),
      "",
      "建议：",
      ...draft.advice.map((a) => `· ${a}`),
    ),
  );

  const generatedAt = new Date().toISOString();
  return {
    entryId: entryId("module", [methodId, draft.context.slice(0, 48), draft.predictionWindow]),
    source: "module",
    methodId,
    title: `${moduleTitle} · 预测草稿`,
    summary: draft.context.slice(0, 120),
    body,
    generatedAt,
  };
}

export function buildReadingReportSnapshot(report: ReadingReport): MethodCopilotReportSnapshot {
  const summarySection = report.sections.find((s) => s.type === "summary");
  const adviceSection = report.sections.find((s) => s.type === "advice");
  const cautionsSection = report.sections.find((s) => s.type === "cautions");
  const traditionSections = report.sections.filter((s) => s.type === "tradition_analysis");

  const body = truncate(
    lines(
      summarySection ? `结论摘要：${summarySection.content}` : "",
      `共识：${report.consensus}`,
      `分歧：${report.divergence}`,
      "",
      "各体系解读：",
      ...traditionSections.map((s) => {
        const label = s.tradition ? TRADITION_LABELS[s.tradition] ?? s.tradition : s.title;
        return `【${label}】\n${s.content}`;
      }),
      adviceSection ? `\n行动建议：\n${adviceSection.content}` : "",
      cautionsSection ? `\n风险提醒：\n${cautionsSection.content}` : "",
      report.citations.length
        ? lines("", "古籍引用：", ...report.citations.map((c) => `${c.original.slice(0, 80)} — ${c.translationZh.slice(0, 120)}`))
        : "",
    ),
  );

  const traditionsLabel = report.traditions.map((t) => TRADITION_LABELS[t] ?? t).join(" · ");

  return {
    entryId: report.readingId,
    source: "reading",
    methodId: report.traditions[0] ?? null,
    title: `对照报告 · ${traditionsLabel}`,
    summary: summarySection?.content ?? report.consensus,
    body,
    generatedAt: report.createdAt,
  };
}

export const DEFAULT_ANALYSIS_PROMPT = "请结合当前页面报告，生成一份详细、结构化的解析。";

export const REPORT_QUICK_PROMPTS = [
  "解析本次报告",
  "用初学者能懂的话重讲一遍",
  "这份结果最大的风险点是什么？",
] as const;
