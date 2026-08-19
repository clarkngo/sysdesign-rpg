import { mcq, flow, type BossEncounter, type McqCard } from '../types'

const impMcqs: Omit<McqCard, 'kind'>[] = [
  {
    id: 'imp-idempotency-keys',
    conceptId: 'idempotency-keys-post',
    incomingThreat:
      'Clients retry POST /charge on timeout — the Imp duplicates payments while you argue about “at-most-once.”',
    scenario:
      'Payment POSTs must not double-charge on retry. What is the idempotency-key pattern for unsafe methods?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Client sends Idempotency-Key; server stores intent + result keyed by it; duplicate key returns the same outcome.',
      },
      {
        id: 'B',
        text: 'Retry POST freely — HTTP guarantees exactly-once delivery.',
      },
      {
        id: 'C',
        text: 'Use GET instead of POST secretly — semantics do not matter.',
      },
      {
        id: 'D',
        text: 'Reject all retries with 400 so clients never try again.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.3,
    xp: 14,
    breakdown: {
      A: 'Idempotency keys turn retries into safe replays of the first result.',
      B: 'HTTP is at-least-once over the network; POST is not inherently safe to retry.',
      C: 'Method semantics matter for caches, proxies, and side effects.',
      D: 'Hard reject breaks legitimate timeout retries.',
    },
    beginner: {
      incomingThreat:
        'A timeout retry charged the customer twice for one purchase.',
      scenario:
        'How do you make POST retries safe?',
      choices: [
        {
          id: 'A',
          text: 'Client sends an Idempotency-Key; server returns the same result for duplicate keys.',
        },
        {
          id: 'B',
          text: 'Retry POST anytime — HTTP is exactly-once.',
        },
        {
          id: 'C',
          text: 'Rename POST to GET so retries are “safe.”',
        },
        {
          id: 'D',
          text: 'Reject every retry with 400.',
        },
      ],
      breakdown: {
        A: 'Idempotency keys dedupe retries.',
        B: 'Networks retry; POST can duplicate side effects.',
        C: 'GET must not have side effects.',
        D: 'Legitimate retries need a safe path.',
      },
    },
  },
  {
    id: 'imp-at-least-once-dedupe',
    conceptId: 'at-least-once-dedupe',
    incomingThreat:
      'The queue delivers the same order event three times — inventory drops unless you dedupe.',
    scenario:
      'A message broker guarantees at-least-once delivery. Workers process purchase events. What prevents duplicate side effects?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Dedupe by message ID or business idempotency key before applying side effects; make handlers idempotent.',
      },
      {
        id: 'B',
        text: 'Assume the broker will never redeliver — skip dedupe.',
      },
      {
        id: 'C',
        text: 'Ack before processing so duplicates never happen.',
      },
      {
        id: 'D',
        text: 'Process every duplicate and fix numbers manually in spreadsheets.',
      },
    ],
    correct: 'A',
    hintEliminate: 'C',
    damageOnHit: 22,
    bossHealOnMiss: 7,
    uptimePenalty: 0.32,
    xp: 15,
    breakdown: {
      A: 'At-least-once requires idempotent consumers and dedupe keys.',
      B: 'Redelivery is normal after crashes and ack races.',
      C: 'Early ack loses messages on worker crash.',
      D: 'Manual repair does not scale and misses real-time integrity.',
    },
    beginner: {
      incomingThreat:
        'The same order message was processed three times and inventory went negative.',
      scenario:
        'How do you handle at-least-once delivery?',
      choices: [
        {
          id: 'A',
          text: 'Dedupe by message or idempotency key; make handlers safe to run twice.',
        },
        {
          id: 'B',
          text: 'Trust the broker — duplicates never happen.',
        },
        {
          id: 'C',
          text: 'Ack before processing so redelivery stops.',
        },
        {
          id: 'D',
          text: 'Process duplicates and fix inventory by hand later.',
        },
      ],
      breakdown: {
        A: 'Dedupe + idempotent handlers handle redelivery.',
        B: 'At-least-once means duplicates will arrive.',
        C: 'Early ack loses work on crash.',
        D: 'Manual fixes do not scale.',
      },
    },
  },
  {
    id: 'imp-replay-window',
    conceptId: 'replay-window-stored-responses',
    incomingThreat:
      'Old idempotency keys never expire — the table grows forever and replays return stale prices from 2019.',
    scenario:
      'You store idempotency results for POST retries. What about replay windows and stored responses?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'TTL replay window: store intent + response; on retry within window return cached result; expire old keys carefully with compaction.',
      },
      {
        id: 'B',
        text: 'Keep every key forever — storage is free and stale responses never matter.',
      },
      {
        id: 'C',
        text: 'Delete keys immediately after first response so retries always re-execute.',
      },
      {
        id: 'D',
        text: 'Return a new random result on every retry with the same key.',
      },
    ],
    correct: 'A',
    hintEliminate: 'D',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.28,
    xp: 14,
    breakdown: {
      A: 'Bounded replay windows balance dedupe, storage, and freshness.',
      B: 'Forever keys bloat storage and serve obsolete outcomes.',
      C: 'Immediate delete breaks safe retry semantics.',
      D: 'Random results violate idempotency guarantees.',
    },
    beginner: {
      incomingThreat:
        'Idempotency records never expire — retries return years-old prices.',
      scenario:
        'How should idempotency key storage work?',
      choices: [
        {
          id: 'A',
          text: 'Keep keys for a TTL window; return stored result on retry; expire old keys safely.',
        },
        {
          id: 'B',
          text: 'Store every key forever.',
        },
        {
          id: 'C',
          text: 'Delete the key right after the first response.',
        },
        {
          id: 'D',
          text: 'Return a different result on each retry with the same key.',
        },
      ],
      breakdown: {
        A: 'TTL windows dedupe retries without infinite stale data.',
        B: 'Forever storage grows and stales.',
        C: 'Delete-on-first breaks safe retries.',
        D: 'Same key must mean same result.',
      },
    },
  },
]

