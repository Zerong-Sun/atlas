/** Shared tokens — library base + morning-mist / stargazer shell */
export const colors = {
  ink: "#0D0D0F",
  night: "#0B1020",
  nightElevated: "#141B2E",
  mist: "#E8EDF2",
  mistMuted: "#9AABB8",
  surface: "#141B2E",
  surfaceElevated: "#1C2438",
  parchment: "#E8E0D4",
  parchmentMuted: "#B8AFA0",
  gold: "#C4A574",
  goldDim: "#8A7350",
  slipBorder: "#C4A574",
  slipShadow: "rgba(11, 16, 32, 0.35)",
  text: "#E8EDF2",
  textOnLight: "#141B2E",
  textSecondary: "#9AABB8",
  textMuted: "#6B7A88",
  border: "#2A3548",
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
  serif: "'Noto Serif SC', Georgia, 'Songti SC', serif",
  sans: "system-ui, -apple-system, 'Segoe UI', 'PingFang SC', sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, 'JetBrains Mono', monospace",
} as const;
