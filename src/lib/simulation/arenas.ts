import type {
  Arena,
  BattleContext,
  Character,
  CombatAction,
  RangeBand,
  StatKey,
  TimeOfDay,
} from "./types";
import { DEFAULT_BATTLE_CONTEXT } from "./types";

export const ARENAS: Arena[] = [
  {
    id: "neutral-ruined-city",
    name: "Neutral Ruined City",
    shortName: "Ruined City",
    description: "A deserted Earth city with damaged towers, streets, cover and no local defender.",
    universe: "Neutral",
    galaxy: "Milky Way",
    realm: "Earthlike reality",
    terrain: "urban",
    atmosphere: "earthlike",
    gravityMultiplier: 1,
    destructibility: 0.82,
    visibility: 0.82,
    ambientMagic: 0.5,
    ambientTechnology: 0.55,
    hazardLevel: 0.18,
    sizeScale: 1.2,
    defaultStartingDistance: 2,
    defaultTimeOfDay: "day",
    tags: ["urban", "cover", "destructible", "earthlike"],
  },
  {
    id: "gotham-city",
    name: "Gotham City",
    shortName: "Gotham",
    description: "Dense rooftops, alleys, surveillance access and deep shadows in Batman's home city.",
    universe: "DC",
    galaxy: "Milky Way",
    realm: "Prime Earth",
    terrain: "urban",
    atmosphere: "earthlike",
    gravityMultiplier: 1,
    destructibility: 0.65,
    visibility: 0.48,
    ambientMagic: 0.35,
    ambientTechnology: 0.76,
    hazardLevel: 0.12,
    sizeScale: 1.4,
    defaultStartingDistance: 2,
    defaultTimeOfDay: "night",
    tags: ["urban", "dense-cover", "dark", "high-tech", "earthlike"],
  },
  {
    id: "latveria",
    name: "Castle Doom, Latveria",
    shortName: "Latveria",
    description: "A fortified techno-mystic stronghold saturated with Doom's systems, wards and local knowledge.",
    universe: "Marvel",
    galaxy: "Milky Way",
    realm: "Earth-616",
    terrain: "urban",
    atmosphere: "earthlike",
    gravityMultiplier: 1,
    destructibility: 0.32,
    visibility: 0.78,
    ambientMagic: 0.82,
    ambientTechnology: 0.94,
    hazardLevel: 0.28,
    sizeScale: 1,
    defaultStartingDistance: 2,
    defaultTimeOfDay: "dusk",
    tags: ["urban", "fortified", "high-tech", "high-magic", "earthlike"],
  },
  {
    id: "mustafar",
    name: "Mustafar Industrial Complex",
    shortName: "Mustafar",
    description: "A volcanic stronghold of narrow platforms, machinery, smoke and lethal lava fields.",
    universe: "Star Wars",
    galaxy: "Far, far away",
    realm: "Material galaxy",
    terrain: "volcanic",
    atmosphere: "toxic",
    gravityMultiplier: 1.06,
    destructibility: 0.58,
    visibility: 0.5,
    ambientMagic: 0.62,
    ambientTechnology: 0.76,
    hazardLevel: 0.72,
    sizeScale: 1.3,
    defaultStartingDistance: 2,
    defaultTimeOfDay: "night",
    tags: ["volcanic", "hazardous", "dark", "high-tech", "toxic"],
  },
  {
    id: "open-ocean",
    name: "Open Ocean and Coastline",
    shortName: "Open Ocean",
    description: "Deep water, a breakable coastline and vast approach lanes favor aquatic and colossal fighters.",
    universe: "Neutral",
    galaxy: "Milky Way",
    realm: "Earthlike reality",
    terrain: "ocean",
    atmosphere: "earthlike",
    gravityMultiplier: 1,
    destructibility: 0.88,
    visibility: 0.7,
    ambientMagic: 0.48,
    ambientTechnology: 0.28,
    hazardLevel: 0.34,
    sizeScale: 2.2,
    defaultStartingDistance: 3,
    defaultTimeOfDay: "day",
    tags: ["aquatic", "open", "destructible", "storm-prone", "earthlike"],
  },
  {
    id: "deep-space",
    name: "Deep Space",
    shortName: "Deep Space",
    description: "A vast vacuum with minimal cover, microgravity and potentially enormous pursuit distances.",
    universe: "Neutral",
    galaxy: "Intergalactic space",
    realm: "Material universe",
    terrain: "space",
    atmosphere: "vacuum",
    gravityMultiplier: 0.08,
    destructibility: 0.04,
    visibility: 0.96,
    ambientMagic: 0.45,
    ambientTechnology: 0.58,
    hazardLevel: 0.86,
    sizeScale: 4,
    defaultStartingDistance: 3,
    defaultTimeOfDay: "timeless",
    tags: ["vacuum", "open", "microgravity", "vast", "zero-cover"],
  },
  {
    id: "open-wilderness",
    name: "Open Wilderness",
    shortName: "Wilderness",
    description: "A broad natural battlefield with uneven terrain, limited structures and long sightlines.",
    universe: "Neutral",
    galaxy: "Milky Way",
    realm: "Earthlike reality",
    terrain: "wilderness",
    atmosphere: "earthlike",
    gravityMultiplier: 1,
    destructibility: 0.7,
    visibility: 0.84,
    ambientMagic: 0.55,
    ambientTechnology: 0.2,
    hazardLevel: 0.16,
    sizeScale: 2,
    defaultStartingDistance: 3,
    defaultTimeOfDay: "day",
    tags: ["wilderness", "open", "destructible", "earthlike"],
  },
  {
    id: "asgard",
    name: "Asgardian Realm",
    shortName: "Asgard",
    description: "A high-energy divine realm with powerful ambient magic, resilient structures and realm-scale space.",
    universe: "Marvel",
    galaxy: "Beyond conventional space",
    realm: "Asgard",
    terrain: "divine-realm",
    atmosphere: "magical",
    gravityMultiplier: 1.08,
    destructibility: 0.25,
    visibility: 0.9,
    ambientMagic: 1,
    ambientTechnology: 0.64,
    hazardLevel: 0.25,
    sizeScale: 2.6,
    defaultStartingDistance: 3,
    defaultTimeOfDay: "timeless",
    tags: ["divine-realm", "high-magic", "open", "fortified", "magical"],
  },
];

