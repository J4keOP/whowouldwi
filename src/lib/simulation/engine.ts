/**
 * Engine v3 public API.
 *
 * The displayed probability is estimated by repeatedly running the same combat
 * engine used for individual replays. Arena, realm, time of day and starting
 * distance are part of the cache key and deterministically affect every run.
 */

import { getArena, makeBattleContext } from "./arenas";
import { ENGINE_VERSION, runCombat } from "./combat";
import { buildMatchupFactors, preflightRating } from "./interactions";
import { randomSeed } from "./rng";
import type {
  BattleContext,
  BattleResult,
  Character,
  MatchupAnalysis,
  Rarity,
  TimelineEvent,
  VictoryPath,
} from "./types";
import { DEFAULT_BATTLE_CONTEXT } from "./types";

const ANALYSIS_SAMPLES = 1400;
const analysisCache = new Map<string, MatchupAnalysis>();

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function hashString(value: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mixSeed(base: number, index: number): number {
  let x = (base + Math.imul(index + 1, 0x9e3779b9)) >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0 || 1;
}

function contextKey(context: BattleContext) {
  return [
    context.prepTime,
    context.morality,
    context.arenaId,
    context.timeOfDay,
    context.startingDistance,
    context.maxRounds,
  ].join(":");
}

function analysisKey(a: Character, b: Character, context: BattleContext) {
  return `${ENGINE_VERSION}:${a.id}:${a.version}|${b.id}:${b.version}|${contextKey(context)}`;
}

function classifyRarity(preProb: number): Rarity {
  if (preProb >= 0.4) return "Common";
  if (preProb >= 0.2) return "Uncommon";
  if (preProb >= 0.05) return "Rare";
  if (preProb >= 0.01) return "Epic";
  if (preProb >= 0.001) return "Legendary";
  return "Mythic";
}

function choosePath(
  winner: Character,
  finalActionId: string | undefined,
  method: BattleResult["method"],
): VictoryPath {
  const direct = winner.victoryPaths.find((path) =>
    finalActionId ? path.actionIds?.includes(finalActionId) : false,
  );
  if (direct) return direct;
  const methodMatch = winner.victoryPaths.find((path) => path.method === method);
  return methodMatch ?? winner.victoryPaths[0];
}

export interface AnalyzeOptions {
  context?: BattleContext;
  samples?: number;
  bypassCache?: boolean;
}

export function analyzeMatchup(
  a: Character,
  b: Character,
  options: AnalyzeOptions = {},
): MatchupAnalysis {
  const context = makeBattleContext(options.context ?? DEFAULT_BATTLE_CONTEXT);
  const arena = getArena(context.arenaId);
  const samples = options.samples ?? ANALYSIS_SAMPLES;
  const key = analysisKey(a, b, context);
  if (!options.bypassCache && samples === ANALYSIS_SAMPLES) {
    const cached = analysisCache.get(key);
    if (cached) return cached;
  }

  const baseSeed = hashString(key);
  let aWins = 0;
  for (let i = 0; i < samples; i++) {
    const outcome = runCombat(a, b, {
      seed: mixSeed(baseSeed, i),
      context,
      recordTimeline: false,
    });
    if (outcome.winnerSide === "A") aWins++;
  }

  const probA = clamp((aWins + 0.5) / (samples + 1), 0.0001, 0.9999);
  const probB = 1 - probA;
  const favorite: "A" | "B" | "EVEN" =
    Math.abs(probA - 0.5) < 0.025 ? "EVEN" : probA > 0.5 ? "A" : "B";
  const analysis: MatchupAnalysis = {
    a,
    b,
    scoreA: preflightRating(a, b, context),
    scoreB: preflightRating(b, a, context),
    probA,
    probB,
    favorite,
    confidence: Math.abs(probA - 0.5) * 2,
    factors: buildMatchupFactors(a, b, context),
    sampleSize: samples,
    engineVersion: ENGINE_VERSION,
    context,
    arena,
  };

  if (!options.bypassCache && samples === ANALYSIS_SAMPLES) analysisCache.set(key, analysis);
  return analysis;
}

export interface SimulateOptions {
  seed?: number;
  precomputedAnalysis?: MatchupAnalysis;
  context?: BattleContext;
}

function timelineFromOutcome(outcome: ReturnType<typeof runCombat>): TimelineEvent[] {
  const important = outcome.events
    .map((event, sourceIndex) => ({ event, sourceIndex }))
    .filter(
      ({ event, sourceIndex }) =>
        event.importance >= 0.28 || sourceIndex === 0 || sourceIndex === outcome.events.length - 1,
    );
  const reducedEntries =
    important.length <= 12
      ? important
      : [
          important[0],
          ...important
            .slice(1, -1)
            .sort((a, b) => b.event.importance - a.event.importance)
            .slice(0, 10)
            .sort((a, b) => a.sourceIndex - b.sourceIndex),
          important[important.length - 1],
        ];
  const reduced = reducedEntries.map(({ event }) => event);

  return reduced.map((event, index) => {
    const winnerLive = outcome.winnerSide === "A" ? event.liveA : 1 - event.liveA;
    const previous =
      index > 0
        ? outcome.winnerSide === "A"
          ? reduced[index - 1].liveA
          : 1 - reduced[index - 1].liveA
        : 0.5;
    const isFinal = index === reduced.length - 1;
    const phase: TimelineEvent["phase"] = isFinal
      ? "final"
      : event.round <= 2
        ? "opening"
        : event.round >= Math.ceil(outcome.rounds * 0.65)
          ? "climax"
          : "mid";
    return {
      t: event.elapsedSeconds,
      activeT: event.activeSeconds,
      phase,
      actor: event.actor,
      text: event.text,
      momentumShift: clamp(winnerLive - previous, -1, 1),
      probabilityAt: isFinal ? 1 : clamp(winnerLive, 0.01, 0.99),
    };
  });
}

export function simulateBattle(
  a: Character,
  b: Character,
  options: SimulateOptions = {},
): BattleResult {
  const context = makeBattleContext(options.context ?? DEFAULT_BATTLE_CONTEXT);
  const analysis = options.precomputedAnalysis ?? analyzeMatchup(a, b, { context });
  const seed = options.seed ?? randomSeed();
  const outcome = runCombat(a, b, {
    seed,
    context,
    baseProbA: analysis.probA,
    recordTimeline: true,
  });

  const winner = outcome.winnerSide === "A" ? a : b;
  const loser = outcome.winnerSide === "A" ? b : a;
  const winnerPreProb = outcome.winnerSide === "A" ? analysis.probA : analysis.probB;
  const path = choosePath(winner, outcome.finalActionId, outcome.method);
  const arena = getArena(context.arenaId);
  const methodLabel = outcome.method.replaceAll("-", " ");
  return {
    seed,
    winnerId: winner.id,
    loserId: loser.id,
    winnerSide: outcome.winnerSide,
    winnerPreProb,
    rarity: classifyRarity(winnerPreProb),
    underdog: winnerPreProb < 0.5,
    durationSeconds: outcome.totalElapsedSeconds,
    activeCombatSeconds: outcome.activeCombatSeconds,
    totalElapsedSeconds: outcome.totalElapsedSeconds,
    rounds: outcome.rounds,
    method: outcome.method,
    path,
    summary: `${winner.name} secured ${methodLabel} through ${path.name.toLowerCase()} in ${arena.name} at ${context.timeOfDay}. Location, time, action timing, recovery and pursuit phases were resolved by the same seeded combat engine.`,
    timeline: timelineFromOutcome(outcome),
    mostInfluentialSuccess: outcome.decisiveSuccess,
    mostInfluentialFailure: outcome.decisiveFailure,
    engineVersion: ENGINE_VERSION,
    context,
    arena,
  };
}

export function batchSimulate(
  a: Character,
  b: Character,
  n: number,
  startSeed?: number,
  context: BattleContext = DEFAULT_BATTLE_CONTEXT,
): {
  aWins: number;
  bWins: number;
  expectedA: number;
  expectedB: number;
  averageRounds: number;
  averageActiveSeconds: number;
  averageElapsedSeconds: number;
  fastestSeconds: number;
  longestSeconds: number;
} {
  const resolvedContext = makeBattleContext(context);
  const analysis = analyzeMatchup(a, b, { context: resolvedContext });
  const base = startSeed ?? randomSeed();
  let aWins = 0;
  let rounds = 0;
  let activeSeconds = 0;
  let elapsedSeconds = 0;
  let fastestSeconds = Number.POSITIVE_INFINITY;
  let longestSeconds = 0;
  for (let i = 0; i < n; i++) {
    const outcome = runCombat(a, b, {
      seed: mixSeed(base, i),
      context: resolvedContext,
      recordTimeline: false,
    });
    if (outcome.winnerSide === "A") aWins++;
    rounds += outcome.rounds;
    activeSeconds += outcome.activeCombatSeconds;
    elapsedSeconds += outcome.totalElapsedSeconds;
    fastestSeconds = Math.min(fastestSeconds, outcome.totalElapsedSeconds);
    longestSeconds = Math.max(longestSeconds, outcome.totalElapsedSeconds);
  }
  return {
    aWins,
    bWins: n - aWins,
    expectedA: analysis.probA,
    expectedB: analysis.probB,
    averageRounds: rounds / Math.max(1, n),
    averageActiveSeconds: activeSeconds / Math.max(1, n),
    averageElapsedSeconds: elapsedSeconds / Math.max(1, n),
    fastestSeconds: Number.isFinite(fastestSeconds) ? fastestSeconds : 0,
    longestSeconds,
  };
}

export function clearAnalysisCache() {
  analysisCache.clear();
}
