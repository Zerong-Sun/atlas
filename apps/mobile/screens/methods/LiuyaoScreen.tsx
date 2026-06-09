import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { castLiuyao, type LiuyaoResult } from "@atlas/engines/liuyao";
import { buildLiuyaoReportSnapshot } from "@atlas/method-core";
import { MethodHero } from "@/components/MethodHero";
import { MethodResultActions } from "@/components/MethodResultActions";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

const LIUYAO_USEFUL_GOD: Record<string, { god: string; note: string }> = {
  事业申请: { god: "官鬼", note: "看官鬼旺衰与动变，兼看父母（文书）。" },
  合作关系: { god: "世爻", note: "世应关系为核心，兼看妻财。" },
  财务得失: { god: "妻财", note: "妻财旺相则利，空破则迟。" },
  失物寻人: { god: "子孙", note: "子孙发动多可寻回。" },
  健康状态: { god: "子孙", note: "子孙为解药之神，忌官鬼持世。" },
};

const LIUYAO_STRENGTH: Record<string, string> = {
  旺: "当令有力，事易成。",
  相: "得生扶，有助力。",
  休: "失令，力量平常。",
  囚: "受克，阻力较大。",
  死: "无气，宜静不宜动。",
  空: "空亡，事多虚浮或延迟。",
};

const LIUYAO_RELATIVES: Record<string, string> = {
  父母: "文书、长辈、保护、合同证件",
  兄弟: "竞争、分利、同辈消耗",
  子孙: "解忧、产出、医药、下属",
  妻财: "财物、机会、女性、资源",
  官鬼: "压力、规则、风险、职位",
};

const SUBJECT_TYPES = Object.keys(LIUYAO_USEFUL_GOD);

type HexLine = {
  position: number;
  isYang: boolean;
  isMoving?: boolean;
  label: string;
  meta?: string;
};

function lineGlyph(isYang: boolean, isMoving?: boolean) {
  const base = isYang ? "━━━" : "━ ━";
  return isMoving ? `${base} ○` : base;
}

