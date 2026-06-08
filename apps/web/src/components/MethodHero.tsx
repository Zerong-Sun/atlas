import { useEffect, type CSSProperties, type ReactNode } from "react";
import { getMethodExperience, methodExperienceStyle } from "@/data/methodExperiences";
import { playMethodSound, unlockAudio } from "@/lib/methodSounds";

type Props = {
  methodId: string;
  kicker?: string;
  title: string;
  description?: ReactNode;
  className?: string;
};

export function MethodHero({ methodId, kicker, title, description, className = "" }: Props) {
  const experience = getMethodExperience(methodId);

  useEffect(() => {
    unlockAudio();
    playMethodSound(methodId, "enter");
  }, [methodId]);

  const style = {
    ...methodExperienceStyle(experience),
    "--method-glyph": `"${experience.glyph}"`,
  } as CSSProperties;

  return (
    <section
      className={`method-experience-hero method-motion--${experience.motion} ${className}`.trim()}
      style={style}
      aria-label={title}
    >
      <div className="method-experience-hero__backdrop" aria-hidden />
      <div className="method-experience-hero__glyph" aria-hidden>
        {experience.glyph}
      </div>
      <div className="method-experience-hero__content">
        {kicker && <p className="method-kicker">{kicker}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </section>
  );
}
