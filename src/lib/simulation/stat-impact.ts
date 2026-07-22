import { DISTANCE_OPTIONS, getArena, getEnvironmentEffects } from "./arenas";
import { analyzeMatchup } from "./engine";
import type { BattleContext, Character, CombatAction, StatKey } from "./types";

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

const STAT_LABELS: Record<StatKey, string> = {
  strength: "Strength",
  speed: "Speed",
  durability: "Durability",
  battleIQ: "Battle IQ",
  combatSkill: "Combat skill",
  range: "Range",
  technology: "Technology",
  magic: "Magic",
  mentalResistance: "Mental resistance",
  healing: "Healing",
  battlefieldControl: "Battlefield control",
  stamina: "Stamina",
};

const BASE_RELEVANCE: Record<StatKey, number> = {
  strength: 0.32,
  speed: 0.52,
  durability: 0.58,
  battleIQ: 0.43,
  combatSkill: 0.49,
  range: 0.14,
  technology: 0.04,
  magic: 0.04,
  mentalResistance: 0.025,
  healing: 0.07,
  battlefieldControl: 0.18,
  stamina: 0.2,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const COUNTERFACTUAL_SAMPLES = 96;

export type FavoriteSide = "A" | "B" | "EVEN";

export type StatImpactLevel = 1 | 2 | 3 | 4 | 5;

export interface StatImpact {
  key: StatKey;
  label: string;
  valueA: number;
  valueB: number;
  baseA: number;
  baseB: number;
  contextDeltaA: number;
  contextDeltaB: number;
  edge: "A" | "B" | "EVEN";
  gap: number;
  probabilityImpact: number;
  role: "favorite-driver" | "counterfactor" | "neutral";
  score: number;
  importance: StatImpactLevel;
  importanceLabel: "Minor" | "Situational" | "Meaningful" | "Major" | "Critical";
  detail: string;
}

function actionWeight(action: CombatAction, context: BattleContext) {
  const output = Math.max(
    action.power,
    (action.control ?? 0) * 0.9,
    (action.systemDamage ?? 0) * 1.05,
    (action.heal ?? 0) * 0.8,
    (action.guard ?? 0) * 0.45,
  );
  const inStartingRange =
    context.startingDistance >= action.minRange && context.startingDistance <= action.maxRange;
  const prepFactor = action.requiresPrep && context.prepTime === "none" ? 0.2 : 1;
  return clamp(output / 100, 0.08, 1.2) * (inStartingRange ? 1 : 0.64) * prepFactor;
}

function hasTag(character: Character, tags: string[]) {
  return character.actions.some((action) => action.tags.some((tag) => tags.includes(tag)));
}

function actionRelevance(character: Character, context: BattleContext) {
  const relevance = { ...BASE_RELEVANCE };
  let totalCost = 0;
  let controlThreat = 0;
  let psychicThreat = 0;
  let rangedThreat = 0;
  let maxPower = 0;
  let recovery = 0;

  for (const action of character.actions) {
    const weight = actionWeight(action, context);
    const isTech = action.tags.includes("technology") || action.tags.includes("gadget");
    const isMagic = action.damageType === "mystical" || action.damageType === "psychic";

    maxPower = Math.max(maxPower, action.power * weight);
    totalCost += action.staminaCost * weight;
    controlThreat = Math.max(controlThreat, (action.control ?? 0) * weight);
    psychicThreat = Math.max(
      psychicThreat,
      action.damageType === "psychic" ? Math.max(action.power, action.control ?? 0) * weight : 0,
    );
    rangedThreat = Math.max(
      rangedThreat,
      action.maxRange >= 2 ? Math.max(action.power, action.control ?? 0) * weight : 0,
    );
    recovery = Math.max(recovery, Math.max(action.heal ?? 0, (action.guard ?? 0) * 0.3) * weight);

    if (isTech) relevance.technology += 0.38 * weight;
    if (isMagic) relevance.magic += 0.42 * weight;
    if (!isTech && !isMagic && action.power > 0) relevance.strength += 0.22 * weight;
    if ((action.control ?? 0) > 0) {
      relevance.battlefieldControl += 0.32 * weight;
      relevance.battleIQ += 0.1 * weight;
    }
    if (action.systemDamage) {
      relevance.technology += 0.2 * weight;
      relevance.battleIQ += 0.08 * weight;
    }
    if (action.kind === "mobility" || action.tags.includes("anti-evasion")) {
      relevance.speed += 0.12 * weight;
      relevance.range += 0.08 * weight;
    }
    if (action.tags.includes("upset-path")) relevance.battleIQ += 0.14 * weight;
  }

  relevance.durability += clamp(maxPower / 220, 0, 0.34);
  relevance.stamina += clamp(totalCost / Math.max(220, character.actions.length * 52), 0, 0.3);
  relevance.healing += clamp(recovery / 130, 0, 0.32);
  relevance.range += clamp(rangedThreat / 260, 0, 0.26);

  return { relevance, controlThreat, psychicThreat, maxPower };
}

function importanceLabel(level: StatImpactLevel): StatImpact["importanceLabel"] {
  return (["Minor", "Situational", "Meaningful", "Major", "Critical"] as const)[level - 1];
}

function explainStat(
  key: StatKey,
  a: Character,
  b: Character,
  context: BattleContext,
  psychicThreat: number,
  controlThreat: number,
) {
  const arena = getArena(context.arenaId);
  const distance =
    DISTANCE_OPTIONS.find((option) => option.value === context.startingDistance)?.label ??
    "the selected distance";

  switch (key) {
    case "strength":
      return hasTag(a, ["web", "telekinesis"]) || hasTag(b, ["web", "telekinesis"])
        ? "Drives direct damage and the ability to overpower restraint or forced movement."
        : "Sets the ceiling for direct physical damage against the opposing defenses.";
    case "speed":
      return "Controls initiative, hit rate and evasion in nearly every live exchange.";
    case "durability":
      return "Determines how many clean hits each fighter can survive before a finishing route opens.";
    case "battleIQ":
      return "Shapes initiative, action choice and the ability to convert a narrow opening.";
    case "combatSkill":
      return "Directly affects accuracy and whether each fighter can turn an attack into a clean hit.";
    case "range":
      return `The ${distance.toLowerCase()} start makes preferred distance and ranged options more relevant.`;
    case "technology":
      return a.defense.criticalSystems || b.defense.criticalSystems
        ? "Tech attacks can exploit armor, weapons or other critical systems in this matchup."
        : "Only matters when a fighter's viable attacks are powered by technology or gadgets.";
    case "magic":
      return psychicThreat > 0
        ? "Mystical and psychic offense can bypass conventional physical answers here."
        : `Magic matters only where a viable mystical action benefits from ${arena.shortName}'s conditions.`;
    case "mentalResistance":
      return psychicThreat > 0
        ? "Direct psychic offense is present, making resistance to mental attack a real survival factor."
        : "Neither fighter has a major direct psychic route, so this is unlikely to decide the fight.";
    case "healing":
      return "Controls recovery between exchanges and becomes more valuable if the fight runs long.";
    case "battlefieldControl":
      return controlThreat > 20
        ? "Restraint, containment or battlefield removal gives control unusually high leverage here."
        : "Influences spacing and positional control, but few decisive control routes are available.";
    case "stamina":
      return "Determines how long high-cost attacks stay available and who fades in later rounds.";
  }
}

function orderByFavorite(
  items: Array<Omit<StatImpact, "importance" | "importanceLabel">>,
  favorite: FavoriteSide,
) {
  const sorted = [...items].sort((left, right) => right.score - left.score || right.gap - left.gap);
  if (favorite === "EVEN") return sorted;

  const favoriteFactors = sorted.filter((item) => item.edge === favorite);
  if (favoriteFactors.length === 0) return sorted;

  const primary = favoriteFactors[0];
  const underdog = favorite === "A" ? "B" : "A";
  const upsetWinCondition = sorted.find((item) => item.edge === underdog);
  const fallback = sorted.find((item) => item.key !== primary.key);
  const featured = [primary, upsetWinCondition ?? fallback].filter(
    (item): item is (typeof sorted)[number] => Boolean(item),
  );

  // The two featured cards have fixed jobs: explain why the favorite leads,
  // then show the underdog's strongest measurable route to reversing it.
  // Everything else stays score-ranked in the quieter secondary grid.
  const featuredKeys = new Set(featured.map((item) => item.key));
  return [...featured, ...sorted.filter((item) => !featuredKeys.has(item.key))];
}

export function rankStatImpact(
  a: Character,
  b: Character,
  context: BattleContext,
  favorite: FavoriteSide,
): StatImpact[] {
  const effectsA = getEnvironmentEffects(a, context);
  const effectsB = getEnvironmentEffects(b, context);
  const profileA = actionRelevance(a, context);
  const profileB = actionRelevance(b, context);
  const psychicThreat = Math.max(profileA.psychicThreat, profileB.psychicThreat);
  const controlThreat = Math.max(profileA.controlThreat, profileB.controlThreat);
  const arena = getArena(context.arenaId);

  const raw = STAT_KEYS.map((key) => {
    const contextDeltaA = effectsA.statBonuses[key] ?? 0;
    const contextDeltaB = effectsB.statBonuses[key] ?? 0;
    const valueA = clamp(a.stats[key] + contextDeltaA, 0, 125);
    const valueB = clamp(b.stats[key] + contextDeltaB, 0, 125);
    const gap = Math.abs(valueA - valueB);
    let relevance = (profileA.relevance[key] + profileB.relevance[key]) / 2;

    if (key === "durability") {
      relevance += clamp((profileA.maxPower + profileB.maxPower) / 480, 0, 0.32);
    }
    if (key === "mentalResistance") relevance += clamp(psychicThreat / 105, 0, 0.72);
    if (key === "battlefieldControl") relevance += clamp(controlThreat / 180, 0, 0.32);
    if (key === "range") {
      const preferredGap =
        Math.abs(context.startingDistance - a.preferredRange) +
        Math.abs(context.startingDistance - b.preferredRange);
      relevance += preferredGap * 0.08 + arena.sizeScale * 0.025;
    }
    if (key === "magic") relevance += arena.ambientMagic * 0.13;
    if (key === "technology") relevance += arena.ambientTechnology * 0.11;
    if (key === "stamina") {
      relevance +=
        (2 - effectsA.staminaRecoveryMultiplier - effectsB.staminaRecoveryMultiplier) * 0.28 +
        context.maxRounds / 180;
    }
    if (key === "healing") {
      relevance +=
        (a.stats.healing + b.stats.healing) / 380 +
        Math.max(0, effectsA.healingMultiplier + effectsB.healingMultiplier - 2) * 0.24;
    }

    return {
      key,
      label: STAT_LABELS[key],
      valueA: Math.round(valueA),
      valueB: Math.round(valueB),
      baseA: a.stats[key],
      baseB: b.stats[key],
      contextDeltaA,
      contextDeltaB,
      edge: gap <= 2 ? ("EVEN" as const) : valueA > valueB ? ("A" as const) : ("B" as const),
      gap: Math.round(gap),
      relevance,
      detail: explainStat(key, a, b, context, psychicThreat, controlThreat),
    };
  });

  // Use paired seeds for the baseline and each neutralized-stat rerun. This
  // makes the measured change much less noisy than comparing unrelated battle
  // samples and answers the useful question: "How much do the odds move if this
  // fighter no longer owns this particular edge?"
  const baselineA = analyzeMatchup(a, b, {
    context,
    samples: COUNTERFACTUAL_SAMPLES,
    bypassCache: true,
  }).probA;

  const measured = raw.map((item) => {
    if (item.edge === "EVEN") {
      return {
        ...item,
        probabilityImpact: 0,
        role: "neutral" as const,
        score: clamp((item.gap / 35) * item.relevance, 0.01, 1) * 0.22,
      };
    }

    const sharedEffectiveValue = (item.valueA + item.valueB) / 2;
    const neutralA: Character = {
      ...a,
      stats: {
        ...a.stats,
        [item.key]: clamp(sharedEffectiveValue - item.contextDeltaA, 0, 125),
      },
    };
    const neutralB: Character = {
      ...b,
      stats: {
        ...b.stats,
        [item.key]: clamp(sharedEffectiveValue - item.contextDeltaB, 0, 125),
      },
    };
    const neutralProbA = analyzeMatchup(neutralA, neutralB, {
      context,
      samples: COUNTERFACTUAL_SAMPLES,
      bypassCache: true,
    }).probA;
    const holderImpact = item.edge === "A" ? baselineA - neutralProbA : neutralProbA - baselineA;
    const probabilityImpact = Math.max(0, holderImpact * 100);
    const disparityEvidence = clamp((item.gap / 35) * clamp(item.relevance, 0.12, 1.15), 0, 1);
    const probabilityEvidence = clamp(probabilityImpact / 10, 0, 1);
    const role: StatImpact["role"] =
      favorite === "EVEN"
        ? "neutral"
        : item.edge === favorite
          ? "favorite-driver"
          : "counterfactor";

    return {
      ...item,
      probabilityImpact,
      role,
      // Probability movement is the main signal. Disparity × relevance keeps
      // the short diagnostic reruns stable when two factors produce a near tie.
      score: probabilityEvidence * 0.78 + disparityEvidence * 0.22,
    };
  });

  const ordered = orderByFavorite(measured, favorite);

  const maxScore = ordered[0]?.score ?? 1;
  return ordered.map((item, index) => {
    const displayScore = item.score * 0.55 + (item.score / maxScore) * 0.45;
    const calculatedImportance = clamp(Math.ceil(displayScore * 5), 1, 5);
    // Give every matchup a clear reading order. Only the favorite's main reason
    // can be Critical; the upset condition and secondary grid step down visibly.
    const importance = (
      index === 0
        ? 5
        : index === 1
          ? clamp(calculatedImportance, 3, 4)
          : index === 2
            ? clamp(calculatedImportance, 2, 3)
            : clamp(calculatedImportance, 1, 2)
    ) as StatImpactLevel;
    return { ...item, importance, importanceLabel: importanceLabel(importance) };
  });
}
