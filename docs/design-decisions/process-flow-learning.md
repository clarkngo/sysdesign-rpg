# Design decision: Process-flow learning

**Status:** Accepted  
**Date:** 2026-08-18  
**Context:** Combat MCQs teach trade-off *judgment*. System design also needs *ordering and topology* (request paths, failure hops, runbooks).

## Decision

**Add process-flow learning as a second card type inside the same boss fight** — not a separate app, and not a replacement for A–D combat.

Multiple-choice stays the default attack. Flow puzzles teach sequencing (where the request goes, what you harden next). Both feed the same mastery tracks and soft-miss rules.

## Why

| Approach | Engagement / learning |
| --- | --- |
| MCQ only | Strong on trade-offs; weak on “draw the path”; quiz fatigue over long decks |
| Full diagram editor | High fidelity, low ship speed; overkill for GitHub Pages MVP |
| **Light flow cards in the deck** | Variety + interview-relevant sequencing without new product surface |

## What a flow card is (MVP)

- Shuffled **stage chips** + ordered **slots** (click or tap to place; reorder allowed)
- Submit → damage / uptime like combat; **reveal correct order + per-hop rationale**
- Framed as the same incident boss (e.g. Thundering Herd corrupts the read path)
- **About one flow card per boss deck** (or every 2–3 MCQs), so sessions stay short

Example (Herd): Client → Edge/CDN → App + singleflight → Cache (SWR) → Origin

## Locked constraints (inherit existing decisions)

- No mastery demotion on miss
- Learn from the reveal (correct path + why)
- Solve UI stays **below** the battlefield (no overlay)
- Progress: localStorage + JSON import/export (extend save schema for flow state)
- Archive replaced assets under `src/assets/archive/`

## Non-goals (this pass)

- Freeform box-and-arrow canvas
- Real-time collaboration / whiteboard export
- Replacing combat MCQs
- Multi-page “course mode” outside the RPG loop

## Engagement expectation

Flows should make the boss feel like **repairing a pipeline**, not another quiz skin. If players skip reveals or treat order as memorization, tighten feedback (highlight first wrong hop) before adding more flow cards.

## Implementation sketch (when building)

1. `kind: 'mcq' | 'flow'` on encounter cards in `src/game/encounters.ts`
2. `FlowCard`: `stages`, `correctOrder`, per-stage breakdown
3. `useEncounter` handles flow submit / re-queue variants
4. `FlowPuzzle` panel under the battlefield via `CombatScreen`
5. One Thundering Herd flow card to validate the loop

## When to revisit

- If flow cards outperform MCQs on retention, increase ratio carefully (still keep trade-off judgment).
- If UI feels like busywork, cut stage count (5–7 hops max) or use “pick next hop” instead of full ordering.
