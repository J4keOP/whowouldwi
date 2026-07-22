import {
  actionEnvironmentMultiplier,
  getArena,
  getEnvironmentEffects,
  type EnvironmentEffects,
} from "./arenas";
import { createRng } from "./rng";
import type {
  Arena,
  BattleContext,
  Character,
  CombatAction,
  CombatTechnique,
  DamageType,
  RangeBand,
  VictoryMethod,
} from "./types";

export const ENGINE_VERSION = "3.0.0-alpha.1";

export interface CombatantState {
  side: "A" | "B";
  character: Character;
  effects: EnvironmentEffects;
  health: number;
  stamina: number;
  control: number;
  systemIntegrity: number;
  guard: number;
  rage: number;
  cooldowns: Record<string, number>;
  lastActionId?: string;
  actionHistory: string[];
  actionUseCounts: Record<string, number>;
  techniqueHistory: string[];
  successfulActions: string[];
  failedActions: string[];
}

export interface RawCombatEvent {
  round: number;
  actor: "A" | "B" | "NEUTRAL";
  actionId?: string;
  text: string;
  elapsedSeconds: number;
  activeSeconds: number;
  healthA: number;
  healthB: number;
  staminaA: number;
  staminaB: number;
  controlA: number;
  controlB: number;
  systemA: number;
  systemB: number;
  liveA: number;
  importance: number;
}

export interface CombatOutcome {
  winnerSide: "A" | "B";
  loserSide: "A" | "B";
  method: VictoryMethod;
  rounds: number;
  /** Backward-compatible alias for total elapsed duration. */
  durationSeconds: number;
  activeCombatSeconds: number;
  totalElapsedSeconds: number;
  finalActionId?: string;
  events: RawCombatEvent[];
  stateA: CombatantState;
  stateB: CombatantState;
  decisiveSuccess: string;
  decisiveFailure: string;
}

interface Resolution {
  text: string;
  techniqueId: string;
  techniqueName: string;
  techniqueFinish?: CombatAction["text"]["finish"];
  hit: boolean;
  damage: number;
  control: number;
  systemDamage: number;
  importance: number;
  battlefieldRemoval: boolean;
}

