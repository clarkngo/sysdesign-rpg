import type { ArtKey } from './types'
import herdArt from '../assets/enemy-herd.png'
import hydraArt from '../assets/enemy-hydra.png'
import wyrmArt from '../assets/enemy-wyrm.png'
import leakArt from '../assets/enemy-leak.png'
import stormArt from '../assets/enemy-storm.png'
import golemArt from '../assets/enemy-golem.png'
import wraithArt from '../assets/enemy-wraith.png'
import shadowArt from '../assets/enemy-shadow.png'
import lurkerArt from '../assets/enemy-lurker.png'
import wispArt from '../assets/enemy-wisp.png'
import mimicArt from '../assets/enemy-mimic.png'
import krakenArt from '../assets/enemy-kraken.png'
import sphinxArt from '../assets/enemy-sphinx.png'
import serpentArt from '../assets/enemy-serpent.png'
import chronosArt from '../assets/enemy-chronos.png'
import impArt from '../assets/enemy-imp.png'
import { BOSSES } from './bosses'
import { MASTERY_LABELS, type MasteryKey } from './types'

export const BOSS_ART: Record<ArtKey, string> = {
  herd: herdArt,
  hydra: hydraArt,
  wyrm: wyrmArt,
  leak: leakArt,
  storm: stormArt,
  golem: golemArt,
  wraith: wraithArt,
  shadow: shadowArt,
  lurker: lurkerArt,
  wisp: wispArt,
  mimic: mimicArt,
  kraken: krakenArt,
  sphinx: sphinxArt,
  serpent: serpentArt,
  chronos: chronosArt,
  imp: impArt,
}

export interface BestiaryEntry {
  bossId: string
  name: string
  artKey: ArtKey
  threatType: string
  maxHp: number
  blurb: string
  habitat: string
  weakness: string
  fieldNotes: string
  scenarioCount: number
  masteryTracks: MasteryKey[]
}

const LORE: Record<
  string,
  { habitat: string; weakness: string; fieldNotes: string }
