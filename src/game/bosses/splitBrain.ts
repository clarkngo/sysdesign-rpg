import { mcq, flow, type BossEncounter, type McqCard } from '../types'

const splitMcqs: Omit<McqCard, 'kind'>[] = [
  {
    id: 'hydra-cap-pacelc',
    conceptId: 'cap-pacelc',
    incomingThreat:
      'A network partition just cut the cluster in half — both sides still accept writes.',
    scenario:
      'Your multi-region KV store is partitioned. Product demands no silent data loss on money transfers, and PACELC says: if partitioned, choose C or A; else choose L or C. What do you prioritize while the split persists?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Keep both partitions fully available and merge conflicting writes later with last-write-wins.',
      },
      {
        id: 'B',
        text: 'Refuse or fence writes on the minority side; preserve consistency until quorum heals.',
      },
      {
        id: 'C',
        text: 'Disable replication entirely and let each region diverge forever.',
      },
      {
        id: 'D',
        text: 'Serve stale reads from either side but claim strong consistency in the API contract.',
      },
    ],
    correct: 'B',
    hintEliminate: 'C',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.32,
    xp: 14,
    breakdown: {
      A: 'Full availability on both sides during a partition invites split-brain and irreversible conflicts; LWW silently drops money-moving updates.',
      B: 'For loss-sensitive writes, sacrifice availability on the minority: fence or reject until a quorum can agree — classic CP under partition.',
      C: 'Killing replication makes permanent divergence; you never recover a single source of truth.',
      D: 'Serving stale while advertising strong consistency is a contract lie and will corrupt client assumptions.',
    },
    beginner: {
      incomingThreat:
        'The network broke your database into two groups. Both groups still take writes.',
      scenario:
        'Money transfers cannot lose data. During a network split, should you keep taking writes everywhere, or protect consistency?',
      choices: [
        {
          id: 'A',
          text: 'Let both sides keep writing and fix conflicts later with “last write wins.”',
        },
        {
          id: 'B',
          text: 'Block or fence writes on the smaller side until the cluster agrees again.',
        },
        {
          id: 'C',
          text: 'Turn off replication and let each region stay different forever.',
        },
        {
          id: 'D',
          text: 'Return old data from either side but tell clients it is strongly consistent.',
        },
      ],
      breakdown: {
        A: 'Writing on both sides causes split-brain. Last-write-wins can erase a real transfer.',
        B: 'For money, pick consistency: stop unsafe writes until a majority can agree.',
        C: 'No replication means two permanent truths — you never heal cleanly.',
        D: 'Calling stale data “strong consistency” breaks the promise your clients rely on.',
      },
    },
  },
  {
    id: 'hydra-quorum-write',
    conceptId: 'quorum-writes',
    incomingThreat:
      'A lone primary acknowledged a durable write that never reached a majority of replicas.',
    scenario:
      'You run a 5-node replication group. A client write ACKs after only the primary fsyncs locally; two replicas are lagging. After a failover, the new primary never saw that write. How should quorum writes be configured?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'ACK after W=1 (primary only); rely on async catch-up for durability.',
      },
      {
        id: 'B',
        text: 'Require W=majority (e.g. 3 of 5) before ACK so any new majority includes the write.',
      },
      {
        id: 'C',
        text: 'Require W=all nodes including offline ones before every ACK.',
      },
      {
        id: 'D',
        text: 'ACK immediately in memory and batch disk writes once per minute.',
      },
    ],
    correct: 'B',
    hintEliminate: 'D',
    damageOnHit: 22,
    bossHealOnMiss: 7,
    uptimePenalty: 0.3,
    xp: 15,
    breakdown: {
      A: 'W=1 means a failover can elect a majority that never saw the write — classic acknowledged data loss.',
      B: 'Majority write quorum guarantees overlap with any future majority read/election set, so committed data survives failover.',
      C: 'W=all stalls forever when any node is down; you trade availability for little extra safety beyond majority.',
      D: 'Memory-only ACK with delayed fsync is the opposite of durability under crash or failover.',
    },
    beginner: {
      incomingThreat:
        'The primary said “saved,” but most replicas never got the write — then a failover lost it.',
      scenario:
        'You have 5 database nodes. When is it safe to tell the client “write succeeded”?',
      choices: [
        {
          id: 'A',
          text: 'After only the primary saves it; others catch up later.',
        },
        {
          id: 'B',
          text: 'After a majority (at least 3 of 5) confirm the write.',
        },
        {
          id: 'C',
          text: 'Only after every node, even offline ones, confirms.',
        },
        {
          id: 'D',
          text: 'Right away in memory, and flush to disk once a minute.',
        },
      ],
      breakdown: {
        A: 'If only one node has it, failover can elect leaders that never saw the write.',
        B: 'Majority ACK means any new majority still includes that write — safe on failover.',
        C: 'Waiting for every node blocks writes whenever anything is down.',
        D: 'Acking from memory is not durable; a crash loses the “success.”',
      },
    },
  },
  {
    id: 'hydra-fencing-token',
    conceptId: 'fencing-tokens',
    incomingThreat:
      'A zombie primary woke up and is still accepting writes after a new leader took over.',
    scenario:
      'Lease-based leader election elected Primary B while Primary A was GC-paused. A recovers and still holds an old connection. Clients must not apply A’s stale writes. What control stops the zombie?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Trust wall-clock timestamps on each write and keep the newer clock.',
      },
      {
        id: 'B',
        text: 'Issue monotonically increasing fencing tokens; storage rejects lower-token writers.',
      },
      {
        id: 'C',
        text: 'Increase the lease TTL so old leaders never expire.',
      },
      {
        id: 'D',
        text: 'Let both primaries write and resolve with CRDTs on every row.',
      },
    ],
    correct: 'B',
    hintEliminate: 'C',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.28,
    xp: 14,
    breakdown: {
      A: 'Clocks skew and pause; wall time cannot prove who is the current leader under split-brain.',
      B: 'Fencing tokens (epoch/term) let storage reject any writer with an older generation — classic zombie primary kill-switch.',
      C: 'Longer leases delay failover and do not stop a zombie that still believes it holds the lease.',
      D: 'CRDTs help some mergeable data, not authoritative single-writer ledgers where one primary must win.',
    },
    beginner: {
      incomingThreat:
        'An old primary came back online and is still writing after a new leader was chosen.',
      scenario:
        'Two “leaders” exist briefly. How do you stop the old one from corrupting storage?',
      choices: [
        {
          id: 'A',
          text: 'Use each server’s clock time and keep the newest timestamp.',
        },
        {
          id: 'B',
          text: 'Give each new leader a higher fencing token; reject older tokens.',
        },
        {
          id: 'C',
          text: 'Make leader leases last much longer so they rarely expire.',
        },
        {
          id: 'D',
          text: 'Allow both leaders to write and merge everything with CRDTs.',
        },
      ],
      breakdown: {
        A: 'Clocks lie under pauses and skew — not a safe leader check.',
        B: 'A rising token/epoch lets storage ignore the zombie’s older generation.',
        C: 'Longer leases slow failover and still don’t stop a zombie that thinks it’s leader.',
        D: 'CRDTs don’t fix systems that need one clear primary for critical writes.',
      },
    },
  },
]

