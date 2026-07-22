import type { CSSProperties } from "react";
import type { AstroHouse, AstroPlanet, AstroSign } from "@atlas/engines/astrodice";
import { AstroIcon } from "@/components/charts/AstroIcon";

export type AstrodicePhase = "idle" | "rolling" | "settled";

type AstrologyDiceProps = {
  phase: AstrodicePhase;
  planet?: AstroPlanet;
  sign?: AstroSign;
  house?: AstroHouse;
};

type DieProps = {
  label: string;
  kind: "planet" | "sign" | "house";
  iconId?: string;
  name: string;
  phase: AstrodicePhase;
  index: number;
};

function Die({ label, kind, iconId, name, phase, index }: DieProps) {
  const rolling = phase === "rolling";
  return (
    <div className={`astrodice-die astrodice-die--${phase}`} style={{ "--die-i": index } as CSSProperties}>
      <span className="astrodice-die__label">{label}</span>
      <div className="astrodice-die__cube">
        <div className="astrodice-die__face astrodice-die__face--front">
          {iconId ? (
            <AstroIcon kind={kind} id={iconId} rolling={rolling} />
          ) : (
            <span className="astrodice-icon astrodice-icon--placeholder">—</span>
          )}
          <strong>{rolling ? "滚动" : name}</strong>
        </div>
      </div>
    </div>
  );
}

export function AstrologyDice({ phase, planet, sign, house }: AstrologyDiceProps) {
  const settled = phase === "settled";

  return (
    <div className={`astrodice-stage astrodice-stage--${phase}`} aria-live="polite">
      <div className="astrodice-dice-row">
        <Die
          label="行星"
          kind="planet"
          iconId={settled && planet ? planet.id : phase === "idle" ? "sun" : undefined}
          name={settled && planet ? planet.name : "—"}
          phase={phase}
          index={0}
        />
        <Die
          label="星座"
          kind="sign"
          iconId={settled && sign ? sign.id : phase === "idle" ? "aries" : undefined}
          name={settled && sign ? sign.name : "—"}
          phase={phase}
          index={1}
        />
        <Die
          label="宫位"
          kind="house"
          iconId={settled && house ? house.id : phase === "idle" ? "1" : undefined}
          name={settled && house ? house.name : "—"}
          phase={phase}
          index={2}
        />
      </div>
      {phase === "rolling" && <p className="astrodice-stage__status">三骰滚动中…</p>}
      {phase === "idle" && <p className="astrodice-stage__hint muted">行星、星座、宫位三骰合一，合成象征语法。</p>}
    </div>
  );
}