const impFlow = flow({
  id: 'imp-idempotency-path',
  conceptId: 'idempotency-remediation-path',
  incomingThreat:
    'The Imp scrambled your retry playbook — steps are out of order.',
  scenario:
    'Order the idempotency response: assign key → store intent/result → on retry return same result → expire old keys carefully.',
  category: 'faultTolerance',
  damageOnHit: 18,
  bossHealOnMiss: 7,
  uptimePenalty: 0.3,
  xp: 16,
  stages: [
    {
      id: 'assign',
      label: 'Assign key',
      rationale: 'Client generates a unique Idempotency-Key per logical operation (UUID v4).',
    },
    {
      id: 'store',
      label: 'Store intent / result',
      rationale: 'Persist in-flight intent then final response keyed by idempotency key before returning.',
    },
    {
      id: 'retry',
      label: 'On retry return same result',
      rationale: 'Duplicate key within window replays stored response without re-executing side effects.',
    },
    {
      id: 'expire',
      label: 'Expire old keys carefully',
      rationale: 'TTL and compaction reclaim storage; document window length for clients.',
    },
  ],
  distractors: [
    {
      id: 'retry-blind',
      label: 'Retry POST blindly',
      rationale: 'Unsafe without idempotency guarantees.',
    },
    {
      id: 'never-expire',
      label: 'Never expire keys',
      rationale: 'Unbounded growth and stale replays.',
    },
  ],
  beginner: {
    incomingThreat:
      'The idempotency fix steps got mixed up — put them in order.',
    scenario:
      'Order: assign key → save intent/result → retry gets same answer → expire old keys.',
    stages: [
      {
        id: 'assign',
        label: 'Assign key',
        rationale: 'Client sends a unique key per operation.',
      },
      {
        id: 'store',
        label: 'Store intent / result',
        rationale: 'Save the work and response under that key.',
      },
      {
        id: 'retry',
        label: 'On retry return same result',
        rationale: 'Same key = same response, no double charge.',
      },
      {
        id: 'expire',
        label: 'Expire old keys carefully',
        rationale: 'Clean up after the replay window.',
      },
    ],
    distractors: [
      {
        id: 'retry-blind',
        label: 'Retry POST blindly',
        rationale: 'That duplicates side effects.',
      },
      {
        id: 'never-expire',
        label: 'Never expire keys',
        rationale: 'Storage grows forever.',
      },
    ],
  },
})

