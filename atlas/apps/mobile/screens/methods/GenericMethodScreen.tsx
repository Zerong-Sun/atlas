import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  castGeomancy,
  castMeihua,
  castScryingVision,
  computeNumerology,
  drawOracle,
  readCoffeeGrounds,
  readPalmistry,
  readXiangmian,
  type GeomancyResult,
  type GeomancyQuestionType,
  type MeihuaResult,
  type NumerologyResult,
  type OracleResult,
  type CoffeeResult,
  type ScryingResult,
  type PalmistryResult,
  type XiangmianResult,
} from "@atlas/engines";
import { buildVedicChart, type VedicEphemerisData, type VedicGrahaKey, type VedicResult } from "@atlas/engines/vedic";
import {
  buildCoffeeReportSnapshot,
  buildGeomancyReportSnapshot,
  buildMeihuaReportSnapshot,
  buildNumerologyReportSnapshot,
  buildOracleReportSnapshot,
  buildPalmistryReportSnapshot,
  buildScryingReportSnapshot,
  buildVedicReportSnapshot,
  buildXiangmianReportSnapshot,
  type MethodCopilotReportSnapshot,
} from "@atlas/method-core";
import { getMethod, getMethodExperience } from "@atlas/method-data";
import { getLocalizedMethodName } from "@atlas/method-data";
import { MethodGuideCard } from "@/components/MethodGuideCard";
import { MethodHero } from "@/components/MethodHero";
import { MethodResultActions } from "@/components/MethodResultActions";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useApp } from "@/context/AppContext";
import { useMethodDraft } from "@/hooks/useMethodDraft";
import { usePersistMethodReading } from "@/hooks/usePersistMethodReading";
import { useUiPrefs } from "@/hooks/useUiPrefs";
import { buildMethodReadingEntryId } from "@/lib/methodReadings";
import { colors, radius, spacing } from "@/constants/theme";

type GenericMethodId =
  | "meihua"
  | "vedic"
  | "numerology"
  | "geomancy"
  | "xiangmian"
  | "palmistry"
  | "oracle"
  | "coffee"
  | "scrying";

type Draft = {
  question: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  mode: "single" | "three" | "number" | "time";
  numA: string;
  numB: string;
  observations: string[];
  hand: "left" | "right" | "both";
  crystalId: string;
  geomancyQuestionType: GeomancyQuestionType;
};

type GenericResult =
  | MeihuaResult
  | VedicResult
  | NumerologyResult
  | GeomancyResult
  | XiangmianResult
  | PalmistryResult
  | OracleResult
  | CoffeeResult
  | ScryingResult;

const DEFAULT_DRAFT: Draft = {
  question: "",
  name: "",
  birthDate: "1990-06-15",
  birthTime: "12:00",
  birthPlace: "",
  mode: "three",
  numA: "3",
  numB: "7",
  observations: [],
  hand: "right",
  crystalId: "quartz",
  geomancyQuestionType: "general",
};

const OBSERVATIONS: Record<"xiangmian" | "palmistry", string[]> = {
  xiangmian: ["中停-匀称", "眼神-清亮", "气色-红润", "眉形-平顺", "鼻相-匀称", "口相-收敛"],
  palmistry: ["智慧线-平直", "感情线-深长", "生命线-深长", "事业线-清晰", "金星丘-饱满", "太阳线-明显"],
};

const CRYSTALS = [
  { id: "quartz", label: "白水晶" },
  { id: "amethyst", label: "紫水晶" },
  { id: "obsidian", label: "黑曜石" },
  { id: "rose", label: "粉晶" },
  { id: "citrine", label: "黄水晶" },
];

const GEOMANCY_QUESTION_TYPES: Array<[GeomancyQuestionType, string]> = [
  ["general", "综合"],
  ["career", "事业"],
  ["relationship", "关系"],
  ["money", "金钱"],
  ["home", "家庭"],
  ["health", "健康"],
  ["travel", "远行"],
  ["study", "学习"],
];

