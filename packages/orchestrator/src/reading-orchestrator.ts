import { runEngines, type EngineInput } from "@atlas/engines";
import type {
  CitationSnapshot,
  QuestionInput,
  ReadingReport,
  ReadingSection,
  StructuredFacts,
  Tradition,
  UserProfile,
} from "@atlas/shared-types";
import { READING_SECTION_ORDER } from "@atlas/shared-types";
import { CitationVerifier, type VerifiableCitation } from "./citation-verifier.js";
import { HybridRetrieval, type ChunkRecord } from "./hybrid-retrieval.js";
import { MimoGateway } from "./mimo-gateway.js";
import { SafetyPolicy } from "./safety-policy.js";

const TRADITION_LABELS: Record<Tradition, string> = {
  bazi: "八字",
  western: "西洋占星",
  tarot: "塔罗",
  iching: "周易",
  dream: "占梦",
};

export interface OrchestratorDeps {
  mimo?: MimoGateway;
  retrieval?: HybridRetrieval;
  verifier?: CitationVerifier;
  safety?: SafetyPolicy;
}

export interface GenerateReadingInput {
  readingId?: string;
  questionId: string;
  question: QuestionInput;
  profile?: UserProfile;
  engineInput?: EngineInput;
  corpus?: ChunkRecord[];
}

export class ReadingOrchestrator {
  private readonly mimo: MimoGateway;
  private readonly retrieval: HybridRetrieval;
  private readonly verifier: CitationVerifier;
  private readonly safety: SafetyPolicy;

  constructor(deps: OrchestratorDeps = {}) {
    this.mimo = deps.mimo ?? new MimoGateway();
    this.retrieval = deps.retrieval ?? new HybridRetrieval();
    this.verifier = deps.verifier ?? new CitationVerifier();
    this.safety = deps.safety ?? new SafetyPolicy();
  }

  async generate(input: GenerateReadingInput): Promise<ReadingReport> {
    const traceId = crypto.randomUUID();
    const readingId = input.readingId ?? crypto.randomUUID();
    const traditions = input.question.traditions.filter((t) => t !== "dream");
    const safety = this.safety.evaluate(input.question);

    const seed = readingId;
    const engineInput: EngineInput = {
      birthDate: input.profile?.birthDate,
      birthTime: input.profile?.birthTime,
      birthLat: input.profile?.birthLat,
      birthLng: input.profile?.birthLng,
      timezone: input.profile?.timezone,
      seed,
      ...input.engineInput,
    };

    const facts = runEngines(traditions, engineInput);
    const retrieval = input.corpus
      ? new HybridRetrieval(input.corpus).retrieve({
          question: input.question.text,
          traditions,
        })
      : this.retrieval.retrieve({ question: input.question.text, traditions });

    const allowedIds = new Set(retrieval.chunks.map((c) => c.chunkId));

    const phaseA = await this.phaseA(facts, retrieval.records, input.question.text);
    const phaseB = await this.phaseB(phaseA, retrieval.records, input.question.text);

    let degraded = phaseA.degraded || phaseB.degraded || !this.mimo.isConfigured();
    const citations = this.buildCitations(
      retrieval.records,
      allowedIds,
      traceId,
      input.question.text
    );
    const verify = this.verifier.verify(
      citations.map((c) => ({
        chunkId: c.chunkId,
        original: c.original,
        translationZh: c.translationZh,
        application: c.application ?? "",
        traceId,
      })),
      allowedIds,
      retrieval.records,
      traceId
    );

    const finalCitations = verify.valid;
    if (verify.rejected.length > 0) degraded = true;

    const sections = this.assembleSections({
      question: input.question,
      traditions,
      facts,
      phaseA,
      phaseB,
      citations: finalCitations,
      safetyDisclaimer: safety.requiresDisclaimer ? safety.disclaimer : undefined,
    });

    return {
      readingId,
      questionId: input.questionId,
      traditions,
      sections,
      citations: finalCitations,
      structuredFacts: facts,
      consensus: phaseB.consensus,
      divergence: phaseB.divergence,
      degraded,
      traceId,
      createdAt: new Date().toISOString(),
    };
  }