const impVariantMcqs: Record<string, Omit<McqCard, 'kind'>> = {
  'idempotency-keys-post': {
    id: 'imp-idempotency-keys-v2',
    conceptId: 'idempotency-keys-post',
    incomingThreat:
      'Mobile app retries POST /transfer on flaky LTE — recipients get paid twice.',
    scenario:
      'Reinforcement: idempotency keys for POSTs. Correct contract?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Require Idempotency-Key header; same key + same body returns original status/body; conflict if body differs.',
      },
      {
        id: 'B',
        text: 'Accept any number of identical POSTs — duplicates are the client’s problem.',
      },
      {
        id: 'C',
        text: 'Use timestamp as key — collisions are impossible.',
      },
      {
        id: 'D',
        text: 'Only idempotent GET needs keys; POST never does.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.26,
    xp: 12,
    breakdown: {
      A: 'Stable key + body match replays; body mismatch detects client bugs.',
      B: 'Server must enforce dedupe for money-moving POSTs.',
      C: 'Timestamps collide under concurrency and clock skew.',
      D: 'POST side effects need keys most.',
    },
    beginner: {
      incomingThreat: 'Flaky network retries doubled a money transfer.',
      scenario: 'What is the idempotency-key contract for POST?',
      choices: [
        {
          id: 'A',
          text: 'Require Idempotency-Key; same key returns the original response; reject if body differs.',
        },
        {
          id: 'B',
          text: 'Let duplicate POSTs through — not the server’s job.',
        },
        {
          id: 'C',
          text: 'Use timestamp as the key.',
        },
        {
          id: 'D',
          text: 'Only GET needs idempotency keys.',
        },
      ],
      breakdown: {
        A: 'Keys make POST retries safe.',
        B: 'Server must dedupe side effects.',
        C: 'Timestamps collide easily.',
        D: 'POST is where duplicates hurt.',
      },
    },
  },
  'at-least-once-dedupe': {
    id: 'imp-at-least-once-v2',
    conceptId: 'at-least-once-dedupe',
    incomingThreat:
      'Worker crashes after charge but before ack — broker redelivers and the Imp strikes again.',
    scenario:
      'Reinforcement: safe retries only with idempotent ops. When is blind retry OK?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Only when the operation is idempotent or guarded by dedupe/idempotency key — never blindly retry non-idempotent side effects.',
      },
      {
        id: 'B',
        text: 'Always retry — at-least-once means exactly-once in practice.',
      },
      {
        id: 'C',
        text: 'Retry only failed HTTP 500, never 429 — 429 means success.',
      },
      {
        id: 'D',
        text: 'Disable acks so messages never redeliver.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 7,
    uptimePenalty: 0.25,
    xp: 12,
    breakdown: {
      A: 'Idempotency keys or naturally idempotent ops unlock safe retries.',
      B: 'At-least-once without dedupe duplicates effects.',
      C: '429 means throttle, not success.',
      D: 'No acks lose messages on failure.',
    },
    beginner: {
      incomingThreat: 'Worker crashed after charging but before ack — message redelivered.',
      scenario: 'When is it safe to retry an operation?',
      choices: [
        {
          id: 'A',
          text: 'Only when idempotent or protected by a dedupe/idempotency key.',
        },
        {
          id: 'B',
          text: 'Always retry — duplicates never happen.',
        },
        {
          id: 'C',
          text: '429 means success — never retry it.',
        },
        {
          id: 'D',
          text: 'Stop acknowledging messages.',
        },
      ],
      breakdown: {
        A: 'Dedupe or idempotent ops make retries safe.',
        B: 'At-least-once delivers duplicates.',
        C: '429 means slow down, not OK.',
        D: 'No acks lose messages.',
      },
    },
  },
  'replay-window-stored-responses': {
    id: 'imp-replay-window-v2',
    conceptId: 'replay-window-stored-responses',
    incomingThreat:
      'Concurrent retries with the same key race — two workers both charge before either stores the result.',
    scenario:
      'Reinforcement: replay windows / stored responses under concurrency. Correct store pattern?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Atomic insert of in-flight record (unique key); first writer executes; others wait or read stored result; finalize then serve replays.',
      },
      {
        id: 'B',
        text: 'Check-then-act without locking — fastest worker wins randomly.',
      },
      {
        id: 'C',
        text: 'Store result only after 24 hours so retries always re-run.',
      },
      {
        id: 'D',
        text: 'Use the same idempotency key for every user request globally.',
      },
    ],
    correct: 'A',
    hintEliminate: 'D',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.24,
    xp: 12,
    breakdown: {
      A: 'Unique constraint + in-flight state prevents double execution under races.',
      B: 'Racey check-then-act double-charges.',
      C: 'Delayed store breaks retry window semantics.',
      D: 'One global key collapses all operations into one.',
    },
    beginner: {
      incomingThreat: 'Two retries with the same key both charged before either saved the result.',
      scenario: 'How do you store idempotency results safely?',
      choices: [
        {
          id: 'A',
          text: 'Atomically insert in-flight record with unique key; one worker runs; others get stored result.',
        },
        {
          id: 'B',
          text: 'Check then act with no lock — hope for the best.',
        },
        {
          id: 'C',
          text: 'Save the result only after 24 hours.',
        },
        {
          id: 'D',
          text: 'Use one idempotency key for all users.',
        },
      ],
      breakdown: {
        A: 'Unique insert prevents double execution.',
        B: 'Races cause double charges.',
        C: 'Late store breaks safe retries.',
        D: 'One key for all users is wrong.',
      },
    },
  },
}

