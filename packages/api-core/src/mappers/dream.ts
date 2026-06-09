export type DreamInterpretation = {
  entryId: string;
  chinese: string;
  jungian: string;
  reflection: string;
  degraded?: boolean;
  createdAt: string;
  text?: string;
  emotions?: string[];
  symbols?: string[];
};

export type DreamTrend = {
  periodDays: number;
  topSymbols: Array<{ symbol: string; count: number }>;
  summary: string;
};

export function mapDreamEntryRow(row: {
  id?: string;
  entryId?: string;
  text?: string;
  emotions?: string[] | null;
  symbols?: string[] | null;
  interpretation?: Record<string, unknown> | null;
  chinese?: string;
  jungian?: string;
  reflection?: string;
  degraded?: boolean;
  created_at?: string;
  createdAt?: string;
}): DreamInterpretation {
  if (row.entryId || (row.chinese && row.jungian)) {
    return {
      entryId: row.entryId ?? row.id ?? `dream-${Date.now()}`,
      text: row.text,
      emotions: row.emotions ?? [],
      symbols: row.symbols ?? [],
      chinese: row.chinese ?? "",
      jungian: row.jungian ?? "",
      reflection: row.reflection ?? "",
      degraded: row.degraded,
      createdAt: row.createdAt ?? row.created_at ?? new Date().toISOString(),
    };
  }

  const interp = (row.interpretation ?? {}) as Record<string, unknown>;
  const reflection =
    typeof interp.reflection === "string"
      ? interp.reflection
      : typeof interp.islamic === "string"
        ? interp.islamic
        : "";
  return {
    entryId: row.id ?? `dream-${Date.now()}`,
    text: row.text,
    emotions: row.emotions ?? [],
    symbols: row.symbols ?? [],
    chinese: typeof interp.chinese === "string" ? interp.chinese : "",
    jungian: typeof interp.jungian === "string" ? interp.jungian : "",
    reflection,
    degraded: interp.degraded === true,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export function aggregateDreamTrend(
  entries: Array<{
    symbols?: string[] | null;
    emotions?: string[] | null;
    createdAt?: string;
    created_at?: string;
  }>,
  periodDays = 7
): DreamTrend {
  const cutoff = Date.now() - periodDays * 24 * 60 * 60 * 1000;
  const recent = entries.filter((e) => {
    const raw = e.createdAt ?? e.created_at;
    const t = raw ? new Date(raw).getTime() : 0;
    return t >= cutoff;
  });
  const counts = new Map<string, number>();
  for (const entry of recent) {
    for (const sym of [...(entry.symbols ?? []), ...(entry.emotions ?? [])]) {
      const key = sym.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const topSymbols = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([symbol, count]) => ({ symbol, count }));

  const summary =
    topSymbols.length === 0
      ? `近 ${periodDays} 日暂无梦境记录，持续记录后可查看重复意象趋势。`
      : `近 ${periodDays} 日梦境重复「${topSymbols
          .slice(0, 3)
          .map((s) => s.symbol)
          .join("」「")}」等意象，可作情绪与议题线索，不宜作确定预言。`;

  return { periodDays, topSymbols, summary };
}
