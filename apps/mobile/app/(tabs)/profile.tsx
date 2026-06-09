import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, TextInput, View } from "react-native";
import type { ReadingReport, Tradition } from "@atlas/shared-types";
import { READING_TRADITIONS, TRADITION_LABELS } from "@/constants/traditions";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useApp } from "@/context/AppContext";
import { listReadings } from "@/lib/api";
import { archiveEntryLabel, listArchiveEntries, type ArchiveEntry } from "@/lib/archive";
import { track } from "@/lib/analytics";
import { colors, radius, spacing } from "@/theme/tokens";

export default function ProfileScreen() {
  const { profile, saveProfile } = useApp();
  const router = useRouter();
  const [history, setHistory] = useState<ReadingReport[]>([]);
  const [archive, setArchive] = useState<ArchiveEntry[]>([]);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? "");
  const [birthTime, setBirthTime] = useState(profile?.birthTime ?? "");
  const [birthPlace, setBirthPlace] = useState(profile?.birthPlace ?? "");
  const [gender, setGender] = useState<"male" | "female">(profile?.gender ?? "male");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void listReadings().then(setHistory);
    void listArchiveEntries().then(setArchive);
  }, []);

  useEffect(() => {
    if (profile) {
      setBirthDate(profile.birthDate ?? "");
      setBirthTime(profile.birthTime ?? "");
      setBirthPlace(profile.birthPlace ?? "");
      setGender(profile.gender ?? "male");
    }
  }, [profile]);

  const disabled = profile?.disabledTraditions ?? [];

  const toggleTradition = async (t: Tradition) => {
    const next = disabled.includes(t) ? disabled.filter((x) => x !== t) : [...disabled, t];
    await saveProfile({ disabledTraditions: next });
  };

  const saveBirth = async () => {
    setSaving(true);
    try {
      await saveProfile({ birthDate, birthTime, birthPlace, gender });
      setEditing(false);
      track("profile_update");
    } finally {
      setSaving(false);
    }
  };

  const openReading = (report: ReadingReport) => {
    track("history_open", { readingId: report.readingId });
    router.push({
      pathname: "/reading/[id]",
      params: { id: report.readingId, data: JSON.stringify(report) },
    });
  };

  const openArchive = (entry: ArchiveEntry) => {
    if (entry.readingReport) {
      openReading(entry.readingReport);
      return;
    }
    if (entry.source === "reading") {
      router.push({ pathname: "/reading/[id]", params: { id: entry.id } });
      return;
    }
    router.push({ pathname: "/archive/[id]", params: { id: entry.id } });
  };

  return (
    <Screen scroll>
      <Text variant="title">档案</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text variant="label">出生信息</Text>
          <Pressable onPress={() => setEditing((e) => !e)}>
            <Text variant="caption" style={styles.editLink}>
              {editing ? "取消" : "编辑"}
            </Text>
          </Pressable>
        </View>
        {editing ? (
          <View style={styles.editForm}>
            <Field label="出生日期" value={birthDate} onChangeText={setBirthDate} placeholder="YYYY-MM-DD" />
            <Field label="出生时间" value={birthTime} onChangeText={setBirthTime} placeholder="HH:mm" />
            <Field label="出生地点" value={birthPlace} onChangeText={setBirthPlace} placeholder="城市" />
            <Text variant="caption" muted>
              性别（用于排盘）
            </Text>
            <View style={styles.genderRow}>
              <Pressable
                style={[styles.genderChip, gender === "male" && styles.genderChipOn]}
                onPress={() => setGender("male")}
              >
                <Text variant="body">男</Text>
              </Pressable>
              <Pressable
                style={[styles.genderChip, gender === "female" && styles.genderChipOn]}
                onPress={() => setGender("female")}
              >
                <Text variant="body">女</Text>
              </Pressable>
            </View>
            <Button title="保存" onPress={saveBirth} loading={saving} />
          </View>
        ) : (
          <>
            <Text variant="body">
              {profile?.birthDate ?? "—"} {profile?.birthTime ?? ""}
            </Text>
            <Text variant="caption" muted>
              {profile?.birthPlace ?? "未设置地点"}
              {profile?.gender ? ` · ${profile.gender === "male" ? "男" : "女"}` : ""}
            </Text>
          </>
        )}
      </View>

      <Text variant="heading" style={styles.section}>
        体系偏好
      </Text>
      <Text variant="caption" muted>
        关闭的体系不会出现在默认选择中
      </Text>
      {READING_TRADITIONS.map((t) => (
        <View key={t} style={styles.row}>
          <Text variant="body">{TRADITION_LABELS[t]}</Text>
          <Switch
            value={!disabled.includes(t)}
            onValueChange={() => toggleTradition(t)}
            trackColor={{ false: colors.border, true: colors.goldDim }}
            thumbColor={colors.parchment}
          />
        </View>
      ))}

      <Pressable style={styles.linkRow} onPress={() => router.push("/library")}>
        <Text variant="heading">书库</Text>
        <Text variant="caption" style={styles.editLink}>
          浏览术语
        </Text>
      </Pressable>

      <Text variant="heading" style={styles.section}>
        归档记录
      </Text>
      {archive.length === 0 ? (
        <Text variant="body" muted>
          完成占法或提问后，结果会自动归档
        </Text>
      ) : (
        archive.slice(0, 10).map((entry) => (
          <Pressable key={entry.id} style={styles.historyItem} onPress={() => openArchive(entry)}>
            <Text variant="body" numberOfLines={1}>
              {entry.title}
            </Text>
            <Text variant="caption" muted>
              {archiveEntryLabel(entry)} · {new Date(entry.createdAt).toLocaleDateString("zh-CN")}
            </Text>
          </Pressable>
        ))
      )}

      <Text variant="heading" style={styles.section}>
        历史报告
      </Text>
      {history.length === 0 ? (
        <Text variant="body" muted>
          暂无记录，去「提问」生成第一份对照报告
        </Text>
      ) : (
        history.map((r) => (
          <Pressable key={r.readingId} style={styles.historyItem} onPress={() => openReading(r)}>
            <Text variant="body" numberOfLines={1}>
              {r.sections.find((s) => s.type === "summary")?.content.slice(0, 40) ?? "对照报告"}
            </Text>
            <Text variant="caption" muted>
              {new Date(r.createdAt).toLocaleDateString("zh-CN")} · {r.traditions.length} 体系
            </Text>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text variant="caption" muted>
        {label}
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  editLink: { color: colors.gold },
  editForm: { gap: spacing.sm, marginTop: spacing.sm },
  field: { gap: spacing.xs },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    color: colors.text,
    fontSize: 16,
  },
  section: { marginTop: spacing.xl, marginBottom: spacing.sm },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  historyItem: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  genderRow: { flexDirection: "row", gap: spacing.sm },
  genderChip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  genderChipOn: { borderColor: colors.gold, backgroundColor: colors.surfaceElevated },
});
