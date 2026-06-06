import {
  getQimenLibrary,
  type QimenClassicNote,
  type QimenDirectionTranslation,
  type QimenEntry,
  type QimenPattern,
  type QimenQuestionType,
  type QimenRule,
} from "../qimenLibrary";
import type { MethodReferenceLibrary, ReferenceEntry } from "./types";

function mapEntry(entry: QimenEntry): ReferenceEntry {
  return { name: entry.name, nature: entry.nature, meaning: entry.meaning, usage: entry.usage };
}

function mapRules(rules: QimenRule[]) {
  return rules.map((rule) => ({ title: rule.title, steps: rule.steps, note: rule.note }));
}

function mapPatterns(patterns: QimenPattern[]) {
  return patterns.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    level: item.level,
    formation: item.formation,
    meaning: item.meaning,
    applications: item.applications,
    cautions: item.cautions,
    actionHint: item.actionHint,
  }));
}

function mapClassic(notes: QimenClassicNote[]) {
  return notes.map((note) => ({
    source: note.source,
    principle: note.principle,
    paraphrase: note.paraphrase,
    application: note.application,
    caution: note.caution,
  }));
}

function directionPanel(translations: QimenDirectionTranslation[]) {
  return {
    label: "方位转译库",
    items: translations.map((item) => ({
      title: item.palace,
      subtitle: `${item.direction} / ${item.element}`,
      body: item.action,
      hint: `${item.spatial}；${item.timing}`,
    })),
  };
}

export function buildQimenReferenceLibrary(): MethodReferenceLibrary {
  const library = getQimenLibrary();
  const questionTypes: QimenQuestionType[] = library.questionTypes;

  return {
    id: "qimen",
    title: "奇门遁甲分析库",
    symbolGroups: [
      { id: "doors", label: "八门", items: library.doors.map(mapEntry) },
      { id: "stars", label: "九星", items: library.stars.map(mapEntry) },
      { id: "gods", label: "八神", items: library.gods.map(mapEntry) },
      { id: "stems", label: "三奇六仪", items: library.stems.map(mapEntry) },
      { id: "palaces", label: "九宫", items: library.palaces.map(mapEntry) },
    ],
    questionTypes: questionTypes.map((item) => ({
      type: item.type,
      focus: item.focus,
      usefulGod: item.usefulGod,
      readingKey: item.readingKey,
    })),
    analysisSteps: library.analysisSteps,
    relations: library.relations.map(mapEntry),
    patterns: mapPatterns(library.patterns),
    ruleGroups: [
      { label: "符使与遁局", rules: mapRules([...library.zhiFuZhiShiRules, ...library.dunRules]) },
      { label: "应期判断", rules: mapRules(library.timingRules) },
    ],
    classicNotes: mapClassic(library.classicNotes),
    extraPanels: [directionPanel(library.directionTranslations)],
  };
}