const impFlowVariant = flow({
  id: 'imp-idempotency-path-v2',
  conceptId: 'idempotency-remediation-path',
  incomingThreat:
    'Path drill: assign → store → retry → expire got tangled.',
  scenario:
    'Reinforcement: order the idempotency remediation path.',
  category: 'faultTolerance',
  damageOnHit: 16,
  bossHealOnMiss: 6,
  uptimePenalty: 0.25,
  xp: 12,
  stages: [
    {
      id: 'assign',
      label: 'Assign key',
      rationale: 'Unique key per operation.',
    },
    {
      id: 'store',
      label: 'Store intent / result',
      rationale: 'Persist under the key.',
    },
    {
      id: 'retry',
      label: 'On retry return same result',
      rationale: 'Replay cached response.',
    },
    {
      id: 'expire',
      label: 'Expire old keys carefully',
      rationale: 'TTL and compaction.',
    },
  ],
  distractors: [
    {
      id: 'retry-blind',
      label: 'Retry POST blindly',
      rationale: 'Duplicates side effects.',
    },
  ],
  beginner: {
    incomingThreat: 'The idempotency order got scrambled again.',
    scenario: 'Put assign → store → retry → expire back in order.',
    stages: [
      {
        id: 'assign',
        label: 'Assign',
        rationale: 'Client sends the key.',
      },
      {
        id: 'store',
        label: 'Store',
        rationale: 'Save intent and result.',
      },
      {
        id: 'retry',
        label: 'Retry',
        rationale: 'Same key, same answer.',
      },
      {
        id: 'expire',
        label: 'Expire',
        rationale: 'Clean up old keys.',
      },
    ],
    distractors: [
      {
        id: 'retry-blind',
        label: 'Retry blindly',
        rationale: 'Unsafe for POST side effects.',
      },
    ],
  },
})

export const idempotencyImp: BossEncounter = {
  id: 'idempotency-imp',
  name: 'Idempotency Imp',
  blurb:
    'Retries breed twins — assign a key, store the outcome, replay the same result, and expire keys on schedule.',
  maxHp: 91,
  threatType: 'Data Integrity',
  artKey: 'imp',
  deck: [mcq(impMcqs[0]), mcq(impMcqs[1]), impFlow, mcq(impMcqs[2])],
  variants: {
    ...Object.fromEntries(
      Object.entries(impVariantMcqs).map(([k, v]) => [k, mcq(v)]),
    ),
    'idempotency-remediation-path': impFlowVariant,
  },
}
