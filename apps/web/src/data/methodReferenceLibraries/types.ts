export type ReferenceEntry = { name: string; nature: string; meaning: string; usage: string };

export type ReferenceQuestionType = {
  type: string;
  focus: string;
  usefulGod: string;
  readingKey: string;
};

export type ReferencePattern = {
  id: string;
  name: string;
  category: string;
  level: "大吉" | "吉" | "平" | "凶" | "大凶" | string;
  formation: string;
  meaning: string;
  applications: string;
  cautions: string;
  actionHint: string;
};

export type ReferenceRule = { title: string; steps: string[]; note: string };

export type ReferenceClassicNote = {
  source: string;
  principle: string;
  paraphrase: string;
  application: string;
  caution: string;
};

export type ReferenceExtraPanel = {
  label: string;
  items: Array<{ title: string; subtitle?: string; body: string; hint?: string }>;
};

export type MethodReferenceLibrary = {
  id: string;
  title: string;
  symbolGroups: Array<{ id: string; label: string; items: ReferenceEntry[] }>;
  questionTypes: ReferenceQuestionType[];
  analysisSteps: string[];
  relations: ReferenceEntry[];
  patterns: ReferencePattern[];
  ruleGroups: Array<{ label: string; rules: ReferenceRule[] }>;
  classicNotes?: ReferenceClassicNote[];
  extraPanels?: ReferenceExtraPanel[];
};
