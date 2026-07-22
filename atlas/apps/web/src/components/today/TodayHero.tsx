import type { DailyBrief } from "@atlas/shared-types";
import { buildEntryId, formatEntryLabel, resolveDayColor } from "@/theme/tokens";

type Props = { brief: DailyBrief };

export function TodayHero({ brief }: Props) {
  const day = brief.dayColor ?? resolveDayColor(brief.date);
  const entryId = brief.slip?.entryId ?? buildEntryId(brief.date);
  const entryLabel = formatEntryLabel(brief.date);

  return (
    <header className="today-hero">
      <span className="today-hero__pill">{day.nameEn}</span>
      <p className="today-hero__meta">
        {entryLabel}
        <br />
        {entryId}
      </p>
    </header>
  );
}
