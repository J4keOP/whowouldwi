/**
 * Deterministic pre-fight explanation layer for Engine v3.
 *
 * These factors explain why the action simulator tends to favor one side. They
 * do not select the winner; aggregate probabilities come from actual combat
 * runs in engine.ts.
 */

import { actionEnvironmentMultiplier, getArena, getEnvironmentEffects } from "./arenas";
import type { BattleContext, Character, CombatAction, MatchupFactor } from "./types";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function bestOffense(attacker: Character, defender: Character, context: BattleContext) {
  let best = 0;
  let bestAction: CombatAction | undefined;
  const effects = getEnvironmentEffects(attacker, context);
  for (const action of attacker.actions) {
    if (action.power <= 0 && !action.control && !action.systemDamage) continue;
    const resistance = defender.defense.resistances[action.damageType] ?? 0;
    const scaleGap = Math.max(0, defender.scale - attacker.scale - (action.scalePiercing ?? 0));
    const scale = Math.pow(0.3, scaleGap);
    const system = defender.defense.criticalSystems ? (action.systemDamage ?? 0) * 0.8 : 0;
    const environment =
      effects.damageMultiplier * actionEnvironmentMultiplier(action, attacker, context);
    const value =
      (action.power *
        (1 - resistance) *
        (0.5 + (action.penetration ?? 0)) *
        scale +
        (action.control ?? 0) * (1 - defender.defense.controlResistance / 115) * scale +
        system) *
      environment;
    if (value > best) {
      best = value;
      bestAction = action;
    }
  }
  return { value: best, action: bestAction };
}

function factor(
  label: string,
  delta: number,
  detailA: string,
  detailB: string,
  scale = 1,
): MatchupFactor | null {
  if (Math.abs(delta) < 0.06) return null;
  return {
    label,
    favors: delta > 0 ? "A" : "B",
    weight: clamp(Math.abs(delta) * scale, 0.05, 1.5),
    detail: delta > 0 ? detailA : detailB,
  };
}