export const ARENAS_BY_ID: Record<string, Arena> = Object.fromEntries(
  ARENAS.map((arena) => [arena.id, arena]),
);

export function getArena(id: string | undefined | null): Arena {
  return ARENAS_BY_ID[id ?? ""] ?? ARENAS_BY_ID[DEFAULT_BATTLE_CONTEXT.arenaId];
}

export function makeBattleContext(input: Partial<BattleContext> = {}): BattleContext {
  const arena = getArena(input.arenaId ?? DEFAULT_BATTLE_CONTEXT.arenaId);
  return {
    ...DEFAULT_BATTLE_CONTEXT,
    ...input,
    arenaId: arena.id,
    timeOfDay: input.timeOfDay ?? arena.defaultTimeOfDay,
    startingDistance:
      input.startingDistance === undefined
        ? arena.defaultStartingDistance
        : (Math.max(0, Math.min(3, input.startingDistance)) as RangeBand),
  };
}

export interface EnvironmentEffects {
  statBonuses: Partial<Record<StatKey, number>>;
  accuracyModifier: number;
  evasionModifier: number;
  damageMultiplier: number;
  controlMultiplier: number;
  staminaRecoveryMultiplier: number;
  healingMultiplier: number;
  actionTimeMultiplier: number;
  initiativeBonus: number;
  attritionPerRound: number;
  homeAdvantage: boolean;
  affinityScore: number;
  labels: string[];
}

