const ASSET_BASE = "/assets/astrodice";

const PLANET_FILES: Record<string, string> = {
  sun: "zodiac-planet-sun",
  moon: "zodiac-planet-moon",
  mercury: "zodiac-planet-mercury",
  venus: "zodiac-planet-venus",
  mars: "zodiac-planet-mars",
  jupiter: "zodiac-planet-jupiter",
  saturn: "zodiac-planet-saturn",
  uranus: "zodiac-planet-uranus",
  neptune: "zodiac-planet-neptune",
  pluto: "zodiac-planet-pluto",
};

export type AstrodiceIconKind = "planet" | "sign" | "house";

export function getAstrodiceIconUrl(kind: AstrodiceIconKind, id: string): string | undefined {
  if (kind === "planet") {
    const file = PLANET_FILES[id];
    return file ? `${ASSET_BASE}/planets/${file}.svg` : undefined;
  }
  if (kind === "sign") {
    return `${ASSET_BASE}/signs/${id}.svg`;
  }
  const houseNum = Number.parseInt(id, 10);
  if (!Number.isFinite(houseNum) || houseNum < 1 || houseNum > 12) return undefined;
  return `${ASSET_BASE}/houses/house-${String(houseNum).padStart(2, "0")}.svg`;
}
