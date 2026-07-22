import type { StatImpact } from "@/lib/simulation/stat-impact";

export function StatBar({
  impact,
  rank,
  nameA,
  nameB,
  accentA,
  accentB,
}: {
  impact: StatImpact;
  rank: number;
  nameA: string;
  nameB: string;
  accentA: string;
  accentB: string;
}) {
  const winnerName = impact.edge === "A" ? nameA : impact.edge === "B" ? nameB : "Even";
  const winnerAccent = impact.edge === "A" ? accentA : impact.edge === "B" ? accentB : "#94a3b8";
  const extent = Math.min(46, 7 + impact.gap * 0.62);
  const fillStyle =
    impact.edge === "A"
      ? { left: `${50 - extent}%`, width: `${extent}%`, background: accentA }
      : impact.edge === "B"
        ? { left: "50%", width: `${extent}%`, background: accentB }
        : { left: "48.5%", width: "3%", background: "#94a3b8" };

  return (
    <article className="rounded-xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="pt-0.5 font-display text-xs tabular-nums text-white/25">
            {String(rank).padStart(2, "0")}
          </div>
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-white">
              {impact.label}
            </h4>
            <ImportanceStars impact={impact} />
          </div>
        </div>
        <div
          className="rounded-full border px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-widest"
          style={{
            color: winnerAccent,
            borderColor: `${winnerAccent}45`,
            background: `${winnerAccent}12`,
          }}
        >
          {impact.edge === "EVEN" ? "No clear edge" : `${winnerName} +${impact.gap}`}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[3.25rem_1fr_3.25rem] items-center gap-3">
        <StatValue
          value={impact.valueA}
          delta={impact.contextDeltaA}
          color={accentA}
          align="right"
        />
        <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.065]">
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/30" />
          <div
            className="absolute inset-y-0 rounded-full transition-all duration-500"
            style={{
              ...fillStyle,
              boxShadow: `0 0 14px ${winnerAccent}80`,
            }}
          />
        </div>
        <StatValue
          value={impact.valueB}
          delta={impact.contextDeltaB}
          color={accentB}
          align="left"
        />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-white/45">{impact.detail}</p>
    </article>
  );
}

export function SecondaryStat({
  impact,
  nameA,
  nameB,
  accentA,
  accentB,
}: {
  impact: StatImpact;
  nameA: string;
  nameB: string;
  accentA: string;
  accentB: string;
}) {
  const winnerName = impact.edge === "A" ? nameA : impact.edge === "B" ? nameB : "Even";
  const winnerAccent = impact.edge === "A" ? accentA : impact.edge === "B" ? accentB : "#94a3b8";

  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.018] px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-white/75">{impact.label}</div>
          <ImportanceStars impact={impact} compact />
        </div>
        <div className="flex items-baseline gap-2 font-display text-sm font-bold tabular-nums">
          <span style={{ color: accentA }}>{impact.valueA}</span>
          <span className="text-[0.6rem] text-white/25">vs</span>
          <span style={{ color: accentB }}>{impact.valueB}</span>
        </div>
      </div>
      <div className="mt-2 text-[0.65rem] uppercase tracking-wider" style={{ color: winnerAccent }}>
        {impact.edge === "EVEN" ? "No clear edge" : `${winnerName} edge · +${impact.gap}`}
      </div>
    </div>
  );
}

function ImportanceStars({ impact, compact = false }: { impact: StatImpact; compact?: boolean }) {
  return (
    <div
      className={`mt-1 flex items-center gap-2 ${compact ? "text-[0.55rem]" : "text-[0.6rem]"}`}
      aria-label={`${impact.importanceLabel} importance, ${impact.importance} out of 5`}
    >
      <span className="tracking-[0.08em] text-amber-300" aria-hidden="true">
        {"★".repeat(impact.importance)}
        <span className="text-white/12">{"★".repeat(5 - impact.importance)}</span>
      </span>
      <span className="uppercase tracking-[0.16em] text-white/35">{impact.importanceLabel}</span>
    </div>
  );
}

function StatValue({
  value,
  delta,
  color,
  align,
}: {
  value: number;
  delta: number;
  color: string;
  align: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <div className="font-display text-lg font-black tabular-nums" style={{ color }}>
        {value}
      </div>
      {delta !== 0 && (
        <div className="text-[0.55rem] tabular-nums text-white/35">
          {delta > 0 ? `+${delta}` : delta} context
        </div>
      )}
    </div>
  );
}
