import { mcq, flow, type BossEncounter, type McqCard } from '../types'

const serpentMcqs: Omit<McqCard, 'kind'>[] = [
  {
    id: 'serpent-n-plus-one',
    conceptId: 'n-plus-one-queries',
    incomingThreat:
      'One list endpoint fans out into hundreds of DB round-trips — latency grows with every row like serpent coils.',
    scenario:
      'GET /posts returns 100 posts, then loads each author in a separate query. What is the core N+1 problem?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'One query for the list plus N per-row lookups — round-trip count scales with result size, not page size alone.',
      },
      {
        id: 'B',
        text: 'N+1 means you need exactly two queries total, always.',
      },
      {
        id: 'C',
        text: 'N+1 only happens with NoSQL — SQL joins prevent it automatically.',
      },
      {
        id: 'D',
        text: 'N+1 is fixed by adding more app servers without changing queries.',
      },
    ],
    correct: 'A',
    hintEliminate: 'D',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.3,
    xp: 14,
    breakdown: {
      A: 'N+1 = 1 + N queries; latency and DB load grow linearly with rows.',
      B: 'Two queries is a fix target, not the definition.',
      C: 'ORM lazy-loading causes N+1 in SQL too; joins must be explicit.',
      D: 'More servers multiply the same query storm.',
    },
    beginner: {
      incomingThreat:
        'Listing 100 items triggers 101 database queries — one for the list, one per item.',
      scenario:
        'What is the N+1 query problem?',
      choices: [
        {
          id: 'A',
          text: 'One query for the list plus one query per row — round-trips grow with result count.',
        },
        {
          id: 'B',
          text: 'It always means exactly two queries total.',
        },
        {
          id: 'C',
          text: 'It only happens in NoSQL databases.',
        },
        {
          id: 'D',
          text: 'Add more servers and the problem goes away.',
        },
      ],
      breakdown: {
        A: '1 + N queries scale badly with list size.',
        B: 'Two is a goal, not the definition.',
        C: 'SQL ORMs lazy-load into N+1 too.',
        D: 'More servers do not reduce query count.',
      },
    },
  },
  {
    id: 'serpent-batch-fetch',
    conceptId: 'batch-fetch-dataloader',
    incomingThreat:
      'The serpent hides in your ORM — lazy loads strike for every relation on every row.',
    scenario:
      'You must load posts with authors and tags for a feed. Which pattern collapses fan-out?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Eager join or batch fetch (IN query / DataLoader): load related IDs in one or few queries, then map in memory.',
      },
      {
        id: 'B',
        text: 'Lazy-load each relation inside the loop — simplest code wins.',
      },
      {
        id: 'C',
        text: 'SELECT * FROM every table on every request with no WHERE clause.',
      },
      {
        id: 'D',
        text: 'Cache the entire database in Redis on every request.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 22,
    bossHealOnMiss: 7,
    uptimePenalty: 0.32,
    xp: 15,
    breakdown: {
      A: 'Joins, batch IN queries, and DataLoader batching turn N+1 into O(1) query rounds.',
      B: 'Lazy loading in loops is the classic N+1 trap.',
      C: 'Full-table scans do not scale and ignore pagination.',
      D: 'Whole-DB caching is neither feasible nor targeted.',
    },
    beginner: {
      incomingThreat:
        'The ORM lazy-loads authors and tags one row at a time in a loop.',
      scenario:
        'How do you load related data without N+1 queries?',
      choices: [
        {
          id: 'A',
          text: 'Join or batch-fetch related rows in one or few queries, then map in memory.',
        },
        {
          id: 'B',
          text: 'Lazy-load each relation inside the loop.',
        },
        {
          id: 'C',
          text: 'SELECT * from every table with no filter.',
        },
        {
          id: 'D',
          text: 'Copy the whole database into cache per request.',
        },
      ],
      breakdown: {
        A: 'Batching collapses N round-trips into one.',
        B: 'Lazy loops are the N+1 trap.',
        C: 'Full scans ignore pagination and scale.',
        D: 'Whole-DB cache is not a query fix.',
      },
    },
  },
  {
    id: 'serpent-batched-index',
    conceptId: 'batched-lookup-index',
    incomingThreat:
      'Batch fetch fixed query count but each IN lookup still scans millions of rows — the tail is still slow.',
    scenario:
      'You batch author lookups with WHERE id IN (...). Pagination loads 50 rows at a time. What completes the fix?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Paginate the list (limit/offset or keyset); index the batched lookup column; avoid loading all rows at once.',
      },
      {
        id: 'B',
        text: 'Load all rows into memory — indexes are optional if RAM is big enough.',
      },
      {
        id: 'C',
        text: 'Remove indexes on foreign keys to speed up writes only.',
      },
      {
        id: 'D',
        text: 'Use OFFSET 1000000 for every page — deep pagination is free.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.28,
    xp: 14,
    breakdown: {
      A: 'Pagination bounds work; indexes make batched IN lookups fast.',
      B: 'Loading everything defeats pagination and blows memory.',
      C: 'Dropping FK indexes slows batched lookups.',
      D: 'Large OFFSET scans discard rows expensively.',
    },
    beginner: {
      incomingThreat:
        'Batch fetch helped but lookups are still slow and someone wants to load every row.',
      scenario:
        'What else do you need besides batch fetch?',
      choices: [
        {
          id: 'A',
          text: 'Paginate results; index the lookup column; do not load all rows at once.',
        },
        {
          id: 'B',
          text: 'Load every row into memory — skip indexes.',
        },
        {
          id: 'C',
          text: 'Drop indexes on foreign keys.',
        },
        {
          id: 'D',
          text: 'Use huge OFFSET values for every page.',
        },
      ],
      breakdown: {
        A: 'Pagination + indexes finish the N+1 fix.',
        B: 'All-rows-in-memory does not scale.',
        C: 'No index = slow batched lookups.',
        D: 'Deep OFFSET is expensive.',
      },
    },
  },
]

