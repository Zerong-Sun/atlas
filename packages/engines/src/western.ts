import * as Astronomy from "astronomy-engine";
import type { EngineInput } from "./index.js";

const SIGNS = [
  "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座",
  "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座",
];

const PLANETS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"] as const;
const PLANET_LABELS: Record<(typeof PLANETS)[number], string> = {
  Sun: "太阳",
  Moon: "月亮",
  Mercury: "水星",
  Venus: "金星",
  Mars: "火星",
  Jupiter: "木星",
  Saturn: "土星",
};
const SIGN_META = [
  { sign: "白羊座", element: "火", modality: "基本" },
  { sign: "金牛座", element: "土", modality: "固定" },
  { sign: "双子座", element: "风", modality: "变动" },
  { sign: "巨蟹座", element: "水", modality: "基本" },
  { sign: "狮子座", element: "火", modality: "固定" },
  { sign: "处女座", element: "土", modality: "变动" },
  { sign: "天秤座", element: "风", modality: "基本" },
  { sign: "天蝎座", element: "水", modality: "固定" },
  { sign: "射手座", element: "火", modality: "变动" },
  { sign: "摩羯座", element: "土", modality: "基本" },
  { sign: "水瓶座", element: "风", modality: "固定" },
  { sign: "双鱼座", element: "水", modality: "变动" },
];
const ASPECTS = [
  { name: "合相", angle: 0, orb: 8 },
  { name: "六合", angle: 60, orb: 5 },
  { name: "刑相", angle: 90, orb: 6 },
  { name: "拱相", angle: 120, orb: 6 },
  { name: "冲相", angle: 180, orb: 8 },
];

export function computeWestern(input: EngineInput): Record<string, unknown> {
  if (!input.birthDate) {
    return { error: "birth_date_required", planets: null };
  }
  const [y, m, d] = input.birthDate.split("-").map(Number);
  const timeParts = (input.birthTime ?? "12:00").split(":");
  const hour = Number(timeParts[0] ?? 12);
  const minute = Number(timeParts[1] ?? 0);

  const lat = input.birthLat ?? 39.9;
  const lng = input.birthLng ?? 116.4;

  const date = new Date(Date.UTC(y, m - 1, d, hour - 8, minute));
  const time = Astronomy.MakeTime(date);
  const observer = new Astronomy.Observer(lat, lng, 0);

  const positions: Record<string, { sign: string; degree: number; longitude: number }> = {};

  for (const name of PLANETS) {
    const body = Astronomy.Body[name];
    const eq = Astronomy.Equator(body, time, observer, true, true);
    const lon = eq.ra * 15;
    const eclipticLon = ((lon % 360) + 360) % 360;
    const signIndex = Math.floor(eclipticLon / 30) % 12;
    positions[name] = {
      sign: SIGNS[signIndex],
      degree: Math.round((eclipticLon % 30) * 10) / 10,
      longitude: Math.round(eclipticLon * 10) / 10,
    };
  }

  const ascendant = estimateAscendant(time, observer);
  const planetList = PLANETS.map((name) => {
    const position = positions[name];
    const signIndex = SIGNS.indexOf(position.sign);
    const meta = SIGN_META[signIndex];
    return {
      key: name,
      label: PLANET_LABELS[name],
      sign: position.sign,
      degree: position.degree,
      longitude: position.longitude,
      house: estimateHouse(position.longitude, ascendant.longitude),
      element: meta?.element ?? "",
      modality: meta?.modality ?? "",
      meaning: planetMeaning(name),
    };
  });
  const elementBalance = countBy(planetList.map((p) => p.element), ["火", "土", "风", "水"]);
  const modalityBalance = countBy(planetList.map((p) => p.modality), ["基本", "固定", "变动"]);
  const aspects = buildAspects(planetList);

  return {
    planets: positions,
    planetList,
    ascendant,
    elementBalance,
    modalityBalance,
    aspects,
    summary: `太阳${positions.Sun.sign}、月亮${positions.Moon.sign}、上升${ascendant.sign}`,
  };
}

function estimateAscendant(
  time: ReturnType<typeof Astronomy.MakeTime>,
  observer: InstanceType<typeof Astronomy.Observer>
) {
  const sunEq = Astronomy.Equator(Astronomy.Body.Sun, time, observer, true, true);
  const lon = ((sunEq.ra * 15 + 90) % 360 + 360) % 360;
  const signIndex = Math.floor(lon / 30) % 12;
  return {
    sign: SIGNS[signIndex],
    degree: Math.round((lon % 30) * 10) / 10,
    longitude: Math.round(lon * 10) / 10,
  };
}

function estimateHouse(longitude: number, ascendantLongitude: number): number {
  const offset = ((longitude - ascendantLongitude) % 360 + 360) % 360;
  return Math.floor(offset / 30) + 1;
}

function countBy(values: string[], keys: string[]): Record<string, number> {
  const result = Object.fromEntries(keys.map((key) => [key, 0])) as Record<string, number>;
  for (const value of values) {
    if (value in result) result[value] += 1;
  }
  return result;
}

function buildAspects(
  planets: Array<{ key: string; label: string; longitude: number }>
): Array<{ planetA: string; planetB: string; aspect: string; orb: number }> {
  const aspects = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const a = planets[i];
      const b = planets[j];
      const diff = Math.abs(a.longitude - b.longitude);
      const angle = diff > 180 ? 360 - diff : diff;
      const match = ASPECTS.find((aspect) => Math.abs(angle - aspect.angle) <= aspect.orb);
      if (match) {
        aspects.push({
          planetA: a.label,
          planetB: b.label,
          aspect: match.name,
          orb: Math.round(Math.abs(angle - match.angle) * 10) / 10,
        });
      }
    }
  }
  return aspects.slice(0, 8);
}

function planetMeaning(name: (typeof PLANETS)[number]): string {
  switch (name) {
    case "Sun":
      return "核心意志与生命主题";
    case "Moon":
      return "情绪需求与安全感";
    case "Mercury":
      return "思维、沟通与学习方式";
    case "Venus":
      return "关系、审美与吸引模式";
    case "Mars":
      return "行动力、欲望与冲突方式";
    case "Jupiter":
      return "扩张、机会与信念";
    case "Saturn":
      return "限制、责任与长期结构";
  }
}
