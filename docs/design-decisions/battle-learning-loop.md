# Design decision: Battle learning loop

**Status:** Accepted  
**Date:** 2026-08-18  
**Context:** SysDesign RPG combat was a single reusable A–D prompt. Players could farm the same answer without learning.

## Decision

Wrong answers **do not demote mastery**. Learning lives in the **choice set**: after every answer, show a full A–D trade-off board. Missed concepts are **re-queued as variants** later in the same fight (spaced practice), with soft penalties only (uptime + small boss heal).

## Why

| Approach | Rejected because |
| --- | --- |
| Level / mastery demotion on miss | Punishes exploration; trains safe memorization over reasoning |
| Retry the same question until correct | Stalls the fight; becomes “click until B” |
| Advance with no teaching | Fast but shallow |
| **Trade-off reveal + soft penalty + re-queue** | Keeps pace, teaches from all four options, reinforces misses without erasing progress |

## Rules (locked)

1. **One scenario per turn** — correct damage advances to a *new* card; never recycle the identical prompt.
2. **Mastery only moves up** — awarded on correct answers; unchanged on miss.
3. **Soft miss cost** — uptime penalty and optional boss heal; never a full level-down.
4. **Teach from choices** — resolve UI always shows why A/B/C/D succeed or fail under load; highlight optimal + player pick.
5. **Spaced re-queue** — on miss, enqueue a *variant* of that concept after remaining main-deck cards (not the same wording).
6. **Optional hint** — eliminate one clearly bad option for a small uptime cost (agency without free answers).
7. **Win conditions** — boss HP ≤ 0, or deck + re-queue exhausted (incident contained).

## Shape of a boss fight

- `BossEncounter` — identity (name, max HP, threat type, art).
- `ScenarioCard[]` — unique main-deck questions for that incident.
- `variants` — alternate wording keyed by `conceptId` for re-queues.

Current reference implementation: Thundering Herd (~5 main cards + variants) in `src/game/encounters.ts`, engine in `src/game/useEncounter.ts`.

## Out of scope (for now)

- LLM-generated live questions
- Multiple bosses / campaign map
- Hard level demotion or skill-tree gating

## Persistence (GitHub Pages)

Progress autosaves to `localStorage` (key `sysdesign-rpg-save-v1`). Export/import JSON moves saves between browsers. No server required for Pages hosting.

## When to revisit

- If players ignore trade-off boards (skim and mash Continue), consider requiring a short “confirm optimal” tap or delaying Continue.
- If misses feel too soft, raise uptime cost or boss heal — still avoid mastery demotion unless evidence says otherwise.
- If decks feel repetitive, add phase framing (escalating incident beats) on top of the same card model.
