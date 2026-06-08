import { useMemo, useState, type CSSProperties } from "react";
import { drawTarotSpread, interpretTarot, normalizeTarotCardName, toInterpretTarotCards } from "@atlas/engines/tarot";
import {
  TAROT_DECK,
  buildTarotCombination,
  getCardMeaning,
  type TarotCard,
  type TarotSuit,
} from "@/data/tarotDeck";
import {
  TAROT_PAIR_RULES,
  TAROT_REVERSAL_LAYERS,
  TAROT_SENSE_RECORD_FIELDS,
  TAROT_SPREAD_LIBRARY,
  getScenarioLens,
} from "@/data/tarotAdvancedLibrary";
import {
  appendTarotDrawHistory,
  getTarotDrawHistory,
  getTarotSenseRecords,
  saveTarotSenseRecord,
  type TarotDrawHistoryItem,
} from "@/lib/storage";
import type { MatchedRule } from "@atlas/shared-types";
import { MethodCopilotTrigger } from "@/components/MethodCopilotTrigger";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildTarotReportSnapshot } from "@/lib/methodReportSnapshot";
import { playMethodSound } from "@/lib/methodSounds";

type DeckMode = "major" | "full";
type DrawPhase = "idle" | "shuffling" | "drawing" | "revealed";

type DrawnCard = TarotCard & {
  position: string;
  reversed: boolean;
};

type PlaceholderCard = {
  position: string;
  placeholder: true;
};

type HistoryItem = TarotDrawHistoryItem;

type SuitFilter = "all" | TarotSuit;

const SPREAD_MAP = Object.fromEntries(TAROT_SPREAD_LIBRARY.map((s) => [s.id, s]));

