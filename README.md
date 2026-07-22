# Fantasy Battles / Who Would Win Prototype

A Lovable-compatible React and TypeScript prototype for a transparent fictional battle simulator.

## Engine v3

The simulator resolves fights action by action and derives both the long-run probability and individual replay from the same rules. V3 adds:

- Arena, universe, galaxy/realm and terrain context
- Time-of-day effects
- Atmosphere, gravity, visibility and environmental survival
- Character home-territory and terrain affinities
- Active combat time and total elapsed fight time
- Rare pursuit and long-stalemate outcomes for future record leaderboards
- Deterministic seeds for exact replay

See `ENGINE_V3.md` for the engine design.

## Local development

```sh
npm install
npm run dev
```

Focused engine validation:

```sh
npm run typecheck:engine
```

Browser test panel:

```text
/app/engine-test
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
- Lovable-compatible GitHub sync

## Current boundary

All simulations are client-side and unverified. Official trophies, rare-victory collectibles and fastest/longest leaderboards must later be issued by a server-authoritative system.
