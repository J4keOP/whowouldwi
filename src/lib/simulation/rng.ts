// Deterministic seeded RNG (mulberry32). Same seed → same sequence, so a
// simulation can be replayed exactly.

export interface RNG {
  seed: number;
  next(): number; // [0, 1)
  int(minInclusive: number, maxExclusive: number): number;
  pick<T>(arr: readonly T[]): T;
  weightedPick<T>(arr: readonly T[], weights: readonly number[]): T;
}

export function createRng(seed: number): RNG {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    seed,
    next,
    int(min, max) {
      return Math.floor(next() * (max - min)) + min;
    },
    pick(arr) {
      return arr[Math.floor(next() * arr.length)];
    },
    weightedPick(arr, weights) {
      const total = weights.reduce((a, b) => a + b, 0);
      if (total <= 0) return arr[Math.floor(next() * arr.length)];
      let r = next() * total;
      for (let i = 0; i < arr.length; i++) {
        r -= weights[i];
        if (r <= 0) return arr[i];
      }
      return arr[arr.length - 1];
    },
  };
}

export function randomSeed(): number {
  // 32-bit non-zero seed, sourced from crypto when available.
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] || 1;
  }
  return (Math.floor(Math.random() * 0xffffffff) || 1) >>> 0;
}