  private async phaseA(
    facts: StructuredFacts[],
    chunks: ChunkRecord[],
    question: string
  ): Promise<{ summaries: Record<string, string>; degraded: boolean }> {
    const summaries: Record<string, string> = {};
    let degraded = false;

    if (this.mimo.isConfigured()) {
      const prompt = {
        question,
        facts: facts.map((f) => ({ tradition: f.tradition, facts: f.facts })),
        chunks: chunks.map((c) => ({ id: c.chunkId, zh: c.translationZh })),
      };
      const res = await this.mimo.complete({
        messages: [
          {
            role: "system",
            content:
              "你是诸象解读助手。根据结构化盘面与语料片段，为每个体系写一段80字以内的中文摘要。返回JSON：{summaries:{bazi?:string,western?:string,...}}",
          },
          { role: "user", content: JSON.stringify(prompt) },
        ],
        responseFormat: "json",
        maxTokens: 1024,
      });
      if (!res.degraded && res.content) {
        try {
          const parsed = JSON.parse(res.content) as { summaries?: Record<string, string> };
          Object.assign(summaries, parsed.summaries ?? {});
        } catch {
          degraded = true;
        }
      } else {
        degraded = true;
      }
    } else {
      degraded = true;
    }

    for (const f of facts) {
      if (!summaries[f.tradition]) {
        summaries[f.tradition] = templateTraditionSummary(f);
      }
    }
    return { summaries, degraded };
  }

  private async phaseB(
    phaseA: { summaries: Record<string, string> },
    chunks: ChunkRecord[],
    question: string
  ): Promise<{
    consensus: string;
    divergence: string;
    advice: string;
    cautions: string;
    followUp: string;
    degraded: boolean;
  }> {
    const fallback = {
      consensus: synthesizeConsensus(phaseA.summaries),
      divergence: synthesizeDivergence(phaseA.summaries),
      advice: "建议以当下可执行的小步行动为主，观察一周后再复盘。",
      cautions: "避免在情绪波动时做重大决定；重大健康与财务问题请咨询专业人士。",
      followUp: "可追问：哪一条依据对你最有共鸣？或希望深入哪个体系？",
      degraded: true,
    };

    if (!this.mimo.isConfigured()) return { ...fallback, degraded: true };

    const res = await this.mimo.complete({
      messages: [
        {
          role: "system",
          content:
            '返回严格JSON：{"consensus":"","divergence":"","advice":"","cautions":"","followUp":""}。共识与分歧需基于各体系摘要，避免强行凑共识。',
        },
        {
          role: "user",
          content: JSON.stringify({
            question,
            summaries: phaseA.summaries,
            chunks: chunks.map((c) => c.translationZh),
          }),
        },
      ],
      responseFormat: "json",
      maxTokens: 1024,
    });

    if (res.degraded || !res.content) return { ...fallback, degraded: true };

    try {
      const parsed = JSON.parse(res.content) as {
        consensus?: string;
        divergence?: string;
        advice?: string;
        cautions?: string;
        followUp?: string;
      };
      return {
        consensus: parsed.consensus ?? fallback.consensus,
        divergence: parsed.divergence ?? fallback.divergence,
        advice: parsed.advice ?? fallback.advice,
        cautions: parsed.cautions ?? fallback.cautions,
        followUp: parsed.followUp ?? fallback.followUp,
        degraded: false,
      };
    } catch {
      return { ...fallback, degraded: true };
    }
  }

