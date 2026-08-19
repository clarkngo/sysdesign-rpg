import { mcq, flow, type BossEncounter, type McqCard } from '../types'

const krakenMcqs: Omit<McqCard, 'kind'>[] = [
  {
    id: 'kraken-load-shedding',
    conceptId: 'load-shedding',
    incomingThreat:
      'Upstream keeps shoving traffic while your workers drown — latency goes infinite and the dependency starts failing too.',
    scenario:
      'Saturation is clear: CPU/queue depth red, SLOs missed. Callers keep retrying. What admission response protects the system?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Shed load: reject excess with 503/429 (and Retry-After) instead of accepting work you cannot finish.',
      },
      {
        id: 'B',
        text: 'Buffer every request in an unbounded queue until memory dies.',
      },
      {
        id: 'C',
        text: 'Disable health checks so load balancers keep sending more traffic.',
      },
      {
        id: 'D',
        text: 'Lower all timeouts to zero so every call fails instantly forever.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.3,
    xp: 14,
    breakdown: {
      A: 'Load shedding preserves capacity for work you can complete; clear rejects beat silent overload.',
      B: 'Unbounded queues turn latency into a black hole and then OOM.',
      C: 'Feeding a saturated service worsens the cascade.',
      D: 'Zero timeouts create a failure storm, not recovery.',
    },
    beginner: {
      incomingThreat:
        'The service is overloaded but still accepts every request — everything gets slower.',
      scenario:
        'What should you do when you are saturated?',
      choices: [
        {
          id: 'A',
          text: 'Shed load: return 503/429 for excess instead of taking work you cannot finish.',
        },
        {
          id: 'B',
          text: 'Queue every request with no size limit until memory dies.',
        },
        {
          id: 'C',
          text: 'Pretend healthy so balancers send even more traffic.',
        },
        {
          id: 'D',
          text: 'Set timeouts to zero so every call fails instantly forever.',
        },
      ],
      breakdown: {
        A: 'Reject excess work so the rest can succeed.',
        B: 'Unbounded queues just hide and then explode the problem.',
        C: 'More traffic on a saturated service makes cascades worse.',
        D: 'Zero timeouts create instant failure storms.',
      },
    },
  },
  {
    id: 'kraken-bounded-queues',
    conceptId: 'bounded-queues-timeouts',
    incomingThreat:
      'Thread pools wait forever; timeout budgets are ignored; the tentacles hold every caller hostage.',
    scenario:
      'A service uses an internal queue and downstream calls without end-to-end deadlines. Under load, queues grow without bound. What controls belong here?',
    category: 'loadBalancing',
    choices: [
      {
        id: 'A',
        text: 'Bound queue depth, apply timeout budgets end-to-end, and fail fast when budgets expire.',
      },
      {
        id: 'B',
        text: 'Use infinite queues and infinite timeouts “to maximize throughput.”',
      },
      {
        id: 'C',
        text: 'Drop timeout headers so nobody can cancel work.',
      },
      {
        id: 'D',
        text: 'Start a new thread per request with no limit.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 22,
    bossHealOnMiss: 7,
    uptimePenalty: 0.32,
    xp: 15,
    breakdown: {
      A: 'Bounded queues + deadline propagation stop overload from becoming infinite wait.',
      B: 'Infinite buffers maximize mean latency and then collapse.',
      C: 'Removing cancellation prevents shedding stuck work.',
      D: 'Unbounded threads exhaust the OS under load.',
    },
    beginner: {
      incomingThreat:
        'Queues grow forever and calls never time out.',
      scenario:
        'What controls should you add?',
      choices: [
        {
          id: 'A',
          text: 'Cap queue size, use end-to-end timeouts, and fail fast when time runs out.',
        },
        {
          id: 'B',
          text: 'Allow infinite queues and infinite waits for “more throughput.”',
        },
        {
          id: 'C',
          text: 'Remove timeouts so nothing can be cancelled.',
        },
        {
          id: 'D',
          text: 'Spawn a new thread for every request with no limit.',
        },
      ],
      breakdown: {
        A: 'Bounds and deadlines keep overload from lasting forever.',
        B: 'Infinite wait is not throughput — it is stuckness.',
        C: 'No cancellation means stuck work piles up.',
        D: 'Unlimited threads crash the machine.',
      },
    },
  },
  {
    id: 'kraken-reactive-backpressure',
    conceptId: 'reactive-backpressure',
    incomingThreat:
      'Producers push faster than consumers can pull — either you signal pressure or the ocean floods the basement.',
    scenario:
      'A streaming/pipeline stage is slower than upstream. Callers ask whether to return 429 or keep buffering. What is the reactive backpressure idea?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Propagate pressure: slow/stop upstream (or reject with 429) rather than buffer forever; resume when capacity returns.',
      },
      {
        id: 'B',
        text: 'Always return 200 and enqueue without limit so producers never slow down.',
      },
      {
        id: 'C',
        text: 'Never tell producers about saturation — silence is politeness.',
      },
      {
        id: 'D',
        text: 'Disable consumer acknowledgements so messages replay infinitely.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.28,
    xp: 14,
    breakdown: {
      A: 'Backpressure signals (pause, 429, credit limits) protect the system; buffers are finite.',
      B: 'Fake success + infinite buffer is how cascades start.',
      C: 'Hidden saturation delays the only useful signal.',
      D: 'Ack games create poison replay loops.',
    },
    beginner: {
      incomingThreat:
        'Producers are faster than consumers — the buffer keeps growing.',
      scenario:
        'What does reactive backpressure mean here?',
      choices: [
        {
          id: 'A',
          text: 'Tell upstream to slow down or send 429 — do not buffer forever; resume when ready.',
        },
        {
          id: 'B',
          text: 'Always return 200 and queue without any limit.',
        },
        {
          id: 'C',
          text: 'Never tell producers you are saturated.',
        },
        {
          id: 'D',
          text: 'Stop acknowledging messages so they replay forever.',
        },
      ],
      breakdown: {
        A: 'Signal pressure or reject; finite buffers only.',
        B: 'Fake OK + infinite queue causes collapse.',
        C: 'Hidden overload helps nobody.',
        D: 'No acks create endless replay.',
      },
    },
  },
]

const krakenFlow = flow({
  id: 'kraken-backpressure-path',
  conceptId: 'backpressure-remediation-path',
  incomingThreat:
    'The Kraken tangled your saturation playbook — steps are out of order.',
  scenario:
    'Order the backpressure response: detect saturation → shed/reject load → drain backlog → restore normal admission.',
  category: 'faultTolerance',
  damageOnHit: 18,
  bossHealOnMiss: 7,
  uptimePenalty: 0.3,
  xp: 16,
  stages: [
    {
      id: 'detect',
      label: 'Detect saturation',
      rationale: 'Confirm queue depth, CPU, error rate, and latency show overload — not a single slow dependency alone.',
    },
    {
      id: 'shed',
      label: 'Shed / reject load',
      rationale: 'Apply admission control (429/503, shed noncritical work) so the system can breathe.',
    },
    {
      id: 'drain',
      label: 'Drain backlog',
      rationale: 'Let bounded queues empty and in-flight work finish under reduced intake.',
    },
    {
      id: 'restore',
      label: 'Restore normal admission',
      rationale: 'Gradually reopen capacity once SLOs recover; keep bounds in place.',
    },
  ],
  distractors: [
    {
      id: 'buffer-forever',
      label: 'Buffer forever',
      rationale: 'Unbounded queues deepen the outage.',
    },
    {
      id: 'open-floodgates',
      label: 'Open all limits immediately',
      rationale: 'Instant full reopen can re-saturate.',
    },
  ],
  beginner: {
    incomingThreat:
      'The overload response steps got mixed up — put them in order.',
    scenario:
      'Order: spot saturation → reject excess → drain the backlog → carefully restore normal intake.',
    stages: [
      {
        id: 'detect',
        label: 'Detect saturation',
        rationale: 'First prove you are overloaded.',
      },
      {
        id: 'shed',
        label: 'Shed / reject load',
        rationale: 'Stop taking more than you can handle.',
      },
      {
        id: 'drain',
        label: 'Drain backlog',
        rationale: 'Clear queued work under lower intake.',
      },
      {
        id: 'restore',
        label: 'Restore normal admission',
        rationale: 'Reopen gradually when healthy.',
      },
    ],
    distractors: [
      {
        id: 'buffer-forever',
        label: 'Buffer forever',
        rationale: 'Endless queues make things worse.',
      },
      {
        id: 'open-floodgates',
        label: 'Open all limits immediately',
        rationale: 'You can overload yourself again.',
      },
    ],
  },
})

const krakenVariantMcqs: Record<string, Omit<McqCard, 'kind'>> = {
  'load-shedding': {
    id: 'kraken-load-shedding-v2',
    conceptId: 'load-shedding',
    incomingThreat:
      'Noncritical batch fan-out is starving interactive traffic during a spike.',
    scenario:
      'Reinforcement: selective shedding. Correct approach?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Shed or defer noncritical work first; protect interactive SLOs with clear 429/503 on excess.',
      },
      {
        id: 'B',
        text: 'Drop interactive user traffic first so batch can finish.',
      },
      {
        id: 'C',
        text: 'Accept everything and sort it out after OOM.',
      },
      {
        id: 'D',
        text: 'Return 200 with empty bodies and hope nobody notices.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.26,
    xp: 12,
    breakdown: {
      A: 'Priority-aware shedding keeps user-facing paths alive.',
      B: 'Sacrificing interactive traffic for batch inverts priorities.',
      C: 'Accept-all guarantees collapse.',
      D: 'Lying 200s corrupt clients and hide incidents.',
    },
    beginner: {
      incomingThreat: 'Batch jobs are starving real user requests in a spike.',
      scenario: 'How should you shed load?',
      choices: [
        {
          id: 'A',
          text: 'Shed or delay batch first; protect users with clear 429/503 when full.',
        },
        {
          id: 'B',
          text: 'Drop user traffic first so batch can finish.',
        },
        {
          id: 'C',
          text: 'Accept everything until the process runs out of memory.',
        },
        {
          id: 'D',
          text: 'Return fake 200 empty responses.',
        },
      ],
      breakdown: {
        A: 'Protect users; shed noncritical work first.',
        B: 'Users come before batch in most products.',
        C: 'Accept-all ends in crash.',
        D: 'Fake success hides the outage.',
      },
    },
  },
  'bounded-queues-timeouts': {
    id: 'kraken-bounded-queues-v2',
    conceptId: 'bounded-queues-timeouts',
    incomingThreat:
      'Gateway timeout is 10s but an internal hop waits 60s with a huge queue.',
    scenario:
      'Reinforcement: timeout budgets across hops. Sound design?',
    category: 'loadBalancing',
    choices: [
      {
        id: 'A',
        text: 'Propagate remaining deadline; bound each queue; fail before the client gives up so resources free.',
      },
      {
        id: 'B',
        text: 'Let every hop use a longer timeout than its caller.',
      },
      {
        id: 'C',
        text: 'Remove client timeouts so servers can take all day.',
      },
      {
        id: 'D',
        text: 'Queue retries without a budget after each timeout.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 7,
    uptimePenalty: 0.25,
    xp: 12,
    breakdown: {
      A: 'Deadline propagation + bounded queues free capacity when the client is already gone.',
      B: 'Inner timeouts longer than outer waste work after cancel.',
      C: 'No client timeouts hang users and threads.',
      D: 'Unbudgeted timeout-retries amplify load.',
    },
    beginner: {
      incomingThreat: 'The client times out at 10s but an inner call waits 60s.',
      scenario: 'What should timeout budgets look like?',
      choices: [
        {
          id: 'A',
          text: 'Pass remaining time down; cap queues; fail before the client is gone.',
        },
        {
          id: 'B',
          text: 'Give every inner hop a longer timeout than the caller.',
        },
        {
          id: 'C',
          text: 'Remove client timeouts so servers can take forever.',
        },
        {
          id: 'D',
          text: 'Retry forever after each timeout with no budget.',
        },
      ],
      breakdown: {
        A: 'Deadlines flow down; stop work the client will not wait for.',
        B: 'Longer inner timeouts waste work after the client left.',
        C: 'No timeouts hang everyone.',
        D: 'Unbudgeted retries make overload worse.',
      },
    },
  },
  'reactive-backpressure': {
    id: 'kraken-reactive-backpressure-v2',
    conceptId: 'reactive-backpressure',
    incomingThreat:
      'A partner keeps POSTing events; your ingest returns 200 while the disk queue hits the ceiling.',
    scenario:
      'Reinforcement: 429 vs buffer forever. Correct signal?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'When buffers near limits, reject with 429/503 (and backoff hints) so producers slow down.',
      },
      {
        id: 'B',
        text: 'Keep returning 200 and grow the disk queue without a max.',
      },
      {
        id: 'C',
        text: 'Ack success then drop events silently.',
      },
      {
        id: 'D',
        text: 'Crash the process so Kubernetes restarts clear the queue.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.24,
    xp: 12,
    breakdown: {
      A: 'Explicit pressure (429) is honest backpressure; producers can retry later.',
      B: 'Buffer-forever is delayed failure with larger blast radius.',
      C: 'Silent drops after 200 destroy trust and data.',
      D: 'Crash-loops are not a queue policy.',
    },
    beginner: {
      incomingThreat: 'Ingest still returns 200 while the on-disk queue is almost full.',
      scenario: '429 vs buffer forever — what should you do?',
      choices: [
        {
          id: 'A',
          text: 'Near the limit, return 429/503 so producers slow down.',
        },
        {
          id: 'B',
          text: 'Keep returning 200 and let the queue grow with no max.',
        },
        {
          id: 'C',
          text: 'Say success, then drop events quietly.',
        },
        {
          id: 'D',
          text: 'Crash on purpose so a restart “clears” the queue.',
        },
      ],
      breakdown: {
        A: 'Honest 429 is backpressure.',
        B: 'Endless buffers end in a bigger outage.',
        C: 'Silent drops after OK lose data.',
        D: 'Crash-looping is not a queue strategy.',
      },
    },
  },
}

const krakenFlowVariant = flow({
  id: 'kraken-backpressure-path-v2',
  conceptId: 'backpressure-remediation-path',
  incomingThreat:
    'Path drill: detect → shed → drain → restore got tangled.',
  scenario:
    'Reinforcement: order the backpressure remediation path.',
  category: 'faultTolerance',
  damageOnHit: 16,
  bossHealOnMiss: 6,
  uptimePenalty: 0.25,
  xp: 12,
  stages: [
    {
      id: 'detect',
      label: 'Detect saturation',
      rationale: 'Confirm overload.',
    },
    {
      id: 'shed',
      label: 'Shed / reject load',
      rationale: 'Admit only what you can handle.',
    },
    {
      id: 'drain',
      label: 'Drain backlog',
      rationale: 'Clear the queue under reduced intake.',
    },
    {
      id: 'restore',
      label: 'Restore normal admission',
      rationale: 'Reopen gradually when healthy.',
    },
  ],
  distractors: [
    {
      id: 'buffer-forever',
      label: 'Buffer forever',
      rationale: 'Deepens the outage.',
    },
  ],
  beginner: {
    incomingThreat: 'The backpressure order got scrambled again.',
    scenario: 'Put detect → shed → drain → restore back in order.',
    stages: [
      {
        id: 'detect',
        label: 'Detect',
        rationale: 'See the overload.',
      },
      {
        id: 'shed',
        label: 'Shed',
        rationale: 'Reject excess.',
      },
      {
        id: 'drain',
        label: 'Drain',
        rationale: 'Clear the backlog.',
      },
      {
        id: 'restore',
        label: 'Restore',
        rationale: 'Reopen carefully.',
      },
    ],
    distractors: [
      {
        id: 'buffer-forever',
        label: 'Buffer forever',
        rationale: 'That makes overload worse.',
      },
    ],
  },
})

export const backpressureKraken: BossEncounter = {
  id: 'backpressure-kraken',
  name: 'Backpressure Kraken',
  blurb:
    'When the flood hits, shed or drown — detect saturation, reject excess, drain the backlog, then restore admission.',
  maxHp: 96,
  threatType: 'Cascading Failure',
  artKey: 'kraken',
  deck: [mcq(krakenMcqs[0]), mcq(krakenMcqs[1]), krakenFlow, mcq(krakenMcqs[2])],
  variants: {
    ...Object.fromEntries(
      Object.entries(krakenVariantMcqs).map(([k, v]) => [k, mcq(v)]),
    ),
    'backpressure-remediation-path': krakenFlowVariant,
  },
}
