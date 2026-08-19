# Design decision: Datacenter-dungeon art direction

**Status:** Accepted  
**Date:** 2026-08-18  
**Context:** Fantasy courtyard + generic slime was fun but weakly tied to system-design learning.

## Decision

Keep the **same HD-2D / pixel RPG style**, but reframe setting and bosses as **real-world ops metaphors** (“datacenter as dungeon”). Do **not** use photoreal cloud consoles, vendor logos, or a different art pipeline.

## Visual language

| Element | Treatment |
| --- | --- |
| Hero | Cloud Architect adventurer — familiar silhouette; cloak + tool/blade that reads as “architect,” not corporate badge photo |
| Arena | Courtyard composition preserved; stone → rack pillars, vines → cable runs, lanterns → status LEDs |
| Bosses | Incident creatures named by failure mode (Thundering Herd = stampeding request swarm), not generic fantasy mobs |
| UI | Unchanged ornate frame + solve panel below battlefield |

## Engagement intent

- Boss **identity** makes the fight feel like containing a known outage pattern.
- Style keeps **play fantasy**; metaphors keep **transfer** to interviews/on-call.
- Scope for this pass: **Thundering Herd + arena + hero** only. Broader roster later (Split-Brain Hydra, SPOF Wyrm, Memory Leak, etc.) using the same bible.

## Explicit non-goals

- Photoreal AWS/GCP/Azure UI embeds
- Abandoning pixel / HD-2D style
- Full campaign map or multi-boss unlock this pass

## When to revisit

- If players still say “cute game, not sysdesign,” push arena props and boss VFX harder toward telemetry (latency sparks, queue piles).
- If it feels too literal, pull back props and lean on creature design only.
