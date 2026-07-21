// Prototype roster. Values are deliberately editable placeholders — not
// canonical power-scaling. Move to DB later; the shape stays the same.

import type { Character, Stats } from "./types";

const s = (partial: Partial<Stats>): Stats => ({
  strength: 50,
  speed: 50,
  durability: 50,
  battleIQ: 50,
  combatSkill: 50,
  range: 50,
  technology: 50,
  magic: 0,
  mentalResistance: 50,
  healing: 20,
  battlefieldControl: 50,
  stamina: 60,
  ...partial,
});

export const CHARACTERS: Character[] = [
  {
    id: "doctor-doom",
    name: "Doctor Doom",
    universe: "Marvel",
    accent: "#5eead4",
    description:
      "Sorcerer-scientist monarch. Combines arcane mastery with weaponized technology and armor forged by his own hand.",
    stats: s({
      strength: 78,
      speed: 62,
      durability: 84,
      battleIQ: 96,
      combatSkill: 78,
      range: 88,
      technology: 96,
      magic: 88,
      mentalResistance: 92,
      healing: 40,
      battlefieldControl: 92,
      stamina: 82,
    }),
    abilities: ["magic", "tech-exploit", "energy-blasts", "armor", "planning"],
    resistances: ["mind-control", "energy", "conventional"],
    weaknesses: ["arrogance", "honor-bound"],
    victoryPaths: [
      {
        id: "doom-mystic",
        name: "Mystic Overwhelm",
        tags: ["magic", "ranged", "control"],
        description: "Binds the opponent with layered sorcery, then finishes with unraveling glyphs.",
      },
      {
        id: "doom-tech",
        name: "Systems Exploit",
        tags: ["tech-exploit", "ranged", "planning"],
        description: "Predicts gear vulnerabilities and detonates them from range.",
      },
      {
        id: "doom-attrition",
        name: "Fortress Attrition",
        tags: ["control", "durability", "stamina"],
        description: "Fights defensively behind wards until the opponent burns out.",
      },
    ],
  },
  {
    id: "darth-vader",
    name: "Darth Vader",
    universe: "Star Wars",
    accent: "#ef4444",
    description:
      "Fallen Jedi encased in life-support armor. Wields lightsaber and the Force with brutal, patient precision.",
    stats: s({
      strength: 78,
      speed: 70,
      durability: 76,
      battleIQ: 82,
      combatSkill: 92,
      range: 66,
      technology: 60,
      magic: 82, // Force
      mentalResistance: 84,
      healing: 20,
      battlefieldControl: 74,
      stamina: 78,
    }),
    abilities: ["telekinesis", "mind-control", "energy-blade", "precognition"],
    resistances: ["mind-control", "fear"],
    weaknesses: ["life-support-armor", "mechanical"],
    victoryPaths: [
      {
        id: "vader-choke",
        name: "Force Choke",
        tags: ["mind", "telekinesis", "control"],
        description: "Locks the opponent in place and crushes the throat from across the room.",
      },
      {
        id: "vader-saber",
        name: "Saber Execution",
        tags: ["close-combat", "combat-skill", "energy-blade"],
        description: "Closes distance behind saber deflections and finishes with a single cut.",
      },
      {
        id: "vader-terrain",
        name: "Telekinetic Barrage",
        tags: ["telekinesis", "ranged", "control"],
        description: "Hurls debris and machinery until the opponent is buried.",
      },
    ],
  },
  {
    id: "spider-man",
    name: "Spider-Man",
    universe: "Marvel",
    accent: "#e11d48",
    description:
      "Peter Parker. Wall-crawler with proportional strength, precognitive spider-sense, and creative gadgeteering.",
    stats: s({
      strength: 62,
      speed: 78,
      durability: 58,
      battleIQ: 82,
      combatSkill: 72,
      range: 60,
      technology: 74,
      magic: 0,
      mentalResistance: 62,
      healing: 55,
      battlefieldControl: 78,
      stamina: 82,
    }),
    abilities: ["spider-sense", "web-shooters", "wall-crawl", "gadgets"],
    resistances: ["surprise-attacks"],
    weaknesses: ["sonic", "endurance-vs-heavyweights"],
    victoryPaths: [
      {
        id: "spidey-outlast",
        name: "Outlast & Outwit",
        tags: ["speed", "control", "planning"],
        description: "Uses mobility and terrain to bleed the opponent's stamina, then hog-ties them.",
      },
      {
        id: "spidey-improvise",
        name: "Improvised Exploit",
        tags: ["tech-exploit", "planning", "close-combat"],
        description: "Reads a weakness mid-fight and rigs an improvised trap.",
      },
      {
        id: "spidey-close",
        name: "Blitz Combo",
        tags: ["close-combat", "speed", "combat-skill"],
        description: "Chains a spider-sense-guided flurry that never lets the opponent set feet.",
      },
    ],
  },
  {
    id: "hulk",
    name: "Hulk",
    universe: "Marvel",
    accent: "#22c55e",
    description:
      "Gamma-fueled titan whose strength scales with rage. The angrier he gets, the harder he hits.",
    stats: s({
      strength: 99,
      speed: 60,
      durability: 96,
      battleIQ: 40,
      combatSkill: 55,
      range: 30,
      technology: 5,
      magic: 0,
      mentalResistance: 55,
      healing: 92,
      battlefieldControl: 55,
      stamina: 96,
    }),
    abilities: ["rage-scaling", "regeneration", "thunderclap", "leap"],
    resistances: ["conventional", "radiation", "pain"],
    weaknesses: ["mind-control", "gas", "outsmarting"],
    victoryPaths: [
      {
        id: "hulk-smash",
        name: "SMASH",
        tags: ["strength", "close-combat"],
        description: "Grabs, slams, repeats. Nothing fancy — nothing has to be.",
      },
      {
        id: "hulk-attrition",
        name: "Regenerate & Overwhelm",
        tags: ["stamina", "healing", "durability"],
        description: "Absorbs everything the opponent has, then hits back once.",
      },
      {
        id: "hulk-thunderclap",
        name: "Thunderclap",
        tags: ["strength", "control", "ranged"],
        description: "One clap rearranges the arena and the opponent with it.",
      },
    ],
  },
  {
    id: "batman",
    name: "Batman",
    universe: "DC",
    accent: "#60a5fa",
    description:
      "Peak human tactician with unmatched preparation, an armored suit, and a utility belt for every occasion.",
    stats: s({
      strength: 55,
      speed: 58,
      durability: 60,
      battleIQ: 98,
      combatSkill: 92,
      range: 68,
      technology: 88,
      magic: 5,
      mentalResistance: 88,
      healing: 25,
      battlefieldControl: 90,
      stamina: 78,
    }),
    abilities: ["prep-time", "gadgets", "stealth", "tech-exploit", "planning"],
    resistances: ["fear", "mind-control"],
    weaknesses: ["raw-power", "sustained-close-combat-vs-heavyweights"],
    victoryPaths: [
      {
        id: "bats-prep",
        name: "Counter-Prep",
        tags: ["planning", "tech-exploit", "control"],
        description: "Has already scouted the opponent and brought the exact tool for the job.",
      },
      {
        id: "bats-stealth",
        name: "Shadow Takedown",
        tags: ["stealth", "combat-skill", "planning"],
        description: "Vanishes, isolates, disables — one target at a time.",
      },
      {
        id: "bats-gadget",
        name: "Gadget Trap",
        tags: ["tech-exploit", "control", "ranged"],
        description: "Baits the opponent onto rigged terrain and ends it in one move.",
      },
    ],
  },
  {
    id: "godzilla",
    name: "Godzilla",
    universe: "Toho",
    accent: "#a78bfa",
    description:
      "Ancient kaiju apex predator. Skyscraper-sized durability, atomic breath, and near-limitless stamina.",
    stats: s({
      strength: 98,
      speed: 45,
      durability: 99,
      battleIQ: 55,
      combatSkill: 60,
      range: 88, // atomic breath
      technology: 0,
      magic: 20, // primordial energy
      mentalResistance: 88,
      healing: 90,
      battlefieldControl: 82, // by sheer size
      stamina: 98,
    }),
    abilities: ["atomic-breath", "regeneration", "size", "energy-blasts"],
    resistances: ["conventional", "energy", "mind-control", "pain"],
    weaknesses: ["mobility", "precision-targeting"],
    victoryPaths: [
      {
        id: "zilla-breath",
        name: "Atomic Breath",
        tags: ["ranged", "energy-blasts", "strength"],
        description: "One sustained beam ends the argument.",
      },
      {
        id: "zilla-stomp",
        name: "Kaiju Stomp",
        tags: ["strength", "close-combat"],
        description: "Closes the gap and simply steps on the opponent.",
      },
      {
        id: "zilla-attrition",
        name: "Immovable Object",
        tags: ["durability", "healing", "stamina"],
        description: "Regenerates through everything until the opponent has nothing left.",
      },
    ],
  },
];

export const CHARACTERS_BY_ID: Record<string, Character> = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c]),
);

export function getCharacter(id: string | undefined | null): Character | undefined {
  if (!id) return undefined;
  return CHARACTERS_BY_ID[id];
}
