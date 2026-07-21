// Simulation engine. Split into three responsibilities:
//   1. analyzeMatchup(a, b)  — pure, deterministic long-run analysis
//   2. simulateBattle(a, b, seed) — a single seeded battle outcome + timeline
//   3. batchSimulate(a, b, n)  — many battles with observed win rates (no timelines)

import type {
  BattleResult,
  Character,
  MatchupAnalysis,
  MatchupFactor,
  Rarity,
  TimelineEvent,
  VictoryPath,
} from "./types";
import { createRng, randomSeed } from "./rng";
import { scoreSides } from "./interactions";

// Convert score delta → probability with a logistic curve. K controls spread:
// larger K → probabilities stay closer to 50/50 for the same delta.
const K = 2.2;
const clampProb = (p: number) => Math.min(0.999, Math.max(0.001, p));

function logistic(delta: number): number {
  return 1 / (1 + Math.exp(-delta / K));
}

function topFactors(
  a: MatchupFactor[],
  b: MatchupFactor[],
  limit = 5,
): MatchupFactor[] {
  // Merge factors, keep the strongest by absolute weight, drop pure base-stat
  // noise unless it is actually a big edge.
  const merged = [...a, ...b].filter(
    (f) => !f.label.startsWith("Base:") || f.weight > 0.35,
  );
  merged.sort((x, y) => y.weight - x.weight);
  return merged.slice(0, limit);
}

export function analyzeMatchup(a: Character, b: Character): MatchupAnalysis {
  const { a: aa, b: bb } = scoreSides(a, b);
  const delta = aa.score - bb.score;
  const probA = clampProb(logistic(delta));
  const probB = 1 - probA;
  const favorite: "A" | "B" | "EVEN" =
    Math.abs(probA - 0.5) < 0.03 ? "EVEN" : probA > probB ? "A" : "B";
  const confidence = Math.abs(probA - 0.5) * 2; // 0..1
  return {
    a,
    b,
    scoreA: aa.score,
    scoreB: bb.score,
    probA,
    probB,
    favorite,
    confidence,
    factors: topFactors(aa.factors, bb.factors, 5),
  };
}

// ---------- Battle simulation ----------

function classifyRarity(preProb: number): Rarity {
  const p = preProb;
  if (p >= 0.4) return "Common";
  if (p >= 0.2) return "Uncommon";
  if (p >= 0.05) return "Rare";
  if (p >= 0.01) return "Epic";
  if (p >= 0.001) return "Legendary";
  return "Mythic";
}

// Weight a winner's paths by tag-fit against the loser, then random-pick.
function pickPath(
  winner: Character,
  loser: Character,
  rng: ReturnType<typeof createRng>,
): VictoryPath {
  const weights = winner.victoryPaths.map((p) => {
    let w = 1;
    for (const tag of p.tags) {
      switch (tag) {
        case "magic":
          if (loser.stats.mentalResistance < 60) w += 1.2;
          if (loser.resistances.includes("magic")) w -= 0.6;
          w += winner.stats.magic / 80;
          break;
        case "tech-exploit":
          if (
            loser.weaknesses.includes("mechanical") ||
            loser.weaknesses.includes("life-support-armor") ||
            loser.abilities.includes("armor")
          )
            w += 1.5;
          w += winner.stats.technology / 100;
          break;
        case "close-combat":
          w += (winner.stats.combatSkill + winner.stats.strength) / 200;
          if (loser.stats.speed > 80) w -= 0.4;
          break;
        case "ranged":
          w += winner.stats.range / 100;
          if (loser.stats.speed > 80) w -= 0.3;
          break;
        case "control":
          w += winner.stats.battlefieldControl / 100;
          break;
        case "speed":
          w += winner.stats.speed / 100;
          if (loser.stats.speed > winner.stats.speed) w -= 0.3;
          break;
        case "stamina":
          w += (winner.stats.stamina + winner.stats.healing) / 200;
          break;
        case "durability":
          w += winner.stats.durability / 100;
          break;
        case "healing":
          w += winner.stats.healing / 100;
          break;
        case "planning":
          w += winner.stats.battleIQ / 100;
          break;
        case "mind":
        case "telekinesis":
          w += winner.stats.magic / 100;
          if (loser.stats.mentalResistance > 80) w -= 0.7;
          break;
        case "energy-blasts":
        case "energy-blade":
          w += winner.stats.range / 120 + winner.stats.strength / 200;
          if (loser.resistances.includes("energy")) w -= 0.6;
          break;
        case "combat-skill":
          w += winner.stats.combatSkill / 100;
          break;
        case "strength":
          w += winner.stats.strength / 100;
          break;
        case "stealth":
          w += winner.stats.battleIQ / 200 + 0.2;
          break;
      }
    }
    return Math.max(0.05, w);
  });
  return rng.weightedPick(winner.victoryPaths, weights);
}

// Timeline templates. Kept tiny and neutral so they combine into anything.
const OPENERS = [
  "{A} opens with a probing strike; {B} answers cautiously.",
  "{A} tests the distance while {B} circles for an angle.",
  "{B} moves first — a feint that pulls {A} out of stance.",
  "The two size each other up. Nothing lands for the first exchange.",
];
const MID = [
  "{A} lands a clean hit, but {B} absorbs it and pivots.",
  "{B} exploits an opening — the tempo shifts.",
  "{A} adapts, forcing {B} onto the back foot.",
  "Both fighters trade at range; the arena begins to break apart.",
  "{B} counters a rushed commitment from {A}.",
];
const CLIMAX = [
  "{winner} reads the pattern and commits to {path}.",
  "{loser} tries one last gambit — {winner} was waiting for it.",
  "{winner} manufactures the exact opening they needed.",
];
const FINAL = [
  "{winner} finishes it. {loser} does not get back up.",
  "{winner} closes the distance and ends the fight in a single beat.",
  "{path} lands clean. The match is over.",
];

