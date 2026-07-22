import { useMemo, type CSSProperties, type ReactNode } from "react";
import type { DailyBriefDayColor } from "@atlas/shared-types";
import { hashDateSeed, isDayFieldLight, resolveDayColor, colors, type DayColor } from "@/theme/tokens";

type Props = {
  date: string;
  /** Server-resolved color; falls back to client derivation from date */
  serverDayColor?: DailyBriefDayColor;
  children: ReactNode;
  /** Night-only backdrop for loading/error states */
  static?: boolean;
};

function buildStarBackground(seed: number): string {
  const layers: string[] = [];
  let s = seed;
  for (let i = 0; i < 48; i++) {
    s = Math.imul(s ^ (s >>> 13), 1597334677);
    const x = (s % 10000) / 100;
    s = Math.imul(s, 1597334677);
    const y = 55 + ((s % 10000) / 100) * 0.45;
    const size = 1 + (s % 3);
    const opacity = 0.12 + ((s % 5) * 0.04);
    layers.push(
      `radial-gradient(${size}px ${size}px at ${x}% ${y}%, rgba(232,237,242,${opacity.toFixed(2)}) 0%, transparent 100%)`
    );
  }
  return layers.join(", ");
}

export function DailyColorField({ date, serverDayColor, children, static: staticField }: Props) {
  const day: DayColor = serverDayColor ?? resolveDayColor(date);
  const light = isDayFieldLight(day);
  const starBg = useMemo(() => buildStarBackground(hashDateSeed(date)), [date]);

  const style = {
    "--day-a": day.a,
    "--day-b": day.b,
    "--text-on-day": light ? colors.textOnLight : colors.mist,
    "--on-day-muted": light ? "rgba(20, 27, 46, 0.65)" : colors.mistMuted,
    "--slip-bg": light ? "rgba(255,255,255,0.55)" : "rgba(11, 16, 32, 0.42)",
    "--slip-border": colors.slipBorder,
    "--glass-bg": light ? "rgba(255,255,255,0.35)" : "rgba(11, 16, 32, 0.55)",
    "--glass-border": light ? "rgba(20, 27, 46, 0.2)" : "rgba(196, 165, 116, 0.22)",
  } as CSSProperties;

  return (
    <div
      className={`daily-color-field${staticField ? " daily-color-field--static" : ""}`}
      style={style}
      data-day-light={light ? "1" : "0"}
    >
      <div className="daily-color-field__gradient" aria-hidden />
      <div className="daily-color-field__mist" aria-hidden />
      {!staticField && (
        <div className="daily-color-field__stars" style={{ backgroundImage: starBg }} aria-hidden />
      )}
      <div className="daily-color-field__content">{children}</div>
    </div>
  );
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
