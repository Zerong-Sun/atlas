import { astro } from "iztro";
import type { ZiweiInput } from "@atlas/shared-types";

export interface ZiweiStar {
  name: string;
  type: "major" | "minor" | "transform";
  mutagen?: "禄" | "权" | "科" | "忌";
  brightness?: string;
}

export interface ZiweiPalace {
  index: number;
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  isSoul: boolean;
  isBody: boolean;
  majorStars: ZiweiStar[];
  minorStars: string[];
  mutagens: Array<{ star: string; type: "禄" | "权" | "科" | "忌" }>;
}

export interface ZiweiDecadal {
  index: number;
  range: [number, number];
  palace: string;
  heavenlyStem: string;
  earthlyBranch: string;
}

export interface ZiweiResult {
  solarDate: string;
  lunarDate: string;
  chineseDate: string;
  gender: string;
  soulPalace: string;
  bodyPalace: string;
  fiveElementsClass: string;
  palaces: ZiweiPalace[];
  decadals: ZiweiDecadal[];
  horoscopeYear?: string;
  summary: string;
}

function hourToTimeIndex(hour: number): number {
  if (hour === 23 || hour === 0) return 0;
  return Math.floor(((hour + 1) % 24) / 2) || 0;
}

export function computeZiwei(input: ZiweiInput = {}): ZiweiResult {
  if (!input.birthDate) {
    return {
      solarDate: "",
      lunarDate: "",
      chineseDate: "",
      gender: "",
      soulPalace: "",
      bodyPalace: "",
      fiveElementsClass: "",
      palaces: [],
      decadals: [],
      summary: "请提供出生日期",
    };
  }

  const timeParts = (input.birthTime ?? "12:00").split(":");
  const hour = Number(timeParts[0] ?? 12);
  const timeIndex = hourToTimeIndex(hour);
  const gender = input.gender === "female" ? "女" : "男";

  const astrolabe = astro.bySolar(input.birthDate, timeIndex, gender, true, "zh-CN");
  const horoscope = astrolabe.horoscope();

  const palaces: ZiweiPalace[] = astrolabe.palaces.map((p, index) => {
    const majorStars: ZiweiStar[] = p.majorStars.map((s) => ({
      name: s.name,
      type: "major" as const,
      mutagen: s.mutagen as ZiweiStar["mutagen"],
      brightness: s.brightness,
    }));
    const mutagens = p.majorStars
      .filter((s) => s.mutagen)
      .map((s) => ({ star: s.name, type: s.mutagen as "禄" | "权" | "科" | "忌" }));

    return {
      index,
      name: p.name,
      heavenlyStem: p.heavenlyStem,
      earthlyBranch: p.earthlyBranch,
      isSoul: p.earthlyBranch === astrolabe.earthlyBranchOfSoulPalace,
      isBody: p.earthlyBranch === astrolabe.earthlyBranchOfBodyPalace,
      majorStars,
      minorStars: p.minorStars.map((s) => s.name),
      mutagens,
    };
  });

  const soulPalace = palaces.find((p) => p.isSoul)?.name ?? "命宫";
  const bodyPalace = palaces.find((p) => p.isBody)?.name ?? "身宫";

  const decadals: ZiweiDecadal[] = astrolabe.palaces[0]?.decadal
    ? astrolabe.palaces.map((p, index) => ({
        index,
        range: p.decadal.range as [number, number],
        palace: p.name,
        heavenlyStem: p.decadal.heavenlyStem,
        earthlyBranch: p.decadal.earthlyBranch,
      }))
    : [];

  return {
    solarDate: astrolabe.solarDate,
    lunarDate: astrolabe.lunarDate,
    chineseDate: astrolabe.chineseDate,
    gender: astrolabe.gender,
    soulPalace,
    bodyPalace,
    fiveElementsClass: astrolabe.fiveElementsClass,
    palaces,
    decadals,
    horoscopeYear: horoscope.yearly?.name,
    summary: `命宫在${soulPalace}，身宫在${bodyPalace}，${astrolabe.fiveElementsClass}`,
  };
}
