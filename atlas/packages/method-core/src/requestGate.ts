/** Accept exactly one in-flight operation per context; ignore completions from old contexts. */
export function createRequestGate() {
  let generation = 0;
  let busy = false;
  return {
    begin(): number | null { if (busy) return null; busy = true; return generation; },
    isCurrent(ticket: number): boolean { return ticket === generation; },
    finish(ticket: number): void { if (ticket === generation) busy = false; },
    reset(): void { generation += 1; busy = false; },
  };
}
