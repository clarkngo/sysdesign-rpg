import { mcq, flow, type BossEncounter, type McqCard } from '../types'

const golemMcqs: Omit<McqCard, 'kind'>[] = [
  {
    id: 'golem-hot-key',
    conceptId: 'hot-keys',
    incomingThreat:
      'One shard’s CPU is pegged while the rest of the cluster sits idle.',
    scenario:
      'A “popular celebrity” user id hashes to a single partition; writes and cache misses pile onto that shard. What is the root cause?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'A hot key/shard — traffic skew from a poor or too-coarse partition key.',
      },
      {
        id: 'B',
        text: 'Too much replication factor on cold shards only.',
      },
      {
        id: 'C',
        text: 'GC pauses on idle nodes stealing work from the busy shard.',
      },
      {
        id: 'D',
        text: 'DNS TTLs that are too short for the load balancer.',
      },
    ],
    correct: 'A',
    hintEliminate: 'D',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.3,
    xp: 14,
    breakdown: {
      A: 'Hot keys concentrate load on one shard — classic scalability bottleneck from skewed partition keys.',
      B: 'Replication factor does not explain one-shard CPU saturation from a single key.',
      C: 'Idle-node GC does not cause another shard’s write hotspot.',
      D: 'DNS TTL is orthogonal to in-cluster key-to-shard skew.',
    },
    beginner: {
      incomingThreat:
        'One database shard is overloaded; the others barely work.',
      scenario:
        'One famous user id gets almost all the traffic. What is the problem called?',
      choices: [
        {
          id: 'A',
          text: 'A hot key/shard — a bad or too-coarse partition key concentrates load.',
        },
        {
          id: 'B',
          text: 'Cold shards having too many replicas.',
        },
        {
          id: 'C',
          text: 'Garbage collection on idle machines stealing the busy shard’s work.',
        },
        {
          id: 'D',
          text: 'DNS cache times that are too short.',
        },
      ],
      breakdown: {
        A: 'Hot keys pile traffic onto one shard.',
        B: 'Replica count on cold shards is not the hotspot.',
        C: 'Idle GC does not create a write hotspot elsewhere.',
        D: 'DNS TTL is unrelated to key-to-shard skew.',
      },
    },
  },
  {
    id: 'golem-partition-key',
    conceptId: 'partition-key-design',
    incomingThreat:
      'Resharding chatter starts — every write still lands on the same “tenant_id” bucket.',
    scenario:
      'You partitioned solely on a low-cardinality tenant_id. One tenant owns 40% of traffic. Best redesign direction?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Choose a higher-cardinality key (or compound key / salting) so load spreads.',
      },
      {
        id: 'B',
        text: 'Keep tenant_id alone and double that one shard’s disk forever.',
      },
      {
        id: 'C',
        text: 'Hash only the constant string “global” for “simplicity.”',
      },
      {
        id: 'D',
        text: 'Disable secondary indexes so the hotspot “goes away.”',
      },
    ],
    correct: 'A',
    hintEliminate: 'C',
    damageOnHit: 22,
    bossHealOnMiss: 7,
    uptimePenalty: 0.32,
    xp: 15,
    breakdown: {
      A: 'Cardinality and salting/compound keys spread writes; low-cardinality keys create permanent hotspots.',
      B: 'Vertical scaling one shard delays pain without fixing skew.',
      C: 'A constant key is the ultimate hotspot.',
      D: 'Dropping indexes does not redistribute partition ownership.',
    },
    beginner: {
      incomingThreat:
        'You split data by tenant_id, but one big tenant owns almost half the traffic.',
      scenario:
        'How should you redesign the partition key?',
      choices: [
        {
          id: 'A',
          text: 'Use a higher-cardinality key (or compound key / salt) to spread load.',
        },
        {
          id: 'B',
          text: 'Keep tenant_id alone and just buy a bigger disk for that shard.',
        },
        {
          id: 'C',
          text: 'Hash the word “global” for every row.',
        },
        {
          id: 'D',
          text: 'Delete secondary indexes so the hotspot disappears.',
        },
      ],
      breakdown: {
        A: 'More unique key values (or salting) spread writes.',
        B: 'A bigger disk does not fix skew.',
        C: 'One constant key is the worst hotspot.',
        D: 'Indexes are not what assigns rows to shards.',
      },
    },
  },
  {
    id: 'golem-read-amplification',
    conceptId: 'read-amplification',
    incomingThreat:
      'A “simple” list API fans out to dozens of shards per request and p99 explodes.',
    scenario:
      'Hot partitions plus scatter-gather reads multiply tail latency. Write skew is also visible on the same key. Sound mitigation set?',
    category: 'loadBalancing',
    choices: [
      {
        id: 'A',
        text: 'Reduce fan-out (localize data), cache hot reads, and rebalance after key fixes.',
      },
      {
        id: 'B',
        text: 'Increase fan-out to every shard on every request for “freshness.”',
      },
      {
        id: 'C',
        text: 'Serialize all cluster traffic through the hottest shard as a gateway.',
      },
      {
        id: 'D',
        text: 'Turn off read timeouts so slow scatter-gather never fails.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.28,
    xp: 14,
    breakdown: {
      A: 'Cut read amplification, cache hotspots, and rebalance after fixing keys — treat skew at the source.',
      B: 'More fan-out worsens p99 and load on hot shards.',
      C: 'Routing everything through the hotspot is anti-scalability.',
      D: 'No timeouts hide overload and exhaust clients.',
    },
    beginner: {
      incomingThreat:
        'One API call hits many shards, and the busy shard makes everything slow.',
      scenario:
        'Hot partitions and wide fan-out reads. What helps?',
      choices: [
        {
          id: 'A',
          text: 'Hit fewer shards, cache hot reads, then rebalance after fixing keys.',
        },
        {
          id: 'B',
          text: 'Ask every shard on every request for “freshness.”',
        },
        {
          id: 'C',
          text: 'Send all traffic through the hottest shard as a front door.',
        },
        {
          id: 'D',
          text: 'Remove read timeouts so slow calls never fail.',
        },
      ],
      breakdown: {
        A: 'Less fan-out, cache hotspots, then rebalance.',
        B: 'More fan-out makes p99 worse.',
        C: 'Using the hotspot as a gateway makes skew worse.',
        D: 'No timeouts hide overload.',
      },
    },
  },
]

const golemFlow = flow({
  id: 'golem-rebalance-path',
  conceptId: 'golem-rebalance-path',
  incomingThreat:
    'The golem scrambled your rebalancing playbook — steps are out of order.',
  scenario:
    'Order the hotspot response: measure the hotspot, change/split the key, rebalance shards, then verify even load.',
  category: 'database',
  damageOnHit: 18,
  bossHealOnMiss: 7,
  uptimePenalty: 0.3,
  xp: 16,
  stages: [
    {
      id: 'measure',
      label: 'Measure hotspot',
      rationale: 'Prove which keys/shards own the skew with metrics before migrating blindly.',
    },
    {
      id: 'change-key',
      label: 'Change / split key',
      rationale: 'Fix cardinality (new key, salt, or split) so ownership can spread.',
    },
    {
      id: 'rebalance',
      label: 'Rebalance',
      rationale: 'Move data/partitions so capacity tracks the new key space.',
    },
    {
      id: 'verify',
      label: 'Verify even load',
      rationale: 'Confirm CPU, QPS, and storage are balanced under real traffic.',
    },
  ],
  distractors: [
    {
      id: 'blind-scale',
      label: 'Only enlarge the hot shard',
      rationale: 'Vertical scaling without a key fix leaves skew in place.',
    },
    {
      id: 'ignore-metrics',
      label: 'Reshard without measuring',
      rationale: 'Blind moves can miss the real hot key.',
    },
  ],
  beginner: {
    incomingThreat:
      'The fix steps are mixed up — put the hot-partition response in order.',
    scenario:
      'Order: measure the hotspot → fix/split the key → rebalance → confirm load is even.',
    stages: [
      {
        id: 'measure',
        label: 'Measure the hotspot',
        rationale: 'Find which key or shard is overloaded.',
      },
      {
        id: 'change-key',
        label: 'Change or split the key',
        rationale: 'Pick a key that can spread traffic.',
      },
      {
        id: 'rebalance',
        label: 'Rebalance shards',
        rationale: 'Move data so capacity matches the new layout.',
      },
      {
        id: 'verify',
        label: 'Verify even load',
        rationale: 'Check that load is balanced under real traffic.',
      },
    ],
    distractors: [
      {
        id: 'blind-scale',
        label: 'Only make the hot shard bigger',
        rationale: 'Bigger disks do not fix a bad key.',
      },
      {
        id: 'ignore-metrics',
        label: 'Reshard without measuring',
        rationale: 'You may miss the real hotspot.',
      },
    ],
  },
})

const golemVariantMcqs: Record<string, Omit<McqCard, 'kind'>> = {
  'hot-keys': {
    id: 'golem-hot-key-v2',
    conceptId: 'hot-keys',
    incomingThreat:
      'Dashboards show one partition owning most QPS again after a viral event.',
    scenario:
      'Reinforcement: single-key traffic spike. Correct label and instinct?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Hot key — investigate partition key cardinality and caching.',
      },
      {
        id: 'B',
        text: 'Healthy uniform hashing — ignore the chart.',
      },
      {
        id: 'C',
        text: 'Proof that all shards must be powered off.',
      },
      {
        id: 'D',
        text: 'A DNS failure masquerading as database load.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.26,
    xp: 12,
    breakdown: {
      A: 'Skewed QPS on one partition is the hot-key signature.',
      B: 'Uniform hashing would not show a single-partition spike.',
      C: 'Powering off shards worsens capacity.',
      D: 'DNS does not create per-shard DB CPU skew by itself.',
    },
    beginner: {
      incomingThreat: 'One partition owns most of the traffic after a viral spike.',
      scenario: 'What is this, and what do you investigate?',
      choices: [
        {
          id: 'A',
          text: 'A hot key — check partition key design and caching.',
        },
        {
          id: 'B',
          text: 'Perfectly even hashing — ignore the chart.',
        },
        {
          id: 'C',
          text: 'A sign to shut down every shard.',
        },
        {
          id: 'D',
          text: 'A DNS problem pretending to be database load.',
        },
      ],
      breakdown: {
        A: 'One busy partition usually means a hot key.',
        B: 'Even hashing would not look like this chart.',
        C: 'Shutting shards down removes capacity.',
        D: 'DNS alone does not create this shard skew.',
      },
    },
  },
  'partition-key-design': {
    id: 'golem-partition-key-v2',
    conceptId: 'partition-key-design',
    incomingThreat:
      'Ops proposes “just add another replica of the hot shard” and leave the key alone.',
    scenario:
      'Reinforcement: low-cardinality partition key. Durable fix?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Redesign toward higher cardinality / salting / compound keys, then rebalance.',
      },
      {
        id: 'B',
        text: 'Pin every write to shard 0 for easier debugging.',
      },
      {
        id: 'C',
        text: 'Use wall-clock hour as the only key so each hour is one partition forever.',
      },
      {
        id: 'D',
        text: 'Delete unique constraints so duplicates hide skew.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 7,
    uptimePenalty: 0.25,
    xp: 12,
    breakdown: {
      A: 'Key redesign plus rebalance addresses skew at the source.',
      B: 'Pinning to shard 0 maximizes the hotspot.',
      C: 'Hour buckets create time-based hotspots and operational pain.',
      D: 'Hiding uniqueness does not redistribute load.',
    },
    beginner: {
      incomingThreat: 'Someone wants more replicas of the hot shard and no key change.',
      scenario: 'What is the durable fix for a weak partition key?',
      choices: [
        {
          id: 'A',
          text: 'Pick a better (higher-cardinality / salted) key, then rebalance.',
        },
        {
          id: 'B',
          text: 'Send every write to shard 0.',
        },
        {
          id: 'C',
          text: 'Partition only by clock hour.',
        },
        {
          id: 'D',
          text: 'Remove uniqueness checks so duplicates hide the skew.',
        },
      ],
      breakdown: {
        A: 'Fix the key, then move data.',
        B: 'Shard 0 becomes the entire bottleneck.',
        C: 'Hour buckets create new hotspots.',
        D: 'Duplicates do not spread load.',
      },
    },
  },
  'read-amplification': {
    id: 'golem-read-amplification-v2',
    conceptId: 'read-amplification',
    incomingThreat:
      'Scatter-gather list endpoints still wake every shard for one page of results.',
    scenario:
      'Reinforcement: hot shard + wide fan-out. Choose the mitigation set.',
    category: 'loadBalancing',
    choices: [
      {
        id: 'A',
        text: 'Localize reads, cache hot paths, fix keys, then verify balance.',
      },
      {
        id: 'B',
        text: 'Fan out to cold standby clusters on every click.',
      },
      {
        id: 'C',
        text: 'Force synchronous writes on every replica before any read.',
      },
      {
        id: 'D',
        text: 'Disable caching so every read always hits all shards.',
      },
    ],
    correct: 'A',
    hintEliminate: 'D',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.24,
    xp: 12,
    breakdown: {
      A: 'Less amplification + cache + key fix + verify is the scalability loop.',
      B: 'Waking more clusters multiplies cost and tail latency.',
      C: 'Sync-everywhere on read paths is a latency and availability tax.',
      D: 'No cache maximizes amplification against hot shards.',
    },
    beginner: {
      incomingThreat: 'One page view still wakes every shard.',
      scenario: 'What mitigation set belongs here?',
      choices: [
        {
          id: 'A',
          text: 'Narrow reads, cache hot data, fix keys, then check balance.',
        },
        {
          id: 'B',
          text: 'Wake extra standby clusters on every click.',
        },
        {
          id: 'C',
          text: 'Force every replica to sync before any read.',
        },
        {
          id: 'D',
          text: 'Turn off caching so every read hits all shards.',
        },
      ],
      breakdown: {
        A: 'Shrink fan-out, cache, fix keys, verify.',
        B: 'More clusters means more cost and latency.',
        C: 'Sync-everywhere slows every read.',
        D: 'No cache maximizes load on hot shards.',
      },
    },
  },
}

const golemFlowVariant = flow({
  id: 'golem-rebalance-path-v2',
  conceptId: 'golem-rebalance-path',
  incomingThreat:
    'Path drill: the golem shuffled measure → change key → rebalance → verify.',
  scenario:
    'Reinforcement: order the hot-partition remediation path.',
  category: 'database',
  damageOnHit: 16,
  bossHealOnMiss: 6,
  uptimePenalty: 0.25,
  xp: 12,
  stages: [
    {
      id: 'measure',
      label: 'Measure hotspot',
      rationale: 'Identify skewed keys/shards first.',
    },
    {
      id: 'change-key',
      label: 'Change / split key',
      rationale: 'Raise cardinality or salt.',
    },
    {
      id: 'rebalance',
      label: 'Rebalance',
      rationale: 'Move partitions to match.',
    },
    {
      id: 'verify',
      label: 'Verify even load',
      rationale: 'Prove skew is gone.',
    },
  ],
  distractors: [
    {
      id: 'blind-scale',
      label: 'Only scale the hot node',
      rationale: 'Delay without fixing the key.',
    },
  ],
  beginner: {
    incomingThreat: 'The remediation order got scrambled again.',
    scenario: 'Put measure → change key → rebalance → verify back in order.',
    stages: [
      {
        id: 'measure',
        label: 'Measure',
        rationale: 'Find the hotspot.',
      },
      {
        id: 'change-key',
        label: 'Change key',
        rationale: 'Fix how data is keyed.',
      },
      {
        id: 'rebalance',
        label: 'Rebalance',
        rationale: 'Move the data.',
      },
      {
        id: 'verify',
        label: 'Verify',
        rationale: 'Confirm even load.',
      },
    ],
    distractors: [
      {
        id: 'blind-scale',
        label: 'Only enlarge the hot node',
        rationale: 'That does not fix skew.',
      },
    ],
  },
})

export const hotPartitionGolem: BossEncounter = {
  id: 'hot-partition-golem',
  name: 'Hot Partition Golem',
  blurb:
    'One shard shoulders the world — rewrite the key, rebalance the stone, or watch scalability crack.',
  maxHp: 93,
  threatType: 'Scalability',
  artKey: 'golem',
  deck: [mcq(golemMcqs[0]), mcq(golemMcqs[1]), golemFlow, mcq(golemMcqs[2])],
  variants: {
    ...Object.fromEntries(
      Object.entries(golemVariantMcqs).map(([k, v]) => [k, mcq(v)]),
    ),
    'golem-rebalance-path': golemFlowVariant,
  },
}