export function buildMatchupFactors(
  a: Character,
  b: Character,
  context: BattleContext,
): MatchupFactor[] {
  const factors: Array<MatchupFactor | null> = [];
  const arena = getArena(context.arenaId);
  const effectsA = getEnvironmentEffects(a, context);
  const effectsB = getEnvironmentEffects(b, context);
  const offenseA = bestOffense(a, b, context);
  const offenseB = bestOffense(b, a, context);

  factors.push(
    factor(
      "Valid finishing offense",
      (offenseA.value - offenseB.value) / 120,
      `${a.name}'s ${offenseA.action?.name ?? "best route"} can create a credible finish against ${b.name}'s defenses.`,
      `${b.name}'s ${offenseB.action?.name ?? "best route"} can create a credible finish against ${a.name}'s defenses.`,
      1.25,
    ),
  );

  const scaleDelta = (a.scale - b.scale) / 3;
  factors.push(
    factor(
      "Scale and damage feasibility",
      scaleDelta,
      `${a.name}'s scale makes ordinary attacks from ${b.name} materially less effective.`,
      `${b.name}'s scale makes ordinary attacks from ${a.name} materially less effective.`,
      1.1,
    ),
  );

  const initiativeA =
    (a.stats.speed + (effectsA.statBonuses.speed ?? 0)) * 0.58 +
    (a.stats.battleIQ + (effectsA.statBonuses.battleIQ ?? 0)) * 0.22 +
    a.defense.evasion * 0.2 +
    effectsA.initiativeBonus;
  const initiativeB =
    (b.stats.speed + (effectsB.statBonuses.speed ?? 0)) * 0.58 +
    (b.stats.battleIQ + (effectsB.statBonuses.battleIQ ?? 0)) * 0.22 +
    b.defense.evasion * 0.2 +
    effectsB.initiativeBonus;
  factors.push(
    factor(
      "Initiative and evasion",
      (initiativeA - initiativeB) / 90,
      `${a.name} is more likely to dictate the first meaningful exchange.`,
      `${b.name} is more likely to dictate the first meaningful exchange.`,
      0.8,
    ),
  );

  const sustainA =
    a.stats.durability * 0.45 +
    a.stats.healing * 0.32 * effectsA.healingMultiplier +
    a.stats.stamina * 0.23 * effectsA.staminaRecoveryMultiplier -
    effectsA.attritionPerRound * 4;
  const sustainB =
    b.stats.durability * 0.45 +
    b.stats.healing * 0.32 * effectsB.healingMultiplier +
    b.stats.stamina * 0.23 * effectsB.staminaRecoveryMultiplier -
    effectsB.attritionPerRound * 4;
  factors.push(
    factor(
      "Sustained combat",
      (sustainA - sustainB) / 80,
      `${a.name} can absorb and recover from more failed exchanges in these conditions.`,
      `${b.name} can absorb and recover from more failed exchanges in these conditions.`,
      0.9,
    ),
  );

  const rangeA =
    (a.stats.range + (effectsA.statBonuses.range ?? 0)) * 0.55 +
    (a.stats.battlefieldControl + (effectsA.statBonuses.battlefieldControl ?? 0)) * 0.45;
  const rangeB =
    (b.stats.range + (effectsB.statBonuses.range ?? 0)) * 0.55 +
    (b.stats.battlefieldControl + (effectsB.statBonuses.battlefieldControl ?? 0)) * 0.45;
  factors.push(
    factor(
      "Range control",
      (rangeA - rangeB) / 95,
      `${a.name} has the stronger tools for choosing where the fight occurs.`,
      `${b.name} has the stronger tools for choosing where the fight occurs.`,
      0.8,
    ),
  );

  const environmentDelta =
    effectsA.affinityScore -
    effectsB.affinityScore +
    (effectsA.homeAdvantage ? 2.2 : 0) -
    (effectsB.homeAdvantage ? 2.2 : 0) +
    (effectsB.attritionPerRound - effectsA.attritionPerRound) * 0.35;
  factors.push(
    factor(
      `${arena.shortName} environment`,
      environmentDelta / 4,
      `${a.name} receives the stronger location/time interaction: ${effectsA.labels[0] ?? "better environmental fit"}.`,
      `${b.name} receives the stronger location/time interaction: ${effectsB.labels[0] ?? "better environmental fit"}.`,
      1.15,
    ),
  );

  const systemsA = b.defense.criticalSystems
    ? Math.max(...a.actions.map((x) => x.systemDamage ?? 0), 0)
    : 0;
  const systemsB = a.defense.criticalSystems
    ? Math.max(...b.actions.map((x) => x.systemDamage ?? 0), 0)
    : 0;
  factors.push(
    factor(
      "Critical-system exploit",
      (systemsA - systemsB) / 70,
      `${a.name} has a direct route into ${b.name}'s critical systems.`,
      `${b.name} has a direct route into ${a.name}'s critical systems.`,
      1,
    ),
  );

  const controlA =
    Math.max(...a.actions.map((x) => x.control ?? 0), 0) *
    (1 - b.defense.controlResistance / 120) *
    effectsA.controlMultiplier;
  const controlB =
    Math.max(...b.actions.map((x) => x.control ?? 0), 0) *
    (1 - a.defense.controlResistance / 120) *
    effectsB.controlMultiplier;
  factors.push(
    factor(
      "Control and containment",
      (controlA - controlB) / 65,
      `${a.name} has the more plausible route to restraining or containing ${b.name}.`,
      `${b.name} has the more plausible route to restraining or containing ${a.name}.`,
      0.95,
    ),
  );

  const tacticsA = a.stats.battleIQ * 0.58 + a.stats.combatSkill * 0.42;
  const tacticsB = b.stats.battleIQ * 0.58 + b.stats.combatSkill * 0.42;
  factors.push(
    factor(
      "Tactical conversion",
      (tacticsA - tacticsB) / 100,
      `${a.name} is more likely to recognize and convert a narrow opening.`,
      `${b.name} is more likely to recognize and convert a narrow opening.`,
      0.7,
    ),
  );

  return factors
    .filter((x): x is MatchupFactor => Boolean(x))
    .sort((x, y) => y.weight - x.weight)
    .slice(0, 5);
}

export function preflightRating(
  character: Character,
  opponent: Character,
  context: BattleContext,
): number {
  const effects = getEnvironmentEffects(character, context);
  const offense = bestOffense(character, opponent, context).value;
  const sustain =
    character.stats.durability * 0.38 +
    character.stats.healing * 0.24 * effects.healingMultiplier +
    character.stats.stamina * 0.18 * effects.staminaRecoveryMultiplier -
    effects.attritionPerRound * 4;
  const tactics =
    (character.stats.battleIQ + (effects.statBonuses.battleIQ ?? 0)) * 0.12 +
    (character.stats.combatSkill + (effects.statBonuses.combatSkill ?? 0)) * 0.08;
  return offense + sustain + tactics + character.scale * 8 + effects.affinityScore * 3;
}
