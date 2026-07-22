# Fantasy Battles / Who Would Win — Engine v3

Engine v3 extends the action-by-action simulator with first-class battle context and mechanically-derived fight duration.

## Core rule

The aggregate matchup percentage and each individual replay come from the same engine:

1. Load explicit character versions, scale, defenses, environmental traits and typed actions.
2. Load the selected arena, universe/realm, atmosphere, time of day and starting distance.
3. Apply specific context interactions such as home-territory knowledge, aquatic mobility, vacuum survival, darkness, ambient magic and ambient technology.
4. Establish initiative and engagement distance.
5. Select an action from the fighter's valid options.
6. Resolve accuracy, evasion, damage type, armor, resistance, scale, control and critical systems.
7. Advance active combat time using the selected action, fighter speed, scale and local gravity.
8. Resolve pursuit, concealment, recovery and rare long-term stalemate intervals.
9. Continue until knockout, incapacitation, containment, exhaustion or battlefield removal.
10. Repeat the same combat engine 1,400 times to estimate the displayed probability.

The winner is never chosen before the action timeline is simulated.

## Included arenas

- Neutral Ruined City
- Gotham City
- Castle Doom, Latveria
- Mustafar Industrial Complex
- Open Ocean and Coastline
- Deep Space
- Open Wilderness
- Asgardian Realm

Each arena includes universe, galaxy/realm, terrain, atmosphere, gravity, visibility, destructibility, ambient magic, ambient technology, hazard level and spatial scale.

## Duration model

Every result records:

- **Active combat time** — direct attacks, defenses, movement and control exchanges.
- **Total elapsed time** — active combat plus pursuit, concealment, recovery, disengagement and stalemate phases.

Most fights remain short. Mechanically qualified matchups can generate rare hour-, day- or year-scale conflicts. The same seed reproduces the same duration.

## Key files

- `src/lib/simulation/types.ts` — engine and context domain model
- `src/lib/simulation/arenas.ts` — arenas and environment effects
- `src/lib/simulation/duration.ts` — duration formatting
- `src/lib/simulation/characters.ts` — curated character versions, actions and environmental traits
- `src/lib/simulation/combat.ts` — action-by-action state and time engine
- `src/lib/simulation/interactions.ts` — transparent matchup/context factors
- `src/lib/simulation/engine.ts` — analysis, replay and batch APIs
- `src/routes/app.engine-test.tsx` — probability and duration validation panel

## Validation

```bash
npm run typecheck:engine
```

Then open `/app/engine-test` and compare independent samples across different arenas and times of day.

## Security boundary

This remains a client-side sandbox. It must not mint official trophies, fastest-fight records or leaderboard entries. Verified results later require server-generated seeds, signed context/rulesets and server-authoritative validation.
