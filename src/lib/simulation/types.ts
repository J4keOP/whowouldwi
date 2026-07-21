// Prototype simulation types. Kept intentionally simple so the shape can move
// to a database later without a rewrite.

export type StatKey =
  | "strength"
  | "speed"
  | "durability"
  | "battleIQ"
  | "combatSkill"
  | "range"
  | "technology"
  | "magic"
  | "mentalResistance"
  | "healing"
  | "battlefieldControl"
  | "stamina";

export type Stats = Record<StatKey, number>;

export interface VictoryPath {
  id: string;
  name: string;
  /** Tags this path leans on (used to score its plausibility). */
  tags: string[];
  description: string;
}

export interface Character {
  id: string;
  name: string;
  universe: string;
  accent: string; // css color / gradient stop
  description: string;
  stats: Stats;
  abilities: string[];
  resistances: string[];
  weaknesses: string[];
  victoryPaths: VictoryPath[];
}

export interface MatchupFactor {
  label: string;
  favors: "A" | "B" | "EVEN";
  weight: number; // absolute contribution magnitude
  detail: string;
}

export interface MatchupAnalysis {
  a: Character;
  b: Character;
  scoreA: number;
  scoreB: number;
  probA: number; // 0..1, long-run
  probB: number;
  favorite: "A" | "B" | "EVEN";
  confidence: number; // 0..1 how lopsided
  factors: MatchupFactor[]; // top 5, ordered by weight
}

export interface TimelineEvent {
  t: number; // seconds into fight
  phase: "opening" | "mid" | "climax" | "final";
  actor: "A" | "B" | "NEUTRAL";
  text: string;
  momentumShift: number; // -1..1, positive = shifts toward winner
  probabilityAt: number; // winner's live probability after this beat
}

export type Rarity =
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Epic"
  | "Legendary"
  | "Mythic";

export interface BattleResult {
  seed: number;
  winnerId: string;
  loserId: string;
  winnerSide: "A" | "B";
  winnerPreProb: number;
  rarity: Rarity;
  underdog: boolean;
  durationSeconds: number;
  path: VictoryPath;
  summary: string;
  timeline: TimelineEvent[];
  mostInfluentialSuccess: string;
  mostInfluentialFailure: string;
}
