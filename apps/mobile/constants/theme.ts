/** Re-export shared tokens + RN-only variant scales */
export { colors, spacing, radius, typography, theme } from "@/theme/tokens";

/** RN-only text variant scales — not shared into @atlas/theme */
export const textVariants = {
  title:   { fontSize: 28, lineHeight: 36, fontWeight: "600" as const },
  heading: { fontSize: 20, lineHeight: 28, fontWeight: "600" as const },
  body:    { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" as const },
  label:   { fontSize: 12, lineHeight: 16, fontWeight: "600" as const },
} as const;