> = {
  'thundering-herd': {
    habitat: 'Hot-key cache tiers, CDN edges, and cold-start deploys',
    weakness: 'TTL jitter, singleflight coalescing, stale-while-revalidate',
    fieldNotes:
      'Appears when synchronized TTLs align across the fleet. Grows stronger with every identical origin query. Do not feed it larger connection pools.',
  },
  'split-brain-hydra': {
    habitat: 'Partitioned clusters, multi-region stores, contested leadership',
    weakness: 'Quorum writes, fencing tokens, minority-side refusal',
    fieldNotes:
      'Each head believes it is primary. Merging blindly with last-write-wins sheds blood (data). Fence first; reconcile second.',
  },
  'spof-wyrm': {
    habitat: 'Single-AZ stacks, lonely Redis nodes, unchecked dependency chains',
    weakness: 'Multi-AZ redundancy, health checks, circuit breakers',
    fieldNotes:
      'Coils around one glowing choke point and calls it “simplicity.” Sever the coil with redundancy before the outage does.',
  },
  'memory-leak-slime': {
    habitat: 'Long-lived processes, unbounded caches, exhausted connection pools',
    weakness: 'Bounds, observability, root-cause fixes (not endless restarts)',
    fieldNotes:
      'Swells quietly until GC thrash becomes customer latency. Restart buys time; limits and leak fixes buy survival.',
  },
  'retry-storm-specter': {
    habitat: 'Chatty clients, tight timeouts, interdependent microservices',
    weakness: 'Backoff with jitter, circuit breakers, bulkheads',
    fieldNotes:
      'Feeds on synchronized retries. Every “try again harder” summons more of it. Open the circuit before the fleet melts.',
  },
  'hot-partition-golem': {
    habitat: 'Skewed shard keys, celebrity tenants, poorly chosen hash spaces',
    weakness: 'Better partition keys, split hot ranges, measured rebalance',
    fieldNotes:
      'One shard glows white-hot while siblings idle. Scaling nodes without fixing the key only forges a larger golem.',
  },
  'poison-queue-wraith': {
    habitat: 'Worker fleets, at-least-once delivery, missing DLQs',
    weakness: 'Poison isolation, DLQ, idempotent consumers, controlled replay',
    fieldNotes:
      'A single bad message loops forever and starves the queue. Banish it to the dead-letter crypt, then heal the consumer.',
  },
  'authz-shadow': {
    habitat: 'API gateways, sprawling IAM roles, service-to-service calls',
    weakness: 'Authn then authz, least privilege, scoped tokens, audit trails',
    fieldNotes:
      'Slips through when authentication is mistaken for authorization. Deny by default; grant narrowly; record every exception.',
  },
  'replication-lag-lurker': {
    habitat: 'Async replicas, read pools, write-then-read UX paths',
    weakness: 'Lag metrics, primary routing for freshness, sync quorum where RPO matters',
    fieldNotes:
      'Speaks yesterday’s commits as today’s truth. Measure lag, protect critical reads, then tune replication before users notice.',
  },
  'cold-start-wisp': {
    habitat: 'Scale-to-zero functions, fat deploy packages, idle overnight APIs',
    weakness: 'Lean init, provisioned concurrency, clients outside the handler',
    fieldNotes:
      'Appears on the first request after silence. Slim the package, warm what users feel, prove p99 before declaring victory.',
  },
  'schema-drift-mimic': {
    habitat: 'Rolling deploys, mixed app versions, online migrations',
    weakness: 'Expand/contract, dual-compatible windows, reconciled cutovers',
    fieldNotes:
      'Wears the old schema while wearing the new face. Expand first, stay compatible, migrate, then contract — never hard-cut mid-fleet.',
  },
  'backpressure-kraken': {
    habitat: 'Saturated queues, chatty producers, missing admission control',
    weakness: 'Load shedding, bounded queues, timeout budgets, honest 429s',
    fieldNotes:
      'Feeds when you buffer forever. Detect saturation, shed excess, drain the backlog, then restore admission carefully.',
  },
  'rate-limit-sphinx': {
    habitat: 'Public APIs, partner gateways, expensive fan-out endpoints',
    weakness: 'Token buckets, per-tenant quotas, 429 + Retry-After, client backoff',
    fieldNotes:
      'Speaks in riddles of “just one more request.” Answer with measured quotas and honest rejects, not silent slow death.',
  },
  'n-plus-one-serpent': {
    habitat: 'ORM list views, GraphQL resolvers, nested detail fetches',
    weakness: 'Joins, batch loaders, query-count budgets, covering indexes',
    fieldNotes:
      'One head per row. Coalesce the fang-strikes into a single bite before p99 turns to stone.',
  },
  'clock-skew-chronarch': {
    habitat: 'Lease managers, distributed locks, token expiry, multi-region nodes',
    weakness: 'Skew-aware TTLs, fencing tokens, logical clocks, clock health alerts',
    fieldNotes:
      'Its faces disagree on “now.” Never trust wall clocks alone for fencing; leave margin for drift.',
  },
  'idempotency-imp': {
    habitat: 'Payment POSTs, webhook deliveries, at-least-once queues',
    weakness: 'Idempotency keys, stored results, safe replay windows',
    fieldNotes:
      'Duplicates delight it. Stamp a key, remember the outcome, and return the same answer on retry.',
  },
}

export function getBestiaryEntries(): BestiaryEntry[] {
  return BOSSES.map((boss) => {
    const lore = LORE[boss.id] ?? {
      habitat: 'Unknown sectors of the datacenter dungeon',
      weakness: 'Sound architecture judgment',
      fieldNotes: boss.blurb,
    }
    const mastery = new Set<MasteryKey>()
    for (const card of boss.deck) mastery.add(card.category)
    return {
      bossId: boss.id,
      name: boss.name,
      artKey: boss.artKey,
      threatType: boss.threatType,
      maxHp: boss.maxHp,
      blurb: boss.blurb,
      habitat: lore.habitat,
      weakness: lore.weakness,
      fieldNotes: lore.fieldNotes,
      scenarioCount: boss.deck.length,
      masteryTracks: [...mastery],
    }
  })
}

export function masteryLabel(key: MasteryKey) {
  return MASTERY_LABELS[key]
}
