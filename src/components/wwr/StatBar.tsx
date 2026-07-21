export function StatBar({
  label,
  a,
  b,
  accentA,
  accentB,
}: {
  label: string;
  a: number;
  b: number;
  accentA: string;
  accentB: string;
}) {
  return (
    <div className="grid grid-cols-[3rem_1fr_5rem_1fr_3rem] items-center gap-2 py-1.5">
      <div className="text-right font-display text-sm font-bold tabular-nums text-white">
        {a}
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="absolute right-0 top-0 h-full rounded-full"
          style={{
            width: `${a}%`,
            background: `linear-gradient(90deg, transparent, ${accentA})`,
          }}
        />
      </div>
      <div className="text-center text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
        {label}
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            width: `${b}%`,
            background: `linear-gradient(90deg, ${accentB}, transparent)`,
          }}
        />
      </div>
      <div className="text-left font-display text-sm font-bold tabular-nums text-white">
        {b}
      </div>
    </div>
  );
}
