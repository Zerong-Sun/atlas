import * as AstronomyModule from "astronomy-engine";
import type { Body } from "astronomy-engine";
import type { EngineInput } from "./index.js";

/** CJS default in Node tests; named exports in Vite/Rollup ESM. */
const Astronomy = (
  (AstronomyModule as { default?: typeof AstronomyModule }).default ?? AstronomyModule
) as typeof AstronomyModule;

const SIGNS = [
  "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座",
  "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座",
];

const HOUSES = [
  "第一宫", "第二宫", "第三宫", "第四宫", "第五宫", "第六宫",
  "第七宫", "第八宫", "第九宫", "第十宫", "第十一宫", "第十二宫",
];

const PLANETS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"] as const;
const PLANET_LABELS: Record<(typeof PLANETS)[number], string> = {
  Sun: "太阳", Moon: "月亮", Mercury: "水星", Venus: "金星", Mars: "火星",
  Jupiter: "木星", Saturn: "土星", Uranus: "天王星", Neptune: "海王星", Pluto: "冥王星",
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

export interface WesternPlanet {
  key: string;
  label: string;
  sign: string;
  degree: number;
  longitude: number;
  house: number;
  houseName: string;
  element: string;
  modality: string;
  meaning: string;
}

export interface WesternHouse {
  number: number;
  name: string;
  sign: string;
  cuspDegree: number;
  cuspLongitude: number;
  meaning: string;
}

export interface WesternTransit {
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  orb: number;
  reading: string;
}

export interface WesternResult {
  planets: Record<string, { sign: string; degree: number; longitude: number }>;
  planetList: WesternPlanet[];
  houses: WesternHouse[];
  ascendant: { sign: string; degree: number; longitude: number };
  midheaven: { sign: string; degree: number; longitude: number };
  elementBalance: Record<string, number>;
  modalityBalance: Record<string, number>;
  aspects: Array<{ planetA: string; planetB: string; aspect: string; orb: number }>;
  transits?: WesternTransit[];
  progressions?: WesternPlanet[];
  summary: string;
}

function toJulianDate(y: number, m: number, d: number, hour: number, minute: number): Date {
  return new Date(Date.UTC(y, m - 1, d, hour - 8, minute));
}

type AstroTime = ReturnType<typeof Astronomy.MakeTime>;
type AstroObserver = InstanceType<typeof Astronomy.Observer>;

function eclipticLongitude(body: Body, time: AstroTime, observer: AstroObserver): number {
  const eq = Astronomy.Equator(body, time, observer, true, true);
  const lon = eq.ra * 15;
  return ((lon % 360) + 360) % 360;
}

function computeAscMc(
  time: AstroTime,
  observer: AstroObserver
): { asc: number; mc: number } {
  const gst = Astronomy.SiderealTime(time);
  const lst = (gst + observer.longitude / 15) % 24;
  const ramc = lst * 15;
  const latRad = (observer.latitude * Math.PI) / 180;
  const ramcRad = (ramc * Math.PI) / 180;
  const obliquity = 23.4393 * (Math.PI / 180);
  const ascRad = Math.atan2(
    Math.cos(ramcRad),
    -(Math.sin(ramcRad) * Math.cos(obliquity) + Math.tan(latRad) * Math.sin(obliquity))
  );
  const asc = ((ascRad * 180) / Math.PI + 360) % 360;
  const mcRad = Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(obliquity));
  const mc = ((mcRad * 180) / Math.PI + 360) % 360;
  return { asc, mc: mc };
}

function signFromLongitude(lon: number): { sign: string; degree: number; index: number } {
  const signIndex = Math.floor(lon / 30) % 12;
  return { sign: SIGNS[signIndex]!, degree: Math.round((lon % 30) * 10) / 10, index: signIndex };
}

function wholeSignHouse(planetLon: number, ascLon: number): number {
  const ascSign = Math.floor(ascLon / 30);
  const planetSign = Math.floor(planetLon / 30);
  return ((planetSign - ascSign + 12) % 12) + 1;
}

function buildHouses(ascLon: number): WesternHouse[] {
  const ascSign = Math.floor(ascLon / 30);
  const houseMeanings = [
    "自我、外在表现", "资源、价值观", "沟通、学习", "家庭、根基",
    "创造、恋爱", "工作、健康", "伴侣、合作", "共享、转化",
    "信念、远行", "事业、公众", "社群、愿景", "潜意识、疗愈",
  ];
  return HOUSES.map((name, i) => {
    const signIndex = (ascSign + i) % 12;
    const cuspLon = signIndex * 30;
    return {
      number: i + 1,
      name,
      sign: SIGNS[signIndex]!,
      cuspDegree: 0,
      cuspLongitude: cuspLon,
      meaning: houseMeanings[i]!,
    };
  });
}

function buildAspects(planets: Array<{ key: string; label: string; longitude: number }>) {
  const aspects = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const a = planets[i]!;
      const b = planets[j]!;
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
  return aspects.slice(0, 12);
}

function buildTransits(
  natal: WesternPlanet[],
  transitPositions: Array<{ label: string; longitude: number }>
): WesternTransit[] {
  const transits: WesternTransit[] = [];
  for (const t of transitPositions) {
    for (const n of natal) {
      const diff = Math.abs(t.longitude - n.longitude);
      const angle = diff > 180 ? 360 - diff : diff;
      const match = ASPECTS.find((a) => Math.abs(angle - a.angle) <= a.orb);
      if (match) {
        transits.push({
          transitPlanet: t.label,
          natalPlanet: n.label,
          aspect: match.name,
          orb: Math.round(Math.abs(angle - match.angle) * 10) / 10,
          reading: `行运${t.label}${match.name}本命${n.label}，${n.meaning}被激活。`,
        });
      }
    }
  }
  return transits.slice(0, 10);
}

