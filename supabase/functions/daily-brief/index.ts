import type { DailyBrief } from "@atlas/shared-types";
import { runEngine } from "@atlas/engines";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { loadProfile } from "../_shared/profile.ts";
import { loadCorpusChunks, pickChunkBySeed } from "../_shared/retrieval.ts";
import { requireUser } from "../_shared/supabase.ts";

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

    const dayThemes = ["守正蓄势", "柔顺接纳", "审慎观察", "积极沟通", "内省整理"];
    const themeIdx = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % dayThemes.length;

    const brief: DailyBrief = {
      date,
      theme: dayThemes[themeIdx] ?? "诸象简讯",
      traditionSummaries: {
        bazi: String((bazi.facts as { summary?: string }).summary ?? "完成档案后可看流日摘要"),
        iching: String((iching.facts as { summary?: string }).summary ?? ""),
      },
      classicQuote: {
        chunkId: quoteChunk.chunkId,
        original: quoteChunk.original,
        translationZh: quoteChunk.translationZh,
        application: `今日${date}·${dayThemes[themeIdx]}。`,
        traceId: seed,
      },
      suitable: ["学习", "整理", "沟通"],
      avoid: ["冲动签约", "过度透支"],
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