const STAT_KEYS: StatKey[] = [
  "strength",
  "speed",
  "durability",
  "battleIQ",
  "combatSkill",
  "range",
  "technology",
  "magic",
  "mentalResistance",
  "healing",
  "battlefieldControl",
  "stamina",
];

function addBonus(target: Partial<Record<StatKey, number>>, keys: StatKey[], value: number) {
  for (const key of keys) target[key] = (target[key] ?? 0) + value;
}

export function getEnvironmentEffects(
  character: Character,
  context: BattleContext,
): EnvironmentEffects {
  const arena = getArena(context.arenaId);
  const profile = character.environment;
  const labels: string[] = [];
  const statBonuses: Partial<Record<StatKey, number>> = {};
  const homeAdvantage = profile.homeArenaIds.includes(arena.id);
  const affinityMatches = profile.affinityTags.filter((tag) => arena.tags.includes(tag));
  const vulnerabilityMatches = profile.vulnerabilityTags.filter((tag) => arena.tags.includes(tag));
  const affinityScore = affinityMatches.length - vulnerabilityMatches.length;

  if (homeAdvantage) {
    addBonus(statBonuses, ["battleIQ", "battlefieldControl"], 9);
    addBonus(statBonuses, ["technology", "magic"], 4);
    labels.push("home-territory systems and local knowledge");
  }

  if (affinityMatches.length > 0) {
    addBonus(statBonuses, ["speed", "battlefieldControl"], Math.min(8, affinityMatches.length * 3));
    labels.push(`terrain affinity: ${affinityMatches.join(", ")}`);
  }

  if (vulnerabilityMatches.length > 0) {
    addBonus(statBonuses, ["speed", "stamina", "battlefieldControl"], -Math.min(14, vulnerabilityMatches.length * 6));
    labels.push(`environmental pressure: ${vulnerabilityMatches.join(", ")}`);
  }

  const timeShift = profile.timeAffinity?.[context.timeOfDay] ?? 0;
  if (timeShift !== 0) {
    const points = timeShift * 55;
    addBonus(statBonuses, ["speed", "battleIQ", "battlefieldControl"], points);
    labels.push(`${context.timeOfDay} performance ${timeShift > 0 ? "advantage" : "penalty"}`);
  }

  const traits = new Set(profile.traits);
  const inVacuum = arena.atmosphere === "vacuum";
  const inToxic = arena.atmosphere === "toxic";
  const inOcean = arena.terrain === "ocean";
  const lowVisibility = arena.visibility < 0.6 || context.timeOfDay === "night";

  let attritionPerRound = 0;
  let staminaRecoveryMultiplier = 1;
  let healingMultiplier = 1;
  let actionTimeMultiplier = Math.sqrt(Math.max(0.25, arena.gravityMultiplier));
  let accuracyModifier = 0;
  let evasionModifier = 0;
  let initiativeBonus = 0;

  if (inVacuum && !traits.has("vacuum-safe")) {
    attritionPerRound += traits.has("vacuum-resistant") ? 0.8 : 4.5;
    staminaRecoveryMultiplier *= traits.has("vacuum-resistant") ? 0.82 : 0.42;
    addBonus(statBonuses, ["speed", "combatSkill"], traits.has("vacuum-resistant") ? -3 : -10);
    labels.push(traits.has("vacuum-resistant") ? "vacuum strain" : "vacuum survival crisis");
  }

  if (inToxic && !traits.has("sealed-environment") && !traits.has("toxin-immune")) {
    attritionPerRound += 1.8;
    staminaRecoveryMultiplier *= 0.78;
    labels.push("toxic-atmosphere strain");
  }

  if (inOcean) {
    if (traits.has("aquatic")) {
      addBonus(statBonuses, ["speed", "battlefieldControl", "healing"], 10);
      healingMultiplier *= 1.12;
      actionTimeMultiplier *= 0.86;
      labels.push("aquatic mobility");
    } else if (!traits.has("aquatic-capable")) {
      addBonus(statBonuses, ["speed", "combatSkill", "battlefieldControl"], -12);
      staminaRecoveryMultiplier *= 0.62;
      actionTimeMultiplier *= 1.3;
      labels.push("restricted underwater movement");
    }
  }

  if (lowVisibility) {
    if (traits.has("darkvision") || traits.has("enhanced-senses")) {
      accuracyModifier += 0.025;
      evasionModifier += 4;
    } else {
      accuracyModifier -= 0.07;
      evasionModifier -= 3;
    }
    if (traits.has("night-specialist")) {
      initiativeBonus += 8;
      addBonus(statBonuses, ["battleIQ", "battlefieldControl"], 6);
    }
  }

  if (arena.tags.includes("dense-cover") && traits.has("urban-mobility")) {
    evasionModifier += 7;
    initiativeBonus += 4;
  }

  if (arena.tags.includes("open") && character.scale >= 4) {
    addBonus(statBonuses, ["range", "battlefieldControl"], 6);
  }

  if (arena.tags.includes("destructible") && character.scale >= 3) {
    addBonus(statBonuses, ["strength", "battlefieldControl"], 4);
  }

  if (arena.ambientTechnology >= 0.75) addBonus(statBonuses, ["technology"], 5);
  if (arena.ambientMagic >= 0.75) addBonus(statBonuses, ["magic"], 5);

  // Guard against accidental undefined/NaN bonuses after future schema edits.
  for (const key of STAT_KEYS) {
    if (!Number.isFinite(statBonuses[key])) delete statBonuses[key];
  }

  return {
    statBonuses,
    accuracyModifier,
    evasionModifier,
    damageMultiplier: 1 + affinityScore * 0.018 + (homeAdvantage ? 0.04 : 0),
    controlMultiplier: 1 + affinityScore * 0.025 + (homeAdvantage ? 0.06 : 0),
    staminaRecoveryMultiplier,
    healingMultiplier,
    actionTimeMultiplier,
    initiativeBonus,
    attritionPerRound,
    homeAdvantage,
    affinityScore,
    labels,
  };
}