const splitFlow = flow({
  id: 'hydra-quorum-ack-path',
  conceptId: 'quorum-ack-path',
  incomingThreat:
      'The hydra scrambled your write path — hops are out of order and a dangerous shortcut is in the pool.',
  scenario:
      'Order the safe multi-replica write path so a client only receives ACK after a quorum has the data (fencing-aware primary).',
  category: 'database',
  damageOnHit: 18,
  bossHealOnMiss: 7,
  uptimePenalty: 0.3,
  xp: 16,
  stages: [
    {
      id: 'client',
      label: 'Client',
      rationale: 'Write originates at the caller — always the start of the path.',
    },
    {
      id: 'load-balancer',
      label: 'Load balancer',
      rationale: 'Route to the current fenced primary, not an arbitrary replica.',
    },
    {
      id: 'primary',
      label: 'Primary (fenced)',
      rationale: 'Only the high-token leader may accept mutating writes.',
    },
    {
      id: 'sync-quorum',
      label: 'Sync replica quorum',
      rationale: 'Replicate to a majority before considering the write durable.',
    },
    {
      id: 'ack-client',
      label: 'Ack client',
      rationale: 'ACK only after quorum durability — never before.',
    },
  ],
  distractors: [
    {
      id: 'async-ack',
      label: 'Ack before replica sync',
      rationale: 'Early ACK is how acknowledged writes vanish on failover.',
    },
    {
      id: 'any-replica',
      label: 'Write any readable replica',
      rationale: 'Multi-writer without fencing is split-brain.',
    },
  ],
  beginner: {
    incomingThreat:
      'The write steps are mixed up — put the safe path back in order.',
    scenario:
      'Put these steps in order so the client only hears “success” after enough replicas saved the write.',
    stages: [
      {
        id: 'client',
        label: 'Client sends write',
        rationale: 'The request starts at the client.',
      },
      {
        id: 'load-balancer',
        label: 'Load balancer → current leader',
        rationale: 'Send the write to the real primary, not a random node.',
      },
      {
        id: 'primary',
        label: 'Fenced primary accepts write',
        rationale: 'Only the current leader with a valid fencing token may write.',
      },
      {
        id: 'sync-quorum',
        label: 'Majority of replicas confirm',
        rationale: 'Wait until a majority has the data.',
      },
      {
        id: 'ack-client',
        label: 'Tell the client “OK”',
        rationale: 'Ack only after the majority confirm — never earlier.',
      },
    ],
    distractors: [
      {
        id: 'async-ack',
        label: 'Say OK before replicas sync',
        rationale: 'Too early — failover can lose the write.',
      },
      {
        id: 'any-replica',
        label: 'Write to any replica',
        rationale: 'That creates two writers — split-brain.',
      },
    ],
  },
})

