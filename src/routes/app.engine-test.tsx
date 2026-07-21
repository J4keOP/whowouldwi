import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CHARACTERS, getCharacter } from "@/lib/simulation/characters";
import { analyzeMatchup, batchSimulate } from "@/lib/simulation/engine";

export const Route = createFileRoute("/app/engine-test")({
  component: EngineTest,
});

type BatchSize = 100 | 1000 | 10000;

function EngineTest() {
  const [aId, setAId] = useState(CHARACTERS[0].id);
  const [bId, setBId] = useState(CHARACTERS[1].id);
  const [runs, setRuns] = useState<
    Array<{ n: BatchSize; aWins: number; bWins: number; ms: number }>
  >([]);

  const a = getCharacter(aId)!;
  const b = getCharacter(bId)!;
  const analysis = useMemo(() => analyzeMatchup(a, b), [a, b]);

  const run = (n: BatchSize) => {
    const t0 = performance.now();
    const res = batchSimulate(a, b, n);
    const ms = performance.now() - t0;
    setRuns((prev) => [{ n, aWins: res.aWins, bWins: res.bWins, ms }, ...prev].slice(0, 12));
  };

  const reset = () => setRuns([]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-white/50">
            Developer tool
          </div>
          <h1 className="font-display text-3xl font-black text-white">
            Engine Test Panel
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Verify that observed win rates converge on the calculated long-run
            probability.
          </p>
        </div>
        <Link
          to="/app"
          className="text-xs uppercase tracking-widest text-white/50 hover:text-white"
        >
          ← Back
        </Link>
      </div>

      <div className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-6 md:grid-cols-2">
        <PickCol label="Fighter A" value={aId} onChange={setAId} exclude={bId} />
        <PickCol label="Fighter B" value={bId} onChange={setBId} exclude={aId} />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/50">
              Calculated long-run
            </div>
            <div className="font-display text-2xl text-white">
              <span style={{ color: a.accent }}>
                {(analysis.probA * 100).toFixed(2)}%
              </span>
              <span className="mx-2 text-white/40">/</span>
              <span style={{ color: b.accent }}>
                {(analysis.probB * 100).toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {([100, 1000, 10000] as BatchSize[]).map((n) => (
              <button
                key={n}
                onClick={() => run(n)}
                className="rounded-md border border-white/15 bg-white/[0.03] px-4 py-2 text-xs font-bold tracking-wider text-white/80 hover:bg-white/[0.08]"
              >
                RUN {n.toLocaleString()}
              </button>
            ))}
            <button
              onClick={reset}
              className="rounded-md px-3 py-2 text-xs text-white/50 hover:text-white"
            >
              clear
            </button>
          </div>
        </div>

        {runs.length > 0 && (
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="text-left text-[0.7rem] uppercase tracking-widest text-white/40">
                <th className="py-2">Sample</th>
                <th>Observed A</th>
                <th>Observed B</th>
                <th>Δ from expected</th>
                <th>Tolerance</th>
                <th>ms</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r, i) => {
                const obsA = r.aWins / r.n;
                const delta = obsA - analysis.probA;
                // 2σ envelope for binomial n·p·(1-p)
                const stderr = Math.sqrt(
                  (analysis.probA * (1 - analysis.probA)) / r.n,
                );
                const tol = 2 * stderr;
                const ok = Math.abs(delta) <= tol;
                return (
                  <tr key={i} className="border-t border-white/5">
                    <td className="py-2 font-mono">{r.n.toLocaleString()}</td>
                    <td>
                      {r.aWins} ({(obsA * 100).toFixed(2)}%)
                    </td>
                    <td>
                      {r.bWins} ({((1 - obsA) * 100).toFixed(2)}%)
                    </td>
                    <td
                      className={delta >= 0 ? "text-emerald-300" : "text-rose-300"}
                    >
                      {(delta * 100).toFixed(2)}pp
                    </td>
                    <td className="text-white/60">±{(tol * 100).toFixed(2)}pp</td>
                    <td>
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest ${
                          ok
                            ? "bg-emerald-400/15 text-emerald-300"
                            : "bg-rose-400/15 text-rose-300"
                        }`}
                      >
                        {ok ? "in tol" : "outside"}
                      </span>{" "}
                      <span className="text-white/40">{r.ms.toFixed(1)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-center text-xs text-white/40">
        Tolerance = 2× standard error. ~95% of runs should fall inside.
      </p>
    </div>
  );
}

function PickCol({
  label,
  value,
  onChange,
  exclude,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  exclude: string;
}) {
  return (
    <div>
      <div className="mb-2 text-xs uppercase tracking-widest text-white/50">
        {label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-white/10 bg-[#0a0f1c] px-3 py-2 text-white"
      >
        {CHARACTERS.filter((c) => c.id !== exclude).map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} · {c.universe}
          </option>
        ))}
      </select>
    </div>
  );
}
