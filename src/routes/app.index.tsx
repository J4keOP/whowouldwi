import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { CharacterPortrait } from "@/components/wwr/CharacterPortrait";
import { FighterSelect, pickTrendingMatchups } from "@/components/wwr/FighterSelect";
import {
  ARENAS,
  DISTANCE_OPTIONS,
  TIME_OPTIONS,
  getArena,
} from "@/lib/simulation/arenas";
import type { RangeBand, TimeOfDay } from "@/lib/simulation/types";

export const Route = createFileRoute("/app/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [a, setA] = useState<string | null>(null);
  const [b, setB] = useState<string | null>(null);
  const [arenaId, setArenaId] = useState("neutral-ruined-city");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("day");
  const [startingDistance, setStartingDistance] = useState<RangeBand>(2);
  const trending = pickTrendingMatchups();
  const arena = getArena(arenaId);

  const canAnalyze = a && b && a !== b;
  const search = {
    a: a!,
    b: b!,
    arena: arenaId,
    time: timeOfDay,
    distance: startingDistance,
  };

  const changeArena = (nextId: string) => {
    const next = getArena(nextId);
    setArenaId(next.id);
    setTimeOfDay(next.defaultTimeOfDay);
    setStartingDistance(next.defaultStartingDistance);
  };

  return (
    <div>
      <section className="mx-auto max-w-3xl pt-6 text-center">
        <div className="font-display text-xs uppercase tracking-[0.4em] text-[#7ea6ff]">
          Battle simulator · Engine v3
        </div>
        <h1 className="mt-4 font-display text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
          WHO WOULD WIN?
        </h1>
        <p className="mt-4 text-lg text-white/60">Every matchup is a new possibility.</p>
      </section>

      <section className="mt-12">
        <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-start">
          <FighterSelect label="Fighter 1" value={a} onChange={setA} excludeId={b} />
          <div className="flex items-center justify-center md:pt-24">
            <div
              className="grid h-16 w-16 place-items-center rounded-full font-display text-2xl font-black tracking-widest text-white"
              style={{
                background:
                  "radial-gradient(circle, rgba(88,101,242,0.5), rgba(139,92,246,0.2) 60%, transparent)",
                boxShadow: "0 0 40px rgba(88,101,242,0.4)",
              }}
            >
              VS
            </div>
          </div>
          <FighterSelect label="Fighter 2" value={b} onChange={setB} excludeId={a} />
        </div>

        <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-display text-xs uppercase tracking-[0.3em] text-white/60">
                Battle conditions
              </div>
              <div className="mt-1 text-sm text-white/45">
                Location and time change stats, survival, visibility, recovery and viable tactics.
              </div>
            </div>
            <div className="rounded-full border border-[#7ea6ff]/25 bg-[#7ea6ff]/10 px-3 py-1 text-[0.65rem] uppercase tracking-widest text-[#a9c2ff]">
              {arena.universe} · {arena.realm ?? arena.galaxy}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Arena">
              <select
                value={arenaId}
                onChange={(e) => changeArena(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#080d18] px-3 py-3 text-sm text-white outline-none focus:border-[#7ea6ff]/60"
              >
                {ARENAS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Time of day">
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                className="w-full rounded-lg border border-white/10 bg-[#080d18] px-3 py-3 text-sm text-white outline-none focus:border-[#7ea6ff]/60"
              >
                {TIME_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Starting distance">
              <select
                value={startingDistance}
                onChange={(e) => setStartingDistance(Number(e.target.value) as RangeBand)}
                className="w-full rounded-lg border border-white/10 bg-[#080d18] px-3 py-3 text-sm text-white outline-none focus:border-[#7ea6ff]/60"
              >
                {DISTANCE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-white/40">{arena.description}</p>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            disabled={!canAnalyze}
            onClick={() => navigate({ to: "/app/matchup", search })}
            className="group relative overflow-hidden rounded-lg px-10 py-4 font-display text-sm font-bold tracking-[0.25em] text-white transition disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #4f8dff 0%, #8b5cf6 100%)",
              boxShadow: canAnalyze
                ? "0 0 40px rgba(79,141,255,0.5), 0 0 80px rgba(139,92,246,0.3)"
                : undefined,
            }}
          >
            ANALYZE MATCHUP →
          </button>
        </div>
      </section>

      <section className="mt-20">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xs uppercase tracking-[0.3em] text-white/50">
            Trending matchups
          </h2>
          <span className="text-xs text-white/30">Uses your selected conditions</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {trending.map(([x, y]) => (
            <button
              key={`${x.id}-${y.id}`}
              type="button"
              onClick={() =>
                navigate({
                  to: "/app/matchup",
                  search: { ...search, a: x.id, b: y.id },
                })
              }
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-white/25 hover:bg-white/[0.05]"
            >
              <CharacterPortrait character={x} size={48} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{x.name}</div>
                <div className="text-[0.65rem] uppercase tracking-widest text-white/40">vs</div>
                <div className="truncate text-sm font-semibold text-white">{y.name}</div>
              </div>
              <CharacterPortrait character={y} size={48} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.22em] text-white/45">
        {label}
      </span>
      {children}
    </label>
  );
}