const splitVariantMcqs: Record<string, Omit<McqCard, 'kind'>> = {
  'cap-pacelc': {
    id: 'hydra-cap-pacelc-v2',
    conceptId: 'cap-pacelc',
    incomingThreat:
      'Partition returned — ops want “just keep everything up” again.',
    scenario:
      'Reinforcement: loss-sensitive ledger under network split. Correct PACELC posture while partitioned?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Maximize availability on every island; reconcile with LWW later.',
      },
      {
        id: 'B',
        text: 'Prefer consistency: fence/reject minority writes until quorum returns.',
      },
      {
        id: 'C',
        text: 'Turn off client auth so either side can accept any write faster.',
      },
      {
        id: 'D',
        text: 'Advertise linearizability while serving whichever partition answers first.',
      },
    ],
    correct: 'B',
    hintEliminate: 'C',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.26,
    xp: 12,
    breakdown: {
      A: 'Availability-first under partition is AP — fine for some caches, fatal for ledgers.',
      B: 'CP under partition: protect the truth until majority heals.',
      C: 'Weakening auth accelerates corruption; it is not a consistency strategy.',
      D: 'First-answer routing plus a linearizability claim is a dangerous mismatch.',
    },
    beginner: {
      incomingThreat: 'The split is back. Ops want every side to stay fully up.',
      scenario:
        'Money data again. During a network split, what is the safer choice?',
      choices: [
        {
          id: 'A',
          text: 'Keep both sides fully up and merge later with last-write-wins.',
        },
        {
          id: 'B',
          text: 'Protect consistency: stop unsafe minority writes until majority returns.',
        },
        {
          id: 'C',
          text: 'Disable auth so either side accepts writes faster.',
        },
        {
          id: 'D',
          text: 'Claim strong consistency but return whichever side answers first.',
        },
      ],
      breakdown: {
        A: 'Fully available on both sides means conflicting truths.',
        B: 'For ledgers, block risky writes until the cluster can agree.',
        C: 'Removing auth makes corruption easier — not a fix.',
        D: 'You cannot claim strong consistency while racing partitions.',
      },
    },
  },
  'quorum-writes': {
    id: 'hydra-quorum-write-v2',
    conceptId: 'quorum-writes',
    incomingThreat:
      'Another failover dropped a write that clients already treated as committed.',
    scenario:
      'Reinforcement: 5-node group. Which ACK policy prevents acknowledged loss across failover?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'W=1 primary fsync only.',
      },
      {
        id: 'B',
        text: 'W=majority overlapping any future election quorum.',
      },
      {
        id: 'C',
        text: 'W=0 — fire-and-forget to a message bus.',
      },
      {
        id: 'D',
        text: 'Randomly ACK after any single replica responds.',
      },
    ],
    correct: 'B',
    hintEliminate: 'C',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.25,
    xp: 12,
    breakdown: {
      A: 'Single-node durability dies with that node’s isolation or loss.',
      B: 'Majority write is the durability contract that survives leader change.',
      C: 'Fire-and-forget is not a committed write.',
      D: 'Any-one replica is still W=1 in disguise.',
    },
    beginner: {
      incomingThreat: 'Failover lost another “successful” write.',
      scenario: 'Which rule makes “success” actually survive a new leader?',
      choices: [
        { id: 'A', text: 'Only the primary must save it.' },
        {
          id: 'B',
          text: 'A majority of nodes must save it before ACK.',
        },
        { id: 'C', text: 'Send it to a queue and never wait.' },
        { id: 'D', text: 'ACK when any one replica replies.' },
      ],
      breakdown: {
        A: 'One node is not enough if that node is not in the new majority.',
        B: 'Majority ACK overlaps with the next leader’s majority.',
        C: 'Not waiting means you never know it was stored.',
        D: 'Any one replica is still just a single copy.',
      },
    },
  },
  'fencing-tokens': {
    id: 'hydra-fencing-token-v2',
    conceptId: 'fencing-tokens',
    incomingThreat:
      'Zombie primary A is back on the wire with stale credentials.',
    scenario:
      'Reinforcement: storage must reject the old leader. Which mechanism?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Compare node hostnames alphabetically and prefer “primary-z”.',
      },
      {
        id: 'B',
        text: 'Monotonic fencing token / term; reject lower generations.',
      },
      {
        id: 'C',
        text: 'Disable health checks so old leaders stay sticky.',
      },
      {
        id: 'D',
        text: 'Hash client IPs to pick which primary wins each write.',
      },
    ],
    correct: 'B',
    hintEliminate: 'A',
    damageOnHit: 18,
    bossHealOnMiss: 7,
    uptimePenalty: 0.24,
    xp: 12,
    breakdown: {
      A: 'Hostnames are not generation proofs.',
      B: 'Token/term fencing is the standard zombie-writer defense.',
      C: 'Sticky unhealthy leaders worsen split-brain.',
      D: 'Per-client hashing creates multi-writer chaos, not fencing.',
    },
    beginner: {
      incomingThreat: 'The old primary is writing again.',
      scenario: 'How should storage ignore the zombie leader?',
      choices: [
        { id: 'A', text: 'Pick the leader with the “best” hostname.' },
        {
          id: 'B',
          text: 'Use a rising fencing token; reject older tokens.',
        },
        { id: 'C', text: 'Stop health checks so the old leader stays.' },
        {
          id: 'D',
          text: 'Let each client’s IP choose which primary to use.',
        },
      ],
      breakdown: {
        A: 'Names don’t prove who is current.',
        B: 'Higher token wins; older writers are rejected.',
        C: 'Keeping a bad leader makes split-brain worse.',
        D: 'Different clients picking different primaries is multi-writer chaos.',
      },
    },
  },
}

