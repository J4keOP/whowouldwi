/**
 * Engine v3 domain model.
 *
 * V3 adds first-class battle context (arena, universe/realm, time of day,
 * atmosphere, terrain and starting distance) plus mechanically-derived active
 * and elapsed fight duration.
 */

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

export type DamageType =
  | "physical"
  | "energy"
  | "mystical"
  | "psychic"
  | "chemical"
  | "environmental";

export type ActionKind = "attack" | "control" | "defense" | "mobility" | "finisher";

/** 0 = contact, 1 = close, 2 = medium, 3 = long. */
export type RangeBand = 0 | 1 | 2 | 3;

export type VictoryMethod =
  | "knockout"
  | "incapacitation"
  | "containment"
  | "exhaustion"
  | "battlefield-removal";

export type TimeOfDay = "dawn" | "day" | "dusk" | "night" | "timeless";

export type TerrainType =
  | "urban"
  | "wilderness"
  | "volcanic"
  | "ocean"
  | "space"
  | "divine-realm";

export type AtmosphereType = "earthlike" | "toxic" | "vacuum" | "magical";

export interface Arena {
  id: string;
  name: string;
  shortName: string;
  description: string;
  universe: string;
  galaxy?: string;
  realm?: string;
  terrain: TerrainType;
  atmosphere: AtmosphereType;
  gravityMultiplier: number;
  destructibility: number;
  visibility: number;
  ambientMagic: number;
  ambientTechnology: number;
  hazardLevel: number;
  sizeScale: number;
  defaultStartingDistance: RangeBand;
  defaultTimeOfDay: TimeOfDay;
  tags: string[];
}

export interface EnvironmentProfile {
  /** Exact arenas where the fighter receives local knowledge and home-system access. */
  homeArenaIds: string[];
  /** Arena tags that enhance this fighter's normal toolkit. */
  affinityTags: string[];
  /** Arena tags that impair this fighter unless another trait cancels them. */
  vulnerabilityTags: string[];
  /** Traits such as vacuum-safe, aquatic, darkvision and night-specialist. */
  traits: string[];
  /** Small overall performance shift by time of day (-0.25 to +0.25). */
  timeAffinity?: Partial<Record<TimeOfDay, number>>;
}

export interface VictoryPath {
  id: string;
  name: string;
  tags: string[];
  description: string;
  actionIds?: string[];
  method?: VictoryMethod;
}

export interface DefenseProfile {
  armor: number;
  evasion: number;
  controlResistance: number;
  systemIntegrity: number;
  /** 0 = no resistance, 1 = complete immunity. */
  resistances: Partial<Record<DamageType, number>>;
  criticalSystems?: boolean;
}

export interface CombatAction {
  id: string;
  name: string;
  kind: ActionKind;
  damageType: DamageType;
  minRange: RangeBand;
  maxRange: RangeBand;
  power: number;
  accuracy: number;
  staminaCost: number;
  control?: number;
  penetration?: number;
  systemDamage?: number;
  guard?: number;
  heal?: number;
  cooldown?: number;
  /** Positive values close distance; negative values create distance. */
  distanceShift?: number;
  tags: string[];
  requiresTargetHealthBelow?: number;
  requiresTargetControlAbove?: number;
  requiresPrep?: boolean;
  canContain?: boolean;
  canBattlefieldRemove?: boolean;
  scalePiercing?: number;
  /** Optional authored timing. Otherwise V3 derives it from action kind and stats. */
  executionTimeSeconds?: number;
  recoveryTimeSeconds?: number;
  text: {
    hit: string;
    miss?: string;
  };
}

export interface Character {
  id: string;
  name: string;
  version: string;
  universe: string;
  accent: string;
  description: string;
  stats: Stats;
  /** 1 human, 2 enhanced, 3 heavy, 4 kaiju, 5 cosmic. */
  scale: 1 | 2 | 3 | 4 | 5;
  preferredRange: RangeBand;
  defense: DefenseProfile;
  environment: EnvironmentProfile;
  abilities: string[];
  resistances: string[];
  weaknesses: string[];
  actions: CombatAction[];
  victoryPaths: VictoryPath[];
}

export interface BattleContext {
  prepTime: "none" | "brief" | "full";
  morality: "in-character" | "bloodlusted";
  arenaId: string;
  timeOfDay: TimeOfDay;
  startingDistance: RangeBand;
  maxRounds: number;
}

export const DEFAULT_BATTLE_CONTEXT: BattleContext = {
  prepTime: "none",
  morality: "in-character",
  arenaId: "neutral-ruined-city",
  timeOfDay: "day",
  startingDistance: 2,
  maxRounds: 24,
};

export interface MatchupFactor {
  label: string;
  favors: "A" | "B" | "EVEN";
  weight: number;
  detail: string;
}

export interface MatchupAnalysis {
  a: Character;
  b: Character;
  scoreA: number;
  scoreB: number;
  probA: number;
  probB: number;
  favorite: "A" | "B" | "EVEN";
  confidence: number;
  factors: MatchupFactor[];
  sampleSize: number;
  engineVersion: string;
  context: BattleContext;
  arena: Arena;
}

export interface TimelineEvent {
  /** Total elapsed battle time at this event. */
  t: number;
  /** Time actually spent in active exchanges at this event. */
  activeT: number;
  phase: "opening" | "mid" | "climax" | "final";
  actor: "A" | "B" | "NEUTRAL";
  text: string;
  momentumShift: number;
  probabilityAt: number;
}

export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";

export interface BattleResult {
  seed: number;
  winnerId: string;
  loserId: string;
  winnerSide: "A" | "B";
  winnerPreProb: number;
  rarity: Rarity;
  underdog: boolean;
  /** Backward-compatible alias for total elapsed duration. */
  durationSeconds: number;
  activeCombatSeconds: number;
  totalElapsedSeconds: number;
  rounds: number;
  method: VictoryMethod;
  path: VictoryPath;
  summary: string;
  timeline: TimelineEvent[];
  mostInfluentialSuccess: string;
  mostInfluentialFailure: string;
  engineVersion: string;
  context: BattleContext;
  arena: Arena;
}