export function TarotPage() {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<DeckMode>("major");
  const [spreadId, setSpreadId] = useState("three-timeline");
  const [cards, setCards] = useState<DrawnCard[]>([]);
  const [interpretation, setInterpretation] = useState<ReturnType<typeof interpretTarot> | null>(null);
  const [phase, setPhase] = useState<DrawPhase>("idle");
  const [lastDraw, setLastDraw] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>(() => getTarotDrawHistory());
  const [senseCardId, setSenseCardId] = useState("");
  const [senseFields, setSenseFields] = useState<Record<string, string>>({});
  const [copyState, setCopyState] = useState("");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [suitFilter, setSuitFilter] = useState<SuitFilter>("all");

  const spread = SPREAD_MAP[spreadId] ?? TAROT_SPREAD_LIBRARY[1]!;
  const combo = useMemo(() => buildTarotCombination(cards), [cards]);
  const isBusy = phase === "shuffling" || phase === "drawing";
  const dailyCard = useMemo(() => getDailyCard(), []);
  const scenarioLens = useMemo(() => getScenarioLens(question), [question]);
  const readingText = useMemo(() => buildReadingText(question, spread.name, cards, combo, interpretation), [cards, combo, question, spread.name, interpretation]);
  const libraryCards = useMemo(() => {
    const q = libraryQuery.trim().toLowerCase();
    return TAROT_DECK.filter((card) => {
      const matchesSuit = suitFilter === "all" || card.suit === suitFilter;
      const text = [card.name, card.nameEn, card.rank, card.element, ...card.keywords, ...card.reversedKeywords].join(" ").toLowerCase();
      return matchesSuit && (!q || text.includes(q));
    }).slice(0, 16);
  }, [libraryQuery, suitFilter]);
  const visibleCards: Array<DrawnCard | PlaceholderCard> = cards.length
    ? cards
    : spread.positions.map((position) => ({ position, placeholder: true }));

  const draw = () => {
    if (isBusy) return;
    playMethodSound("tarot", "action");
    setCards([]);
    setInterpretation(null);
    setPhase("shuffling");

    window.setTimeout(() => {
      const seed = `${Date.now()}-${question}-${spreadId}`;
      const result = drawTarotSpread({
        seed,
        spreadId,
        includeMinor: mode === "full",
      });
      const next: DrawnCard[] = result.cards.map((drawn) => {
        const full = resolveTarotCard(drawn.name);
        return { ...full, position: drawn.position, reversed: drawn.reversed };
      });
      const interp = interpretTarot(toInterpretTarotCards(result.cards), { question });
      setCards(next);
      setInterpretation(interp);
      setPhase("drawing");
      const time = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
      setLastDraw(time);
      const item: HistoryItem = {
        id: `${Date.now()}`,
        time,
        spread: spread.name,
        spreadId,
        question: question.trim() || "当下趋势",
        cards: next.map((c) => ({ name: c.name, position: c.position, reversed: c.reversed })),
      };
      appendTarotDrawHistory(item);
      setHistory(getTarotDrawHistory());
      window.setTimeout(() => {
        setPhase("revealed");
        playMethodSound("tarot", "complete");
      }, 680);
    }, 820);
  };

  const resetSpread = (nextSpreadId: string) => {
    setSpreadId(nextSpreadId);
    setCards([]);
    setInterpretation(null);
    setPhase("idle");
  };

  const copilotReport = useMemo(() => {
    if (phase !== "revealed" || !cards.length) return null;
    return buildTarotReportSnapshot({
      question,
      spreadName: spread.name,
      cards,
      combo,
      interpretation,
    });
  }, [phase, cards, question, spread.name, combo, interpretation]);
  useRegisterMethodCopilotReport(copilotReport);

  const copyReading = async () => {
    if (!cards.length) return;
    try {
      await navigator.clipboard.writeText(readingText);
      setCopyState("已复制");
    } catch {
      setCopyState("复制失败");
    }
    window.setTimeout(() => setCopyState(""), 1400);
  };

  return (
    <Page wide className="tarot-page">
      <MethodHero
        methodId="tarot"
        kicker="RIDER-WAITE-SMITH TAROT"
        title="塔罗抽卡"
        description="使用经典 Rider-Waite-Smith 公共域卡面。先洗牌，再抽牌，最后翻开牌面并生成单牌与组合解释。"
        className="tarot-hero"
      />

      <section className="tarot-utility-grid" aria-label="塔罗辅助功能">
        <article className="daily-tarot-card">
          <div>
            <span>DAILY CARD</span>
            <h2>今日一牌 · {dailyCard.name}</h2>
            <p>{dailyCard.upright}</p>
          </div>
          <img src={dailyCard.image} alt={`今日一牌 ${dailyCard.name}`} loading="lazy" />
        </article>
        <article className="tarot-history-panel">
          <div className="section-heading">
            <p>READING LOG</p>
            <h2>抽牌历史</h2>
          </div>
          {history.length === 0 ? (
            <p className="history-empty">抽牌后会在这里保留最近 6 次记录，方便复盘。</p>
          ) : (
            <div className="tarot-history-list">
              {history.map((item) => (
                <button key={item.id} type="button">
                  <span>{item.time} · {item.spread}</span>
                  <strong>{item.question}</strong>
                  <em>{item.cards.map((c) => `${c.position}:${c.name}${c.reversed ? "逆" : "正"}`).join(" / ")}</em>
                </button>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="tarot-console">
        <div className="tarot-controls">
          <label>
            <span>问题</span>
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="写下你想问的事，也可以留空只看当下趋势。" />
          </label>
          <div className="deck-toggle" role="group" aria-label="牌组选择">
            <button type="button" className={mode === "major" ? "active" : ""} onClick={() => setMode("major")}>
              大阿卡那
            </button>
            <button type="button" className={mode === "full" ? "active" : ""} onClick={() => setMode("full")}>
              全牌组 78
            </button>
          </div>
          <div className="spread-toggle" role="group" aria-label="牌阵选择">
            {TAROT_SPREAD_LIBRARY.map((item) => (
              <button
                key={item.id}
                type="button"
                className={spreadId === item.id ? "active" : ""}
                onClick={() => resetSpread(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
          <p className="spread-note">{spread.useCase}</p>
          <button type="button" className="draw-button" onClick={draw} disabled={isBusy}>
            {phase === "shuffling" ? "洗牌中..." : phase === "drawing" ? "抽牌中..." : cards.length ? "重新洗牌抽取" : "洗牌并抽牌"}
          </button>
          {lastDraw && <p className="last-draw">上次抽牌 {lastDraw}</p>}
        </div>

        <div className={`tarot-table tarot-table--${phase}`} aria-live="polite">
          <DeckAnimation phase={phase} />
          <div className="tarot-spread" style={{ "--spread-count": spread.positions.length } as CSSProperties}>
            {visibleCards.map((card, index) => (
              !("placeholder" in card) ? (
                <article
                  className={`spread-card${phase === "revealed" ? " is-revealed" : ""}${card.reversed ? " is-reversed" : ""}`}
                  key={`${card.position}-${card.id}`}
                  style={{ "--i": index } as CSSProperties}
                >
                  <div className="spread-card__inner">
                    <div className="spread-card__back">
                      <span>{card.position}</span>
                      <strong>抽取中</strong>
                    </div>
                    <div className="spread-card__face">
                      <img src={card.image} alt={`${card.name} ${card.reversed ? "逆位" : "正位"}`} loading="lazy" />
                    </div>
                  </div>
                  <div className="spread-card__meta">
                    <span>{card.position}</span>
                    <strong>{card.name}</strong>
                    <i>{card.nameEn} · {card.reversed ? "逆位" : "正位"}</i>
                    <p>{(card.reversed ? card.reversedKeywords : card.keywords).join(" / ")}</p>
                  </div>
                </article>
              ) : (
                <article className="spread-card spread-card--placeholder" key={`${card.position}-${index}`}>
                  <div className="spread-card__inner">
                    <div className="spread-card__back">
                      <span>{card.position}</span>
                      <strong>待抽取</strong>
                    </div>
                  </div>
                  <div className="spread-card__meta">
                    <span>{card.position}</span>
                    <strong>牌背</strong>
                    <i>等待洗牌</i>
                    <p>点击抽牌后显示 Rider-Waite-Smith 经典牌面。</p>
                  </div>
                </article>
              )
            ))}
          </div>
        </div>
      </section>

      <section className="tarot-reading">
        <div className="section-heading">
          <p>INTERPRETATION</p>
          <h2>牌面与组合解释</h2>
        </div>
        {phase === "revealed" && cards.length > 0 && (
          <div className="method-result-actions">
            <MethodCopilotTrigger variant="analyze" />
          </div>
        )}
        {cards.length > 0 && (
          <div className="tarot-reading-actions">
            <button type="button" onClick={copyReading}>复制本次解读</button>
            {copyState && <span>{copyState}</span>}
          </div>
        )}
        <div className="reading-grid">
          <article>
            <span>问题焦点</span>
            <p>{question.trim() || "未指定问题，按当下趋势解释。"}</p>
          </article>
          <article>
            <span>组合语义</span>
            <p>{interpretation?.summary ?? combo}</p>
          </article>
          {interpretation && interpretation.pairMatches.length > 0 && (
            <article>
              <span>组合规则命中</span>
              <p>{interpretation.pairMatches.map((p: MatchedRule) => `${p.name}：${p.meaning}`).join("；")}</p>
            </article>
          )}
          {interpretation && interpretation.scenarioSections.length > 0 && (
            <article>
              <span>{scenarioLens.scenario}场景解读</span>
              <p>{interpretation.scenarioSections.map((s: { title: string; content: string }) => `${s.title}：${s.content}`).join(" ")}</p>
            </article>
          )}
          <article>
            <span>指点</span>
            <p>先看核心位置，再看逆位是否指出阻滞。组合解释不把牌义硬拼在一起，而是看大阿卡那比例、元素分布和牌阵位置。</p>
          </article>
        </div>
      </section>

      {cards.length > 0 && (
        <section className="tarot-card-library" aria-label="本次抽到的单牌解释">
          {cards.map((card) => (
            <article key={`meaning-${card.position}-${card.id}`} className={card.reversed ? "is-reversed" : ""}>
              <img src={card.image} alt={card.name} loading="lazy" />
              <div>
                <span>{card.position} · {card.reversed ? "逆位" : "正位"}</span>
                <h3>{card.name}</h3>
                <p>{getCardMeaning(card, card.reversed)}</p>
                {card.reversed && interpretation?.cardReadings.find((r: { name: string; reversalDetail?: string }) => r.name === card.name)?.reversalDetail && (
                  <small>{interpretation.cardReadings.find((r: { name: string; reversalDetail?: string }) => r.name === card.name)?.reversalDetail}</small>
                )}
                <em>{card.advice}</em>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="tarot-library-browser" aria-label="塔罗牌库检索">
        <div className="section-heading">
          <p>CARD LIBRARY</p>
          <h2>塔罗牌库检索</h2>
        </div>
        <div className="tarot-library-controls">
          <label>
            <span>搜索牌名 / 关键词</span>
            <input value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder="例如：恋人、冲突、水、完成..." />
          </label>
          <select value={suitFilter} onChange={(event) => setSuitFilter(event.target.value as SuitFilter)} aria-label="牌组筛选">
            <option value="all">全部牌组</option>
            <option value="major">大阿卡那</option>
            <option value="wands">权杖</option>
            <option value="cups">圣杯</option>
            <option value="swords">宝剑</option>
            <option value="pentacles">星币</option>
          </select>
        </div>
        <div className="tarot-library-grid">
          {libraryCards.map((card) => (
            <article key={card.id}>
              <img src={card.image} alt={card.name} loading="lazy" />
              <div>
                <span>{card.nameEn}</span>
                <strong>{card.name}</strong>
                <p>{card.keywords.join(" / ")}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="tarot-library-browser" aria-label="塔罗高级解释库">
        <div className="section-heading">
          <p>ADVANCED TAROT</p>
          <h2>牌阵、组合与场景解释库</h2>
        </div>
        <div className="method-module-section-grid">
          <article>
            <span>{scenarioLens.scenario}场景</span>
            <p>{scenarioLens.focus}</p>
            <em>{scenarioLens.majorArcanaKey}</em>
          </article>
          {TAROT_REVERSAL_LAYERS.slice(0, 3).map((layer) => (
            <article key={layer.layer}>
              <span>逆位 · {layer.layer}</span>
              <p>{layer.cue}</p>
              <em>{layer.reading}</em>
            </article>
          ))}
        </div>
        <div className="method-module-library__grid">
          {TAROT_SPREAD_LIBRARY.slice(0, 8).map((item) => (
            <article key={item.id}>
              <span>{item.topic} / {item.difficulty}</span>
              <strong>{item.name}</strong>
              <p>{item.positions.join(" / ")}</p>
              <em>{item.readingKey}</em>
            </article>
          ))}
        </div>
        <div className="method-module-section-grid">
          {TAROT_PAIR_RULES.slice(0, 4).map((rule) => (
            <article key={rule.id}>
              <span>{rule.theme}</span>
              <p>{rule.cards.join(" + ")}：{rule.meaning}</p>
              <em>{rule.caution}</em>
            </article>
          ))}
        </div>
        <div className="method-module-inputs" aria-label="牌感记录">
          <label>
            <span>选择牌</span>
            <select value={senseCardId} onChange={(e) => setSenseCardId(e.target.value)}>
              <option value="">—</option>
              {cards.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          {TAROT_SENSE_RECORD_FIELDS.map((field) => (
            <label key={field.field}>
              <span>{field.field}</span>
              <input
                value={senseFields[field.field] ?? ""}
                onChange={(e) => setSenseFields((prev) => ({ ...prev, [field.field]: e.target.value }))}
                placeholder={field.prompt}
              />
            </label>
          ))}
          <button
            type="button"
            disabled={!senseCardId}
            onClick={() => {
              const card = cards.find((c) => c.id === senseCardId);
              if (!card) return;
              saveTarotSenseRecord({
                cardId: card.id,
                cardName: card.name,
                fields: senseFields,
                updatedAt: new Date().toISOString(),
              });
            }}
          >
            保存牌感
          </button>
          {senseCardId && getTarotSenseRecords()[senseCardId] && (
            <p className="muted">已保存该牌的牌感记录</p>
          )}
        </div>
      </section>
    </Page>
  );
}

const deckByName: Record<string, TarotCard> = Object.fromEntries(
  TAROT_DECK.map((card) => [normalizeTarotCardName(card.name), card])
);

function resolveTarotCard(name: string): TarotCard {
  return deckByName[normalizeTarotCardName(name)] ?? TAROT_DECK[0]!;
}

function DeckAnimation({ phase }: { phase: DrawPhase }) {
  return (
    <div className="deck-animation" aria-hidden>
      {Array.from({ length: 9 }, (_, index) => (
        <span key={index} style={{ "--i": index } as CSSProperties} />
      ))}
      <strong>{phase === "shuffling" ? "SHUFFLING" : phase === "drawing" ? "DRAWING" : "DECK"}</strong>
    </div>
  );
}

function getDailyCard() {
  const dateKey = new Date().toISOString().slice(0, 10);
  const seed = Array.from(dateKey).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return TAROT_DECK[seed % TAROT_DECK.length];
}

function buildReadingText(
  question: string,
  spread: string,
  cards: DrawnCard[],
  combo: string,
  interpretation: ReturnType<typeof interpretTarot> | null,
) {
  const lines = [
    `问题：${question.trim() || "当下趋势"}`,
    `牌阵：${spread}`,
    "",
    ...cards.map((card) => `${card.position}：${card.name}${card.reversed ? "（逆位）" : "（正位）"} - ${getCardMeaning(card, card.reversed)}`),
    "",
    `组合解释：${interpretation?.summary ?? combo}`,
  ];
  if (interpretation?.pairMatches.length) {
    lines.push("", "组合规则：", ...interpretation.pairMatches.map((p: MatchedRule) => p.meaning ?? ""));
  }
  return lines.join("\n");
}