function isGenericMethodId(value: string): value is GenericMethodId {
  return ["meihua", "vedic", "numerology", "geomancy", "xiangmian", "palmistry", "oracle", "coffee", "scrying"].includes(value);
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function approxVedicEphemeris(seed: string): VedicEphemerisData {
  const base = hashSeed(seed);
  const grahaLongitudes = {} as Record<VedicGrahaKey, number>;
  const keys: VedicGrahaKey[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  keys.forEach((key, index) => {
    grahaLongitudes[key] = ((base / (index + 3)) + index * 37.7) % 360;
  });
  grahaLongitudes.Ketu = (grahaLongitudes.Rahu + 180) % 360;
  return {
    julianDay: base,
    ayanamsa: 24,
    ascendantLongitude: (base / 11) % 360,
    midheavenLongitude: (base / 17) % 360,
    grahaLongitudes,
  };
}

function primaryActionLabel(methodId: GenericMethodId, hasResult: boolean) {
  if (methodId === "numerology") return hasResult ? "重新计算" : "计算";
  if (methodId === "vedic") return hasResult ? "重新生成" : "生成基础盘";
  return hasResult ? "重新推演" : "开始";
}

function guideSteps(methodId: GenericMethodId): string[] {
  if (methodId === "numerology") return ["输入生日与姓名，生成生命路径、命运数与个人年。", "输入会自动保存，下次打开会恢复。", "结果可归档并交给解读助手继续追问。"];
  if (methodId === "vedic") return ["Mobile 当前生成基础移动版星盘，不替代 Web 端精密星历。", "出生档案会自动带入，可在此页临时调整。", "结果会保存到档案记忆，方便后续追问。"];
  if (methodId === "xiangmian" || methodId === "palmistry") return ["选择你自己观察到的部位特征。", "本功能不做照片识别、医疗判断或外貌价值判断。", "可用撤回回到上一轮观察组合。"];
  return ["先写下问题或主题，再选择必要参数。", "点击开始后会生成结果并保存到档案。", "误操作可以撤回上一轮结果，输入草稿会自动恢复。"];
}

function buildResult(methodId: GenericMethodId, draft: Draft): GenericResult {
  const question = draft.question.trim() || undefined;
  const seed = `${Date.now()}-${methodId}-${draft.question}-${draft.mode}-${draft.numA}-${draft.numB}`;

  switch (methodId) {
    case "meihua":
      return castMeihua({
        seed,
        question,
        mode: draft.mode === "time" ? "time" : "number",
        numbers: draft.mode === "time" ? undefined : [Number(draft.numA) || 1, Number(draft.numB) || 1],
        timestamp: draft.mode === "time" ? new Date().toISOString() : undefined,
      });
    case "numerology":
      return computeNumerology({ birthDate: draft.birthDate, name: draft.name.trim() || "Seeker" });
    case "geomancy":
      return castGeomancy({ seed, question, questionType: draft.geomancyQuestionType });
    case "xiangmian":
      return readXiangmian({ question, observations: draft.observations.length ? draft.observations : OBSERVATIONS.xiangmian.slice(0, 2) });
    case "palmistry":
      return readPalmistry({ question, hand: draft.hand, observations: draft.observations.length ? draft.observations : OBSERVATIONS.palmistry.slice(0, 2) });
    case "oracle":
      return drawOracle({ seed, question, theme: draft.question, spread: draft.mode === "single" ? "single" : "three" });
    case "coffee":
      return readCoffeeGrounds({ seed, question });
    case "scrying":
      return castScryingVision({ seed, question, crystalId: draft.crystalId });
    case "vedic":
      return buildVedicChart(approxVedicEphemeris(`${draft.birthDate}-${draft.birthTime}-${draft.birthPlace}`), {
        birthDate: draft.birthDate,
        birthTime: draft.birthTime,
        birthPlace: draft.birthPlace,
        timezone: 8,
      });
  }
}

function buildSnapshot(methodId: GenericMethodId, draft: Draft, result: GenericResult): MethodCopilotReportSnapshot {
  switch (methodId) {
    case "meihua":
      return buildMeihuaReportSnapshot(draft.question, result as MeihuaResult);
    case "numerology":
      return buildNumerologyReportSnapshot(result as NumerologyResult);
    case "geomancy":
      return buildGeomancyReportSnapshot(draft.question, result as GeomancyResult);
    case "xiangmian":
      return buildXiangmianReportSnapshot(draft.question, result as XiangmianResult);
    case "palmistry":
      return buildPalmistryReportSnapshot(draft.question, result as PalmistryResult);
    case "oracle":
      return buildOracleReportSnapshot(draft.question, result as OracleResult);
    case "coffee":
      return buildCoffeeReportSnapshot(draft.question, result as CoffeeResult);
    case "scrying":
      return buildScryingReportSnapshot(draft.question, result as ScryingResult);
    case "vedic":
      return buildVedicReportSnapshot(result as VedicResult);
  }
}

function summaryRows(methodId: GenericMethodId, result: GenericResult): Array<{ label: string; value: string; detail?: string }> {
  switch (methodId) {
    case "meihua": {
      const r = result as MeihuaResult;
      return [
        { label: "本卦", value: `上${r.upper.name}下${r.lower.name}`, detail: r.summary },
        { label: "体用", value: `体${r.body.name} · 用${r.use.name}`, detail: r.relation },
        { label: "变卦", value: r.changing.name, detail: r.changing.meaning },
      ];
    }
    case "numerology": {
      const r = result as NumerologyResult;
      return [
        { label: "生命路径", value: String(r.lifePath), detail: r.lifePathMeaning },
        { label: "命运数", value: String(r.destiny), detail: r.destinyMeaning },
        { label: "个人年", value: String(r.personalYear), detail: r.personalYearMeaning },
      ];
    }
    case "geomancy": {
      const r = result as GeomancyResult;
      return [
        {
          label: `用神宫 · 第${r.significator.house}宫`,
          value: r.significator.figure.name,
          detail: r.significator.reading,
        },
        { label: "审判图", value: r.judge.name, detail: r.judge.meaning },
        { label: "左见证", value: r.witnesses[0]?.name ?? "—", detail: r.witnesses[0]?.meaning },
        { label: "右见证", value: r.witnesses[1]?.name ?? "—", detail: r.witnesses[1]?.meaning },
      ];
    }
    case "oracle":
      return (result as OracleResult).cards.map((card) => ({ label: card.position, value: card.name, detail: `${card.meaning}。${card.affirmation}` }));
    case "coffee":
      return (result as CoffeeResult).zones.map((zone) => ({ label: zone.zoneLabel, value: zone.symbol.name, detail: zone.reading }));
    case "scrying": {
      const r = result as ScryingResult;
      return [
        { label: "水晶", value: r.crystal.name, detail: r.crystal.meaning },
        { label: "颜色", value: r.color.name, detail: r.color.meaning },
        { label: "意象", value: r.image.name, detail: r.meditation },
      ];
    }
    case "vedic": {
      const r = result as VedicResult;
      return [
        { label: "月亮", value: r.moonSign, detail: `${r.moonNakshatra.label} 第${r.moonNakshatra.pada}足` },
        { label: "上升", value: r.ascendantSign, detail: `${r.ascendantDegree}°` },
        { label: "大运", value: r.mahadashaLabel, detail: r.summary },
      ];
    }
    case "xiangmian":
    case "palmistry":
      return (result as XiangmianResult | PalmistryResult).readings.map((reading) => ({
        label: reading.observation,
        value: reading.meaning,
        detail: reading.predictionUse,
      }));
  }
}

function resultSummary(result: GenericResult): string {
  if ("summary" in result && typeof result.summary === "string") return result.summary;
  return "已生成结果。";
}

export function GenericMethodScreen() {
  const { methodId: paramMethodId } = useLocalSearchParams<{ methodId: string }>();
  const rawMethodId = paramMethodId ?? "";
  const methodId: GenericMethodId = isGenericMethodId(rawMethodId) ? rawMethodId : "oracle";
  const method = getMethod(methodId);
  const experience = getMethodExperience(methodId);
  const { profile } = useApp();
  const { prefs } = useUiPrefs();
  const localizedTitle = getLocalizedMethodName(methodId, prefs.locale);
  const initial = useMemo<Draft>(
    () => ({
      ...DEFAULT_DRAFT,
      name: profile?.displayName ?? "",
      birthDate: profile?.birthDate ?? DEFAULT_DRAFT.birthDate,
      birthTime: profile?.birthTime ?? DEFAULT_DRAFT.birthTime,
      birthPlace: profile?.birthPlace ?? "",
    }),
    [profile],
  );
  const [draft, updateDraft] = useMethodDraft<Draft>(methodId, initial);
  const [result, setResult] = useState<GenericResult | null>(null);
  const [previous, setPrevious] = useState<GenericResult | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);

  const snapshot = useMemo(
    () => (result ? buildSnapshot(methodId, draft, result) : null),
    [methodId, draft, result],
  );

  usePersistMethodReading({
    snapshot,
    payload: result
      ? {
          methodId,
          question: draft.question.trim() || undefined,
          inputs: { ...draft },
          result,
        }
      : null,
    entryId: entryId ?? undefined,
    ready: Boolean(result),
  });

  const run = () => {
    setPrevious(result);
    setResult(buildResult(methodId, draft));
    setEntryId(buildMethodReadingEntryId(methodId));
  };

  const undo = () => {
    if (!previous) return;
    setResult(previous);
    setPrevious(null);
    setEntryId(buildMethodReadingEntryId(methodId));
  };

  const toggleObservation = (value: string) => {
    const next = draft.observations.includes(value)
      ? draft.observations.filter((item) => item !== value)
      : [...draft.observations, value];
    updateDraft({ observations: next });
  };

  return (
    <Screen scroll>
      <MethodHero
        methodId={methodId}
        kicker={method?.tradition ?? "METHOD"}
        title={localizedTitle ?? method?.title ?? methodId}
        description={method?.subtitle ?? "移动端占法工作台"}
      />
      {method ? (
        <View style={styles.cultureNote}>
          {localizedTitle && localizedTitle !== method.title ? (
            <Text variant="caption" gold>
              {method.title}
            </Text>
          ) : null}
          <Text variant="caption" gold>
            {method.civilization}
          </Text>
          <Text variant="body" muted>
            {method.culturalNote}
          </Text>
          <Text variant="caption" muted>
            {method.questionStyle}
          </Text>
        </View>
      ) : null}

      <MethodGuideCard methodId={methodId} steps={guideSteps(methodId)} />

      <View style={[styles.workbench, { borderColor: experience.accentColor }]}>
        {methodId !== "numerology" && methodId !== "vedic" ? (
          <Field label="问题 / 主题" value={draft.question} onChangeText={(question) => updateDraft({ question })} multiline />
        ) : null}

        {methodId === "numerology" || methodId === "vedic" ? (
          <>
            {methodId === "numerology" ? (
              <Field label="姓名（拼音或英文）" value={draft.name} onChangeText={(name) => updateDraft({ name })} />
            ) : null}
            <Field label="出生日期" value={draft.birthDate} onChangeText={(birthDate) => updateDraft({ birthDate })} placeholder="YYYY-MM-DD" />
            <Field label="出生时间" value={draft.birthTime} onChangeText={(birthTime) => updateDraft({ birthTime })} placeholder="HH:mm" />
            {methodId === "vedic" ? (
              <Field label="出生地点" value={draft.birthPlace} onChangeText={(birthPlace) => updateDraft({ birthPlace })} placeholder="城市" />
            ) : null}
          </>
        ) : null}

        {methodId === "meihua" ? (
          <>
            <ChipRow
              items={[
                ["number", "数字取卦"],
                ["time", "时间取卦"],
              ]}
              value={draft.mode}
              onChange={(mode) => updateDraft({ mode: mode as Draft["mode"] })}
            />
            {draft.mode !== "time" ? (
              <View style={styles.twoCols}>
                <Field label="上卦数" value={draft.numA} onChangeText={(numA) => updateDraft({ numA })} keyboardType="numeric" />
                <Field label="下卦数" value={draft.numB} onChangeText={(numB) => updateDraft({ numB })} keyboardType="numeric" />
              </View>
            ) : null}
          </>
        ) : null}

        {methodId === "oracle" ? (
          <ChipRow
            items={[
              ["single", "单卡"],
              ["three", "三卡"],
            ]}
            value={draft.mode}
            onChange={(mode) => updateDraft({ mode: mode as Draft["mode"] })}
          />
        ) : null}

        {methodId === "scrying" ? (
          <ChipRow items={CRYSTALS.map((c) => [c.id, c.label])} value={draft.crystalId} onChange={(crystalId) => updateDraft({ crystalId })} />
        ) : null}

        {methodId === "geomancy" ? (
          <>
            <Text variant="label">问题类型</Text>
            <ChipRow
              items={GEOMANCY_QUESTION_TYPES}
              value={draft.geomancyQuestionType}
              onChange={(geomancyQuestionType) => updateDraft({ geomancyQuestionType: geomancyQuestionType as GeomancyQuestionType })}
            />
          </>
        ) : null}

        {methodId === "palmistry" ? (
          <ChipRow
            items={[
              ["right", "右手"],
              ["left", "左手"],
              ["both", "双手"],
            ]}
            value={draft.hand}
            onChange={(hand) => updateDraft({ hand: hand as Draft["hand"] })}
          />
        ) : null}

        {methodId === "xiangmian" || methodId === "palmistry" ? (
          <View style={styles.chipWrap}>
            {OBSERVATIONS[methodId].map((item) => (
              <Pressable
                key={item}
                style={[styles.chip, draft.observations.includes(item) && styles.chipActive]}
                onPress={() => toggleObservation(item)}
              >
                <Text variant="caption" style={draft.observations.includes(item) ? styles.chipTextActive : undefined}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <Button title={primaryActionLabel(methodId, Boolean(result))} onPress={run} />
          <Button title="撤回" variant="secondary" onPress={undo} disabled={!previous} />
        </View>
      </View>

      {result ? (
        <View style={styles.result}>
          <MethodResultActions methodId={methodId} />
          <MethodResultVisual methodId={methodId} result={result} />
          <Text variant="heading">{resultSummary(result)}</Text>
          <View style={styles.grid}>
            {summaryRows(methodId, result).map((row) => (
              <View key={`${row.label}-${row.value}`} style={styles.card}>
                <Text variant="label" gold>
                  {row.label}
                </Text>
                <Text variant="heading">{row.value}</Text>
                {row.detail ? (
                  <Text variant="caption" muted>
                    {row.detail}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
          {methodId === "vedic" ? (
            <Text variant="caption" muted style={styles.note}>
              Mobile 端当前为基础盘归档版；精密 Swiss Ephemeris 计算仍建议使用 Web 端。
            </Text>
          ) : null}
          {methodId === "geomancy" ? (
            <Text variant="caption" muted style={styles.note}>
              法庭图读法：先看用神宫对应的现实领域，再用左右见证判断过程和外部佐证，审判图是最终收束。
            </Text>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

function MethodResultVisual({ methodId, result }: { methodId: GenericMethodId; result: GenericResult }) {
  if (methodId === "meihua") {
    const r = result as MeihuaResult;
    return (
      <View style={styles.visualPanel}>
        <View style={styles.hexStack}>
          {[...r.upper.lines, ...r.lower.lines].reverse().map((isYang, index) => (
            <View key={`${index}-${isYang}`} style={styles.hexLineWrap}>
              {isYang ? (
                <View style={styles.hexLine} />
              ) : (
                <View style={styles.brokenLine}>
                  <View style={styles.brokenHalf} />
                  <View style={styles.brokenHalf} />
                </View>
              )}
            </View>
          ))}
        </View>
        <View style={styles.visualText}>
          <Text variant="label" gold>
            体用生克
          </Text>
          <Text variant="body">{r.body.name} / {r.use.name}</Text>
          <Text variant="caption" muted>{r.relation}</Text>
        </View>
      </View>
    );
  }

  if (methodId === "geomancy") {
    const r = result as GeomancyResult;
    return (
      <View style={[styles.visualPanel, styles.geomancyPanel]}>
        <View style={styles.geomancyFocus}>
          <Text variant="caption" gold numberOfLines={1}>第{r.significator.house}宫</Text>
          <Text variant="body" numberOfLines={1}>{r.significator.figure.name}</Text>
          <Text variant="caption" muted numberOfLines={2}>{r.significator.label}</Text>
        </View>
        {[...r.mothers.slice(0, 2), ...r.witnesses, r.judge].map((figure) => (
          <View key={`${figure.key}-${figure.name}`} style={styles.geomancyFigure}>
            <Text variant="caption" gold numberOfLines={1}>{figure.name}</Text>
            {figure.lines.map((oneDot, index) => (
              <View key={index} style={styles.dotRow}>
                <View style={styles.dot} />
                {!oneDot ? <View style={styles.dot} /> : null}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  }

  if (methodId === "numerology") {
    const r = result as NumerologyResult;
    return (
      <View style={styles.orbRow}>
        <NumberOrb label="路径" value={r.lifePath} />
        <NumberOrb label="命运" value={r.destiny} />
        <NumberOrb label="个人年" value={r.personalYear} />
      </View>
    );
  }

  if (methodId === "oracle") {
    const r = result as OracleResult;
    return (
      <View style={styles.cardSpread}>
        {r.cards.map((card) => (
          <View key={`${card.id}-${card.position}`} style={styles.oracleCard}>
            <Text variant="caption" gold>{card.position}</Text>
            <Text variant="heading">{card.name}</Text>
            <Text variant="caption" muted numberOfLines={3}>{card.meaning}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (methodId === "coffee") {
    const r = result as CoffeeResult;
    return (
      <View style={styles.cupVisual}>
        {r.zones.map((zone, index) => (
          <View key={zone.zone} style={[styles.cupZone, index === 0 && styles.cupZoneBottom]}>
            <Text variant="caption" gold>{zone.zoneLabel}</Text>
            <Text variant="body">{zone.symbol.name}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (methodId === "scrying") {
    const r = result as ScryingResult;
    return (
      <View style={styles.scryingVisual}>
        <View style={styles.crystalCore}>
          <Text variant="heading">{r.image.name}</Text>
        </View>
        <Text variant="caption" muted>{r.crystal.name} · {r.color.name} · {r.shape.name}</Text>
      </View>
    );
  }

  if (methodId === "vedic") {
    const r = result as VedicResult;
    return (
      <View style={styles.zodiacWheel}>
        <Text variant="label" gold>SIDEREAL</Text>
        <Text variant="heading">{r.ascendantSign}</Text>
        <Text variant="caption" muted>Moon {r.moonSign} · {r.moonNakshatra.label}</Text>
      </View>
    );
  }

  if (methodId === "xiangmian" || methodId === "palmistry") {
    const r = result as XiangmianResult | PalmistryResult;
    return (
      <View style={styles.observationVisual}>
        {r.readings.slice(0, 4).map((reading) => (
          <View key={reading.observation} style={styles.observationNode}>
            <Text variant="caption" gold numberOfLines={1}>{reading.observation}</Text>
          </View>
        ))}
      </View>
    );
  }

  return null;
}

function NumberOrb({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.numberOrb}>
      <Text variant="caption" muted>{label}</Text>
      <Text variant="title" gold>{value}</Text>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.field}>
      <Text variant="label">{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textarea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? "输入…"}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function ChipRow({
  items,
  value,
  onChange,
}: {
  items: string[][];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.chipWrap}>
      {items.map(([id, label]) => (
        <Pressable key={id} style={[styles.chip, value === id && styles.chipActive]} onPress={() => onChange(id)}>
          <Text variant="caption" style={value === id ? styles.chipTextActive : undefined}>
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  workbench: {
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  cultureNote: {
    gap: spacing.xs,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  field: { gap: spacing.xs, flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.ink,
  },
  textarea: { minHeight: 88, textAlignVertical: "top" },
  twoCols: { flexDirection: "row", gap: spacing.sm },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.ink,
  },
  chipActive: { borderColor: colors.gold, backgroundColor: colors.surfaceElevated },
  chipTextActive: { color: colors.gold },
  actionRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  result: { marginTop: spacing.lg, gap: spacing.md },
  visualPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.goldDim,
    backgroundColor: colors.surface,
  },
  geomancyPanel: { flexWrap: "wrap" },
  geomancyFocus: {
    width: 92,
    gap: 2,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.goldDim,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  visualText: { flex: 1, gap: spacing.xs },
  hexStack: { width: 96, gap: 7 },
  hexLineWrap: { height: 8, justifyContent: "center" },
  hexLine: { height: 6, borderRadius: radius.full, backgroundColor: colors.gold },
  brokenLine: { flexDirection: "row", justifyContent: "space-between" },
  brokenHalf: { width: 38, height: 6, borderRadius: radius.full, backgroundColor: colors.gold },
  geomancyFigure: {
    flex: 1,
    minWidth: 54,
    alignItems: "center",
    gap: 4,
    paddingVertical: spacing.xs,
  },
  dotRow: { minHeight: 9, flexDirection: "row", gap: 5, justifyContent: "center" },
  dot: { width: 7, height: 7, borderRadius: 7, backgroundColor: colors.gold },
  orbRow: { flexDirection: "row", gap: spacing.sm },
  numberOrb: {
    flex: 1,
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.goldDim,
    backgroundColor: colors.surface,
  },
  cardSpread: { flexDirection: "row", gap: spacing.sm },
  oracleCard: {
    flex: 1,
    minHeight: 132,
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.goldDim,
    backgroundColor: colors.surface,
  },
  cupVisual: {
    overflow: "hidden",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.goldDim,
    backgroundColor: colors.surface,
  },
  cupZone: {
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cupZoneBottom: { backgroundColor: colors.surfaceElevated },
  scryingVisual: {
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.goldDim,
    backgroundColor: colors.surface,
  },
  crystalCore: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.surfaceElevated,
  },
  zodiacWheel: {
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.goldDim,
    backgroundColor: colors.surface,
  },
  observationVisual: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  observationNode: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.goldDim,
    backgroundColor: colors.surface,
  },
  grid: { gap: spacing.sm },
  card: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  note: { lineHeight: 20 },
});
