/**
 * Character-specific technique libraries.
 *
 * A technique is a canonical-style manifestation of one balanced combat action
 * family. This keeps the feed varied without letting a fighter bypass cooldowns
 * by receiving several mechanically identical high-powered actions.
 */
import type { CombatTechnique } from "./types";

const technique = (value: CombatTechnique): CombatTechnique => value;
const t = (
  id: string,
  name: string,
  actionId: string,
  hit: string,
  miss?: string,
): CombatTechnique => ({ id, name, actionId, text: { hit, ...(miss ? { miss } : {}) } });

export const DOCTOR_DOOM_TECHNIQUES: CombatTechnique[] = [
  t(
    "doom-eldritch-lightning",
    "Eldritch Lightning",
    "doom-arcane-bolt",
    "Doom's gauntlet releases eldritch lightning that coils through {target}'s defense.",
    "{target} breaks the lightning's path before it closes.",
  ),
  t(
    "doom-dimension-rift",
    "Dimensional Rift Strike",
    "doom-arcane-bolt",
    "A narrow dimensional rift tears open across {target}'s attack lane.",
    "The rift seals a fraction before {target} crosses it.",
  ),
  t(
    "doom-mystic-lance",
    "Mystic Lance",
    "doom-arcane-bolt",
    "Doctor Doom compresses sorcery into a piercing mystic lance aimed at {target}.",
    "{target} deflects the mystic lance off its intended line.",
  ),
  t(
    "doom-transmutation-ray",
    "Transmutation Ray",
    "doom-arcane-bolt",
    "Doom's spell briefly destabilizes the material shielding {target}.",
    "The transmutation pattern fails to lock onto {target}.",
  ),
  t(
    "doom-gauntlet-blast",
    "Gauntlet Blast",
    "doom-armor-volley",
    "Doom hammers {target}'s position with synchronized gauntlet blasts.",
    "The gauntlet blasts crater the ground behind {target}.",
  ),
  t(
    "doom-micro-missile-fan",
    "Micro-Missile Fan",
    "doom-armor-volley",
    "A fan of armor-launched micro-missiles converges around {target}.",
    "{target} escapes through the micro-missile pattern.",
  ),
  t(
    "doom-concussive-beam",
    "Concussive Beam",
    "doom-armor-volley",
    "Doctor Doom's armor drives a concussive beam through {target}'s guard.",
    "The concussive beam shears past {target}.",
  ),
  t(
    "doom-electric-cage",
    "Electric Cage",
    "doom-armor-volley",
    "Interlocking armor bolts form an electric cage around {target}.",
    "{target} exits before the electric cage closes.",
  ),
  t(
    "doom-system-override",
    "Systems Override",
    "doom-technopathic-hex",
    "Doom overlays a technopathic command across {target}'s active systems.",
    "{target}'s systems reject the override command.",
  ),
  t(
    "doom-energy-siphon",
    "Energy Siphon",
    "doom-technopathic-hex",
    "Doctor Doom's hex siphons power from {target}'s active defenses.",
    "The siphon loses its connection to {target}.",
  ),
  t(
    "doom-armor-lock",
    "Armor Lock Hex",
    "doom-technopathic-hex",
    "Mystic code locks around {target}'s moving systems and joints.",
    "{target} purges the armor-lock hex before it takes hold.",
  ),
  t(
    "doom-binding-circles",
    "Binding Circles",
    "doom-crimson-bands",
    "Layered binding circles tighten around {target}'s limbs and center of mass.",
    "{target} disrupts the binding circles before they align.",
  ),
  t(
    "doom-mystic-chains",
    "Mystic Chains",
    "doom-crimson-bands",
    "Mystic chains erupt from the arena and coil around {target}.",
    "The chains close on empty space as {target} moves.",
  ),
  t(
    "doom-kinetic-barrier",
    "Kinetic Barrier",
    "doom-force-field",
    "Doom's armor projects a dense kinetic barrier across the impact line.",
  ),
  t(
    "doom-absorbing-field",
    "Energy-Absorbing Field",
    "doom-force-field",
    "A layered field drinks in the incoming energy before it reaches Doom.",
  ),
  t(
    "doom-dimensional-step",
    "Dimensional Step",
    "doom-teleport",
    "Doom steps through a dimensional fold and reappears at a superior angle.",
  ),
  t(
    "doom-banishment-seal",
    "Banishment Seal",
    "doom-mystic-seal",
    "Doctor Doom completes a banishment seal beneath {target}.",
    "{target} breaks the seal's geometry before it closes.",
  ),
  t(
    "doom-time-snare",
    "Temporal Snare",
    "doom-mystic-seal",
    "A temporal sigil drags against {target}'s movement and locks the finishing pattern.",
    "{target} outruns the temporal sigil's final alignment.",
  ),
];

