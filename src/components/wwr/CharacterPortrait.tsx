import { useId, type CSSProperties, type ReactNode } from "react";
import type { Character, CharacterSilhouette } from "@/lib/simulation/types";

export function CharacterPortrait({
  character,
  size = 96,
  showName = false,
  className = "",
}: {
  character: Character;
  size?: number;
  showName?: boolean;
  className?: string;
}) {
  const id = useId().replaceAll(":", "");
  const { visual } = character;

  return (
    <div
      className={`fighter-mark group/mark relative shrink-0 overflow-hidden rounded-2xl ${className}`}
      style={
        {
          width: size,
          height: size,
          "--fighter-accent": character.accent,
          "--fighter-secondary": visual.secondary,
          "--fighter-highlight": visual.highlight,
          background: `radial-gradient(circle at 28% 18%, ${visual.highlight}28, transparent 34%), radial-gradient(circle at 75% 72%, ${character.accent}40, transparent 48%), linear-gradient(145deg, ${visual.secondary}, #050810 72%)`,
          boxShadow: `0 0 28px ${character.accent}2f, inset 0 0 0 1px ${character.accent}70`,
        } as CSSProperties
      }
      role="img"
      aria-label={`${character.name} fighter mark`}
    >
      <div className="fighter-mark-grid absolute inset-0 opacity-30" />
      <div className="fighter-mark-aura absolute -inset-8" />
      <svg
        className="fighter-mark-silhouette absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={visual.highlight} stopOpacity="0.32" />
            <stop offset="0.42" stopColor="#070a12" stopOpacity="0.96" />
            <stop offset="1" stopColor={visual.secondary} stopOpacity="0.82" />
          </linearGradient>
          <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.25" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <Silhouette
          kind={visual.silhouette}
          fill={`url(#${id}-body)`}
          accent={character.accent}
          highlight={visual.highlight}
          glowId={`${id}-glow`}
        />
      </svg>

      <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-black via-black/75 to-transparent" />
      {showName && (
        <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5 text-center">
          <div
            className={`fighter-mark-name fighter-mark-name--${visual.nameStyle} font-display font-black uppercase leading-none text-white`}
            style={{
              fontSize: Math.max(9, Math.min(18, size * 0.13)),
              textShadow: `0 2px 8px #000, 0 0 16px ${character.accent}a0`,
            }}
          >
            {character.name}
          </div>
          {size >= 88 && (
            <div className="mt-1 truncate text-[0.46rem] uppercase tracking-[0.24em] text-white/55">
              {character.universe}
            </div>
          )}
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl border"
        style={{ borderColor: `${character.accent}80` }}
      />
    </div>
  );
}

function Silhouette({
  kind,
  fill,
  accent,
  highlight,
  glowId,
}: {
  kind: CharacterSilhouette;
  fill: string;
  accent: string;
  highlight: string;
  glowId: string;
}) {
  const common = { fill, stroke: accent, strokeWidth: 1.35, strokeLinejoin: "round" as const };
  const glow = {
    stroke: highlight,
    filter: `url(#${glowId})`,
    strokeLinecap: "round" as const,
  };

  const marks: Record<CharacterSilhouette, ReactNode> = {
    "armored-mage": (
      <g>
        <path
          {...common}
          d="M16 92C18 72 27 63 36 59L29 45 35 18 50 8l15 10 6 27-7 14c10 4 19 13 21 33Z"
        />
        <path
          d="m36 24 14-9 14 9-4 28-10 9-10-9Z"
          fill="#111827"
          stroke={accent}
          strokeWidth="1.2"
        />
        <path {...glow} d="m42 38 6 1m10-1-6 1" strokeWidth="2" />
        <path d="M33 64 50 77l17-13" fill="none" stroke={accent} strokeWidth="1.2" opacity=".7" />
      </g>
    ),
    "space-knight": (
      <g>
        <path
          {...common}
          d="M12 92c3-21 13-31 27-35l-8-13 5-25L50 8l14 11 5 25-8 13c14 4 24 14 27 35Z"
        />
        <path
          d="M36 25c4-9 24-9 28 0l-2 18-12 13-12-13Z"
          fill="#05070b"
          stroke={accent}
          strokeWidth="1.2"
        />
        <path {...glow} d="m39 35 8 2m14-2-8 2" strokeWidth="1.8" />
        <path
          d="m44 43 6 10 6-10M36 62l14 11 14-11"
          fill="none"
          stroke={accent}
          strokeWidth="1.1"
          opacity=".72"
        />
      </g>
    ),
    "web-hero": (
      <g>
        <path
          {...common}
          d="M15 92c5-20 18-31 29-34-8-5-12-14-10-25 1-13 7-22 16-22s15 9 16 22c2 11-2 20-10 25 11 3 24 14 29 34Z"
        />
        <path
          d="m39 33 9-7-3 14-8 4Zm22 0-9-7 3 14 8 4Z"
          fill={highlight}
          stroke={accent}
          strokeWidth="1"
        />
        <path
          d="M50 13v43M35 23l30 29M65 23 35 52"
          fill="none"
          stroke={highlight}
          strokeWidth=".65"
          opacity=".32"
        />
        <path {...glow} d="M20 73 8 57m72 16 12-16" strokeWidth="1.2" opacity=".8" />
      </g>
    ),
    "gamma-titan": (
      <g>
        <path
          {...common}
          d="M3 94c1-21 9-31 27-34l9-7c-7-4-10-12-9-23 1-13 8-21 20-21s19 8 20 21c1 11-2 19-9 23l9 7c18 3 26 13 27 34Z"
        />
        <path
          d="M36 28 45 24m19 4-9-4M39 42c8 6 14 6 22 0"
          fill="none"
          stroke={highlight}
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity=".7"
        />
        <path {...glow} d="M17 69 5 58m78 11 12-11" strokeWidth="2" />
      </g>
    ),
    "night-vigilante": (
      <g>
        <path
          {...common}
          d="M10 94c4-22 15-32 30-37l-7-14 3-28 9 8 5-12 5 12 9-8 3 28-7 14c15 5 26 15 30 37Z"
        />
        <path
          d="M38 29c5-8 19-8 24 0l-2 18-10 10-10-10Z"
          fill="#080b12"
          stroke={accent}
          strokeWidth="1.1"
        />
        <path {...glow} d="m40 37 8 2m12-2-8 2" strokeWidth="1.8" />
        <path d="M28 68 50 82l22-14" fill="none" stroke={accent} strokeWidth="1.15" opacity=".55" />
      </g>
    ),
    "atomic-kaiju": (
      <g>
        <path
          {...common}
          d="M10 92c7-17 15-25 29-30L25 53l11-4-9-12 14 2-3-15 12 9 7-18 5 20 13-8-3 16 15 1-12 10 14 8-18 3c10 8 15 16 18 27Z"
        />
        <path
          d="M39 43c8-7 22-5 29 4L57 58l-18-3Z"
          fill="#071016"
          stroke={accent}
          strokeWidth="1.2"
        />
        <path {...glow} d="m48 46 6 1M62 58l7 2" strokeWidth="1.8" />
        <path d="m39 65 11 13 8-15" fill="none" stroke={accent} strokeWidth="1.2" opacity=".65" />
      </g>
    ),
  };

  return marks[kind];
}
