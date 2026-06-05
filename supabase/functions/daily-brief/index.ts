import type { DailyBrief } from "@atlas/shared-types";
import { runEngine } from "@atlas/engines";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { loadProfile } from "../_shared/profile.ts";
import { loadCorpusChunks, pickChunkBySeed } from "../_shared/retrieval.ts";
import { requireUser } from "../_shared/supabase.ts";

// ── Inlined day-color logic (matches @atlas/theme/day-color, Deno-safe) ───────
const DAY_COLORS = [
  { id: "celadon-dawn", nameEn: "Celadon Dawn", a: "#B8D4C8", b: "#7A9E8E" },
  { id: "mist-rose", nameEn: "Mist Rose", a: "#E8D0D4", b: "#C4A0A8" },
  { id: "nautical-grey", nameEn: "Nautical Grey", a: "#A8B8C8", b: "#6A7A8E" },
  { id: "apricot-haze", nameEn: "Apricot Haze", a: "#F0D8C0", b: "#D4A878" },
  { id: "horizon-blue", nameEn: "Horizon Blue", a: "#B0C8E0", b: "#6888B0" },
  { id: "lichen-mist", nameEn: "Lichen Mist", a: "#C8D8C0", b: "#8AA878" },
  { id: "dusk-lilac", nameEn: "Dusk Lilac", a: "#D0C8E0", b: "#9888B8" },
  { id: "sand-fog", nameEn: "Sand Fog", a: "#E8E0D0", b: "#C0B090" },
  { id: "steel-dawn", nameEn: "Steel Dawn", a: "#C0C8D0", b: "#8898A8" },
  { id: "peach-glow", nameEn: "Peach Glow", a: "#F0D4C8", b: "#D09888" },
  { id: "fjord-green", nameEn: "Fjord Green", a: "#A8C8B8", b: "#5A8878" },
  { id: "cloud-amber", nameEn: "Cloud Amber", a: "#E8D8B0", b: "#C8A868" },
  { id: "polar-sky", nameEn: "Polar Sky", a: "#C8E0F0", b: "#78A8C8" },
  { id: "heather-dew", nameEn: "Heather Dew", a: "#D8C8E0", b: "#A088B8" },
  { id: "clay-morning", nameEn: "Clay Morning", a: "#E0C8B8", b: "#B08878" },
  { id: "sage-breath", nameEn: "Sage Breath", a: "#C0D4C8", b: "#88A898" },
  { id: "twilight-teal", nameEn: "Twilight Teal", a: "#98C8C0", b: "#4A8880" },
  { id: "blush-fog", nameEn: "Blush Fog", a: "#F0D0D8", b: "#D0A0B0" },
  { id: "slate-dawn", nameEn: "Slate Dawn", a: "#B8C0C8", b: "#788898" },
  { id: "honey-mist", nameEn: "Honey Mist", a: "#F0E0C0", b: "#D0B878" },
  { id: "reef-azure", nameEn: "Reef Azure", a: "#A0D0E0", b: "#5898B8" },
  { id: "moss-haze", nameEn: "Moss Haze", a: "#C0D0B0", b: "#88A070" },
  { id: "wine-dusk", nameEn: "Wine Dusk", a: "#D0B8C0", b: "#987088" },
  { id: "moon-silver", nameEn: "Moon Silver", a: "#D8E0E8", b: "#A0A8B8" },
] as const;

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function resolveDayColorBySeed(seed: string) {
  return DAY_COLORS[hashSeed(seed) % DAY_COLORS.length]!;
}

function buildEntryId(dateCompact: string, seed: string): string {
  const tag = (hashSeed(seed) % 65536).toString(16).toUpperCase().padStart(4, "0");
  return `ATLAS-${dateCompact}-${tag}`;
}
// ─────────────────────────────────────────────────────────────────────────────

const DAY_THEMES = [
  "守正蓄势",
  "柔顺接纳",
  "审慎观察",
  "积极沟通",
  "内省整理",
  "动中求静",
  "蓄力待发",
];

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    const { id: userId, client } = await requireUser(req);
    const url = new URL(req.url);
    const date = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

    const { data: cached } = await client
      .from("daily_briefs")
      .select("payload")
      .eq("user_id", userId)
      .eq("brief_date", date)
      .maybeSingle();

    if (cached?.payload) {
      return jsonResponse(cached.payload as DailyBrief);
    }

    const profile = await loadProfile(client, userId);
    const seed = `${userId}-${date}`;
    const dateCompact = date.replace(/-/g, "");

    const bazi = runEngine("bazi", {
      birthDate: profile?.birthDate,
      birthTime: profile?.birthTime,
      seed,
    });
    const iching = runEngine("iching", { seed });

    const corpus = await loadCorpusChunks(client, ["iching", "bazi", "tarot", "western"], 100);
    const quoteChunk = pickChunkBySeed(corpus, seed) ?? {
      chunkId: "fallback",
      original: "元亨利贞。",
      translationZh: "大通顺，利于正固。",
      keywords: ["乾"],
      sourceId: "yijing_64",
      tradition: "iching",
    };

    const themeIdx = hashSeed(seed) % DAY_THEMES.length;
    const dayColor = resolveDayColorBySeed(seed);
    const entryId = buildEntryId(dateCompact, seed);

    const brief: DailyBrief = {
      date,
      theme: DAY_THEMES[themeIdx] ?? "诸象简讯",
      traditionSummaries: {
        bazi: String((bazi.facts as { summary?: string }).summary ?? "完成档案后可看流日摘要"),
        iching: String((iching.facts as { summary?: string }).summary ?? ""),
      },
      classicQuote: {
        chunkId: quoteChunk.chunkId,
        original: quoteChunk.original,
        translationZh: quoteChunk.translationZh,
        application: `今日${date}·${DAY_THEMES[themeIdx]}。`,
        traceId: seed,
      },
      suitable: ["学习", "整理", "沟通"],
      avoid: ["冲动签约", "过度透支"],
      dayColor,
      slip: { entryId },
    };

    await client.from("daily_briefs").upsert({
      user_id: userId,
      brief_date: date,
      payload: brief,
    });

    return jsonResponse(brief);
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonResponse({ error: String(e) }, 500);
  }
});
