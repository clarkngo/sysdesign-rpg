import { mcq, flow, type BossEncounter, type McqCard } from '../types'

const lurkerMcqs: Omit<McqCard, 'kind'>[] = [
  {
    id: 'lurker-read-your-writes',
    conceptId: 'read-your-writes',
    incomingThreat:
      'Users save a profile edit and immediately reload — the old bio stares back from a lagging replica.',
    scenario:
      'Writes hit the primary; the app reads the next page from a replica that is seconds behind. Users report “my change disappeared.” What is the right consistency fix for this path?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Guarantee read-your-writes: route post-write reads (or sticky sessions) to the primary until replicas catch up.',
      },
      {
        id: 'B',
        text: 'Always read from the most lagged replica to “spread load evenly.”',
      },
      {
        id: 'C',
        text: 'Drop the write ACK until every replica worldwide has applied it, with no timeouts.',
      },
      {
        id: 'D',
        text: 'Cache the old value forever in the CDN so users never see updates.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.3,
    xp: 14,
    breakdown: {
      A: 'Read-your-writes (primary routing / sticky reads after write) stops users from seeing their own stale data.',
      B: 'Preferring lag makes inconsistency worse.',
      C: 'Synchronous wait on every replica kills write latency and availability.',
      D: 'Eternal CDN cache hides updates entirely.',
    },
    beginner: {
      incomingThreat:
        'Someone saves a change, refreshes, and still sees the old value.',
      scenario:
        'Writes go to the primary; the next read hits a slow replica. What should you do?',
      choices: [
        {
          id: 'A',
          text: 'After a write, read from the primary (or stick to it) until replicas catch up.',
        },
        {
          id: 'B',
          text: 'Always read from the slowest replica.',
        },
        {
          id: 'C',
          text: 'Block every write until every replica on earth is updated.',
        },
        {
          id: 'D',
          text: 'Cache the old page forever so updates never show.',
        },
      ],
      breakdown: {
        A: 'Read-your-writes keeps users from seeing their own stale data.',
        B: 'Slowest replica means more stale reads.',
        C: 'Waiting on every replica makes writes painfully slow.',
        D: 'Forever cache means updates never appear.',
      },
    },
  },
  {
    id: 'lurker-sync-vs-async',
    conceptId: 'sync-vs-async-replication',
    incomingThreat:
      'Ops argues “make every replica sync” while write p99 melts and failover still looks risky.',
    scenario:
      'You need durable writes and low lag for critical reads, but not every replica must ack every commit. How do you choose sync vs async replication?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Use sync (or semi-sync) to a small quorum for durability; keep other replicas async and monitor lag for scale-out reads.',
      },
      {
        id: 'B',
        text: 'Force fully synchronous replication to every replica in every region for all writes.',
      },
      {
        id: 'C',
        text: 'Disable replication entirely so lag is always zero.',
      },
      {
        id: 'D',
        text: 'Async-only with no lag alerts and hope failover never loses data.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 22,
    bossHealOnMiss: 7,
    uptimePenalty: 0.32,
    xp: 15,
    breakdown: {
      A: 'Quorum sync protects durability; async replicas give read scale if you watch lag.',
      B: 'Sync-to-all multiplies latency and outage blast radius.',
      C: 'No replicas means no HA and no read scale.',
      D: 'Blind async risks silent data loss on failover.',
    },
    beginner: {
      incomingThreat:
        'Someone wants every replica to wait on every write — write latency is already bad.',
      scenario:
        'How should you mix sync and async replication?',
      choices: [
        {
          id: 'A',
          text: 'Sync (or semi-sync) to a small quorum; keep other replicas async and watch lag.',
        },
        {
          id: 'B',
          text: 'Make every replica in every region wait on every write.',
        },
        {
          id: 'C',
          text: 'Turn off replication so lag cannot exist.',
        },
        {
          id: 'D',
          text: 'Use async only and never alert on lag.',
        },
      ],
      breakdown: {
        A: 'Small sync quorum for safety; async replicas for scale with lag checks.',
        B: 'Sync-everywhere is slow and fragile.',
        C: 'No replicas means no failover.',
        D: 'Ignoring lag risks lost commits on failover.',
      },
    },
  },
  {
    id: 'lurker-lag-monitoring',
    conceptId: 'replication-lag-monitoring',
    incomingThreat:
      'Dashboards show “replica healthy” while replica_lag_seconds climbs and support tickets pile up.',
    scenario:
      'Health checks only ping TCP. Product reads are stale during spikes. What monitoring and routing change belongs here?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Alert on replication lag; remove or demote lagged replicas from read pools; send freshness-critical reads to primary.',
      },
      {
        id: 'B',
        text: 'Treat TCP ping success as proof that data is fresh.',
      },
      {
        id: 'C',
        text: 'Hide lag metrics so on-call is not paged.',
      },
      {
        id: 'D',
        text: 'Route all analytics and user-facing reads only to the furthest replica.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.28,
    xp: 14,
    breakdown: {
      A: 'Lag metrics + pool demotion + primary for critical reads keep freshness honest.',
      B: 'TCP up ≠ applied WAL / catch-up.',
      C: 'Silencing lag guarantees surprise stale reads.',
      D: 'Furthest replica maximizes staleness.',
    },
    beginner: {
      incomingThreat:
        'Replicas look “up,” but users still see old data and lag is climbing.',
      scenario:
        'What should you monitor and how should you route reads?',
      choices: [
        {
          id: 'A',
          text: 'Alert on lag, pull slow replicas out of read pools, and send critical reads to the primary.',
        },
        {
          id: 'B',
          text: 'If a TCP ping works, assume the data is fresh.',
        },
        {
          id: 'C',
          text: 'Hide lag graphs so nobody gets paged.',
        },
        {
          id: 'D',
          text: 'Send all reads to the farthest, slowest replica.',
        },
      ],
      breakdown: {
        A: 'Watch lag, demote stale replicas, use primary when freshness matters.',
        B: 'Ping ≠ caught up.',
        C: 'Hiding lag hides the bug.',
        D: 'Farthest replica is the stalest.',
      },
    },
  },
]