function fill(
  template: string,
  a: Character,
  b: Character,
  winner: Character,
  loser: Character,
  path: VictoryPath,
): string {
  return template
    .replaceAll("{A}", a.name)
    .replaceAll("{B}", b.name)
    .replaceAll("{winner}", winner.name)
    .replaceAll("{loser}", loser.name)
    .replaceAll("{path}", path.name);
}

function buildTimeline(
  a: Character,
  b: Character,
  winnerSide: "A" | "B",
  path: VictoryPath,
  preProb: number,
  rng: ReturnType<typeof createRng>,
): { events: TimelineEvent[]; duration: number } {
  const winner = winnerSide === "A" ? a : b;
  const loser = winnerSide === "A" ? b : a;
  const beats = 4 + rng.int(0, 3); // 4..6 beats
  const duration = 20 + rng.int(0, 180); // 20..200s
  const events: TimelineEvent[] = [];
  let prob = preProb;

  const beatPhases: TimelineEvent["phase"][] = [];
  beatPhases.push("opening");
  for (let i = 1; i < beats - 2; i++) beatPhases.push("mid");
  beatPhases.push("climax");
  beatPhases.push("final");

  for (let i = 0; i < beatPhases.length; i++) {
    const phase = beatPhases[i];
    const t = Math.round((duration * (i + 1)) / (beatPhases.length + 1));
    const pool =
      phase === "opening"
        ? OPENERS
        : phase === "mid"
          ? MID
          : phase === "climax"
            ? CLIMAX
            : FINAL;
    const template = rng.pick(pool);
    const shift =
      phase === "final"
        ? 1
        : phase === "climax"
          ? 0.4 + rng.next() * 0.3
          : (rng.next() - 0.35) * 0.4;
    prob = Math.min(0.999, Math.max(0.05, prob + shift * (1 - prob) * 0.7));
    events.push({
      t,
      phase,
      actor: shift > 0 ? winnerSide : winnerSide === "A" ? "B" : "A",
      text: fill(template, a, b, winner, loser, path),
      momentumShift: shift,
      probabilityAt: phase === "final" ? 1 : prob,
    });
  }
  return { events, duration };
}

function pickInfluentialFactors(
  analysis: MatchupAnalysis,
  winnerSide: "A" | "B",
): { success: string; failure: string } {
  const forWinner = analysis.factors
    .filter((f) => f.favors === winnerSide)
    .sort((a, b) => b.weight - a.weight);
  const forLoser = analysis.factors
    .filter((f) => f.favors !== winnerSide && f.favors !== "EVEN")
    .sort((a, b) => b.weight - a.weight);
  return {
    success: forWinner[0]?.detail ?? "The stronger overall matchup profile.",
    failure:
      forLoser[0]?.detail ?? "No single factor was enough to change the result.",
  };
}

export interface SimulateOptions {
  seed?: number;
  precomputedAnalysis?: MatchupAnalysis;
}

export function simulateBattle(
  a: Character,
  b: Character,
  options: SimulateOptions = {},
): BattleResult {
  const analysis = options.precomputedAnalysis ?? analyzeMatchup(a, b);
  const seed = options.seed ?? randomSeed();
  const rng = createRng(seed);

  // Roll for winner using long-run probabilities. Individual rolls vary — the
  // long-run distribution does NOT (never mutate the underlying analysis).
  const roll = rng.next();
  const winnerSide: "A" | "B" = roll < analysis.probA ? "A" : "B";
  const winner = winnerSide === "A" ? a : b;
  const loser = winnerSide === "A" ? b : a;
  const preProb = winnerSide === "A" ? analysis.probA : analysis.probB;

  const path = pickPath(winner, loser, rng);
  const { events, duration } = buildTimeline(a, b, winnerSide, path, preProb, rng);
  const factors = pickInfluentialFactors(analysis, winnerSide);

  return {
    seed,
    winnerId: winner.id,
    loserId: loser.id,
    winnerSide,
    winnerPreProb: preProb,
    rarity: classifyRarity(preProb),
    underdog: preProb < 0.5,
    durationSeconds: duration,
    path,
    summary: `${winner.name} won via ${path.name.toLowerCase()} — ${path.description}`,
    timeline: events,
    mostInfluentialSuccess: factors.success,
    mostInfluentialFailure: factors.failure,
  };
}

// Fast batch — no timelines, no strings.
export function batchSimulate(
  a: Character,
  b: Character,
  n: number,
  startSeed?: number,
): { aWins: number; bWins: number; expectedA: number; expectedB: number } {
  const analysis = analyzeMatchup(a, b);
  const seed = startSeed ?? randomSeed();
  const rng = createRng(seed);
  let aWins = 0;
  for (let i = 0; i < n; i++) {
    if (rng.next() < analysis.probA) aWins++;
  }
  return {
    aWins,
    bWins: n - aWins,
    expectedA: analysis.probA,
    expectedB: analysis.probB,
  };
}