export const DARTH_VADER_TECHNIQUES: CombatTechnique[] = [
  t(
    "vader-force-crush",
    "Force Crush",
    "vader-force-choke",
    "Vader closes his fist and the Force crushes inward around {target}.",
    "{target} breaks Vader's concentration before the crush closes.",
  ),
  t(
    "vader-force-pin",
    "Force Pin",
    "vader-force-choke",
    "Vader pins {target} in place beneath overwhelming telekinetic pressure.",
    "{target} slips the Force pin before it stabilizes.",
  ),
  t(
    "vader-telekinetic-constriction",
    "Telekinetic Constriction",
    "vader-force-choke",
    "The Force constricts around {target}'s chest and limbs.",
    "{target} tears free of the constriction's weakest edge.",
  ),
  t(
    "vader-djem-so-overhead",
    "Djem So Overhead",
    "vader-saber-strike",
    "Vader brings his lightsaber down through {target}'s guard with a crushing overhead stroke.",
    "{target} gives ground before the overhead stroke lands.",
  ),
  t(
    "vader-one-hand-counter",
    "One-Handed Saber Counter",
    "vader-saber-strike",
    "Vader catches the attack one-handed and counters across {target}'s opening.",
    "{target} retracts before the saber counter arrives.",
  ),
  t(
    "vader-saber-lunge",
    "Saber Lunge",
    "vader-saber-strike",
    "Vader drives forward and extends a precise saber lunge at {target}.",
    "{target} pivots outside the saber's reach.",
  ),
  t(
    "vader-disarming-cut",
    "Disarming Cut",
    "vader-saber-strike",
    "Vader's red blade cuts through {target}'s weapon line and exposed defense.",
    "{target} withdraws the targeted limb before the cut lands.",
  ),
  t(
    "vader-guided-saber-arc",
    "Guided Saber Arc",
    "vader-saber-throw",
    "Vader guides his spinning saber around cover and across {target}'s flank.",
    "{target} drops beneath the returning saber arc.",
  ),
  t(
    "vader-returning-sweep",
    "Returning Saber Sweep",
    "vader-saber-throw",
    "The thrown saber passes {target}, reverses, and sweeps back from behind.",
    "{target} reads the returning sweep and clears both passes.",
  ),
  t(
    "vader-debris-storm",
    "Debris Storm",
    "vader-telekinetic-barrage",
    "Vader surrounds {target} with a storm of telekinetically driven debris.",
    "{target} finds a seam through the debris storm.",
  ),
  t(
    "vader-force-slam",
    "Force Slam",
    "vader-telekinetic-barrage",
    "Vader lifts {target} and slams them against the arena with the Force.",
    "{target} anchors before the Force slam can lift them.",
  ),
  t(
    "vader-ceiling-collapse",
    "Telekinetic Collapse",
    "vader-telekinetic-barrage",
    "Vader tears the structure overhead down around {target}.",
    "{target} escapes the collapsing structure's center.",
  ),
  t(
    "vader-projectile-reversal",
    "Projectile Reversal",
    "vader-telekinetic-barrage",
    "Vader catches incoming debris in the Force and hurls it back at {target}.",
    "The reversed projectiles pass outside {target}'s new angle.",
  ),
  t(
    "vader-saber-deflection",
    "Saber Deflection",
    "vader-force-guard",
    "Vader's blade moves in short, efficient arcs that turn the attack aside.",
  ),
  t(
    "vader-force-barrier",
    "Force Barrier",
    "vader-force-guard",
    "A dense wall of Force absorbs the attack in front of Vader.",
  ),
  t(
    "vader-precognitive-parry",
    "Precognitive Parry",
    "vader-force-guard",
    "Vader feels the attack through the Force and parries before it fully begins.",
  ),
  t(
    "vader-force-yank",
    "Force Yank",
    "vader-force-pull",
    "Vader yanks {target} abruptly off their chosen line and into danger.",
    "{target} anchors against the Force yank.",
  ),
  t(
    "vader-saber-range-pull",
    "Saber-Range Pull",
    "vader-force-pull",
    "Vader drags {target} directly into the reach of his waiting lightsaber.",
    "{target} arrests the pull outside saber range.",
  ),
  t(
    "vader-telekinetic-trip",
    "Telekinetic Trip",
    "vader-force-pull",
    "A low telekinetic pull tears {target}'s footing away.",
    "{target} recovers their footing before the pull compounds.",
  ),
];

