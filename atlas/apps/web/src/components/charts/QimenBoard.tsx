import type { QimenPalace } from "@atlas/engines/qimen";
import { PalaceGrid, type PalaceCell } from "./PalaceGrid";

/** 洛书序 3×3：巽4 离9 坤2 / 震3 中5 兑7 / 艮8 坎1 乾6 */
const BOARD_ORDER = ["巽四", "离九", "坤二", "震三", "中五", "兑七", "艮八", "坎一", "乾六"] as const;

interface QimenBoardProps {
  palaces: QimenPalace[];
  zhiFuPalace?: string;
  zhiShi?: string;
  className?: string;
}

export function QimenBoard({ palaces, zhiFuPalace, zhiShi, className = "" }: QimenBoardProps) {
  const byName = Object.fromEntries(palaces.map((p) => [p.palace, p]));
  const cells: PalaceCell[] = BOARD_ORDER.map((key) => {
    const p = byName[key];
    if (!p) {
      return { key, label: key, sublabel: "—" };
    }
    const highlight = p.isZhiFu || p.palace === zhiFuPalace || p.door === zhiShi;
    const flags = [
      p.kongWang ? "空" : "",
      p.ruMu ? "墓" : "",
      p.menPo ? "迫" : "",
      p.jiXing ? "刑" : "",
    ].filter(Boolean).join("");
    return {
      key,
      label: p.palace.replace(/[一二三四五六七八九]/, ""),
      sublabel: `${p.heavenStem}/${p.earthStem}`,
      highlight,
      children: (
        <div className="qimen-board__meta">
          {p.door && <span>{p.door}{p.isZhiShi ? "·使" : ""}</span>}
          <span>{p.star}{p.isZhiFu ? "·符" : ""}</span>
          {p.god && <span>{p.god}</span>}
          {flags && <em>{flags}</em>}
        </div>
      ),
    };
  });

  return (
    <PalaceGrid
      cells={cells}
      columns={3}
      className={`qimen-board ${className}`.trim()}
      ariaLabel="奇门九宫盘"
    />
  );
}
