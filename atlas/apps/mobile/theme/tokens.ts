import { colors } from "@atlas/theme";

export {
  colors,
  spacing,
  radius,
  typography,
  DAY_COLORS,
  resolveDayColor,
  buildEntryId,
  formatEntryLabel,
  isDayFieldLight,
  hashDateSeed,
  type DayColor,
} from "@atlas/theme";

/** @deprecated use named exports from @/theme/tokens */
export const theme = { colors } as const;
