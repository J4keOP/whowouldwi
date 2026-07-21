import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { z } from "zod";
import { getCharacter } from "@/lib/simulation/characters";
import { analyzeMatchup, simulateBattle } from "@/lib/simulation/engine";
import { randomSeed } from "@/lib/simulation/rng";
import { CharacterPortrait } from "@/components/wwr/CharacterPortrait";
import type { Rarity } from "@/lib/simulation/types";

const searchSchema = z.object({
  a: z.string(),
  b: z.string(),
  seed: z.coerce.number().int(),
});

export const Route = createFileRoute("/app/battle")({
  validateSearch: (s) => searchSchema.parse(s),
  component: Battle,
});

const RARITY_COLOR: Record<Rarity, string> = {
  Common: "#94a3b8",
  Uncommon: "#4ade80",
  Rare: "#4f8dff",
  Epic: "#a855f7",
  Legendary: "#f59e0b",
  Mythic: "#ef4444",
};

function Battle() {
  const { a: aId, b: bId, seed } = Route.useSearch();
  const navigate = useNavigate();
  const a = getCharacter(aId);
  const b = getCharacter(bId);

  const { analysis, result } = useMemo(() => {
    if (!a || !b) return { analysis: null, result: null };
    const an = analyzeMatchup(a, b);
    const res = simulateBattle(a, b, { seed, precomputedAnalysis: an });
    return { analysis: an, result: res };
  }, [a, b, seed]);

  if (!a || !b || !result || !analysis) {
    return (
      <div className="py-20 text-center text-white/60">
        <p>Unknown matchup.</p>
        <Link to="/app" className="mt-4 inline-block text-[#7ea6ff] underline">
          ← Choose fighters
        </Link>
      </div>
    );
  }

  const winner = result.winnerSide === "A" ? a : b;
  const loser = result.winnerSide === "A" ? b : a;
  const rarityColor = RARITY_COLOR[result.rarity];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() =>
            navigate({ to: "/app/matchup", search: { a: a.id, b: b.id } })
          }
          className="text-xs uppercase tracking-widest text-white/50 hover:text-white"
        >
          ← View analysis
        </button>
        <div className="font-mono text-[0.7rem] text-white/40">
          seed · {result.seed}
        </div>
      </div>

      {/* Winner banner */}
      <div
        className="relative overflow-hidden rounded-2xl border p-8"
        style={{
          borderColor: `${winner.accent}55`,
          background: `linear-gradient(135deg, ${winner.accent}18, transparent 60%), rgba(255,255,255,0.02)`,
          boxShadow: result.underdog
            ? `0 0 60px ${rarityColor}60, 0 0 120px ${rarityColor}30`
            : `0 0 40px ${winner.accent}30`,
        }}
      >
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
          <CharacterPortrait character={winner} size={120} />
          <div className="flex-1">
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">
              Winner
            </div>
            <div
              className="font-display text-5xl font-black text-white"
              style={{ textShadow: `0 0 30px ${winner.accent}80` }}
            >
              {winner.name.toUpperCase()}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-3 py-1 font-display text-xs font-bold uppercase tracking-widest"
                style={{
                  background: `${rarityColor}22`,
                  color: rarityColor,
                  border: `1px solid ${rarityColor}66`,
                }}
              >
                {result.rarity}
              </span>
              {result.underdog && (
                <span className="rounded-full border border-amber-400/50 bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-300">
                  Upset · Underdog wins
                </span>
              )}
              <span className="text-sm text-white/60">
                Pre-battle probability{" "}
                <span className="font-bold text-white">
                  {(result.winnerPreProb * 100).toFixed(2)}%
                </span>
              </span>
            </div>
            <div className="mt-3 text-sm text-white/70">
              <span className="text-white/50">Winning path:</span>{" "}
              <span className="font-semibold text-white">{result.path.name}</span>{" "}
              — {result.path.description}
            </div>
            <div className="mt-1 text-sm text-white/50">
              Duration ~{result.durationSeconds}s
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() =>
            navigate({
              to: "/app/battle",
              search: { a: a.id, b: b.id, seed: randomSeed() },
            })
          }
          className="rounded-lg px-6 py-3 font-display text-xs font-bold tracking-[0.25em] text-white"
          style={{
            background: "linear-gradient(135deg, #4f8dff, #8b5cf6)",
            boxShadow: "0 0 24px rgba(79,141,255,0.4)",
          }}
        >
          RUN AGAIN
        </button>
        <button
          onClick={() =>
            navigate({
              to: "/app/battle",
              search: { a: a.id, b: b.id, seed },
              replace: true,
            })
          }
          className="rounded-lg border border-white/20 bg-white/[0.03] px-6 py-3 font-display text-xs font-bold tracking-[0.25em] text-white/80 hover:bg-white/[0.06]"
        >
          REPLAY THIS SEED
        </button>
        <button
          onClick={() =>
            navigate({ to: "/app/matchup", search: { a: a.id, b: b.id } })
          }
          className="rounded-lg border border-white/20 bg-white/[0.03] px-6 py-3 font-display text-xs font-bold tracking-[0.25em] text-white/80 hover:bg-white/[0.06]"
        >
          VIEW ANALYSIS
        </button>
        <button
          onClick={() => navigate({ to: "/app" })}
          className="rounded-lg border border-white/20 bg-white/[0.03] px-6 py-3 font-display text-xs font-bold tracking-[0.25em] text-white/80 hover:bg-white/[0.06]"
        >
          CHANGE MATCHUP
        </button>
      </div>

      {/* Explanation */}
      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="mb-2 font-display text-sm uppercase tracking-[0.3em] text-white/60">
          Why this simulation ended this way
        </h3>
        <p className="text-white/80">{result.summary}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Insight
            label={`Most influential success · ${winner.name}`}
            accent={winner.accent}
            text={result.mostInfluentialSuccess}
          />
          <Insight
            label={`Most influential failure · ${loser.name}`}
            accent={loser.accent}
            text={result.mostInfluentialFailure}
          />
        </div>
      </section>

      {/* Timeline */}
      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="mb-4 font-display text-sm uppercase tracking-[0.3em] text-white/60">
          Battle timeline
        </h3>
        <ol className="relative border-l border-white/10 pl-6">
          {result.timeline.map((ev, i) => (
            <li key={i} className="relative pb-5 last:pb-0">
              <span
                className="absolute -left-[9px] top-1.5 h-3 w-3 rounded-full"
                style={{
                  background:
                    ev.actor === "A"
                      ? a.accent
                      : ev.actor === "B"
                        ? b.accent
                        : "#64748b",
                  boxShadow: `0 0 10px ${
                    ev.actor === "A"
                      ? a.accent
                      : ev.actor === "B"
                        ? b.accent
                        : "#64748b"
                  }`,
                }}
              />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-xs uppercase tracking-widest text-white/40">
                  {ev.phase} · t+{ev.t}s
                </div>
                <div className="text-xs font-mono text-white/50">
                  win prob {(ev.probabilityAt * 100).toFixed(1)}%
                </div>
              </div>
              <p className="mt-1 text-white/85">{ev.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Insight({
  label,
  accent,
  text,
}: {
  label: string;
  accent: string;
  text: string;
}) {
  return (
    <div
      className="rounded-lg border p-4"
      style={{
        borderColor: `${accent}40`,
        background: `${accent}0f`,
      }}
    >
      <div
        className="text-[0.65rem] uppercase tracking-widest"
        style={{ color: accent }}
      >
        {label}
      </div>
      <div className="mt-1 text-sm text-white/80">{text}</div>
    </div>
  );
}
