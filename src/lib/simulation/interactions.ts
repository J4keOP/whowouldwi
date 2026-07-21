// Centralized matchup interaction rules. Every rule returns a signed
// contribution to the attacker's effective score against a specific opponent.
// Rules are intentionally readable and can be expanded later.

import type { Character, MatchupFactor, Stats } from "./types";

// Base weight per stat for a generic matchup. These sum to a stable scale.
const BASE_WEIGHTS: Record<keyof Stats, number> = {
  strength: 1.0,
  speed: 0.9,
  durability: 1.1,
  battleIQ: 0.8,
  combatSkill: 0.9,
  range: 0.7,
  technology: 0.6,
  magic: 0.7,
  mentalResistance: 0.6,
  healing: 0.5,
  battlefieldControl: 0.7,
  stamina: 0.6,
};

const norm = (v: number) => (v - 50) / 50; // -1..1 around average

interface Contribution {
  label: string;
  value: number; // signed contribution to attacker
  detail: string;
}

/**
 * Compute contributions from ATTACKER's perspective vs DEFENDER.
 * Positive values favor attacker.
 */
export function computeContributions(
  attacker: Character,
  defender: Character,
): Contribution[] {
  const out: Contribution[] = [];
  const aStats = attacker.stats;
  const dStats = defender.stats;

  // 1) Base stat weighting — every stat contributes at its base weight.
  for (const key of Object.keys(BASE_WEIGHTS) as (keyof Stats)[]) {
    const w = BASE_WEIGHTS[key];
    const contrib = w * norm(aStats[key]);
    out.push({
      label: `Base:${key}`,
      value: contrib,
      detail: `${attacker.name}'s ${key} (${aStats[key]})`,
    });
  }

  // 2) High technology exploits mechanical/tech opponents.
  if (
    aStats.technology >= 70 &&
    (defender.weaknesses.includes("mechanical") ||
      defender.weaknesses.includes("life-support-armor") ||
      defender.abilities.includes("armor"))
  ) {
    const v = (aStats.technology - 60) / 50;
    out.push({
      label: "Tech exploit vs gear",
      value: v,
      detail: `${attacker.name}'s technology exploits ${defender.name}'s equipment.`,
    });
  }

  // 3) Mental resistance blunts telekinesis / mind-control.
  if (
    (defender.abilities.includes("telekinesis") ||
      defender.abilities.includes("mind-control")) &&
    aStats.mentalResistance >= 60
  ) {
    const v = (aStats.mentalResistance - 50) / 60;
    out.push({
      label: "Mind-shield holds",
      value: v,
      detail: `${attacker.name} resists ${defender.name}'s mental attacks.`,
    });
  }
  if (
    (aStats.magic >= 60 || attacker.abilities.includes("telekinesis")) &&
    dStats.mentalResistance < 60
  ) {
    const v = (60 - dStats.mentalResistance) / 80;
    out.push({
      label: "Mind attack lands",
      value: v,
      detail: `${defender.name}'s mental resistance is thin.`,
    });
  }

  // 4) Magic bypasses conventional durability.
  if (aStats.magic >= 60 && defender.resistances.includes("conventional")) {
    const v = (aStats.magic - 50) / 80;
    out.push({
      label: "Magic bypasses armor",
      value: v,
      detail: `${defender.name}'s conventional durability doesn't apply.`,
    });
  }

  // 5) Speed → evasion & initiative.
  const speedGap = norm(aStats.speed) - norm(dStats.speed);
  if (Math.abs(speedGap) > 0.15) {
    out.push({
      label: "Speed advantage",
      value: speedGap * 0.6,
      detail:
        speedGap > 0
          ? `${attacker.name} dictates initiative.`
          : `${defender.name} out-paces the opening.`,
    });
  }

  // 6) Battlefield control improves range management.
  if (aStats.battlefieldControl >= 70 && aStats.range >= 60) {
    const v = ((aStats.battlefieldControl - 60) / 100) * (aStats.range / 100);
    out.push({
      label: "Kites at range",
      value: v,
      detail: `${attacker.name} controls the arena and picks the distance.`,
    });
  }

  // 7) Healing + stamina → attritional advantage.
  const attrition =
    (aStats.healing + aStats.stamina - dStats.healing - dStats.stamina) / 220;
  if (Math.abs(attrition) > 0.05) {
    out.push({
      label: "Attrition edge",
      value: attrition * 0.8,
      detail:
        attrition > 0
          ? `${attacker.name} outlasts the exchange.`
          : `${defender.name} outlasts the exchange.`,
    });
  }

  // 8) Battle IQ improves weakness exploitation.
  if (aStats.battleIQ >= 70 && defender.weaknesses.length > 0) {
    const v = ((aStats.battleIQ - 60) / 100) * defender.weaknesses.length * 0.15;
    out.push({
      label: "Finds the weakness",
      value: v,
      detail: `${attacker.name} reads ${defender.name}'s tell.`,
    });
  }

  // 9) Extreme strength matters if attacker can close.
  if (aStats.strength >= 85) {
    const closeAbility =
      (aStats.speed + aStats.battlefieldControl) / 200; // 0..1
    const v = ((aStats.strength - 70) / 60) * closeAbility;
    out.push({
      label: "Strength on contact",
      value: v,
      detail: `${attacker.name} devastates once inside.`,
    });
  }

  // 10) Range vs low-mobility opponents.
  if (aStats.range >= 70 && dStats.speed < 55) {
    const v = ((aStats.range - 60) / 100) * ((60 - dStats.speed) / 100);
    out.push({
      label: "Kites the slow",
      value: v,
      detail: `${defender.name} cannot close on ${attacker.name}.`,
    });
  }

  return out;
}

export interface SidedScore {
  score: number;
  factors: MatchupFactor[]; // sided already
}

export function scoreSides(a: Character, b: Character): {
  a: SidedScore;
  b: SidedScore;
} {
  const aC = computeContributions(a, b);
  const bC = computeContributions(b, a);
  return {
    a: {
      score: aC.reduce((s, c) => s + c.value, 0),
      factors: aC.map((c) => ({
        label: c.label,
        favors: c.value === 0 ? "EVEN" : "A",
        weight: Math.abs(c.value),
        detail: c.detail,
      })),
    },
    b: {
      score: bC.reduce((s, c) => s + c.value, 0),
      factors: bC.map((c) => ({
        label: c.label,
        favors: c.value === 0 ? "EVEN" : "B",
        weight: Math.abs(c.value),
        detail: c.detail,
      })),
    },
  };
}
