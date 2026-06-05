import { MimoGateway, type MimoMessage } from "./mimo-gateway.js";

export interface MimoBatchTask {
  id: string;
  prompt: string;
  system?: string;
  maxTokens?: number;
}

export interface MimoBatchResult {
  id: string;
  content: string;
  degraded: boolean;
  tokenCost?: number;
  elapsedMs: number;
  error?: string;
}

export interface MimoBatchOptions {
  concurrency?: number;
  defaultSystem?: string;
  defaultMaxTokens?: number;
}

const DEFAULT_SYSTEM = "你是一个严谨的中文文献整理助手。输出简洁、结构化，保留不确定性。";

export class MimoBatchRunner {
  private readonly mimo: MimoGateway;

  constructor(mimo = new MimoGateway()) {
    this.mimo = mimo;
  }

  async run(tasks: MimoBatchTask[], options: MimoBatchOptions = {}): Promise<MimoBatchResult[]> {
    const concurrency = Math.max(1, Math.floor(options.concurrency ?? 4));
    const results = new Array<MimoBatchResult>(tasks.length);
    let cursor = 0;

    const worker = async () => {
      while (cursor < tasks.length) {
        const index = cursor;
        cursor += 1;
        results[index] = await this.runOne(tasks[index], options);
      }
    };

    await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
    return results;
  }

  private async runOne(task: MimoBatchTask, options: MimoBatchOptions): Promise<MimoBatchResult> {
    const started = Date.now();
    const system = task.system ?? options.defaultSystem ?? DEFAULT_SYSTEM;
    const messages: MimoMessage[] = [
      { role: "system", content: system },
      { role: "user", content: task.prompt },
    ];

    try {
      const res = await this.mimo.complete({
        messages,
        maxTokens: task.maxTokens ?? options.defaultMaxTokens ?? 1200,
      });
      return {
        id: task.id,
        content: res.content,
        degraded: res.degraded,
        tokenCost: res.tokenCost,
        elapsedMs: Date.now() - started,
      };
    } catch (error) {
      return {
        id: task.id,
        content: "",
        degraded: true,
        elapsedMs: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
