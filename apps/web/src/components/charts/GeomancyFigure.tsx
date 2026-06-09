import type { GeomancyFigure as GeomancyFigureType } from "@atlas/engines/geomancy";

type Props = {
  name: string;
  lines: GeomancyFigureType;
  caption?: string;
};

export function GeomancyFigure({ name, lines, caption }: Props) {
  const ordered = [...lines].reverse();
  return (
    <figure className="geomancy-figure" aria-label={`${name} 土占图形`}>
      <figcaption>{name}</figcaption>
      <div className="geomancy-figure__dots">
        {ordered.map((single, index) => (
          <div key={index} className="geomancy-figure__row">
            {single ? <span className="geomancy-dot geomancy-dot--one" /> : (
              <>
                <span className="geomancy-dot geomancy-dot--pair" />
                <span className="geomancy-dot geomancy-dot--pair" />
              </>
            )}
          </div>
        ))}
      </div>
      {caption && <p className="geomancy-figure__caption">{caption}</p>}
    </figure>
  );
}
