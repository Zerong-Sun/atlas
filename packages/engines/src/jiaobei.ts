import { createRng } from "./seed.ts";

export type JiaobeiFace = "yin" | "yang";
export type JiaobeiOutcome = "holy" | "laugh" | "yin";

export interface JiaobeiThrowInput {
  seed?: string;
  question?: string;
  throwIndex?: number;
}

export interface JiaobeiThrow {
  cups: [JiaobeiFace, JiaobeiFace];
  outcome: JiaobeiOutcome;
  throwIndex: number;
  seed: string;
  question?: string;
}

export interface JiaobeiSessionInput {
  seed?: string;
  question?: string;
  maxThrows?: number;
}

export interface JiaobeiSession {
  throws: JiaobeiThrow[];
  holyCount: number;
  threeHoly: boolean;
  shouldStop: boolean;
  stopReason?: string;
  seed: string;
  question?: string;
}

const OUTCOME_LABELS: Record<JiaobeiOutcome, string> = {
  holy: "圣杯",
  laugh: "笑杯",
  yin: "阴杯",
};

export function getJiaobeiOutcomeLabel(outcome: JiaobeiOutcome): string {
  return OUTCOME_LABELS[outcome];
}

function resolveOutcome(cups: [JiaobeiFace, JiaobeiFace]): JiaobeiOutcome {
  const yangCount = cups.filter((f) => f === "yang").length;
  if (yangCount === 1) return "holy";
  if (yangCount === 2) return "laugh";
  return "yin";
}

function throwCupPair(seed: string, throwIndex: number): [JiaobeiFace, JiaobeiFace] {
  const rng = createRng(`${seed}-cup-${throwIndex}`);
  return [rng() < 0.5 ? "yin" : "yang", rng() < 0.5 ? "yin" : "yang"];
}

export function throwJiaobei(input: JiaobeiThrowInput = {}): JiaobeiThrow {
  const seed = input.seed ?? new Date().toISOString();
  const throwIndex = input.throwIndex ?? 1;
  const cups = throwCupPair(seed, throwIndex);
  return {
    cups,
    outcome: resolveOutcome(cups),
    throwIndex,
    seed,
    question: input.question,
  };
}

export function throwJiaobeiSession(input: JiaobeiSessionInput = {}): JiaobeiSession {
  const seed = input.seed ?? new Date().toISOString();
  const maxThrows = input.maxThrows ?? 3;
  const throws: JiaobeiThrow[] = [];

  for (let i = 1; i <= maxThrows; i++) {
    const t = throwJiaobei({ seed, question: input.question, throwIndex: i });
    throws.push(t);
    if (t.outcome === "yin") {
      return {
        throws,
        holyCount: throws.filter((x) => x.outcome === "holy").length,
        threeHoly: false,
        shouldStop: true,
        stopReason: "阴杯：宜暂停，不宜强求。",
        seed,
        question: input.question,
      };
    }
    if (t.outcome === "laugh") {
      return {
        throws,
        holyCount: throws.filter((x) => x.outcome === "holy").length,
        threeHoly: false,
        shouldStop: true,
        stopReason: "笑杯：问题未准，请修正问句后再掷。",
        seed,
        question: input.question,
      };
    }
  }

  const holyCount = throws.filter((x) => x.outcome === "holy").length;
  return {
    throws,
    holyCount,
    threeHoly: holyCount === 3,
    shouldStop: throws.length >= maxThrows,
    stopReason: holyCount === 3 ? "三圣杯：强确认，可行动。" : undefined,
    seed,
    question: input.question,
  };
}
