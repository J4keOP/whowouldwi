import type { Character } from "@/lib/simulation/types";
import { CharacterPortrait } from "./CharacterPortrait";

export function CharacterCard({
  character,
  compact = false,
}: {
  character: Character;
  compact?: boolean;
}) {
  return (
    <div
      className="rounded-xl border border-white/10 bg-[oklch(0.11_0.02_260)] p-5"
      style={{ boxShadow: `0 0 40px ${character.accent}10` }}
    >
      <div className="flex items-center gap-4">
        <CharacterPortrait character={character} size={compact ? 64 : 88} />
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.2em] text-white/50">
            {character.universe}
          </div>
          <div className="truncate font-display text-2xl font-bold text-white">
            {character.name}
          </div>
          {!compact && (
            <p className="mt-1 line-clamp-2 text-sm text-white/60">
              {character.description}
            </p>
          )}
        </div>
      </div>
      {!compact && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {character.abilities.slice(0, 5).map((a) => (
            <span
              key={a}
              className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-white/70"
            >
              {a}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