export const HULK_TECHNIQUES: CombatTechnique[] = [
  t(
    "hulk-double-fist-smash",
    "Double-Fist Smash",
    "hulk-smash",
    "Hulk brings both fists down and drives {target} into the arena.",
    "The double-fist smash detonates the ground beside {target}.",
  ),
  t(
    "hulk-backhand",
    "Gamma Backhand",
    "hulk-smash",
    "Hulk's backhand catches {target} and launches them through the terrain.",
    "{target} ducks beneath the gamma backhand.",
  ),
  t(
    "hulk-ground-pound",
    "Ground Pound",
    "hulk-smash",
    "Hulk pounds through {target}'s guard with raw gamma force.",
    "Hulk's ground pound lands just outside {target}'s position.",
  ),
  t(
    "hulk-grab-and-slam",
    "Grab and Slam",
    "hulk-smash",
    "Hulk catches {target} and repeatedly slams them across the battlefield.",
    "{target} slips Hulk's grip before the slam begins.",
  ),
  t(
    "hulk-gamma-haymaker",
    "Gamma Haymaker",
    "hulk-smash",
    "Hulk winds through a full-power gamma haymaker at {target}.",
    "The haymaker tears the air past {target}.",
  ),
  t(
    "hulk-meteor-leap",
    "Meteor Leap",
    "hulk-leap-smash",
    "Hulk descends on {target} like a gamma-powered meteor.",
    "{target} clears the center of Hulk's landing.",
  ),
  t(
    "hulk-leaping-tackle",
    "Leaping Tackle",
    "hulk-leap-smash",
    "Hulk crosses the arena and tackles {target} through the battlefield.",
    "The leaping tackle carves past {target}.",
  ),
  t(
    "hulk-crater-drop",
    "Crater Drop",
    "hulk-leap-smash",
    "Hulk drops from above and craters the ground beneath {target}.",
    "{target} escapes the crater's center before impact.",
  ),
  t(
    "hulk-gamma-bound",
    "Gamma Bound",
    "hulk-leap-smash",
    "One impossible bound carries Hulk directly into {target}'s position.",
    "{target} changes direction before Hulk lands.",
  ),
  t(
    "hulk-focused-thunderclap",
    "Focused Thunderclap",
    "hulk-thunderclap",
    "Hulk focuses a thunderclap into a wall of pressure around {target}.",
    "{target} drops below the focused pressure wave.",
  ),
  t(
    "hulk-airburst-clap",
    "Airburst Clap",
    "hulk-thunderclap",
    "Hulk's palms collide and the airburst engulfs {target}'s escape lanes.",
    "{target} clears the airburst's strongest cone.",
  ),
  t(
    "hulk-shockwave-clap",
    "Shockwave Clap",
    "hulk-thunderclap",
    "A gamma-powered clap sends a rolling shockwave through {target}.",
    "The shockwave breaks around the terrain before reaching {target}.",
  ),
  t(
    "hulk-faultline-smash",
    "Faultline Smash",
    "hulk-ground-quake",
    "Hulk punches open a faultline beneath {target}.",
    "The faultline branches away from {target}.",
  ),
  t(
    "hulk-arena-breaker",
    "Arena Breaker",
    "hulk-ground-quake",
    "Hulk tears the battlefield apart under {target}'s footing.",
    "{target} reaches stable ground before the break spreads.",
  ),
  t(
    "hulk-seismic-stomp",
    "Seismic Stomp",
    "hulk-ground-quake",
    "Hulk's stomp sends a seismic wall rolling toward {target}.",
    "{target} rides over the weakest edge of the seismic wall.",
  ),
  t(
    "hulk-boulder-upheaval",
    "Boulder Upheaval",
    "hulk-ground-quake",
    "Hulk rips a mass of terrain upward beneath {target}.",
    "The upheaval erupts behind {target}.",
  ),
  t(
    "hulk-rage-roar",
    "Rage Roar",
    "hulk-roar",
    "Hulk's roar rolls across the arena as his rage and power climb.",
  ),
  t(
    "hulk-gamma-surge",
    "Gamma Surge",
    "hulk-roar",
    "Gamma energy surges through Hulk as he forces himself back into the fight.",
  ),
  t(
    "hulk-pain-to-power",
    "Pain into Power",
    "hulk-roar",
    "Every accumulated impact feeds Hulk's anger and rising strength.",
  ),
  t(
    "hulk-regenerative-rage",
    "Regenerative Rage",
    "hulk-roar",
    "Hulk's wounds close as his rage resets his attack posture.",
  ),
];