const serpentFlow = flow({
  id: 'serpent-n-plus-one-path',
  conceptId: 'n-plus-one-remediation-path',
  incomingThreat:
    'The Serpent tangled your query playbook — steps are out of order.',
  scenario:
    'Order the N+1 response: detect query fan-out → batch/join → verify query count → ship with guardrails.',
  category: 'database',
  damageOnHit: 18,
  bossHealOnMiss: 7,
  uptimePenalty: 0.3,
  xp: 16,
  stages: [
    {
      id: 'detect',
      label: 'Detect query fan-out',
      rationale: 'Use APM/query logs to spot 1+N patterns and count queries per endpoint.',
    },
    {
      id: 'batch',
      label: 'Batch / join',
      rationale: 'Replace per-row lazy loads with eager joins, IN batch fetch, or DataLoader.',
    },
    {
      id: 'verify',
      label: 'Verify query count',
      rationale: 'Assert query count stays flat in tests and staging under realistic page sizes.',
    },
    {
      id: 'ship',
      label: 'Ship with guardrails',
      rationale: 'Add CI query-count checks or linters; monitor p99 and DB load in prod.',
    },
  ],
  distractors: [
    {
      id: 'scale-servers',
      label: 'Scale servers only',
      rationale: 'More instances multiply the same query storm.',
    },
    {
      id: 'disable-logs',
      label: 'Disable query logging',
      rationale: 'Hiding fan-out does not fix it.',
    },
  ],
  beginner: {
    incomingThreat:
      'The N+1 fix steps got mixed up — put them in order.',
    scenario:
      'Order: spot fan-out → batch/join queries → confirm query count → deploy with checks.',
    stages: [
      {
        id: 'detect',
        label: 'Detect query fan-out',
        rationale: 'First find the 1+N pattern.',
      },
      {
        id: 'batch',
        label: 'Batch / join',
        rationale: 'Collapse per-row queries.',
      },
      {
        id: 'verify',
        label: 'Verify query count',
        rationale: 'Prove queries stay flat.',
      },
      {
        id: 'ship',
        label: 'Ship with guardrails',
        rationale: 'Add tests and monitoring.',
      },
    ],
    distractors: [
      {
        id: 'scale-servers',
        label: 'Scale servers only',
        rationale: 'More servers do not reduce queries.',
      },
      {
        id: 'disable-logs',
        label: 'Disable query logging',
        rationale: 'You will not see the problem.',
      },
    ],
  },
})

