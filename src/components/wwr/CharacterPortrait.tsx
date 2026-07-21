import type { Character } from "@/lib/simulation/types";

// Original placeholder art: gradient disc + initials + subtle glow. No
// copyrighted likenesses.
export function CharacterPortrait({
  character,
  size = 96,
}: {
  character: Character;
  size?: number;
}) {
  const initials = character.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className="relative flex items-center justify-center rounded-2xl"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, ${character.accent}55, transparent 60%), linear-gradient(135deg, #0b1220, #050914)`,
        boxShadow: `0 0 24px ${character.accent}30, inset 0 0 0 1px ${character.accent}55`,
      }}
      aria-hidden
    >
      <span
        className="font-display font-black tracking-tight"
        style={{
          color: character.accent,
          fontSize: size * 0.36,
          textShadow: `0 0 12px ${character.accent}80`,
        }}
      >
        {initials}
      </span>
    </div>
  );
}
