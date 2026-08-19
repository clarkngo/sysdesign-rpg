# Design decision: Difficulty + boss roster

**Status:** Accepted  
**Date:** 2026-08-18

## Difficulty

- **Beginner (default):** same card ids / correct answers / path stage ids; clearer scenario and choice wording via `card.beginner` patches.
- **Standard:** original denser trade-off language.
- Toggle on the boss-select hub; preference stored in `localStorage` (`sysdesign-rpg-difficulty`).

## Boss select

Start at a hub listing all bosses. **Engage** starts a fresh fight; **Continue** appears when a mid-fight save matches that boss.

## Roster

| Boss | Focus |
| --- | --- |
| Thundering Herd | Cache stampedes / CDN |
| Split-Brain Hydra | Consistency / quorum / fencing |
| SPOF Wyrm | HA / redundancy / circuit breakers |
| Memory Leak Slime | Resource leaks / limits / verify |
| Retry Storm Specter | Retries / backoff / bulkheads |
| Hot Partition Golem | Shard skew / partition keys |
| Poison Queue Wraith | DLQ / poison messages / idempotency |
| Authz Shadow | Authn vs authz / least privilege |
| Replication Lag Lurker | Stale replicas / read-your-writes |
| Cold Start Wisp | Serverless init / provisioned concurrency |
| Schema Drift Mimic | Expand-contract migrations |
| Backpressure Kraken | Load shedding / bounded queues |
| Rate-Limit Sphinx | Quotas / 429 / token buckets |
| N+1 Serpent | Query fan-out / batching |
| Clock-Skew Chronarch | Leases / skew margins / fencing |
| Idempotency Imp | Keys / safe retries / dedupe |