export const GODZILLA_TECHNIQUES: CombatTechnique[] = [
  t(
    "godzilla-spiral-ray",
    "Spiral Heat Ray",
    "godzilla-atomic-breath",
    "Godzilla's dorsal plates flare as a spiraling heat ray engulfs {target}.",
    "The spiral ray scorches past {target}.",
  ),
  t(
    "godzilla-sweeping-breath",
    "Sweeping Atomic Breath",
    "godzilla-atomic-breath",
    "Godzilla sweeps atomic breath across every escape lane around {target}.",
    "{target} outruns the sweeping edge of the beam.",
  ),
  t(
    "godzilla-focused-beam",
    "Focused Atomic Beam",
    "godzilla-atomic-breath",
    "Godzilla compresses his atomic breath into a focused beam through {target}.",
    "The focused beam cuts beside {target}.",
  ),
  t(
    "godzilla-point-blank-breath",
    "Point-Blank Atomic Breath",
    "godzilla-atomic-breath",
    "Godzilla unleashes atomic breath at point-blank range into {target}.",
    "{target} breaks away before the point-blank blast fires.",
  ),
  t(
    "godzilla-tail-whip",
    "Tail Whip",
    "godzilla-tail-sweep",
    "Godzilla's tail whips across {target} with building-shattering force.",
    "{target} clears the tail's fastest section.",
  ),
  t(
    "godzilla-tail-hammer",
    "Tail Hammer",
    "godzilla-tail-sweep",
    "Godzilla brings his tail down like a hammer across {target}'s position.",
    "The tail hammer craters the ground beside {target}.",
  ),
  t(
    "godzilla-reverse-tail-sweep",
    "Reverse Tail Sweep",
    "godzilla-tail-sweep",
    "Godzilla reverses his turn and catches {target} with the returning tail sweep.",
    "{target} reads the reversal and stays outside the return arc.",
  ),
  t(
    "godzilla-body-check",
    "Kaiju Body Check",
    "godzilla-tail-sweep",
    "Godzilla pivots his full mass through {target}'s guard.",
    "{target} moves before Godzilla's mass closes the lane.",
  ),
  t(
    "godzilla-crushing-stomp",
    "Crushing Stomp",
    "godzilla-stomp",
    "Godzilla's foot descends across {target}'s entire position.",
    "{target} escapes the footprint before impact.",
  ),
  t(
    "godzilla-double-stomp",
    "Double Stomp",
    "godzilla-stomp",
    "Godzilla follows the first quake with a second crushing stomp around {target}.",
    "{target} threads the gap between the two impacts.",
  ),
  t(
    "godzilla-seismic-step",
    "Seismic Step",
    "godzilla-stomp",
    "Godzilla's advancing step sends a seismic impact through {target}.",
    "{target} braces beyond the strongest seismic line.",
  ),
  t(
    "godzilla-omnidirectional-pulse",
    "Omnidirectional Nuclear Pulse",
    "godzilla-nuclear-pulse",
    "Godzilla releases a nuclear pulse in every direction around {target}.",
    "{target} reaches the pulse's outer edge before it peaks.",
  ),
  t(
    "godzilla-burning-pulse",
    "Burning Pulse",
    "godzilla-nuclear-pulse",
    "A burning nuclear pulse erupts from Godzilla's body and overtakes {target}.",
    "{target} clears the burning pulse's center.",
  ),
  t(
    "godzilla-reactor-burst",
    "Reactor Burst",
    "godzilla-nuclear-pulse",
    "Godzilla vents stored atomic energy in a reactor-like burst around {target}.",
    "The reactor burst fades before reaching {target}.",
  ),
  t(
    "godzilla-armored-charge",
    "Armored Charge",
    "godzilla-advance",
    "Godzilla absorbs the incoming attack and continues his armored charge toward {target}.",
  ),
  t(
    "godzilla-relentless-march",
    "Relentless March",
    "godzilla-advance",
    "Godzilla marches through the collapsing battlefield without yielding ground.",
  ),
  t(
    "godzilla-rapid-regeneration",
    "Rapid Regeneration",
    "godzilla-regenerate",
    "Godzilla's damaged tissue rapidly knits itself back together.",
  ),
  t(
    "godzilla-atomic-recovery",
    "Atomic Recovery",
    "godzilla-regenerate",
    "Stored atomic energy floods Godzilla's wounds and restores his fighting posture.",
  ),
  t(
    "godzilla-kaiju-endurance",
    "Kaiju Endurance",
    "godzilla-regenerate",
    "Godzilla endures the damage and rises through it as his body recovers.",
  ),
];

