import type { Character, MatchupAnalysis } from "@/lib/simulation/types";
import type { CSSProperties } from "react";

const SPARKS = [
  { left: "15%", top: "20%", size: 3, delay: "-0.4s", duration: "3.1s" },
  { left: "81%", top: "16%", size: 2, delay: "-1.8s", duration: "2.7s" },
  { left: "93%", top: "46%", size: 4, delay: "-0.9s", duration: "3.6s" },
  { left: "78%", top: "82%", size: 3, delay: "-2.2s", duration: "3.2s" },
  { left: "18%", top: "86%", size: 2, delay: "-1.2s", duration: "2.9s" },
  { left: "4%", top: "55%", size: 4, delay: "-2.6s", duration: "3.8s" },
];

export function VictoryOdds({
  fighterA,
  fighterB,
  analysis,
}: {
  fighterA: Character | null;
  fighterB: Character | null;
  analysis: MatchupAnalysis | null;
}) {
  const ready = fighterA !== null && fighterB !== null && analysis !== null;
  const percentA = ready ? Math.round(analysis.probA * 100) : 50;
  const percentB = 100 - percentA;
  const colorA = fighterA?.accent ?? "#64748b";
  const colorB = fighterB?.accent ?? "#475569";
  const accessibleLabel = ready
    ? `${fighterA.name} has a ${percentA} percent victory chance. ${fighterB.name} has a ${percentB} percent victory chance.`
    : "Select two fighters to calculate victory odds.";

  return (
    <div className="flex w-full shrink-0 flex-col items-center justify-center self-center py-2 lg:w-40 lg:pt-20 xl:w-48">
      <div className="font-display text-[0.58rem] uppercase tracking-[0.3em] text-white/40">
        Victory odds
      </div>

      <div
        className="victory-odds-chart relative mt-2 h-36 w-36 lg:h-40 lg:w-40"
        style={
          {
            "--fighter-a": colorA,
            "--fighter-b": colorB,
          } as CSSProperties
        }
        role="img"
        aria-label={accessibleLabel}
      >
        <div className="victory-odds-aura absolute inset-[12%] rounded-full" />
        {SPARKS.map((spark, index) => (
          <span
            key={index}
            className="victory-odds-spark absolute rounded-full"
            style={{
              left: spark.left,
              top: spark.top,
              width: spark.size,
              height: spark.size,
              animationDelay: spark.delay,
              animationDuration: spark.duration,
              background: index % 2 === 0 ? colorA : colorB,
              boxShadow: `0 0 ${spark.size * 4}px ${index % 2 === 0 ? colorA : colorB}`,
            }}
          />
        ))}

        <svg className="absolute inset-0 -rotate-90 overflow-visible" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="49"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="15"
          />
          <circle
            className="victory-odds-segment"
            cx="60"
            cy="60"
            r="49"
            pathLength="100"
            fill="none"
            stroke={colorA}
            strokeWidth="15"
            strokeDasharray={`${percentA} ${100 - percentA}`}
            strokeLinecap="butt"
            style={{ color: colorA }}
          />
          <circle
            className="victory-odds-segment"
            cx="60"
            cy="60"
            r="49"
            pathLength="100"
            fill="none"
            stroke={colorB}
            strokeWidth="15"
            strokeDasharray={`${percentB} ${100 - percentB}`}
            strokeDashoffset={-percentA}
            strokeLinecap="butt"
            style={{ color: colorB }}
          />
          <circle
            cx="60"
            cy="60"
            r="39"
            fill="#050810"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        </svg>

        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="font-display text-2xl font-black tracking-[0.12em] text-white">VS</div>
            <div className="mt-1 text-[0.5rem] uppercase tracking-[0.2em] text-white/35">
              {ready ? `${analysis.sampleSize.toLocaleString()} sims` : "Select both"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 grid w-full grid-cols-2 gap-2" aria-hidden="true">
        <OddsLabel
          name={fighterA?.name ?? "Fighter 1"}
          percent={ready ? percentA : null}
          color={colorA}
          align="right"
        />
        <OddsLabel
          name={fighterB?.name ?? "Fighter 2"}
          percent={ready ? percentB : null}
          color={colorB}
          align="left"
        />
      </div>
    </div>
  );
}

function OddsLabel({
  name,
  percent,
  color,
  align,
}: {
  name: string;
  percent: number | null;
  color: string;
  align: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <div
        className="font-display text-lg font-black tabular-nums"
        style={{ color, textShadow: `0 0 14px ${color}70` }}
      >
        {percent === null ? "—" : `${percent}%`}
      </div>
      <div className="truncate text-[0.5rem] uppercase tracking-wider text-white/35">{name}</div>
    </div>
  );
}
