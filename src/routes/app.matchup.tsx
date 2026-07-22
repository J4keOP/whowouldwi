import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { z } from "zod";
import { CharacterCard } from "@/components/wwr/CharacterCard";
import { SecondaryStat, StatBar } from "@/components/wwr/StatBar";
import {
  DISTANCE_OPTIONS,
  contextSummary,
  getArena,
  makeBattleContext,
} from "@/lib/simulation/arenas";
import { getCharacter } from "@/lib/simulation/characters";
import { analyzeMatchup } from "@/lib/simulation/engine";
import { randomSeed } from "@/lib/simulation/rng";
import { rankStatImpact } from "@/lib/simulation/stat-impact";
import type { RangeBand, TimeOfDay } from "@/lib/simulation/types";

const searchSchema = z.object({
  a: z.string(),
  b: z.string(),
  arena: z.string().default("neutral-ruined-city"),
  time: z.enum(["dawn", "day", "dusk", "night", "timeless"]).default("day"),
  distance: z.coerce.number().int().min(0).max(3).default(2),
});

export const Route = createFileRoute("/app/matchup")({
  validateSearch: (s) => searchSchema.parse(s),
  component: Matchup,
});

function Matchup() {
  const { a: aId, b: bId, arena: arenaId, time, distance } = Route.useSearch();
  const navigate = useNavigate();
  const a = getCharacter(aId);
  const b = getCharacter(bId);
  const context = useMemo(
    () =>
      makeBattleContext({
        arenaId,
        timeOfDay: time as TimeOfDay,
        startingDistance: distance as RangeBand,
      }),
    [arenaId, time, distance],
  );
  const arena = getArena(context.arenaId);
  const analysis = useMemo(
    () => (a && b ? analyzeMatchup(a, b, { context }) : null),
    [a, b, context],
  );
  const statImpact = useMemo(() => (a && b ? rankStatImpact(a, b, context) : []), [a, b, context]);

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
    analysis.favorite === "A" ? a.name : analysis.favorite === "B" ? b.name : "Even fight";
  const search = {
    a: a.id,
    b: b.id,
    arena: context.arenaId,
    time: context.timeOfDay,
    distance: context.startingDistance,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to="/app"
          className="text-xs uppercase tracking-widest text-white/50 hover:text-white"
        >
          ← Change matchup
        </Link>
        <div className="text-xs uppercase tracking-widest text-white/40">Pre-battle analysis</div>
      </div>

      <section className="rounded-xl border border-[#7ea6ff]/20 bg-[#7ea6ff]/[0.055] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[0.65rem] uppercase tracking-[0.28em] text-[#a9c2ff]">
              Battle context
            </div>
            <div className="mt-1 font-display text-xl font-bold text-white">
              {contextSummary(context)}
            </div>
            <div className="mt-1 text-sm text-white/50">{arena.description}</div>
          </div>
          <div className="flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-widest text-white/65">
            <ContextChip label={`Terrain · ${arena.terrain}`} />
            <ContextChip label={`Atmosphere · ${arena.atmosphere}`} />
            <ContextChip
              label={`Start · ${DISTANCE_OPTIONS.find((x) => x.value === context.startingDistance)?.label}`}
            />
          </div>
        </div>
      </section>

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
            {analysis.favorite === "EVEN" ? "Coin flip" : `Favorite: ${favName}`}
          </div>
          <div className="text-[0.6rem] uppercase tracking-widest text-white/40">
            Confidence {(analysis.confidence * 100).toFixed(0)}%
          </div>
          <div className="max-w-[220px] text-center text-[0.58rem] leading-relaxed text-white/30">
            Estimated from {analysis.sampleSize.toLocaleString()} context-aware fights · Engine{" "}
            {analysis.engineVersion}
          </div>
        </div>
        <CharacterCard character={b} />
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() =>
            navigate({
              to: "/app/battle",
              search: { ...search, seed: randomSeed() },
            })
          }
          className="rounded-lg px-12 py-4 font-display text-sm font-bold tracking-[0.25em] text-white"
          style={{
            background: "linear-gradient(135deg, #4f8dff 0%, #8b5cf6 100%)",
            boxShadow: "0 0 40px rgba(79,141,255,0.5), 0 0 80px rgba(139,92,246,0.3)",
          }}
        >
          SIMULATE BATTLE →
        </button>
      </div>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="border-b border-white/[0.07] bg-gradient-to-r from-white/[0.025] via-transparent to-white/[0.025] px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-display text-sm uppercase tracking-[0.3em] text-white/70">
                  Matchup-deciding stats
                </h3>
                <span className="rounded-full border border-amber-200/15 bg-amber-200/[0.06] px-2.5 py-1 text-[0.55rem] uppercase tracking-[0.2em] text-amber-100/60">
                  V3 · Dynamic impact model
                </span>
              </div>
              <p className="mt-1 text-xs text-white/40">
                Ranked by how likely each stat is to decide this exact fight.
              </p>
            </div>
            <div className="flex gap-4 text-xs">
              <span style={{ color: a.accent }}>{a.name}</span>
              <span className="text-white/30">vs</span>
              <span style={{ color: b.accent }}>{b.name}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[0.6rem] uppercase tracking-[0.24em] text-amber-200/65">
              The fight at a glance
            </div>
            <div className="text-[0.58rem] uppercase tracking-wider text-white/25">
              Context-adjusted values
            </div>
          </div>
          <div className="space-y-3">
            {statImpact.slice(0, 3).map((impact, index) => (
              <StatBar
                key={impact.key}
                impact={impact}
                rank={index + 1}
                emphasis={index === 0 ? "primary" : "supporting"}
                nameA={a.name}
                nameB={b.name}
                accentA={a.accent}
                accentB={b.accent}
              />
            ))}
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.07]" />
            <div className="text-[0.58rem] uppercase tracking-[0.22em] text-white/25">
              Secondary factors
            </div>
            <div className="h-px flex-1 bg-white/[0.07]" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {statImpact.slice(3).map((impact) => (
              <SecondaryStat
                key={impact.key}
                impact={impact}
                nameA={a.name}
                nameB={b.name}
                accentA={a.accent}
                accentB={b.accent}
              />
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-[#7ea6ff]/10 bg-[#7ea6ff]/[0.045] px-4 py-3 text-xs leading-relaxed text-white/40">
            Importance changes with the fighters, their usable attacks, the arena, time of day and
            starting distance. Stars measure matchup relevance; the center meter shows who owns the
            actual edge.
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="mb-4 font-display text-sm uppercase tracking-[0.3em] text-white/60">
          Top 5 matchup factors
        </h3>
        <ol className="space-y-2">
          {analysis.factors.map((f, i) => {
            const who = f.favors === "A" ? a : f.favors === "B" ? b : null;
            return (
              <li
                key={i}
                className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="font-medium text-white">{f.label.replace(/^Base:/, "")}</div>
                  <div className="text-xs text-white/50">{f.detail}</div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
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

      <section className="grid gap-4 md:grid-cols-2">
        {[a, b].map((c) => (
          <div key={c.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
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

function ContextChip({ label }: { label: string }) {
  return <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">{label}</span>;
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