const lurkerFlow = flow({
  id: 'lurker-lag-remediation',
  conceptId: 'lag-remediation-path',
  incomingThreat:
    'The Lurker scrambled your lag playbook — steps are out of order.',
  scenario:
    'Order the replication-lag response: detect lag → route critical reads to primary → tune replication → verify freshness.',
  category: 'database',
  damageOnHit: 18,
  bossHealOnMiss: 7,
  uptimePenalty: 0.3,
  xp: 16,
  stages: [
    {
      id: 'detect',
      label: 'Detect lag',
      rationale: 'Measure replica_lag and spot stale-read symptoms before changing routing blindly.',
    },
    {
      id: 'route-primary',
      label: 'Route critical reads to primary',
      rationale: 'Protect read-your-writes and freshness-sensitive paths while lag is high.',
    },
    {
      id: 'tune',
      label: 'Tune replication',
      rationale: 'Fix apply bottlenecks, adjust sync/async, capacity, or parallel apply as appropriate.',
    },
    {
      id: 'verify',
      label: 'Verify freshness',
      rationale: 'Confirm lag recovered and critical reads see fresh data under load.',
    },
  ],
  distractors: [
    {
      id: 'ignore-lag',
      label: 'Ignore lag forever',
      rationale: 'Unwatched lag becomes silent data lies.',
    },
    {
      id: 'kill-replicas',
      label: 'Delete all replicas',
      rationale: 'Removes HA/read scale instead of fixing lag.',
    },
  ],
  beginner: {
    incomingThreat:
      'The lag-fix steps got mixed up — put them back in order.',
    scenario:
      'Order: spot the lag → send critical reads to primary → fix/tune replication → confirm data is fresh.',
    stages: [
      {
        id: 'detect',
        label: 'Detect lag',
        rationale: 'First measure how far behind replicas are.',
      },
      {
        id: 'route-primary',
        label: 'Route critical reads to primary',
        rationale: 'Keep important reads fresh while you fix lag.',
      },
      {
        id: 'tune',
        label: 'Tune replication',
        rationale: 'Speed up or reconfigure replication so lag drops.',
      },
      {
        id: 'verify',
        label: 'Verify freshness',
        rationale: 'Prove lag is down and reads look correct.',
      },
    ],
    distractors: [
      {
        id: 'ignore-lag',
        label: 'Ignore lag forever',
        rationale: 'You will keep serving stale data.',
      },
      {
        id: 'kill-replicas',
        label: 'Delete all replicas',
        rationale: 'That removes HA instead of fixing lag.',
      },
    ],
  },
})