export function actionEnvironmentMultiplier(
  action: CombatAction,
  character: Character,
  context: BattleContext,
): number {
  const arena = getArena(context.arenaId);
  let multiplier = 1;
  if (action.tags.includes("magic")) multiplier *= 0.88 + arena.ambientMagic * 0.24;
  if (action.tags.includes("technology") || action.tags.includes("gadget")) {
    multiplier *= 0.9 + arena.ambientTechnology * 0.2;
  }
  if (action.tags.includes("area")) multiplier *= 0.92 + arena.destructibility * 0.16;
  if (arena.terrain === "ocean" && character.environment.traits.includes("aquatic")) {
    multiplier *= 1.08;
  }
  if (arena.terrain === "space" && action.tags.includes("projectile")) multiplier *= 1.04;
  return multiplier;
}

export function contextSummary(context: BattleContext): string {
  const arena = getArena(context.arenaId);
  const place = [arena.realm, arena.galaxy].filter(Boolean).join(" · ");
  return `${arena.name} · ${context.timeOfDay}${place ? ` · ${place}` : ""}`;
}

export const TIME_OPTIONS: Array<{ value: TimeOfDay; label: string }> = [
  { value: "dawn", label: "Dawn" },
  { value: "day", label: "Day" },
  { value: "dusk", label: "Dusk" },
  { value: "night", label: "Night" },
  { value: "timeless", label: "Timeless / no day cycle" },
];

export const DISTANCE_OPTIONS: Array<{ value: RangeBand; label: string }> = [
  { value: 0, label: "Contact" },
  { value: 1, label: "Close" },
  { value: 2, label: "Medium" },
  { value: 3, label: "Long" },
];
