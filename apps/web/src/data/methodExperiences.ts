export type MethodMotion = "shuffle" | "orbit" | "ripple" | "flip" | "smoke" | "static";

export type MethodExperience = {
  id: string;
  glyph: string;
  accentColor: string;
  accentSecondary: string;
  motion: MethodMotion;
  reducedMotionFallback: "fade" | "none";
  heroImage?: string;
  cardImage?: string;
};

const exp = (
  id: string,
  glyph: string,
  accentColor: string,
  accentSecondary: string,
  motion: MethodMotion
): MethodExperience => ({
  id,
  glyph,
  accentColor,
  accentSecondary,
  motion,
  reducedMotionFallback: "fade",
});

export const METHOD_EXPERIENCES: Record<string, MethodExperience> = {
  bazi: exp("bazi", "柱", "#8B4513", "#C4A574", "static"),
  "bazi-relationship": exp("bazi-relationship", "合", "#8B4513", "#C4A574", "orbit"),
  tarot: exp("tarot", "✦", "#7B4A8B", "#B88BC4", "shuffle"),
  dream: exp("dream", "☽", "#6B5B95", "#9A8BB8", "ripple"),
  iching: exp("iching", "卦", "#4A7C6F", "#7EB2B7", "ripple"),
  qimen: exp("qimen", "遁", "#7A6248", "#A8926E", "smoke"),
  ziwei: exp("ziwei", "紫微", "#5C4A8B", "#8B7AB8", "static"),
  liuyao: exp("liuyao", "爻", "#3D6B5C", "#6B9E8A", "ripple"),
  meihua: exp("meihua", "梅", "#6B8E4E", "#9CB87A", "ripple"),
  western: exp("western", "☉", "#4A6FA5", "#7EB2B7", "orbit"),
  vedic: exp("vedic", "ॐ", "#8B6914", "#C4A574", "orbit"),
  numerology: exp("numerology", "∞", "#5A7A9A", "#8BA8C4", "orbit"),
  runes: exp("runes", "ᚠ", "#6B5A4A", "#9A8A7A", "static"),
  geomancy: exp("geomancy", "土", "#7A6B4A", "#A8926E", "flip"),
  lot: exp("lot", "签", "#8B4A4A", "#C47A7A", "flip"),
  jiaobei: exp("jiaobei", "筊", "#6B5040", "#9A7868", "flip"),
  xiangmian: exp("xiangmian", "相", "#7A5A4A", "#A88A7A", "static"),
  palmistry: exp("palmistry", "掌", "#8B6B5A", "#B89A8A", "static"),
  fengshui: exp("fengshui", "罗盘", "#4A6B5A", "#7A9A8A", "smoke"),
  astrodice: exp("astrodice", "骰", "#5A6FA5", "#8AA8C4", "flip"),
  lenormand: exp("lenormand", "◈", "#4A5A7A", "#7A8AA8", "shuffle"),
  oracle: exp("oracle", "谕", "#7A5A8B", "#AA8AB8", "shuffle"),
  coffee: exp("coffee", "☕", "#6B4A3A", "#9A7A6A", "ripple"),
  scrying: exp("scrying", "晶", "#5A7A9A", "#8AA8C4", "smoke"),
};

export function getMethodExperience(methodId: string): MethodExperience {
  return (
    METHOD_EXPERIENCES[methodId] ?? {
      id: methodId,
      glyph: "✦",
      accentColor: "#C4A574",
      accentSecondary: "#7EB2B7",
      motion: "static",
      reducedMotionFallback: "fade",
    }
  );
}

export function methodExperienceStyle(experience: MethodExperience): Record<string, string> {
  return {
    "--method-accent": experience.accentColor,
    "--method-accent-secondary": experience.accentSecondary,
  };
}