const lurkerVariantMcqs: Record<string, Omit<McqCard, 'kind'>> = {
  'read-your-writes': {
    id: 'lurker-read-your-writes-v2',
    conceptId: 'read-your-writes',
    incomingThreat:
      'Checkout shows “item added,” then the cart page is empty on the next request.',
    scenario:
      'Reinforcement: write-then-read across primary/replica. Correct control?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Sticky/primary reads after write (or causal tokens) until replicas are caught up.',
      },
      {
        id: 'B',
        text: 'Randomize every read across all replicas with no session affinity.',
      },
      {
        id: 'C',
        text: 'Return success to the client before the primary has committed.',
      },
      {
        id: 'D',
        text: 'Flush the user’s session cookie so they start over.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.26,
    xp: 12,
    breakdown: {
      A: 'Session stickiness or primary reads close the write-then-read gap.',
      B: 'Random replicas maximize chance of stale self-reads.',
      C: 'Ack-before-commit invents phantom success.',
      D: 'Nuking sessions does not fix consistency.',
    },
    beginner: {
      incomingThreat: 'Cart says “added,” then the next page shows an empty cart.',
      scenario: 'What fixes write-then-read staleness?',
      choices: [
        {
          id: 'A',
          text: 'After a write, keep reading from the primary until replicas catch up.',
        },
        {
          id: 'B',
          text: 'Pick a random replica for every read.',
        },
        {
          id: 'C',
          text: 'Tell the user it worked before the primary even saved it.',
        },
        {
          id: 'D',
          text: 'Log the user out and hope the cart reappears.',
        },
      ],
      breakdown: {
        A: 'Primary/sticky reads after write = read-your-writes.',
        B: 'Random replicas often serve old data.',
        C: 'Acking early creates fake success.',
        D: 'Logging out does not fix replication lag.',
      },
    },
  },
  'sync-vs-async-replication': {
    id: 'lurker-sync-vs-async-v2',
    conceptId: 'sync-vs-async-replication',
    incomingThreat:
      'A region failover lost recent commits that only lived on async secondaries.',
    scenario:
      'Reinforcement: durability vs lag tradeoff. Sound posture?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Require sync/semi-sync ack from a durability quorum; treat pure async as best-effort read scale.',
      },
      {
        id: 'B',
        text: 'Rely solely on async replicas for RPO=0 failover promises.',
      },
      {
        id: 'C',
        text: 'Turn off the primary and write only to lagging replicas.',
      },
      {
        id: 'D',
        text: 'Disable fsync on the primary to “speed up” commits.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 7,
    uptimePenalty: 0.25,
    xp: 12,
    breakdown: {
      A: 'Durability needs a sync quorum; async is for reads, not RPO=0.',
      B: 'Async-only cannot promise zero data loss.',
      C: 'Writing to lagging replicas breaks the source of truth.',
      D: 'Disabling fsync gambles durability for speed.',
    },
    beginner: {
      incomingThreat: 'Failover lost recent writes that only hit async replicas.',
      scenario: 'What is the sound sync vs async posture?',
      choices: [
        {
          id: 'A',
          text: 'Need a sync/semi-sync quorum for durable commits; async is for read scale.',
        },
        {
          id: 'B',
          text: 'Promise zero data loss using only async replicas.',
        },
        {
          id: 'C',
          text: 'Shut down the primary and write only to lagging replicas.',
        },
        {
          id: 'D',
          text: 'Disable disk sync on the primary to go faster.',
        },
      ],
      breakdown: {
        A: 'Sync quorum protects commits; async helps reads.',
        B: 'Async-only cannot guarantee no data loss.',
        C: 'Replicas are not the write authority.',
        D: 'Skipping fsync risks silent loss.',
      },
    },
  },
  'replication-lag-monitoring': {
    id: 'lurker-lag-monitoring-v2',
    conceptId: 'replication-lag-monitoring',
    incomingThreat:
      'Read pool still includes a replica that is minutes behind after a bulk load.',
    scenario:
      'Reinforcement: stale replicas in the pool. Correct response?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Monitor lag SLOs; auto-eject lagged replicas; prefer primary for freshness-critical queries.',
      },
      {
        id: 'B',
        text: 'Weight traffic toward the most lagged replica to “catch it up with reads.”',
      },
      {
        id: 'C',
        text: 'Increase client timeouts only and leave routing unchanged.',
      },
      {
        id: 'D',
        text: 'Delete lag dashboards after the bulk load finishes.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.24,
    xp: 12,
    breakdown: {
      A: 'Lag SLOs + ejection + primary for critical reads are the standard toolkit.',
      B: 'More reads on a lagging replica do not heal apply lag.',
      C: 'Longer timeouts do not make data fresher.',
      D: 'Deleting dashboards does not fix staleness.',
    },
    beginner: {
      incomingThreat: 'A replica minutes behind is still getting user reads.',
      scenario: 'What should you do?',
      choices: [
        {
          id: 'A',
          text: 'Watch lag, remove slow replicas from the pool, use primary for critical reads.',
        },
        {
          id: 'B',
          text: 'Send even more reads to the lagging replica to “help it catch up.”',
        },
        {
          id: 'C',
          text: 'Only raise client timeouts and change nothing else.',
        },
        {
          id: 'D',
          text: 'Delete the lag dashboard when the bulk load ends.',
        },
      ],
      breakdown: {
        A: 'Monitor, eject, and protect critical freshness.',
        B: 'Extra reads do not fix apply lag.',
        C: 'Timeouts ≠ fresher data.',
        D: 'No dashboard means no warning next time.',
      },
    },
  },
}

