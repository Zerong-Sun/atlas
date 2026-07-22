import type { JiaobeiFace, JiaobeiOutcome } from "@atlas/engines/jiaobei";
import { getJiaobeiOutcomeLabel } from "@atlas/engines/jiaobei";

export type JiaobeiPhase = "idle" | "tossing" | "landed";

type JiaobeiCupsProps = {
  phase: JiaobeiPhase;
  cups?: [JiaobeiFace, JiaobeiFace];
  outcome?: JiaobeiOutcome;
};

function CupSvg({
  face,
  side,
  hidden,
}: {
  face?: JiaobeiFace;
  side: "left" | "right";
  hidden?: boolean;
}) {
  const isYang = face === "yang";
  return (
    <svg
      className={`jiaobei-cup jiaobei-cup--${side}${face ? ` jiaobei-cup--${face}` : ""}${hidden ? " jiaobei-cup--hidden" : ""}`}
      viewBox="0 0 120 80"
      aria-hidden={hidden}
    >
      <path
        d="M15 55 C15 25 55 10 60 10 C65 10 105 25 105 55 C105 68 85 72 60 72 C35 72 15 68 15 55 Z"
        fill={
          hidden
            ? "rgba(90, 100, 120, 0.75)"
            : isYang
              ? "rgba(196, 165, 116, 0.85)"
              : "rgba(45, 55, 72, 0.92)"
        }
        stroke="rgba(196, 165, 116, 0.5)"
        strokeWidth="2"
      />
      {!hidden && face && (
        <>
          <ellipse
            cx="60"
            cy="28"
            rx="28"
            ry="10"
            fill={isYang ? "rgba(232, 224, 212, 0.5)" : "rgba(17, 24, 39, 0.4)"}
          />
          <text x="60" y="48" textAnchor="middle" className="jiaobei-cup__label">
            {isYang ? "阳" : "阴"}
          </text>
        </>
      )}
    </svg>
  );
}

const OUTCOME_HINTS: Record<JiaobeiOutcome, string> = {
  holy: "一阴一阳，神明允准，当前可行。",
  laugh: "两阳面，问题未准或时机未到，宜重述问句。",
  yin: "两面阴，暂不允许或条件未足，宜暂停。",
};

export function JiaobeiCups({ phase, cups, outcome }: JiaobeiCupsProps) {
  const showFaces = phase === "landed" && cups;

  return (
    <div className={`jiaobei-stage jiaobei-stage--${phase}`} aria-live="polite">
      <div className="jiaobei-cups" role="img" aria-label={showFaces ? `筊杯结果：${getJiaobeiOutcomeLabel(outcome!)}` : "双筊杯"}>
        <CupSvg face={showFaces ? cups[0] : undefined} side="left" hidden={!showFaces} />
        <CupSvg face={showFaces ? cups[1] : undefined} side="right" hidden={!showFaces} />
      </div>
      {phase === "tossing" && <p className="jiaobei-stage__status">筊杯抛掷中…</p>}
      {phase === "landed" && outcome && (
        <div className="jiaobei-outcome">
          <strong>{getJiaobeiOutcomeLabel(outcome)}</strong>
          <p>{OUTCOME_HINTS[outcome]}</p>
        </div>
      )}
      {phase === "idle" && <p className="jiaobei-stage__hint muted">心诚专注，一事一问。掷筊后见阴阳落定。</p>}
    </div>
  );
}
