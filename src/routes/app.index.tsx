import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FighterSelect, pickTrendingMatchups } from "@/components/wwr/FighterSelect";
import { CharacterPortrait } from "@/components/wwr/CharacterPortrait";

export const Route = createFileRoute("/app/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [a, setA] = useState<string | null>(null);
  const [b, setB] = useState<string | null>(null);
  const trending = pickTrendingMatchups();

  const canAnalyze = a && b && a !== b;

  return (
    <div>
      <section className="mx-auto max-w-3xl pt-6 text-center">
        <div className="font-display text-xs uppercase tracking-[0.4em] text-[#7ea6ff]">
          Battle simulator · Prototype
        </div>
        <h1 className="mt-4 font-display text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
          WHO WOULD WIN?
        </h1>
        <p className="mt-4 text-lg text-white/60">
          Every matchup is a new possibility.
        </p>
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

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            disabled={!canAnalyze}
            onClick={() =>
              navigate({ to: "/app/matchup", search: { a: a!, b: b! } })
            }
            className="group relative overflow-hidden rounded-lg px-10 py-4 font-display text-sm font-bold tracking-[0.25em] text-white transition disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background:
                "linear-gradient(135deg, #4f8dff 0%, #8b5cf6 100%)",
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
          <span className="text-xs text-white/30">Tap to load</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {trending.map(([x, y]) => (
            <button
              key={`${x.id}-${y.id}`}
              type="button"
              onClick={() =>
                navigate({ to: "/app/matchup", search: { a: x.id, b: y.id } })
              }
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-white/25 hover:bg-white/[0.05]"
            >
              <CharacterPortrait character={x} size={48} />
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-semibold text-white">
                  {x.name}
                </div>
                <div className="text-[0.65rem] uppercase tracking-widest text-white/40">
                  vs
                </div>
                <div className="truncate text-sm font-semibold text-white">
                  {y.name}
                </div>
              </div>
              <CharacterPortrait character={y} size={48} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