const lurkerFlowVariant = flow({
  id: 'lurker-lag-remediation-v2',
  conceptId: 'lag-remediation-path',
  incomingThreat:
    'Path drill: detect → route primary → tune → verify got shuffled.',
  scenario:
    'Reinforcement: order the replication-lag remediation path.',
  category: 'database',
  damageOnHit: 16,
  bossHealOnMiss: 6,
  uptimePenalty: 0.25,
  xp: 12,
  stages: [
    {
      id: 'detect',
      label: 'Detect lag',
      rationale: 'Measure first.',
    },
    {
      id: 'route-primary',
      label: 'Route critical reads to primary',
      rationale: 'Protect freshness-sensitive paths.',
    },
    {
      id: 'tune',
      label: 'Tune replication',
      rationale: 'Fix apply/config bottlenecks.',
    },
    {
      id: 'verify',
      label: 'Verify freshness',
      rationale: 'Prove lag recovered.',
    },
  ],
  distractors: [
    {
      id: 'ignore-lag',
      label: 'Ignore lag',
      rationale: 'Stale reads remain.',
    },
  ],
  beginner: {
    incomingThreat: 'The lag remediation order got scrambled again.',
    scenario: 'Put detect → route to primary → tune → verify back in order.',
    stages: [
      {
        id: 'detect',
        label: 'Detect',
        rationale: 'See the lag first.',
      },
      {
        id: 'route-primary',
        label: 'Route to primary',
        rationale: 'Protect critical reads.',
      },
      {
        id: 'tune',
        label: 'Tune',
        rationale: 'Fix replication.',
      },
      {
        id: 'verify',
        label: 'Verify',
        rationale: 'Confirm freshness.',
      },
    ],
    distractors: [
      {
        id: 'ignore-lag',
        label: 'Ignore lag',
        rationale: 'Stale data stays.',
      },
    ],
  },
})

export const replicationLagLurker: BossEncounter = {
  id: 'replication-lag-lurker',
  name: 'Replication Lag Lurker',
  blurb:
    'Replicas whisper yesterday’s truth — detect lag, protect critical reads, then tune replication until freshness returns.',
  maxHp: 92,
  threatType: 'Consistency',
  artKey: 'lurker',
  deck: [mcq(lurkerMcqs[0]), mcq(lurkerMcqs[1]), lurkerFlow, mcq(lurkerMcqs[2])],
  variants: {
    ...Object.fromEntries(
      Object.entries(lurkerVariantMcqs).map(([k, v]) => [k, mcq(v)]),
    ),
    'lag-remediation-path': lurkerFlowVariant,
  },
}
