import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { z } from "zod";
import { getCharacter } from "@/lib/simulation/characters";
import { analyzeMatchup } from "@/lib/simulation/engine";
import { randomSeed } from "@/lib/simulation/rng";
import { CharacterCard } from "@/components/wwr/CharacterCard";
import { StatBar } from "@/components/wwr/StatBar";
import type { StatKey } from "@/lib/simulation/types";

const searchSchema = z.object({
  a: z.string(),
  b: z.string(),
});

export const Route = createFileRoute("/app/matchup")({
  validateSearch: (s) => searchSchema.parse(s),
  component: Matchup,
});

const STAT_ORDER: StatKey[] = [
  "strength",
  "speed",
  "durability",
  "battleIQ",
  "combatSkill",
  "range",
  "technology",
  "magic",
  "mentalResistance",
  "healing",
  "battlefieldControl",
  "stamina",
];

function Matchup() {
  const { a: aId, b: bId } = Route.useSearch();
  const navigate = useNavigate();
  const a = getCharacter(aId);
  const b = getCharacter(bId);

  const analysis = useMemo(
    () => (a && b ? analyzeMatchup(a, b) : null),
    [a, b],
  );

  if (!a || !b || !analysis) {
    return (
      <div className="py-20 text-center text-white/60">
        <p>Unknown matchup.</p>
        <Link to="/app" className="mt-4 inline-block text-[#7ea6ff] underline">
          ← Choose fighters
        </Link>
      </div>
    );
  }

  const probAPct = (analysis.probA * 100).toFixed(1);
  const probBPct = (analysis.probB * 100).toFixed(1);
  const favName =
    analysis.favorite === "A"
      ? a.name
      : analysis.favorite === "B"
        ? b.name
        : "Even fight";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to="/app"
          className="text-xs uppercase tracking-widest text-white/50 hover:text-white"
        >
          ← Change matchup
        </Link>
        <div className="text-xs uppercase tracking-widest text-white/40">
          Pre-battle analysis
        </div>
      </div>

      {/* Cards + probability */}
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
        <CharacterCard character={a} />
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <div className="text-[0.65rem] uppercase tracking-[0.3em] text-white/40">
            Long-run win %
          </div>
          <div className="flex items-center gap-4">
            <ProbBig value={probAPct} accent={a.accent} />
            <span className="font-display text-xl text-white/40">·</span>
            <ProbBig value={probBPct} accent={b.accent} />
          </div>
          <div className="mt-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[0.65rem] uppercase tracking-widest text-white/70">
            {analysis.favorite === "EVEN"
              ? "Coin flip"
              : `Favorite: ${favName}`}
          </div>
          <div className="text-[0.6rem] uppercase tracking-widest text-white/40">
            Confidence {(analysis.confidence * 100).toFixed(0)}%
          </div>
        </div>
        <CharacterCard character={b} />
      </div>

      {/* Simulate */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() =>
            navigate({
              to: "/app/battle",
              search: { a: a.id, b: b.id, seed: randomSeed() },
            })
          }
          className="rounded-lg px-12 py-4 font-display text-sm font-bold tracking-[0.25em] text-white"
          style={{
            background: "linear-gradient(135deg, #4f8dff 0%, #8b5cf6 100%)",
            boxShadow:
              "0 0 40px rgba(79,141,255,0.5), 0 0 80px rgba(139,92,246,0.3)",
          }}
        >
          SIMULATE BATTLE →
        </button>
      </div>

      {/* Stats */}
      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-sm uppercase tracking-[0.3em] text-white/60">
            Stat comparison
          </h3>
          <div className="flex gap-4 text-xs">
            <span style={{ color: a.accent }}>{a.name}</span>
            <span className="text-white/30">vs</span>
            <span style={{ color: b.accent }}>{b.name}</span>
          </div>
        </div>
        <div>
          {STAT_ORDER.map((key) => (
            <StatBar
              key={key}
              label={key}
              a={a.stats[key]}
              b={b.stats[key]}
              accentA={a.accent}
              accentB={b.accent}
            />
          ))}
        </div>
      </section>

      {/* Factors */}
      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="mb-4 font-display text-sm uppercase tracking-[0.3em] text-white/60">
          Top 5 matchup factors
        </h3>
        <ol className="space-y-2">
          {analysis.factors.map((f, i) => {
            const who =
              f.favors === "A" ? a : f.favors === "B" ? b : null;
            return (
              <li
                key={i}
                className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="font-medium text-white">
                    {f.label.replace(/^Base:/, "")}
                  </div>
                  <div className="truncate text-xs text-white/50">
                    {f.detail}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-widest"
                    style={{
                      background: who ? `${who.accent}20` : "rgba(255,255,255,0.05)",
                      color: who ? who.accent : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {who ? `Favors ${who.name}` : "Even"}
                  </div>
                  <div className="w-16 text-right font-display text-sm tabular-nums text-white/70">
                    {f.weight.toFixed(2)}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Victory paths */}
      <section className="grid gap-4 md:grid-cols-2">
        {[a, b].map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-6"
          >
            <h3
              className="mb-3 font-display text-sm uppercase tracking-widest"
              style={{ color: c.accent }}
            >
              {c.name}'s paths to victory
            </h3>
            <ul className="space-y-3">
              {c.victoryPaths.map((p) => (
                <li key={p.id}>
                  <div className="font-semibold text-white">{p.name}</div>
                  <div className="text-sm text-white/60">{p.description}</div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}

function ProbBig({ value, accent }: { value: string; accent: string }) {
  return (
    <div
      className="font-display text-4xl font-black tabular-nums"
      style={{ color: accent, textShadow: `0 0 20px ${accent}80` }}
    >
      {value}%
    </div>
  );
}