const serpentVariantMcqs: Record<string, Omit<McqCard, 'kind'>> = {
  'n-plus-one-queries': {
    id: 'serpent-n-plus-one-v2',
    conceptId: 'n-plus-one-queries',
    incomingThreat:
      'GraphQL resolvers fetch comments per post per user — query count explodes with depth.',
    scenario:
      'Reinforcement: N+1 in nested resolvers. Root cause?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Each nested field triggers its own query per parent row — fan-out multiplies at every resolver level.',
      },
      {
        id: 'B',
        text: 'GraphQL always batches automatically — no design needed.',
      },
      {
        id: 'C',
        text: 'N+1 means the database connection pool is too small.',
      },
      {
        id: 'D',
        text: 'The fix is to disable pagination so fewer round-trips happen.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.26,
    xp: 12,
    breakdown: {
      A: 'Resolver-per-row patterns recreate N+1 at each graph level.',
      B: 'GraphQL batching requires DataLoader or similar — not automatic.',
      C: 'Pool size affects concurrency, not query multiplication.',
      D: 'Removing pagination increases rows and worsens fan-out.',
    },
    beginner: {
      incomingThreat: 'Nested GraphQL fields each run a query per parent row.',
      scenario: 'What causes N+1 here?',
      choices: [
        {
          id: 'A',
          text: 'Each nested field queries per parent row — fan-out grows with depth.',
        },
        {
          id: 'B',
          text: 'GraphQL batches everything automatically.',
        },
        {
          id: 'C',
          text: 'The connection pool is too small.',
        },
        {
          id: 'D',
          text: 'Remove pagination to fix it.',
        },
      ],
      breakdown: {
        A: 'Per-row resolvers multiply queries.',
        B: 'Batching must be built in.',
        C: 'Pool size is not the N+1 root cause.',
        D: 'No pagination makes it worse.',
      },
    },
  },
  'batch-fetch-dataloader': {
    id: 'serpent-batch-fetch-v2',
    conceptId: 'batch-fetch-dataloader',
    incomingThreat:
      'A feed endpoint still lazy-loads avatars inside a map() after “optimizing” the main query.',
    scenario:
      'Reinforcement: eager join vs DataLoader. Correct batching move?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Collect IDs in the request tick, issue one IN query (DataLoader) or use a JOIN in the main query.',
      },
      {
        id: 'B',
        text: 'await db.user.find(id) inside the loop — async is fast enough.',
      },
      {
        id: 'C',
        text: 'Prefetch the entire users table on every feed request.',
      },
      {
        id: 'D',
        text: 'Move lazy load to a background thread — still N queries.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 7,
    uptimePenalty: 0.25,
    xp: 12,
    breakdown: {
      A: 'JOIN or batched IN collapses round-trips regardless of sync/async.',
      B: 'Async per-row awaits still mean N queries.',
      C: 'Full-table prefetch does not scale.',
      D: 'Background threads do not reduce query count.',
    },
    beginner: {
      incomingThreat: 'Avatars still load one query per user inside a loop.',
      scenario: 'How should you batch the lookups?',
      choices: [
        {
          id: 'A',
          text: 'One IN query or JOIN for all IDs — do not query inside the loop.',
        },
        {
          id: 'B',
          text: 'await find(id) in the loop — async fixes it.',
        },
        {
          id: 'C',
          text: 'Load the entire users table every time.',
        },
        {
          id: 'D',
          text: 'Run the loop in a background thread.',
        },
      ],
      breakdown: {
        A: 'Batch or join = one round-trip.',
        B: 'Async still means N queries.',
        C: 'Full table load does not scale.',
        D: 'Threads do not reduce query count.',
      },
    },
  },
  'batched-lookup-index': {
    id: 'serpent-batched-index-v2',
    conceptId: 'batched-lookup-index',
    incomingThreat:
      'Batch IN query runs but EXPLAIN shows seq scan — p99 still bad at scale.',
    scenario:
      'Reinforcement: pagination vs load-all with indexed batch lookup. Sound combo?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Keyset pagination on the list + index on batched FK/id column; never load unbounded rows.',
      },
      {
        id: 'B',
        text: 'Load all 500k rows, batch in app memory, paginate in RAM.',
      },
      {
        id: 'C',
        text: 'Skip indexes — IN lists are always index-friendly without them.',
      },
      {
        id: 'D',
        text: 'Use SELECT COUNT(*) on full table each request to “warm” the cache.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.24,
    xp: 12,
    breakdown: {
      A: 'Bounded pages + indexed batch lookups keep latency predictable.',
      B: 'Load-all defeats pagination and memory limits.',
      C: 'IN without indexes can seq-scan large tables.',
      D: 'Full-table counts add load, not warmth.',
    },
    beginner: {
      incomingThreat: 'Batch query works but is slow — someone wants to load half a million rows.',
      scenario: 'What is the right pagination + index approach?',
      choices: [
        {
          id: 'A',
          text: 'Paginate the list; index the batch lookup column; never load unbounded rows.',
        },
        {
          id: 'B',
          text: 'Load all rows into app memory first.',
        },
        {
          id: 'C',
          text: 'Skip indexes — IN is always fast.',
        },
        {
          id: 'D',
          text: 'COUNT(*) the whole table on every request.',
        },
      ],
      breakdown: {
        A: 'Pagination + index keeps queries fast.',
        B: 'Load-all blows memory.',
        C: 'IN needs indexes on big tables.',
        D: 'Full counts add useless load.',
      },
    },
  },
}

