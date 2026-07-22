/** Client-side analytics hooks — events forwarded when Supabase/env configured */

export type AnalyticsEvent =
  | "app_open"
  | "onboarding_start"
  | "onboarding_interests"
  | "onboarding_profile"
  | "onboarding_complete"
  | "reading_start"
  | "reading_complete"
  | "citation_expand"
  | "dream_save"
  | "daily_brief_view"
  | "library_browse"
  | "history_open"
  | "profile_update";

type EventProps = Record<string, string | number | boolean | undefined>;

const queue: { event: AnalyticsEvent; props?: EventProps; at: string }[] = [];

export function track(event: AnalyticsEvent, props?: EventProps): void {
  const payload = { event, props, at: new Date().toISOString() };
  queue.push(payload);
  if (__DEV__) {
    console.debug("[analytics]", payload);
  }
}

export function flushAnalyticsQueue(): typeof queue {
  return [...queue];
}

export function clearAnalyticsQueue(): void {
  queue.length = 0;
}
