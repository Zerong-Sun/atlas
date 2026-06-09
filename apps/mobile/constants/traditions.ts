import type { Tradition } from "@atlas/shared-types";

export const TRADITION_LABELS: Record<Tradition, string> = {
  bazi: "八字",
  western: "西洋占星",
  tarot: "塔罗",
  iching: "周易",
  qimen: "奇门遁甲",
  dream: "占梦",
};

export const READING_TRADITIONS: Tradition[] = ["bazi", "western", "tarot", "iching", "qimen"];

export const TRADITION_COLORS: Record<Tradition, string> = {
  bazi: "#8B4513",
  western: "#4A6FA5",
  tarot: "#7B4A8B",
  iching: "#4A7C6F",
  qimen: "#5C4A6F",
  dream: "#6B5B95",
};

export const INTEREST_OPTIONS = [
  { id: "self", label: "自我认知" },
  { id: "career", label: "事业决策" },
  { id: "love", label: "情感关系" },
  { id: "dream", label: "梦境解析" },
  { id: "classic", label: "古籍智慧" },
  { id: "compare", label: "多体系对照" },
];