const serpentFlowVariant = flow({
  id: 'serpent-n-plus-one-path-v2',
  conceptId: 'n-plus-one-remediation-path',
  incomingThreat:
    'Path drill: detect → batch → verify → ship got tangled.',
  scenario:
    'Reinforcement: order the N+1 remediation path.',
  category: 'database',
  damageOnHit: 16,
  bossHealOnMiss: 6,
  uptimePenalty: 0.25,
  xp: 12,
  stages: [
    {
      id: 'detect',
      label: 'Detect query fan-out',
      rationale: 'Find 1+N in logs.',
    },
    {
      id: 'batch',
      label: 'Batch / join',
      rationale: 'Collapse per-row queries.',
    },
    {
      id: 'verify',
      label: 'Verify query count',
      rationale: 'Assert flat query count.',
    },
    {
      id: 'ship',
      label: 'Ship with guardrails',
      rationale: 'CI checks and monitoring.',
    },
  ],
  distractors: [
    {
      id: 'scale-servers',
      label: 'Scale servers only',
      rationale: 'Does not reduce queries.',
    },
  ],
  beginner: {
    incomingThreat: 'The N+1 order got scrambled again.',
    scenario: 'Put detect → batch → verify → ship back in order.',
    stages: [
      {
        id: 'detect',
        label: 'Detect',
        rationale: 'Spot the fan-out.',
      },
      {
        id: 'batch',
        label: 'Batch',
        rationale: 'Join or batch fetch.',
      },
      {
        id: 'verify',
        label: 'Verify',
        rationale: 'Check query count.',
      },
      {
        id: 'ship',
        label: 'Ship',
        rationale: 'Deploy with guardrails.',
      },
    ],
    distractors: [
      {
        id: 'scale-servers',
        label: 'Scale servers only',
        rationale: 'More servers ≠ fewer queries.',
      },
    ],
  },
})

export const nPlusOneSerpent: BossEncounter = {
  id: 'n-plus-one-serpent',
  name: 'N+1 Serpent',
  blurb:
    'One query becomes many — detect fan-out, batch your joins, verify the count, and ship with guardrails.',
  maxHp: 90,
  threatType: 'Latency',
  artKey: 'serpent',
  deck: [mcq(serpentMcqs[0]), mcq(serpentMcqs[1]), serpentFlow, mcq(serpentMcqs[2])],
  variants: {
    ...Object.fromEntries(
      Object.entries(serpentVariantMcqs).map(([k, v]) => [k, mcq(v)]),
    ),
    'n-plus-one-remediation-path': serpentFlowVariant,
  },
}