const splitFlowVariant = flow({
  id: 'hydra-quorum-ack-path-v2',
  conceptId: 'quorum-ack-path',
  incomingThreat:
    'Path drill: the hydra shuffled write hops after a partial fence.',
  scenario:
    'Reinforcement: order the quorum-safe write ACK path under fencing.',
  category: 'database',
  damageOnHit: 16,
  bossHealOnMiss: 6,
  uptimePenalty: 0.25,
  xp: 12,
  stages: [
    {
      id: 'client',
      label: 'Client',
      rationale: 'Start at the caller.',
    },
    {
      id: 'load-balancer',
      label: 'LB → current primary',
      rationale: 'Hit the fenced leader only.',
    },
    {
      id: 'primary',
      label: 'Primary applies write',
      rationale: 'Leader mutates with current token.',
    },
    {
      id: 'sync-quorum',
      label: 'Majority replica sync',
      rationale: 'Durability = quorum.',
    },
    {
      id: 'ack-client',
      label: 'Client ACK',
      rationale: 'Success only after quorum.',
    },
  ],
  distractors: [
    {
      id: 'async-ack',
      label: 'Optimistic early ACK',
      rationale: 'That is acknowledged data loss waiting to happen.',
    },
  ],
  beginner: {
    incomingThreat: 'The write path got shuffled again.',
    scenario: 'Put the safe “write then ACK” steps back in order.',
    stages: [
      {
        id: 'client',
        label: 'Client',
        rationale: 'Request starts here.',
      },
      {
        id: 'load-balancer',
        label: 'Load balancer to leader',
        rationale: 'Go to the current primary.',
      },
      {
        id: 'primary',
        label: 'Primary writes',
        rationale: 'Leader accepts the mutation.',
      },
      {
        id: 'sync-quorum',
        label: 'Majority sync',
        rationale: 'Wait for enough replicas.',
      },
      {
        id: 'ack-client',
        label: 'ACK the client',
        rationale: 'Only then say success.',
      },
    ],
    distractors: [
      {
        id: 'async-ack',
        label: 'ACK too early',
        rationale: 'Early ACK risks losing the write.',
      },
    ],
  },
})

export const splitBrainHydra: BossEncounter = {
  id: 'split-brain-hydra',
  name: 'Split-Brain Hydra',
  blurb:
    'A severed cluster grows two heads — fence the zombie, quorum the write, or watch consistency die.',
  maxHp: 96,
  threatType: 'Data Loss',
  artKey: 'hydra',
  deck: [mcq(splitMcqs[0]), mcq(splitMcqs[1]), splitFlow, mcq(splitMcqs[2])],
  variants: {
    ...Object.fromEntries(
      Object.entries(splitVariantMcqs).map(([k, v]) => [k, mcq(v)]),
    ),
    'quorum-ack-path': splitFlowVariant,
  },
}
