import { useCallback, useMemo } from "react";
import type { GeomancyFigure as GeomancyFigureType } from "@atlas/engines/geomancy";
import { GeomancyFigure } from "./GeomancyFigure";

export type MotherRowState = boolean | null;

type Props = {
  mothers: MotherRowState[][];
  activeMother: number;
  onMothersChange: (mothers: MotherRowState[][]) => void;
  onActiveMotherChange: (index: number) => void;
  onRowTap?: () => void;
};

const MOTHER_LABELS = ["第一母", "第二母", "第三母", "第四母"];

function cycleRow(current: MotherRowState): MotherRowState {
  if (current === null) return true;
  if (current === true) return false;
  return null;
}

function isMotherComplete(mother: MotherRowState[]): boolean {
  return mother.every((row) => row !== null);
}

function toFigureLines(mother: MotherRowState[]): GeomancyFigureType | null {
  if (!isMotherComplete(mother)) return null;
  return mother as GeomancyFigureType;
}

export function isMothersComplete(mothers: MotherRowState[][]): boolean {
  return mothers.length === 4 && mothers.every(isMotherComplete);
}

export function mothersToBooleanMatrix(mothers: MotherRowState[][]): boolean[][] {
  return mothers.map((m) => m.map((row) => row as boolean));
}

export function createEmptyMothers(): MotherRowState[][] {
  return Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => null));
}

export function GeomancyMotherBuilder({
  mothers,
  activeMother,
  onMothersChange,
  onActiveMotherChange,
  onRowTap,
}: Props) {
  const completedCount = useMemo(
    () => mothers.filter(isMotherComplete).length,
    [mothers],
  );

  const handleRowTap = useCallback(
    (motherIndex: number, rowIndex: number) => {
      const next = mothers.map((m, mi) =>
        mi === motherIndex ? m.map((row, ri) => (ri === rowIndex ? cycleRow(row) : row)) : [...m],
      );
      onMothersChange(next);

      if (motherIndex === activeMother && isMotherComplete(next[motherIndex]!)) {
        const nextIncomplete = next.findIndex((m, i) => i > motherIndex && !isMotherComplete(m));
        if (nextIncomplete >= 0) {
          onActiveMotherChange(nextIncomplete);
        } else if (motherIndex < 3) {
          onActiveMotherChange(motherIndex + 1);
        }
      }

      onRowTap?.();
    },
    [mothers, activeMother, onMothersChange, onActiveMotherChange, onRowTap],
  );

  return (
    <div className="geomancy-builder">
      <p className="geomancy-builder__hint">
        点选每行点阵：空 → 单点（阳）→ 双点（阴）→ 空。当前第 {activeMother + 1} 母，已完成 {completedCount}/4。
      </p>

      <div className="geomancy-builder__slots" role="group" aria-label="四母点阵">
        {mothers.map((mother, motherIndex) => {
          const lines = toFigureLines(mother);
          const isActive = motherIndex === activeMother;
          return (
            <div
              key={motherIndex}
              className={isActive ? "geomancy-builder__slot geomancy-builder__slot--active" : "geomancy-builder__slot"}
            >
              <div className="geomancy-builder__slot-head">
                <strong>{MOTHER_LABELS[motherIndex]}</strong>
                {!isActive && (
                  <button type="button" className="chip" onClick={() => onActiveMotherChange(motherIndex)}>
                    编辑
                  </button>
                )}
              </div>

              {lines && !isActive ? (
                <GeomancyFigure name={MOTHER_LABELS[motherIndex]!} lines={lines} />
              ) : (
                <div className="geomancy-builder__tap-grid" aria-label={`${MOTHER_LABELS[motherIndex]} 点阵`}>
                  {[...mother].reverse().map((row, displayIndex) => {
                    const rowIndex = 3 - displayIndex;
                    return (
                      <button
                        key={rowIndex}
                        type="button"
                        className="geomancy-builder__row"
                        aria-pressed={row !== null}
                        aria-label={`第 ${rowIndex + 1} 行`}
                        onClick={() => handleRowTap(motherIndex, rowIndex)}
                        disabled={motherIndex !== activeMother}
                      >
                        {row === null ? (
                          <span className="geomancy-builder__row-empty">—</span>
                        ) : row ? (
                          <span className="geomancy-dot geomancy-dot--one" />
                        ) : (
                          <>
                            <span className="geomancy-dot geomancy-dot--pair" />
                            <span className="geomancy-dot geomancy-dot--pair" />
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
