import type { Character } from "@/lib/simulation/types";
import { CHARACTERS } from "@/lib/simulation/characters";
import { CharacterPortrait } from "./CharacterPortrait";

export function FighterSelect({
  label,
  value,
  onChange,
  excludeId,
}: {
  label: string;
  value: string | null;
  onChange: (id: string) => void;
  excludeId?: string | null;
}) {
  const selected = CHARACTERS.find((c) => c.id === value) ?? null;
  return (
    <div className="flex-1">
      <div className="mb-3 text-[0.7rem] uppercase tracking-[0.3em] text-white/50">{label}</div>
      <div
        className="rounded-2xl border border-white/10 bg-[oklch(0.1_0.02_260)] p-5"
        style={{
          boxShadow: selected
            ? `0 0 40px ${selected.accent}25, inset 0 0 0 1px ${selected.accent}40`
            : undefined,
        }}
      >
        <div className="flex items-center gap-4">
          {selected ? (
            <CharacterPortrait character={selected} size={104} showName />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-2xl border border-dashed border-white/15 text-3xl text-white/30">
              ?
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-display text-xl font-bold text-white">
              {selected ? "Selected fighter" : "— Select fighter —"}
            </div>
            <div className="text-xs uppercase tracking-widest text-white/50">
              {selected ? selected.universe : "Any universe"}
            </div>
            {selected && (
              <div className="mt-2 line-clamp-2 text-xs text-white/45">{selected.version}</div>
            )}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {CHARACTERS.map((c) => {
            const disabled = excludeId === c.id;
            const active = value === c.id;
            return (
              <button
                key={c.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange(c.id)}
                className={`group flex min-w-0 items-center justify-center rounded-xl border p-2 text-center transition ${
                  active
                    ? "border-white/40 bg-white/[0.06]"
                    : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                } ${disabled ? "cursor-not-allowed opacity-30" : ""}`}
                style={active ? { boxShadow: `0 0 20px ${c.accent}30` } : undefined}
              >
                <CharacterPortrait character={c} size={92} showName />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function pickTrendingMatchups(): Array<[Character, Character]> {
  const pairs: [string, string][] = [
    ["doctor-doom", "darth-vader"],
    ["hulk", "godzilla"],
    ["batman", "spider-man"],
    ["darth-vader", "batman"],
  ];
  return pairs.map(
    ([a, b]) =>
      [CHARACTERS.find((c) => c.id === a)!, CHARACTERS.find((c) => c.id === b)!] as [
        Character,
        Character,
      ],
  );
}
