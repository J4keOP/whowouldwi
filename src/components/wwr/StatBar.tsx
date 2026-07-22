import type { StatImpact } from "@/lib/simulation/stat-impact";

export function StatBar({
  impact,
  rank,
  emphasis = "supporting",
  nameA,
  nameB,
  accentA,
  accentB,
}: {
  impact: StatImpact;
  rank: number;
  emphasis?: "primary" | "supporting";
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
  const isPrimary = emphasis === "primary";
  const takeaway =
    impact.edge === "EVEN"
      ? `${impact.label} is the fight's biggest swing factor, but neither fighter owns a clear advantage.`
      : `${winnerName}'s ${impact.label} is the strongest stat-based reason they can win this matchup.`;

  return (
    <article
      className={`relative overflow-hidden rounded-xl border bg-black/25 transition ${
        isPrimary ? "p-5 sm:p-6" : "p-4 sm:p-5"
      }`}
      style={{
        borderColor: isPrimary ? `${winnerAccent}65` : `${winnerAccent}28`,
        boxShadow: isPrimary
          ? `0 0 26px ${winnerAccent}28, inset 0 0 40px ${winnerAccent}0d`
          : `0 0 14px ${winnerAccent}0d`,
      }}
    >
      {isPrimary && (
        <>
          <div
            className="pointer-events-none absolute -right-12 -top-20 h-52 w-52 animate-pulse rounded-full opacity-20 blur-3xl motion-reduce:animate-none"
            style={{ background: winnerAccent }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full opacity-10 blur-3xl"
            style={{ background: winnerAccent }}
          />
        </>
      )}

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div
            className={`flex shrink-0 items-center justify-center rounded-full border font-display font-black tabular-nums ${
              isPrimary ? "h-11 w-11 text-lg" : "h-8 w-8 text-xs"
            }`}
            style={{
              color: winnerAccent,
              borderColor: `${winnerAccent}55`,
              background: `${winnerAccent}12`,
              boxShadow: isPrimary ? `0 0 18px ${winnerAccent}40` : undefined,
            }}
          >
            #{rank}
          </div>
          <div>
            {isPrimary && (
              <div className="mb-1 text-[0.58rem] font-bold uppercase tracking-[0.24em] text-amber-200/80">
                Primary battle-deciding factor
              </div>
            )}
            <h4
              className={`font-display font-black uppercase text-white ${
                isPrimary
                  ? "text-xl tracking-[0.14em] sm:text-2xl"
                  : "text-sm tracking-[0.18em] sm:text-base"
              }`}
            >
              {impact.label}
            </h4>
            <ImportanceStars impact={impact} prominent={isPrimary} />
          </div>
        </div>
        <div
          className={`rounded-full border font-semibold uppercase tracking-widest ${
            isPrimary ? "px-4 py-2 text-xs" : "px-3 py-1 text-[0.6rem]"
          }`}
          style={{
            color: winnerAccent,
            borderColor: `${winnerAccent}45`,
            background: `${winnerAccent}12`,
          }}
        >
          {impact.edge === "EVEN" ? "No clear edge" : `${winnerName} +${impact.gap}`}
        </div>
      </div>

      {isPrimary && (
        <p className="relative mt-5 max-w-3xl text-sm font-semibold leading-relaxed text-white/80 sm:text-base">
          {takeaway}
        </p>
      )}

      <div
        className={`relative grid items-center gap-3 ${
          isPrimary
            ? "mt-5 grid-cols-[4rem_1fr_4rem] sm:grid-cols-[5rem_1fr_5rem]"
            : "mt-4 grid-cols-[3.25rem_1fr_3.25rem]"
        }`}
      >
        <StatValue
          value={impact.valueA}
          delta={impact.contextDeltaA}
          color={accentA}
          align="right"
          prominent={isPrimary}
        />
        <div
          className={`relative overflow-hidden rounded-full bg-white/[0.065] ${isPrimary ? "h-3" : "h-2"}`}
        >
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
          prominent={isPrimary}
        />
      </div>

      <p
        className={`relative leading-relaxed ${
          isPrimary ? "mt-4 text-sm text-white/55" : "mt-3 text-xs text-white/45"
        }`}
      >
        {impact.detail}
      </p>
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

function ImportanceStars({
  impact,
  compact = false,
  prominent = false,
}: {
  impact: StatImpact;
  compact?: boolean;
  prominent?: boolean;
}) {
  return (
    <div
      className={`mt-1 flex items-center gap-2 ${
        prominent ? "text-sm" : compact ? "text-[0.55rem]" : "text-[0.6rem]"
      }`}
      aria-label={`${impact.importanceLabel} importance, ${impact.importance} out of 5`}
    >
      <span
        className="tracking-[0.08em] text-amber-300"
        style={{ textShadow: prominent ? "0 0 12px rgba(252,211,77,0.75)" : undefined }}
        aria-hidden="true"
      >
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
  prominent = false,
}: {
  value: number;
  delta: number;
  color: string;
  align: "left" | "right";
  prominent?: boolean;
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <div
        className={`font-display font-black tabular-nums ${prominent ? "text-2xl sm:text-3xl" : "text-lg"}`}
        style={{ color, textShadow: prominent ? `0 0 14px ${color}65` : undefined }}
      >
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