function HexagramDisplay({ lines, title }: { lines: HexLine[]; title: string }) {
  return (
    <View style={styles.hexagram}>
      <Text variant="label">{title}</Text>
      {[...lines].reverse().map((line) => (
        <View key={line.position} style={styles.hexLine}>
          <Text variant="body" style={styles.hexGlyph}>
            {lineGlyph(line.isYang, line.isMoving)}
          </Text>
          <Text variant="caption" muted>
            {line.label}
          </Text>
          {line.meta && (
            <Text variant="caption" muted>
              {line.meta}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

function coinLabel(value: number) {
  if (value === 6) return "老阳";
  if (value === 7) return "少阳";
  if (value === 8) return "少阴";
  return "老阴";
}

export function LiuyaoScreen() {
  const [question, setQuestion] = useState("");
  const [subjectType, setSubjectType] = useState("事业申请");
  const [coinLines, setCoinLines] = useState<number[]>([]);
  const [result, setResult] = useState<LiuyaoResult | null>(null);

  const castStep = coinLines.length;

  const throwCoins = () => {
    if (castStep >= 6) return;
    const sum = Math.floor(Math.random() * 4) + 6;
    const next = [...coinLines, sum];
    setCoinLines(next);
    if (next.length === 6) {
      const categoryMap: Record<string, "career" | "love" | "finance" | "health" | "general"> = {
        事业申请: "career",
        合作关系: "love",
        财务得失: "finance",
        失物寻人: "general",
        健康状态: "health",
      };
      setResult(
        castLiuyao({
          lines: next,
          questionCategory: categoryMap[subjectType] ?? "general",
          seed: `${Date.now()}-${question}`,
        }),
      );
    }
  };

  const reset = () => {
    setCoinLines([]);
    setResult(null);
  };

  const copilotReport = useMemo(
    () => (result ? buildLiuyaoReportSnapshot(question, subjectType, result) : null),
    [result, question, subjectType],
  );
  useRegisterMethodCopilotReport(copilotReport);

  const hexLines = useMemo<HexLine[]>(() => {
    if (!result) return [];
    return result.lines.map((l) => ({
      position: l.position,
      isYang: l.isYang,
      isMoving: l.isMoving,
      label: `${l.branch}${l.relative}${l.isWorld ? "·世" : ""}${l.isResponse ? "·应" : ""}`,
      meta: `${l.strength} · ${LIUYAO_STRENGTH[l.strength] ?? ""}`,
    }));
  }, [result]);

  return (
    <Screen scroll>
      <MethodHero
        methodId="liuyao"
        kicker="LIUYAO"
        title="纳甲六爻"
        description="铜钱起卦，定世应、纳甲、六亲与用神旺衰。一事一占，先定用神再看动变。"
      />

      <View style={styles.workbench}>
        <View style={styles.field}>
          <Text variant="label">所问事项</Text>
          <TextInput
            style={styles.input}
            value={question}
            onChangeText={setQuestion}
            multiline
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text variant="label">事项类型</Text>
          <View style={styles.chipRow}>
            {SUBJECT_TYPES.map((k) => (
              <Pressable
                key={k}
                style={[styles.chip, subjectType === k && styles.chipActive]}
                onPress={() => setSubjectType(k)}
              >
                <Text variant="caption" style={subjectType === k ? styles.chipTextActive : undefined}>
                  {k}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text variant="caption" muted>
          {LIUYAO_USEFUL_GOD[subjectType]?.note}
        </Text>

        <View style={styles.coinCast}>
          <Text variant="body">第 {Math.min(castStep + 1, 6)} 爻 / 6（点击铜钱起卦）</Text>
          {coinLines.length > 0 && (
            <Text variant="caption" muted>
              已得：{coinLines.map(coinLabel).join(" · ")}
            </Text>
          )}
          <Button title="🪙 掷铜钱" onPress={throwCoins} disabled={castStep >= 6} />
          {castStep > 0 && (
            <Button title="重置" variant="secondary" onPress={reset} />
          )}
        </View>
      </View>

      {result && (
        <View style={styles.result}>
          <MethodResultActions />
          <View style={styles.resultHead}>
            <Text variant="heading">
              {result.primaryName}卦 → {result.changedName}卦
            </Text>
            <Text variant="body">
              {result.palace}宫 · 世{result.worldLine} 应{result.responseLine} · 用神
              {result.usefulGod}
            </Text>
            <Text variant="caption" muted>
              日柱 {result.dayStem}
              {result.dayBranch} · 月建 {result.monthBranch}
            </Text>
          </View>

          <HexagramDisplay lines={hexLines} title="六爻排盘" />

          <View style={styles.readingGrid}>
            {result.lines.map((l) => (
              <View
                key={l.position}
                style={[
                  styles.readingCard,
                  l.position === result.usefulGodLine && styles.readingCardHi,
                ]}
              >
                <Text variant="label">
                  {l.position}爻 {l.branch}
                  {l.stem}
                </Text>
                <Text variant="body">
                  {l.relative}
                  {l.isWorld ? "·世" : ""}
                  {l.isResponse ? "·应" : ""}
                </Text>
                <Text variant="caption" muted>
                  {LIUYAO_RELATIVES[l.relative]} · {l.strength}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  workbench: { gap: spacing.md, marginTop: spacing.lg },
  field: { gap: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    minHeight: 88,
    textAlignVertical: "top",
    fontSize: 16,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.gold, backgroundColor: colors.surfaceElevated },
  chipTextActive: { color: colors.gold },
  coinCast: { gap: spacing.sm },
  result: { marginTop: spacing.xl, gap: spacing.md },
  resultHead: { gap: spacing.xs },
  hexagram: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  hexLine: { alignItems: "center", gap: 2 },
  hexGlyph: { fontFamily: "monospace", letterSpacing: 2 },
  readingGrid: { gap: spacing.md },
  readingCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  readingCardHi: { borderColor: colors.gold },
});
