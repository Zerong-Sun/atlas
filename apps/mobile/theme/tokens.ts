/** Dark「高级图书馆」design tokens — ink, parchment, gold-gray */
export const colors = {
  ink: "#0D0D0F",
  surface: "#16141A",
  surfaceElevated: "#1E1C24",
  parchment: "#E8E0D4",
  parchmentMuted: "#B8AFA0",
  gold: "#C4A574",
  goldDim: "#8A7350",
  text: "#F5F0E8",
  textSecondary: "#A39E94",
  textMuted: "#6B665E",
  border: "#2A272F",
  consensus: "#4A7C6F",
  consensusBg: "#1A2E28",
  divergence: "#8B6B4A",
  divergenceBg: "#2A2218",
  danger: "#B85C5C",
  success: "#5C9E7A",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 999,
} as const;

export const typography = {
  serif: "Georgia",
  sans: "System",
  mono: "Courier",
  title: { fontSize: 28, fontWeight: "600" as const, letterSpacing: 0.5 },
  heading: { fontSize: 20, fontWeight: "600" as const },
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 13, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: "600" as const, letterSpacing: 1 },
} as const;

export const theme = { colors, spacing, radius, typography } as const;