export const SPIDER_MAN_TECHNIQUES: CombatTechnique[] = [
  technique({
    id: "spidey-web-zip-strike",
    name: "Web-Zip Strike",
    actionId: "spidey-blitz",
    text: {
      hit: "Spider-Man web-zips into {target} with a sudden two-footed strike.",
      miss: "{target} reads the web line and slips the incoming web-zip.",
    },
  }),
  technique({
    id: "spidey-spider-sense-counter",
    name: "Spider-Sense Counter",
    actionId: "spidey-blitz",
    text: {
      hit: "Spider-sense maps the attack before it begins, and Spider-Man counters through the opening.",
      miss: "{target} aborts the attack before Spider-Man's counter can land cleanly.",
    },
  }),
  technique({
    id: "spidey-wall-crawl-ambush",
    name: "Wall-Crawl Ambush",
    actionId: "spidey-blitz",
    text: {
      hit: "Spider-Man changes planes across a wall and attacks {target} from the blind side.",
      miss: "{target} tracks the wall-crawl and turns before the ambush connects.",
    },
  }),
  technique({
    id: "spidey-ceiling-drop",
    name: "Ceiling Drop",
    actionId: "spidey-blitz",
    text: {
      hit: "Spider-Man releases from above and drives {target} into the ground.",
      miss: "{target} rolls clear as Spider-Man drops from overhead.",
    },
  }),
  technique({
    id: "spidey-acrobatic-sweep",
    name: "Acrobatic Sweep",
    actionId: "spidey-blitz",
    text: {
      hit: "Spider-Man cartwheels under {target}'s guard and sweeps their base away.",
      miss: "{target} hops the sweep and keeps their stance.",
    },
  }),
  technique({
    id: "spidey-leaping-uppercut",
    name: "Leaping Uppercut",
    actionId: "spidey-blitz",
    text: {
      hit: "Spider-Man converts a full-body leap into an uppercut beneath {target}'s guard.",
      miss: "{target} angles away and the uppercut passes beside them.",
    },
  }),
  technique({
    id: "spidey-web-slingshot",
    name: "Web Slingshot",
    actionId: "spidey-blitz",
    text: {
      hit: "Spider-Man stretches a web slingshot to full tension and launches through {target}.",
      miss: "{target} vacates the line as the web slingshot releases.",
    },
  }),
  technique({
    id: "spidey-swing-by-kick",
    name: "Swing-By Kick",
    actionId: "spidey-blitz",
    text: {
      hit: "Spider-Man arcs past on a web line and drives a swinging kick into {target}.",
      miss: "The swing-by kick passes just outside {target}'s guard.",
    },
  }),
  technique({
    id: "spidey-web-yank",
    name: "Web Yank",
    actionId: "spidey-web-snare",
    text: {
      hit: "Spider-Man anchors twin web lines and yanks {target} off balance.",
      miss: "The web yank loses tension before Spider-Man can redirect {target}.",
    },
  }),
  technique({
    id: "spidey-web-tripline",
    name: "Web Tripline",
    actionId: "spidey-web-snare",
    text: {
      hit: "A low web tripline catches {target}'s advance and folds their footing underneath them.",
      miss: "{target} clears the web tripline before it can tighten.",
    },
  }),
  technique({
    id: "spidey-web-cocoon",
    name: "Web Cocoon",
    actionId: "spidey-web-snare",
    text: {
      hit: "Spider-Man circles {target} with rapid cocoon layers, sealing their arms and legs.",
      miss: "{target} breaks the cocoon pattern before the final layers connect.",
      finish: {
        containment:
          "Spider-Man seals {target} inside a reinforced web cocoon. Their limbs are immobilized, they cannot tear free, and the fight ends by containment.",
      },
    },
  }),
  technique({
    id: "spidey-web-blind",
    name: "Web Blind",
    actionId: "spidey-web-snare",
    text: {
      hit: "A pinpoint web burst covers {target}'s eyes and targeting line.",
      miss: "{target} shields their vision before the web burst lands.",
    },
  }),
  technique({
    id: "spidey-dual-web-disarm",
    name: "Dual-Web Disarm",
    actionId: "spidey-web-snare",
    text: {
      hit: "Twin web lines rip {target}'s active weapon or tool away from its firing angle.",
      miss: "{target} releases and recovers the targeted equipment before the disarm completes.",
    },
  }),
  technique({
    id: "spidey-ricochet-web",
    name: "Ricochet Web Shot",
    actionId: "spidey-web-snare",
    text: {
      hit: "Spider-Man banks a web shot around cover and catches {target} from an unseen angle.",
      miss: "The ricocheted web line grazes past {target} without anchoring.",
    },
  }),
  technique({
    id: "spidey-ground-tether",
    name: "Grounded Web Tether",
    actionId: "spidey-web-snare",
    text: {
      hit: "Spider-Man webs {target}'s limbs to separate ground anchors, sharply limiting movement.",
      miss: "{target} tears one anchor loose before the tether can load.",
    },
  }),
  technique({
    id: "spidey-rapid-web-barrage",
    name: "Rapid Web Barrage",
    actionId: "spidey-web-snare",
    text: {
      hit: "A rapid fan of web shots closes every immediate escape lane around {target}.",
      miss: "{target} finds the one seam left open in the web barrage.",
    },
  }),
  technique({
    id: "spidey-web-catapult",
    name: "Web Catapult",
    actionId: "spidey-environmental-trap",
    text: {
      hit: "Spider-Man uses web tension to catapult loose terrain into a trap around {target}.",
      miss: "The improvised projectile breaks apart before the trap closes around {target}.",
    },
  }),
  technique({
    id: "spidey-web-shield",
    name: "Web Shield",
    actionId: "spidey-evasive-swing",
    text: {
      hit: "Spider-Man layers a web shield across the incoming attack and rolls behind cover.",
    },
  }),
  technique({
    id: "spidey-web-parachute",
    name: "Web Parachute",
    actionId: "spidey-evasive-swing",
    text: {
      hit: "Spider-Man deploys a web parachute, bleeding off the fall and changing direction.",
    },
  }),
  technique({
    id: "spidey-wall-rebound",
    name: "Wall Rebound",
    actionId: "spidey-evasive-swing",
    text: {
      hit: "Spider-Man rebounds between surfaces and clears the incoming attack from an oblique angle.",
    },
  }),
];