interface LullResult {
  seconds: number;
  text?: string;
  importance: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const logistic = (x: number) => 1 / (1 + Math.exp(-x));
const replaceTarget = (text: string, target: Character) => text.replaceAll("{target}", target.name);

function techniqueHash(value: string): number {
  let hash = 2166136261 >>> 0;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickTechnique(state: CombatantState, action: CombatAction): CombatTechnique {
  const base: CombatTechnique = {
    id: action.id,
    name: action.name,
    actionId: action.id,
    text: action.text,
  };
  const variants = state.character.techniques?.filter((item) => item.actionId === action.id) ?? [];
  const all = [base, ...variants];
  const fresh = all.filter((item) => !state.techniqueHistory.includes(item.id));
  const candidates = fresh.length > 0 ? fresh : all;
  const useCount = state.actionUseCounts[action.id] ?? 1;
  const selected = candidates[(techniqueHash(action.id) + useCount * 7) % candidates.length];
  state.techniqueHistory.push(selected.id);
  if (state.techniqueHistory.length > 10) state.techniqueHistory.shift();
  return selected;
}

function hashNoise(seed: number, round: number, side: "A" | "B") {
  let x = (seed ^ (round * 0x9e3779b9) ^ (side === "A" ? 0xa341316c : 0xc8013ea4)) >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

function effectiveStat(state: CombatantState, key: keyof Character["stats"]): number {
  let value = state.character.stats[key] + (state.effects.statBonuses[key] ?? 0);
  if (state.character.abilities.includes("rage-scaling")) {
    const rageBonus = state.rage * (key === "strength" ? 0.24 : key === "durability" ? 0.1 : 0);
    value += rageBonus;
  }
  if (state.stamina < 25 && ["speed", "combatSkill", "battlefieldControl"].includes(key)) {
    value *= 0.82;
  }
  if (state.control > 60 && ["speed", "combatSkill"].includes(key)) value *= 0.72;
  return clamp(value, 0, 125);
}

function rangePenalty(action: CombatAction, distance: RangeBand): number {
  if (distance < action.minRange) return (action.minRange - distance) * 0.28;
  if (distance > action.maxRange) return (distance - action.maxRange) * 0.34;
  return 0;
}

function scaleMultiplier(attacker: Character, defender: Character, action: CombatAction): number {
  const gap = defender.scale - attacker.scale;
  if (gap <= 0) return 1 + Math.min(0.18, Math.abs(gap) * 0.05);
  const piercing = action.scalePiercing ?? 0;
  const uncovered = Math.max(0, gap - piercing);
  if (uncovered <= 0) return 1;
  return Math.pow(0.27, uncovered);
}

function resistanceFor(defender: Character, type: DamageType): number {
  return clamp(defender.defense.resistances[type] ?? 0, 0, 0.98);
}

function expectedDamage(
  attacker: CombatantState,
  defender: CombatantState,
  action: CombatAction,
  context: BattleContext,
): number {
  if (action.power <= 0) return 0;
  const offense =
    action.damageType === "mystical"
      ? effectiveStat(attacker, "magic")
      : action.damageType === "psychic"
        ? Math.max(effectiveStat(attacker, "magic"), effectiveStat(attacker, "battleIQ") * 0.75)
        : action.tags.includes("technology") || action.tags.includes("gadget")
          ? Math.max(
              effectiveStat(attacker, "technology"),
              effectiveStat(attacker, "strength") * 0.55,
            )
          : effectiveStat(attacker, "strength");

  const penetration = clamp(action.penetration ?? 0, 0, 0.95);
  const armor = defender.character.defense.armor / 100;
  const durability = effectiveStat(defender, "durability") / 100;
  const resistance = resistanceFor(defender.character, action.damageType);
  const defense = clamp(0.45 * armor + 0.4 * durability + 0.45 * resistance, 0, 1.25);
  const mitigated = clamp(1 - defense * (1 - penetration), 0.04, 1);
  const scale = scaleMultiplier(attacker.character, defender.character, action);
  const guard = clamp(1 - defender.guard / 150, 0.35, 1);
  const offenseScale = 0.46 + offense / 105;
  const environment =
    attacker.effects.damageMultiplier *
    actionEnvironmentMultiplier(action, attacker.character, context);
  return action.power * offenseScale * mitigated * scale * guard * environment * 0.34;
}

function expectedControl(
  attacker: CombatantState,
  defender: CombatantState,
  action: CombatAction,
): number {
  const base = action.control ?? 0;
  if (base <= 0) return 0;
  const controlStat =
    (effectiveStat(attacker, "battlefieldControl") + effectiveStat(attacker, "battleIQ")) / 200;
  const resistance = defender.character.defense.controlResistance / 100;
  const strengthResistance =
    action.tags.includes("web") || action.tags.includes("telekinesis")
      ? effectiveStat(defender, "strength") / 140
      : 0;
  const scale = scaleMultiplier(attacker.character, defender.character, action);
  return (
    base *
    (0.5 + controlStat * 0.8) *
    clamp(1 - resistance * 0.68 - strengthResistance * 0.38, 0.05, 1) *
    scale *
    attacker.effects.controlMultiplier
  );
}

function expectedSystemDamage(
  attacker: CombatantState,
  defender: CombatantState,
  action: CombatAction,
): number {
  if (!defender.character.defense.criticalSystems || !action.systemDamage) return 0;
  const tech = effectiveStat(attacker, "technology") / 100;
  const penetration = action.penetration ?? 0;
  const scale = scaleMultiplier(attacker.character, defender.character, action);
  return (
    action.systemDamage *
    (0.45 + tech * 0.5 + penetration * 0.25) *
    scale *
    attacker.effects.damageMultiplier
  );
}

function actionAvailable(
  state: CombatantState,
  opponent: CombatantState,
  action: CombatAction,
  context: BattleContext,
): boolean {
  if ((state.cooldowns[action.id] ?? 0) > 0) return false;
  if (state.stamina < action.staminaCost) return false;
  if (action.requiresPrep && context.prepTime === "none") return false;
  if (
    action.requiresTargetHealthBelow !== undefined &&
    opponent.health > action.requiresTargetHealthBelow
  )
    return false;
  if (
    action.requiresTargetControlAbove !== undefined &&
    opponent.control < action.requiresTargetControlAbove
  )
    return false;
  return true;
}

function actionUtility(
  state: CombatantState,
  opponent: CombatantState,
  action: CombatAction,
  distance: RangeBand,
  context: BattleContext,
  noise: number,
): number {
  if (!actionAvailable(state, opponent, action, context)) return -Infinity;

  const penalty = rangePenalty(action, distance);
  const damage = expectedDamage(state, opponent, action, context);
  const control = expectedControl(state, opponent, action);
  const systems = expectedSystemDamage(state, opponent, action);
  let utility = damage * 1.5 + control * 0.9 + systems * 1.15;

  if (action.kind === "defense") {
    const danger =
      (100 - state.health) * 0.35 +
      Math.max(0, opponent.character.stats.strength - state.character.stats.durability) * 0.3;
    utility = (action.guard ?? 0) * 0.55 + (action.heal ?? 0) * 1.2 + danger;
    if (state.guard > 25) utility *= 0.35;
  }

  if (action.kind === "mobility") {
    const desired = state.character.preferredRange;
    const currentError = Math.abs(distance - desired);
    const shifted = clamp(distance - (action.distanceShift ?? 0), 0, 3);
    const newError = Math.abs(shifted - desired);
    utility = 15 + (currentError - newError) * 22 + (action.control ?? 0) * 0.25;
    if (currentError === 0) utility *= 0.2;
  }

  if (action.kind === "finisher") utility += 28;
  if (action.canContain && opponent.control > 60) utility += 30;
  if (action.canBattlefieldRemove && opponent.control > 55) utility += 22;
  if (opponent.character.defense.criticalSystems && action.systemDamage) utility += 14;
  if (action.tags.includes("area") && opponent.character.defense.evasion >= 75) utility += 15;
  if (action.tags.includes("anti-evasion") && opponent.character.defense.evasion >= 70)
    utility += 22;
  if (action.tags.includes("upset-path")) utility += effectiveStat(state, "battleIQ") / 18;

  // A fighter should adapt instead of selecting the same mathematically optimal
  // move every exchange. Finishers remain available when their requirements are
  // met, but ordinary actions receive a strong recency and usage penalty.
  const previousIndex = state.actionHistory.lastIndexOf(action.id);
  if (previousIndex >= 0 && action.kind !== "finisher") {
    const turnsSinceUse = state.actionHistory.length - previousIndex;
    utility -= turnsSinceUse === 1 ? 8 : turnsSinceUse === 2 ? 4 : turnsSinceUse <= 4 ? 2 : 0;
  }
  const previousAction = state.character.actions.find(
    (candidate) => candidate.id === state.actionHistory[state.actionHistory.length - 1],
  );
  if (previousAction?.kind === "defense" && action.kind === "defense") utility -= 5;
  if (previousAction?.kind === "mobility" && action.kind === "mobility") utility -= 4;
  utility -= Math.max(0, (state.actionUseCounts[action.id] ?? 0) - 1) * 4;

  utility -= penalty * 70;
  utility -= action.staminaCost * (state.stamina < 25 ? 0.8 : 0.16);
  utility += noise * 14;
  return utility;
}

function pickAction(
  state: CombatantState,
  opponent: CombatantState,
  distance: RangeBand,
  context: BattleContext,
  rng: ReturnType<typeof createRng>,
): CombatAction {
  const candidates = state.character.actions.filter((a) =>
    actionAvailable(state, opponent, a, context),
  );
  if (candidates.length === 0) return state.character.actions[0];
  const scored = candidates
    .map((a) => ({
      action: a,
      score: actionUtility(state, opponent, a, distance, context, rng.next()),
    }))
    .sort((x, y) => y.score - x.score);

  const shortlist = scored.slice(0, Math.min(5, scored.length));
  const weights = shortlist.map((x, i) =>
    Math.max(0.1, x.score - shortlist[shortlist.length - 1].score + (3 - i) * 3),
  );
  return rng.weightedPick(
    shortlist.map((x) => x.action),
    weights,
  );
}

function hitChance(
  attacker: CombatantState,
  defender: CombatantState,
  action: CombatAction,
  distance: RangeBand,
): number {
  const accuracySkill =
    effectiveStat(attacker, "combatSkill") * 0.42 +
    effectiveStat(attacker, "speed") * 0.28 +
    effectiveStat(attacker, "battleIQ") * 0.16;
  let evasion =
    defender.character.defense.evasion * 0.54 +
    effectiveStat(defender, "speed") * 0.25 +
    effectiveStat(defender, "battleIQ") * 0.08 +
    defender.effects.evasionModifier;
  if (defender.character.abilities.includes("spider-sense")) evasion += 10;
  if (defender.character.abilities.includes("precognition")) evasion += 6;
  if (action.tags.includes("area")) evasion *= 0.55;
  if (action.tags.includes("anti-evasion")) evasion *= 0.35;

  const skillDelta = (accuracySkill - evasion) / 180;
  const controlBonus = defender.control / 260;
  const exhaustionPenalty = attacker.stamina < 20 ? 0.12 : 0;
  const penalty = rangePenalty(action, distance);
  return clamp(
    action.accuracy +
      attacker.effects.accuracyModifier +
      skillDelta +
      controlBonus -
      exhaustionPenalty -
      penalty,
    0.035,
    0.97,
  );
}

function resolveAction(
  attacker: CombatantState,
  defender: CombatantState,
  action: CombatAction,
  distance: RangeBand,
  context: BattleContext,
  rng: ReturnType<typeof createRng>,
): Resolution {
  attacker.stamina = clamp(attacker.stamina - action.staminaCost, 0, 100);
  attacker.lastActionId = action.id;
  attacker.actionHistory.push(action.id);
  if (attacker.actionHistory.length > 6) attacker.actionHistory.shift();
  attacker.actionUseCounts[action.id] = (attacker.actionUseCounts[action.id] ?? 0) + 1;
  const technique = pickTechnique(attacker, action);
  if (action.cooldown) attacker.cooldowns[action.id] = action.cooldown;

  if (action.kind === "defense") {
    attacker.guard = clamp(attacker.guard + (action.guard ?? 0), 0, 80);
    attacker.health = clamp(
      attacker.health + (action.heal ?? 0) * attacker.effects.healingMultiplier,
      0,
      100,
    );
    attacker.successfulActions.push(action.id);
    return {
      text: replaceTarget(technique.text.hit, defender.character),
      techniqueId: technique.id,
      techniqueName: technique.name,
      techniqueFinish: technique.text.finish,
      hit: true,
      damage: 0,
      control: 0,
      systemDamage: 0,
      importance: 0.35 + (action.heal ?? 0) / 40,
      battlefieldRemoval: false,
    };
  }

  if (action.kind === "mobility" && !action.control) {
    attacker.successfulActions.push(action.id);
    return {
      text: replaceTarget(technique.text.hit, defender.character),
      techniqueId: technique.id,
      techniqueName: technique.name,
      techniqueFinish: technique.text.finish,
      hit: true,
      damage: 0,
      control: 0,
      systemDamage: 0,
      importance: 0.25,
      battlefieldRemoval: false,
    };
  }

  const chance = hitChance(attacker, defender, action, distance);
  const hit = rng.next() < chance;
  if (!hit) {
    attacker.failedActions.push(action.id);
    return {
      text: replaceTarget(
        technique.text.miss ??
          action.text.miss ??
          `${attacker.character.name}'s ${technique.name} misses {target}.`,
        defender.character,
      ),
      techniqueId: technique.id,
      techniqueName: technique.name,
      techniqueFinish: technique.text.finish,
      hit: false,
      damage: 0,
      control: 0,
      systemDamage: 0,
      importance: 0.18,
      battlefieldRemoval: false,
    };
  }

  const variance = 0.78 + rng.next() * 0.44;
  let damage = expectedDamage(attacker, defender, action, context) * variance;
  let control = expectedControl(attacker, defender, action) * (0.82 + rng.next() * 0.36);
  let systemDamage = expectedSystemDamage(attacker, defender, action) * (0.82 + rng.next() * 0.36);

  if (action.tags.includes("tech-exploit") && defender.character.defense.criticalSystems) {
    systemDamage *= 1.2;
  }
  if (action.tags.includes("web")) {
    const tearFactor =
      (effectiveStat(defender, "strength") / 100) *
      (1 + Math.max(0, defender.character.scale - attacker.character.scale) * 0.7);
    control *= clamp(1.25 - tearFactor, 0.03, 1);
  }
  if (action.tags.includes("telekinesis")) {
    const scaleGap = Math.max(0, defender.character.scale - attacker.character.scale);
    control *= Math.pow(0.3, scaleGap);
  }
  if (action.damageType === "chemical") {
    const chemicalRes = resistanceFor(defender.character, "chemical");
    control *= clamp(1 - chemicalRes, 0.02, 1);
    damage *= clamp(1 - chemicalRes, 0.02, 1);
  }
  if (action.tags.includes("upset-path")) {
    const iqEdge =
      (effectiveStat(attacker, "battleIQ") - effectiveStat(defender, "battleIQ")) / 200;
    const jackpot = rng.next() < clamp(0.025 + iqEdge * 0.04, 0.004, 0.065);
    if (jackpot) {
      control += 38;
      damage += 14;
    }
  }

  const scaleGap = defender.character.scale - attacker.character.scale;
  if (
    scaleGap >= 2 &&
    action.tags.includes("finisher") &&
    (action.penetration ?? 0) >= 0.7 &&
    rng.next() < clamp(0.0007 + effectiveStat(attacker, "battleIQ") / 100000, 0.0007, 0.0018)
  ) {
    damage += 115;
  }

  defender.health = clamp(defender.health - damage, 0, 100);
  defender.control = clamp(defender.control + control, 0, 125);
  if (defender.character.defense.criticalSystems) {
    defender.systemIntegrity = clamp(defender.systemIntegrity - systemDamage, 0, 100);
  }

  if (defender.character.abilities.includes("rage-scaling")) {
    defender.rage = clamp(defender.rage + damage * 0.72 + control * 0.25, 0, 100);
  }

  attacker.successfulActions.push(action.id);
  const importance = clamp(damage / 32 + control / 55 + systemDamage / 60, 0.2, 1.6);
  const scaleGapForRemoval = Math.max(0, defender.character.scale - attacker.character.scale);
  const engineeredUpsetChance = clamp(
    0.0025 +
      Math.max(0, effectiveStat(attacker, "battleIQ") - effectiveStat(defender, "battleIQ")) /
        7500 -
      scaleGapForRemoval * 0.00065,
    0.00015,
    0.009,
  );
  const arena = getArena(context.arenaId);
  const removalSpaceMultiplier = 0.7 + arena.sizeScale * 0.22;
  const battlefieldRemoval = Boolean(
    action.canBattlefieldRemove &&
    ((defender.control >= 90 &&
      rng.next() <
        clamp(
          (0.08 + effectiveStat(attacker, "battleIQ") / 260 - defender.character.scale * 0.025) *
            removalSpaceMultiplier,
          0.01,
          0.38,
        )) ||
      (action.tags.includes("upset-path") &&
        rng.next() < engineeredUpsetChance * removalSpaceMultiplier)),
  );

  return {
    text: replaceTarget(technique.text.hit, defender.character),
    techniqueId: technique.id,
    techniqueName: technique.name,
    techniqueFinish: technique.text.finish,
    hit: true,
    damage,
    control,
    systemDamage,
    importance,
    battlefieldRemoval,
  };
}

function decrementCooldowns(state: CombatantState) {
  for (const id of Object.keys(state.cooldowns)) {
    state.cooldowns[id] = Math.max(0, state.cooldowns[id] - 1);
  }
}

function endRoundRecovery(state: CombatantState) {
  const c = state.character;
  const staminaRecovery =
    (3 + effectiveStat(state, "stamina") / 45) * state.effects.staminaRecoveryMultiplier;
  state.stamina = clamp(state.stamina + staminaRecovery, 0, 100);
  state.control = clamp(state.control - (5 + c.defense.controlResistance / 22), 0, 125);
  state.guard = clamp(state.guard * 0.42, 0, 80);

  if (c.abilities.includes("regeneration")) {
    const regen = (1.1 + effectiveStat(state, "healing") / 34) * state.effects.healingMultiplier;
    state.health = clamp(state.health + regen, 0, 100);
  }

  state.health = clamp(state.health - state.effects.attritionPerRound, 0, 100);
}

function applyLullRecovery(state: CombatantState, seconds: number) {
  if (seconds <= 2) return;
  const magnitude = Math.log10(1 + seconds);
  state.stamina = clamp(
    state.stamina + Math.min(30, magnitude * 4.2) * state.effects.staminaRecoveryMultiplier,
    0,
    100,
  );
  state.control = clamp(
    state.control - Math.min(70, magnitude * (8 + state.character.defense.controlResistance / 18)),
    0,
    125,
  );
  if (state.character.abilities.includes("regeneration")) {
    state.health = clamp(
      state.health + Math.min(24, magnitude * 3.5) * state.effects.healingMultiplier,
      0,
      100,
    );
  }
}

function liveProbabilityA(a: CombatantState, b: CombatantState, baseProbA: number): number {
  const baseLogit = Math.log(clamp(baseProbA, 0.01, 0.99) / clamp(1 - baseProbA, 0.01, 0.99));
  const health = (a.health - b.health) / 24;
  const stamina = (a.stamina - b.stamina) / 58;
  const control = (b.control - a.control) / 42;
  const systemA = a.character.defense.criticalSystems
    ? (a.systemIntegrity / Math.max(1, a.character.defense.systemIntegrity)) * 100
    : 100;
  const systemB = b.character.defense.criticalSystems
    ? (b.systemIntegrity / Math.max(1, b.character.defense.systemIntegrity)) * 100
    : 100;
  const systems = (systemA - systemB) / 80;
  return clamp(logistic(baseLogit + health + stamina + control + systems), 0.005, 0.995);
}

function makeState(side: "A" | "B", character: Character, context: BattleContext): CombatantState {
  return {
    side,
    character,
    effects: getEnvironmentEffects(character, context),
    health: 100,
    stamina: 100,
    control: 0,
    systemIntegrity: character.defense.criticalSystems ? character.defense.systemIntegrity : 0,
    guard: 0,
    rage: 0,
    cooldowns: {},
    actionHistory: [],
    actionUseCounts: {},
    techniqueHistory: [],
    successfulActions: [],
    failedActions: [],
  };
}

function victoryAfterAction(
  attacker: CombatantState,
  defender: CombatantState,
  action: CombatAction,
  resolution: Resolution,
): VictoryMethod | null {
  if (resolution.battlefieldRemoval) return "battlefield-removal";
  const canDirectlyFinish = action.kind !== "defense" && action.kind !== "mobility";
  if (
    canDirectlyFinish &&
    resolution.systemDamage > 0 &&
    defender.character.defense.criticalSystems &&
    defender.systemIntegrity <= 0
  ) {
    return "incapacitation";
  }
  if (canDirectlyFinish && resolution.damage > 0 && defender.health <= 0) return "knockout";
  if (resolution.control > 0 && action.canContain && defender.control >= 100) return "containment";
  if (resolution.control > 0 && canDirectlyFinish && defender.control >= 115)
    return "incapacitation";
  return null;
}

function victoryExplanation(
  winner: CombatantState,
  loser: CombatantState,
  method: VictoryMethod,
  action: CombatAction | undefined,
  resolution: Resolution | undefined,
  arena: Arena,
  rounds: number,
): string {
  const authored = resolution?.techniqueFinish?.[method] ?? action?.text.finish?.[method];
  if (authored) {
    return `VICTORY — ${replaceTarget(authored, loser.character)}`;
  }

  const actionLead = action
    ? `${winner.character.name}'s ${resolution?.techniqueName ?? action.name}`
    : `After ${rounds} rounds, ${winner.character.name}'s accumulated advantage`;
  const explanation =
    method === "containment"
      ? `${actionLead} completes the restraint: ${loser.character.name} is immobilized and can no longer fight or escape.`
      : method === "battlefield-removal"
        ? `${actionLead} forces ${loser.character.name} out of the active battlefield in ${arena.shortName}; ${winner.character.name} remains in bounds and secures the result.`
        : method === "incapacitation"
          ? `${actionLead} shuts down ${loser.character.name}'s ability to defend or continue. ${winner.character.name} wins by incapacitation.`
          : method === "exhaustion"
            ? `${actionLead} leaves ${loser.character.name} unable to sustain effective resistance; ${winner.character.name} remains operational and wins the attritional fight.`
            : `${actionLead} delivers the decisive impact. ${loser.character.name} is knocked out and cannot continue.`;
  return `VICTORY — ${explanation}`;
}

function stateScore(state: CombatantState): number {
  const system = state.character.defense.criticalSystems ? state.systemIntegrity * 0.32 : 20;
  return state.health * 1.25 + state.stamina * 0.28 + system - state.control * 0.58;
}

function actionDurationSeconds(
  attacker: CombatantState,
  action: CombatAction,
  distance: RangeBand,
  arena: Arena,
  rng: ReturnType<typeof createRng>,
): number {
  const baseByKind: Record<CombatAction["kind"], number> = {
    attack: 1.1,
    control: 1.45,
    defense: 0.75,
    mobility: 1.25,
    finisher: 2.2,
  };
  const execution = action.executionTimeSeconds ?? baseByKind[action.kind];
  const recovery = action.recoveryTimeSeconds ?? (action.kind === "finisher" ? 1.2 : 0.35);
  const speedFactor = clamp(72 / Math.max(18, effectiveStat(attacker, "speed")), 0.22, 2.8);
  const scaleFactor = 0.88 + attacker.character.scale * 0.09;
  const rangeTravel = action.maxRange <= 1 ? Math.max(0, distance - 1) * 0.8 : 0;
  const variance = 0.82 + rng.next() * 0.36;
  return Math.max(
    0.015,
    (execution + recovery + rangeTravel) *
      speedFactor *
      scaleFactor *
      attacker.effects.actionTimeMultiplier *
      Math.sqrt(Math.max(0.12, arena.gravityMultiplier)) *
      variance,
  );
}

function durationLabel(seconds: number): string {
  if (seconds >= 31_557_600) return `${(seconds / 31_557_600).toFixed(1)} years`;
  if (seconds >= 86_400) return `${(seconds / 86_400).toFixed(1)} days`;
  if (seconds >= 3_600) return `${(seconds / 3_600).toFixed(1)} hours`;
  if (seconds >= 60) return `${(seconds / 60).toFixed(1)} minutes`;
  return `${Math.round(seconds)} seconds`;
}

function computeLull(
  a: CombatantState,
  b: CombatantState,
  arena: Arena,
  distance: RangeBand,
  round: number,
  rng: ReturnType<typeof createRng>,
): LullResult {
  let seconds = (0.25 + rng.next() * 1.9) * arena.sizeScale;
  const bothDurable =
    effectiveStat(a, "durability") + effectiveStat(b, "durability") > 165 &&
    effectiveStat(a, "healing") + effectiveStat(b, "healing") > 80;
  const evasive =
    a.character.environment.traits.includes("urban-mobility") ||
    b.character.environment.traits.includes("urban-mobility");
  const vast = arena.tags.includes("vast") || arena.sizeScale >= 3;
  const lowVisibility = arena.visibility < 0.6;
  const closeToFinish = a.health < 28 || b.health < 28 || a.control > 80 || b.control > 80;

  if (distance >= 2) seconds *= 1.25;
  if (evasive && (arena.terrain === "urban" || lowVisibility) && rng.next() < 0.12) {
    seconds += 15 + rng.next() * 180;
  }
  if (bothDurable && !closeToFinish && rng.next() < 0.007) {
    seconds += 120 + rng.next() * 2_700;
  }
  if (vast && rng.next() < 0.012) seconds += 60 + rng.next() * 7_200;

  // Rare, mechanically-qualified pursuit/stalemate paths create record-length
  // battles without changing the winner by fiat. Recovery during the gap can
  // still influence the later action state.
  const protractedEligible =
    round >= 3 &&
    !closeToFinish &&
    (vast || bothDurable || (evasive && lowVisibility)) &&
    effectiveStat(a, "stamina") + effectiveStat(b, "stamina") > 140;
  if (protractedEligible) {
    const roll = rng.next();
    if (roll < 0.000001) {
      seconds += (1 + rng.next() * 9) * 31_557_600;
    } else if (roll < 0.00006) {
      seconds += (1 + rng.next() * 120) * 86_400;
    } else if (roll < 0.0008) {
      seconds += (1 + rng.next() * 48) * 3_600;
    }
  }

  if (seconds < 30) return { seconds, importance: 0.08 };
  const text =
    seconds >= 31_557_600
      ? `A rare strategic stalemate becomes a years-long pursuit across ${arena.shortName}; both fighters repeatedly disengage, recover and re-enter the conflict.`
      : seconds >= 86_400
        ? `The conflict fragments into a ${durationLabel(seconds)} hunt across ${arena.shortName} before contact is re-established.`
        : seconds >= 3_600
          ? `A prolonged pursuit and recovery phase lasts ${durationLabel(seconds)} before the next exchange.`
          : `Both fighters reset position for ${durationLabel(seconds)} before committing again.`;
  return {
    seconds,
    text,
    importance: seconds >= 86_400 ? 0.75 : seconds >= 3_600 ? 0.5 : 0.28,
  };
}

export interface RunCombatOptions {
  seed: number;
  context: BattleContext;
  baseProbA?: number;
  recordTimeline?: boolean;
}

export function runCombat(
  characterA: Character,
  characterB: Character,
  options: RunCombatOptions,
): CombatOutcome {
  const rng = createRng(options.seed);
  const arena = getArena(options.context.arenaId);
  const a = makeState("A", characterA, options.context);
  const b = makeState("B", characterB, options.context);
  const events: RawCombatEvent[] = [];
  let distance: RangeBand = options.context.startingDistance;
  let finalActionId: string | undefined;
  let method: VictoryMethod | null = null;
  let winnerSide: "A" | "B" | null = null;
  let finalResolution: Resolution | undefined;
  let rounds = 0;
  let activeCombatSeconds = 0;
  let totalElapsedSeconds = 0;
  const baseProbA = options.baseProbA ?? 0.5;

  const pushEvent = (
    round: number,
    actor: "A" | "B" | "NEUTRAL",
    text: string,
    importance: number,
    actionId?: string,
  ) => {
    if (!options.recordTimeline) return;
    events.push({
      round,
      actor,
      actionId,
      text,
      elapsedSeconds: totalElapsedSeconds,
      activeSeconds: activeCombatSeconds,
      healthA: a.health,
      healthB: b.health,
      staminaA: a.stamina,
      staminaB: b.stamina,
      controlA: a.control,
      controlB: b.control,
      systemA: a.systemIntegrity,
      systemB: b.systemIntegrity,
      liveA: liveProbabilityA(a, b, baseProbA),
      importance,
    });
  };

  pushEvent(
    0,
    "NEUTRAL",
    `${characterA.name} and ${characterB.name} enter ${arena.name} at ${options.context.timeOfDay}. The fight begins at ${["contact", "close", "medium", "long"][distance]} range.`,
    0.42,
  );

  for (let round = 1; round <= options.context.maxRounds; round++) {
    rounds = round;
    decrementCooldowns(a);
    decrementCooldowns(b);

    const initiativeA =
      effectiveStat(a, "speed") * 0.52 +
      effectiveStat(a, "battleIQ") * 0.22 +
      a.effects.initiativeBonus +
      hashNoise(options.seed, round, "A") * 35;
    const initiativeB =
      effectiveStat(b, "speed") * 0.52 +
      effectiveStat(b, "battleIQ") * 0.22 +
      b.effects.initiativeBonus +
      hashNoise(options.seed, round, "B") * 35;
    const order: Array<[CombatantState, CombatantState]> =
      initiativeA >= initiativeB
        ? [
            [a, b],
            [b, a],
          ]
        : [
            [b, a],
            [a, b],
          ];

    for (const [attacker, defender] of order) {
      if (winnerSide) break;
      const action = pickAction(attacker, defender, distance, options.context, rng);
      const beforeDistance: RangeBand = distance;
      const actionSeconds = actionDurationSeconds(attacker, action, distance, arena, rng);
      activeCombatSeconds += actionSeconds;
      totalElapsedSeconds += actionSeconds;
      const resolution = resolveAction(attacker, defender, action, distance, options.context, rng);

      if (action.distanceShift) {
        distance = clamp(distance - action.distanceShift, 0, 3) as RangeBand;
      } else if (action.kind === "attack" && action.maxRange <= 1 && resolution.hit) {
        distance = 0;
      }

      let text = resolution.text;
      if (distance !== beforeDistance && action.kind === "mobility") {
        text += ` The distance shifts to ${["contact", "close", "medium", "long"][distance]} range.`;
      }
      pushEvent(round, attacker.side, text, resolution.importance, action.id);

      const wonBy = victoryAfterAction(attacker, defender, action, resolution);
      if (wonBy) {
        winnerSide = attacker.side;
        method = wonBy;
        finalActionId = action.id;
        finalResolution = resolution;
        break;
      }
    }

    if (winnerSide) break;
    endRoundRecovery(a);
    endRoundRecovery(b);

    if (a.health <= 0 || b.health <= 0) {
      winnerSide = a.health > b.health ? "A" : "B";
      method = "knockout";
      break;
    }

    const lull = computeLull(a, b, arena, distance, round, rng);
    totalElapsedSeconds += lull.seconds;
    applyLullRecovery(a, lull.seconds);
    applyLullRecovery(b, lull.seconds);
    if (lull.text) pushEvent(round, "NEUTRAL", lull.text, lull.importance);

    if ((a.stamina <= 2 && a.health < 25) || (b.stamina <= 2 && b.health < 25)) {
      winnerSide = stateScore(a) >= stateScore(b) ? "A" : "B";
      method = "exhaustion";
      break;
    }
  }

  if (!winnerSide) {
    const scoreA = stateScore(a);
    const scoreB = stateScore(b);
    winnerSide =
      Math.abs(scoreA - scoreB) < 2 ? (rng.next() < 0.5 ? "A" : "B") : scoreA > scoreB ? "A" : "B";
    method = "exhaustion";
  }

  const loserSide = winnerSide === "A" ? "B" : "A";
  const winner = winnerSide === "A" ? a : b;
  const loser = winnerSide === "A" ? b : a;

  if (options.recordTimeline) {
    const decisiveAction = winner.character.actions.find((x) => x.id === finalActionId);
    const finishText = victoryExplanation(
      winner,
      loser,
      method ?? "incapacitation",
      decisiveAction,
      finalResolution,
      arena,
      rounds,
    );
    pushEvent(rounds, winnerSide, finishText, 1.8, finalActionId);
  }

  const decisiveAction = winner.character.actions.find((x) => x.id === finalActionId);
  const failedActionId = loser.failedActions[loser.failedActions.length - 1] ?? loser.lastActionId;
  const failedAction = loser.character.actions.find((x) => x.id === failedActionId);

  return {
    winnerSide,
    loserSide,
    method: method ?? "incapacitation",
    rounds,
    durationSeconds: totalElapsedSeconds,
    activeCombatSeconds,
    totalElapsedSeconds,
    finalActionId,
    events,
    stateA: a,
    stateB: b,
    decisiveSuccess:
      decisiveAction && finalResolution
        ? `${finalResolution.techniqueName} created the actual ${method} victory condition in ${arena.shortName}.`
        : `${winner.character.name} preserved more health, stamina and control through the final exchange.`,
    decisiveFailure: failedAction
      ? `${failedAction.name} failed to create a sustainable win condition against ${winner.character.name}'s defenses and the conditions in ${arena.shortName}.`
      : `${loser.character.name} could not convert their available actions into a valid finish.`,
  };
}