  private buildCitations(
    records: ChunkRecord[],
    allowedIds: Set<string>,
    traceId: string,
    question: string
  ): VerifiableCitation[] {
    return records
      .filter((r) => allowedIds.has(r.chunkId))
      .slice(0, 4)
      .map((r) => ({
        chunkId: r.chunkId,
        original: r.original,
        translationZh: r.translationZh,
        annotationZh: r.annotationZh,
        application: `结合您的问题「${question.slice(0, 24)}」，${r.translationZh.slice(0, 40)}`,
        traceId,
      }));
  }

  private assembleSections(ctx: {
    question: QuestionInput;
    traditions: Tradition[];
    facts: StructuredFacts[];
    phaseA: { summaries: Record<string, string> };
    phaseB: {
      consensus: string;
      divergence: string;
      advice: string;
      cautions: string;
      followUp: string;
    };
    citations: CitationSnapshot[];
    safetyDisclaimer?: string;
  }): ReadingSection[] {
    const traditionList = ctx.traditions.map((t) => TRADITION_LABELS[t]).join("、");
    const summaryText = `针对您的问题，${traditionList} 对照显示：${ctx.phaseB.consensus.slice(0, 80)}…`;

    const byType: Partial<Record<string, ReadingSection>> = {
      summary: { type: "summary", title: "结论摘要", content: summaryText },
      question_restate: {
        type: "question_restate",
        title: "问题重述",
        content: ctx.question.text,
      },
      traditions_used: {
        type: "traditions_used",
        title: "采用体系",
        content: traditionList,
        metadata: { traditions: ctx.traditions },
      },
      consensus: {
        type: "consensus",
        title: "共识",
        content: ctx.phaseB.consensus,
      },
      divergence: {
        type: "divergence",
        title: "分歧",
        content: ctx.phaseB.divergence,
      },
      tradition_analysis: {
        type: "tradition_analysis",
        title: "各体系分析",
        content: ctx.traditions
          .map((t) => `【${TRADITION_LABELS[t]}】\n${ctx.phaseA.summaries[t] ?? ""}`)
          .join("\n\n"),
      },
      citations: {
        type: "citations",
        title: "古籍依据",
        content:
          ctx.citations.length > 0
            ? ctx.citations.map((c) => `${c.original} — ${c.translationZh}`).join("\n")
            : "暂无检索到可引用片段。",
        metadata: { count: ctx.citations.length },
      },
      advice: { type: "advice", title: "行动建议", content: ctx.phaseB.advice },
      cautions: {
        type: "cautions",
        title: "注意事项",
        content: [ctx.phaseB.cautions, ctx.safetyDisclaimer].filter(Boolean).join("\n\n"),
      },
      follow_up: {
        type: "follow_up",
        title: "可追问",
        content: ctx.phaseB.followUp,
      },
    };

    for (const f of ctx.facts) {
      if (f.tradition === "dream") continue;
      const existing = byType.tradition_analysis;
      if (existing) {
        existing.metadata = {
          ...((existing.metadata as object) ?? {}),
          [f.tradition]: f.facts,
        };
      }
    }

    return READING_SECTION_ORDER.map((type) => byType[type]!).filter(Boolean);
  }
}

function templateTraditionSummary(f: StructuredFacts): string {
  const summary = (f.facts as { summary?: string }).summary;
  return (
    summary ??
    `【AI 综合解释·模板】${TRADITION_LABELS[f.tradition]}盘面已计算，详见 structured_facts。`
  );
}

function synthesizeConsensus(summaries: Record<string, string>): string {
  const parts = Object.values(summaries);
  if (parts.length === 0) return "各体系均强调当下需谨慎观察，不宜操之过急。";
  return `各体系共同指向：${parts[0]?.slice(0, 40) ?? "保持觉察"}，并在变化中保留弹性。`;
}

function synthesizeDivergence(summaries: Record<string, string>): string {
  const keys = Object.keys(summaries);
  if (keys.length < 2) return "单一体系视角，建议对照其他传统作交叉验证。";
  return "八字重时运结构，占星重心理主题，塔罗重当下选择，周易重变化趋势——时间尺度与建议力度可能不同。";
}