export const BATMAN_TECHNIQUES: CombatTechnique[] = [
  technique({
    id: "batman-electrified-batarang",
    name: "Electrified Batarang",
    actionId: "batman-batarang",
    text: {
      hit: "An electrified batarang discharges on contact with {target}.",
      miss: "The electrified batarang grounds itself against the arena.",
    },
  }),
  technique({
    id: "batman-sonic-batarang",
    name: "Sonic Batarang",
    actionId: "batman-batarang",
    text: {
      hit: "A sonic batarang bursts beside {target}, disrupting balance and concentration.",
      miss: "{target} clears the sonic batarang's focused cone.",
    },
  }),
  technique({
    id: "batman-remote-batarang",
    name: "Remote Batarang",
    actionId: "batman-batarang",
    text: {
      hit: "Batman steers a remote batarang around cover into {target}'s exposed flank.",
      miss: "{target} changes direction faster than the remote batarang can correct.",
    },
  }),
  technique({
    id: "batman-taser-dart",
    name: "Taser Dart",
    actionId: "batman-emp",
    text: {
      hit: "A taser dart lands at {target}'s exposed joint and delivers a focused systems charge.",
      miss: "The taser dart sparks past {target}'s moving silhouette.",
    },
  }),
  technique({
    id: "batman-microdrone-breach",
    name: "Microdrone Systems Breach",
    actionId: "batman-emp",
    text: {
      hit: "Batman's microdrone maps {target}'s active systems and delivers a localized shutdown pulse.",
      miss: "{target} blocks the microdrone before it can transmit the shutdown pulse.",
    },
  }),
  technique({
    id: "batman-flashbang",
    name: "Flashbang Capsule",
    actionId: "batman-gas",
    text: {
      hit: "Batman's compound capsule blinds and disorients {target} inside the expanding cloud.",
      miss: "{target} turns and clears the capsule's effective radius.",
    },
  }),
  technique({
    id: "batman-adhesive-aerosol",
    name: "Adhesive Aerosol",
    actionId: "batman-gas",
    text: {
      hit: "A specialized adhesive aerosol thickens around {target}'s joints and breathing zone.",
      miss: "The adhesive cloud hardens outside {target}'s movement path.",
    },
  }),
  technique({
    id: "batman-explosive-batarang",
    name: "Explosive Batarang",
    actionId: "batman-explosive-gel",
    text: {
      hit: "An explosive batarang detonates beside {target} and drives debris through the lane.",
      miss: "{target} clears the blast center before the batarang detonates.",
    },
  }),
  technique({
    id: "batman-shaped-charge",
    name: "Shaped Demolition Charge",
    actionId: "batman-explosive-gel",
    text: {
      hit: "Batman angles a shaped charge to collapse the marked structure across {target}'s route.",
      miss: "{target} exits the marked structure before the shaped charge fires.",
    },
  }),
  technique({
    id: "batman-cape-glide",
    name: "Cape Glide",
    actionId: "batman-smoke",
    text: { hit: "Batman converts the fall into a cape glide and exits the attack line." },
  }),
  technique({
    id: "batman-grapnel-evasion",
    name: "Grapnel Evasion",
    actionId: "batman-smoke",
    text: { hit: "Batman fires the grapnel and cuts across the battlefield to a new elevation." },
  }),
  technique({
    id: "batman-armor-brace",
    name: "Armor Brace",
    actionId: "batman-smoke",
    text: {
      hit: "Batman locks his armored forearms over vital points and absorbs the worst of the impact.",
    },
  }),
  technique({
    id: "batman-batclaw-disarm",
    name: "Batclaw Disarm",
    actionId: "batman-grapnel-trap",
    text: {
      hit: "The Batclaw hooks {target}'s active weapon or limb and tears it off line.",
      miss: "{target} cuts the Batclaw line before Batman can pull.",
    },
  }),
  technique({
    id: "batman-line-launcher-snare",
    name: "Line Launcher Snare",
    actionId: "batman-grapnel-trap",
    text: {
      hit: "Crossed line-launcher cables redirect {target} into a structural snare.",
      miss: "{target} slips between the launcher cables before they cross.",
      finish: {
        "battlefield-removal":
          "Batman's crossed line-launcher cables redirect {target} beyond the active battlefield and lock the return route. Batman remains in bounds and wins by battlefield removal.",
      },
    },
  }),
  technique({
    id: "batman-bola-snare",
    name: "Bola Snare",
    actionId: "batman-grapnel-trap",
    text: {
      hit: "A weighted bola wraps {target}'s legs and redirects them into Batman's structural trap.",
      miss: "{target} clears the bola before it can wrap.",
    },
  }),
  technique({
    id: "batman-cape-stun",
    name: "Cape Stun",
    actionId: "batman-takedown",
    text: {
      hit: "Batman's weighted cape blinds {target} for the precise incapacitating strike behind it.",
      miss: "{target} ducks beneath the cape and powers out before the takedown is secured.",
    },
  }),
  technique({
    id: "batman-counter-strike",
    name: "Counter Strike",
    actionId: "batman-takedown",
    text: {
      hit: "Batman parries the entry and converts the opening into a precise incapacitating counter.",
      miss: "{target} withdraws before Batman's counter can develop.",
    },
  }),
  technique({
    id: "batman-nerve-strike",
    name: "Nerve Strike Sequence",
    actionId: "batman-takedown",
    text: {
      hit: "Batman chains precision nerve strikes across {target}'s compromised guard.",
      miss: "{target} twists away before the nerve-strike sequence is complete.",
    },
  }),
];