function planetMeaning(name: (typeof PLANETS)[number]): string {
  const map: Record<string, string> = {
    Sun: "核心意志与生命主题", Moon: "情绪需求与安全感", Mercury: "思维、沟通与学习方式",
    Venus: "关系、审美与吸引模式", Mars: "行动力、欲望与冲突方式", Jupiter: "扩张、机会与信念",
    Saturn: "限制、责任与长期结构", Uranus: "突变、独立与创新", Neptune: "梦想、直觉与边界模糊",
    Pluto: "深层转化与权力议题",
  };
  return map[name] ?? "";
}

function countBy(values: string[], keys: string[]): Record<string, number> {
  const result = Object.fromEntries(keys.map((key) => [key, 0])) as Record<string, number>;
  for (const value of values) {
    if (value in result) result[value] += 1;
  }
  return result;
}

export function computeWestern(input: EngineInput): WesternResult | Record<string, unknown> {
  if (!input.birthDate) {
    return { error: "birth_date_required", planets: null };
  }
  const [y, m, d] = input.birthDate.split("-").map(Number);
  const timeParts = (input.birthTime ?? "12:00").split(":");
  const hour = Number(timeParts[0] ?? 12);
  const minute = Number(timeParts[1] ?? 0);
  const lat = input.birthLat ?? 39.9;
  const lng = input.birthLng ?? 116.4;

  const natalDate = toJulianDate(y, m, d, hour, minute);
  const natalTime = Astronomy.MakeTime(natalDate);
  const observer = new Astronomy.Observer(lat, lng, 0);

  const positions: Record<string, { sign: string; degree: number; longitude: number }> = {};
  for (const name of PLANETS) {
    const body = Astronomy.Body[name];
    const lon = eclipticLongitude(body, natalTime, observer);
    const { sign, degree } = signFromLongitude(lon);
    positions[name] = { sign, degree, longitude: Math.round(lon * 10) / 10 };
  }

  const { asc, mc } = computeAscMc(natalTime, observer);
  const ascInfo = signFromLongitude(asc);
  const mcInfo = signFromLongitude(mc);
  const ascendant = { sign: ascInfo.sign, degree: ascInfo.degree, longitude: Math.round(asc * 10) / 10 };
  const midheaven = { sign: mcInfo.sign, degree: mcInfo.degree, longitude: Math.round(mc * 10) / 10 };
  const houses = buildHouses(asc);

  const planetList: WesternPlanet[] = PLANETS.map((name) => {
    const position = positions[name]!;
    const signIndex = SIGNS.indexOf(position.sign);
    const meta = SIGN_META[signIndex]!;
    const houseNum = wholeSignHouse(position.longitude, asc);
    return {
      key: name,
      label: PLANET_LABELS[name],
      sign: position.sign,
      degree: position.degree,
      longitude: position.longitude,
      house: houseNum,
      houseName: HOUSES[houseNum - 1]!,
      element: meta.element,
      modality: meta.modality,
      meaning: planetMeaning(name),
    };
  });

  const aspects = buildAspects(planetList);

  let transits: WesternTransit[] | undefined;
  let progressions: WesternPlanet[] | undefined;

  if (input.timestamp) {
    const transitDate = new Date(input.timestamp);
    const transitTime = Astronomy.MakeTime(transitDate);
    const transitPositions = PLANETS.slice(0, 7).map((name) => ({
      label: PLANET_LABELS[name],
      longitude: eclipticLongitude(Astronomy.Body[name], transitTime, observer),
    }));
    transits = buildTransits(planetList, transitPositions);

    const daysSinceBirth = (transitDate.getTime() - natalDate.getTime()) / 86400000;
    const progDate = new Date(natalDate.getTime() + daysSinceBirth * 86400000);
    const progTime = Astronomy.MakeTime(progDate);
    progressions = ["Sun", "Moon"].map((name) => {
      const n = name as "Sun" | "Moon";
      const lon = eclipticLongitude(Astronomy.Body[n], progTime, observer);
      const { sign, degree } = signFromLongitude(lon);
      const houseNum = wholeSignHouse(lon, asc);
      const signIndex = SIGNS.indexOf(sign);
      const meta = SIGN_META[signIndex]!;
      return {
        key: n,
        label: `次限${PLANET_LABELS[n]}`,
        sign,
        degree,
        longitude: Math.round(lon * 10) / 10,
        house: houseNum,
        houseName: HOUSES[houseNum - 1]!,
        element: meta.element,
        modality: meta.modality,
        meaning: planetMeaning(n),
      };
    });
  }

  return {
    planets: positions,
    planetList,
    houses,
    ascendant,
    midheaven,
    elementBalance: countBy(planetList.map((p) => p.element), ["火", "土", "风", "水"]),
    modalityBalance: countBy(planetList.map((p) => p.modality), ["基本", "固定", "变动"]),
    aspects,
    transits,
    progressions,
    summary: `太阳${positions.Sun!.sign}、月亮${positions.Moon!.sign}、上升${ascendant.sign}`,
  };
}

export { SIGNS, HOUSES, PLANET_LABELS, ASPECTS };
