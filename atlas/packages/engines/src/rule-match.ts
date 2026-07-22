import type { MatchedRule, MatchedRuleEvidence } from "@atlas/shared-types";

export interface RuleWithPredicate {
  id: string;
  name: string;
  category?: string;
  level?: string;
  meaning?: string;
  actionHint?: string;
  libraryRef?: string;
  predicate?: RulePredicate;
}

export type RulePredicate =
  | { type: "always" }
  | { type: "stemCombo"; heaven: string; earth: string; palaces?: string | "any" }
  | { type: "stemOnDoor"; stem: string; door: string }
  | { type: "stemOnStar"; stem: string; star: string }
  | { type: "godAtPalace"; god: string; palace: string }
  | { type: "doorAtPalace"; door: string; palace: string }
  | { type: "tenGodCombo"; requires: string[]; minCount?: number }
  | { type: "deityPresent"; name: string }
  | { type: "patternName"; name: string }
  | { type: "tarotPair"; cards: string[] }
  | { type: "custom"; evaluate: (ctx: unknown) => boolean | { match: boolean; evidence?: MatchedRuleEvidence[] } };

export function matchRules<T extends RuleWithPredicate>(
  ctx: unknown,
  rules: T[],
  evaluator: (ctx: unknown, predicate: RulePredicate, rule: T) => { match: boolean; evidence?: MatchedRuleEvidence[]; confidence?: number },
): MatchedRule[] {
  const results: MatchedRule[] = [];
  for (const rule of rules) {
    if (!rule.predicate) continue;
    const outcome = evaluator(ctx, rule.predicate, rule);
    if (!outcome.match) continue;
    results.push({
      id: rule.id,
      name: rule.name,
      confidence: outcome.confidence ?? 0.85,
      evidence: outcome.evidence ?? [],
      libraryRef: rule.libraryRef ?? rule.id,
      category: rule.category,
      level: rule.level,
      meaning: rule.meaning,
      actionHint: rule.actionHint,
    });
  }
  return results.sort((a, b) => b.confidence - a.confidence);
}

export function evaluatePredicate(
  ctx: unknown,
  predicate: RulePredicate,
  fallback: (ctx: unknown, predicate: RulePredicate) => { match: boolean; evidence?: MatchedRuleEvidence[]; confidence?: number },
): { match: boolean; evidence?: MatchedRuleEvidence[]; confidence?: number } {
  if (predicate.type === "always") {
    return { match: true, confidence: 1 };
  }
  if (predicate.type === "custom") {
    const result = predicate.evaluate(ctx);
    if (typeof result === "boolean") {
      return { match: result, confidence: result ? 0.9 : 0 };
    }
    return { match: result.match, evidence: result.evidence, confidence: result.match ? 0.9 : 0 };
  }
  return fallback(ctx, predicate);
}
