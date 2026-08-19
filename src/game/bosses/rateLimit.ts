import { mcq, flow, type BossEncounter, type McqCard } from '../types'

const sphinxMcqs: Omit<McqCard, 'kind'>[] = [
  {
    id: 'sphinx-token-bucket',
    conceptId: 'token-bucket-leaky-bucket',
    incomingThreat:
      'Traffic bursts flatten your API — steady average is fine but spikes consume every thread before anyone gets served.',
    scenario:
      'You need admission control that allows short bursts but caps sustained abuse. Which algorithm family fits?',
    category: 'loadBalancing',
    choices: [
      {
        id: 'A',
        text: 'Token bucket (or leaky bucket): refill tokens at a steady rate; bursts spend the bucket, sustained overload gets rejected.',
      },
      {
        id: 'B',
        text: 'Fixed window counter reset at midnight — no burst allowance, easy double-count at boundaries.',
      },
      {
        id: 'C',
        text: 'No limiter — rely on clients to “be reasonable.”',
      },
      {
        id: 'D',
        text: 'Block every request after the first one per IP forever.',
      },
    ],
    correct: 'A',
    hintEliminate: 'C',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.3,
    xp: 14,
    breakdown: {
      A: 'Token/leaky buckets smooth bursts while enforcing sustained rate limits.',
      B: 'Fixed windows create boundary spikes and uneven fairness.',
      C: 'Hope is not admission control.',
      D: 'One-shot blocks punish legitimate retries and shared NATs.',
    },
    beginner: {
      incomingThreat:
        'Short traffic bursts overwhelm the API even though average load looks fine.',
      scenario:
        'Which rate-limit approach allows brief bursts but caps sustained overload?',
      choices: [
        {
          id: 'A',
          text: 'Token bucket: tokens refill steadily; bursts spend the bucket, then excess is rejected.',
        },
        {
          id: 'B',
          text: 'Hard reset a counter at midnight with no burst allowance.',
        },
        {
          id: 'C',
          text: 'No limit — trust clients to behave.',
        },
        {
          id: 'D',
          text: 'Permanently block an IP after its first request.',
        },
      ],
      breakdown: {
        A: 'Token buckets handle bursts while limiting sustained rate.',
        B: 'Fixed windows spike at boundaries.',
        C: 'Without limits, abusers win.',
        D: 'One-shot blocks break normal users behind shared IPs.',
      },
    },
  },
  {
    id: 'sphinx-retry-after',
    conceptId: 'retry-after-429',
    incomingThreat:
      'Clients hammer 429 responses in a tight loop — your edge catches fire retrying what you just rejected.',
    scenario:
      'A caller exceeds quota. What should the rate-limit response include so well-behaved clients back off?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Return 429 with Retry-After (seconds or HTTP-date) so clients wait before retrying.',
      },
      {
        id: 'B',
        text: 'Return 200 with an empty body so clients think they succeeded.',
      },
      {
        id: 'C',
        text: 'Return 500 with no hint — let clients retry immediately forever.',
      },
      {
        id: 'D',
        text: 'Drop the TCP connection silently with no status code.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 22,
    bossHealOnMiss: 7,
    uptimePenalty: 0.32,
    xp: 15,
    breakdown: {
      A: '429 + Retry-After is the standard signal for “slow down until this time.”',
      B: 'Fake success corrupts client state and hides throttling.',
      C: '500 without backoff invites retry storms.',
      D: 'Silent drops cause blind immediate retries.',
    },
    beginner: {
      incomingThreat:
        'Clients keep retrying instantly after hitting the rate limit.',
      scenario:
        'What should you return when a caller is over quota?',
      choices: [
        {
          id: 'A',
          text: '429 with Retry-After telling clients when to try again.',
        },
        {
          id: 'B',
          text: '200 with an empty body pretending success.',
        },
        {
          id: 'C',
          text: '500 with no guidance so clients retry right away.',
        },
        {
          id: 'D',
          text: 'Close the connection with no response.',
        },
      ],
      breakdown: {
        A: '429 + Retry-After tells clients to wait.',
        B: 'Fake OK hides throttling.',
        C: '500 without hints causes retry storms.',
        D: 'Silent drops trigger blind retries.',
      },
    },
  },
  {
    id: 'sphinx-client-backoff',
    conceptId: 'client-backoff-rate-limits',
    incomingThreat:
      'Your SDK retries every 429 in 50ms — the Sphinx feeds on synchronized retry herds.',
    scenario:
      'A client library hits rate limits on POST /orders. What retry discipline avoids amplifying overload?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Honor Retry-After; use exponential backoff with jitter; cap max retries; do not retry non-idempotent calls blindly.',
      },
      {
        id: 'B',
        text: 'Retry immediately on every 429 with no delay — persistence wins.',
      },
      {
        id: 'C',
        text: 'Open 100 parallel connections so one gets through.',
      },
      {
        id: 'D',
        text: 'Convert 429 to success locally so metrics stay green.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.28,
    xp: 14,
    breakdown: {
      A: 'Backoff + jitter + Retry-After respect limits; idempotency gates unsafe retries.',
      B: 'Immediate 429 retries recreate thundering herds.',
      C: 'Parallel fan-out multiplies abuse.',
      D: 'Lying to metrics does not fix server pressure.',
    },
    beginner: {
      incomingThreat:
        'The client retries every rate limit in 50ms and makes things worse.',
      scenario:
        'How should a client behave when it gets 429?',
      choices: [
        {
          id: 'A',
          text: 'Wait for Retry-After, backoff with jitter, cap retries, avoid blind retries on unsafe POSTs.',
        },
        {
          id: 'B',
          text: 'Retry instantly on every 429.',
        },
        {
          id: 'C',
          text: 'Open many parallel connections to brute-force through.',
        },
        {
          id: 'D',
          text: 'Treat 429 as success in the client so dashboards look fine.',
        },
      ],
      breakdown: {
        A: 'Backoff and Retry-After reduce retry storms.',
        B: 'Instant retries amplify overload.',
        C: 'More connections = more abuse.',
        D: 'Hiding 429s does not help the server.',
      },
    },
  },
]

const sphinxFlow = flow({
  id: 'sphinx-rate-limit-path',
  conceptId: 'rate-limit-remediation-path',
  incomingThreat:
    'The Sphinx scrambled your abuse playbook — steps are out of order.',
  scenario:
    'Order the rate-limit response: measure abuse → apply limits → signal 429 → clients backoff.',
  category: 'loadBalancing',
  damageOnHit: 18,
  bossHealOnMiss: 7,
  uptimePenalty: 0.3,
  xp: 16,
  stages: [
    {
      id: 'measure',
      label: 'Measure abuse',
      rationale: 'Identify hot endpoints, abusive tenants, and burst vs sustained patterns before tuning limits.',
    },
    {
      id: 'apply',
      label: 'Apply limits',
      rationale: 'Configure per-user and global quotas with token/leaky bucket policies at the edge or API gateway.',
    },
    {
      id: 'signal',
      label: 'Signal 429',
      rationale: 'Return clear 429 responses with Retry-After when quotas are exceeded.',
    },
    {
      id: 'backoff',
      label: 'Clients backoff',
      rationale: 'Document and enforce client backoff with jitter; monitor retry rates after rollout.',
    },
  ],
  distractors: [
    {
      id: 'block-all',
      label: 'Block all traffic globally',
      rationale: 'Blanket blocks punish legitimate users.',
    },
    {
      id: 'ignore-429',
      label: 'Hide 429 from clients',
      rationale: 'Clients cannot backoff without a signal.',
    },
  ],
  beginner: {
    incomingThreat:
      'The rate-limit fix steps got mixed up — put them in order.',
    scenario:
      'Order: spot abuse → set limits → return 429 → clients wait before retrying.',
    stages: [
      {
        id: 'measure',
        label: 'Measure abuse',
        rationale: 'First see who and what is overloading you.',
      },
      {
        id: 'apply',
        label: 'Apply limits',
        rationale: 'Set per-user and global quotas.',
      },
      {
        id: 'signal',
        label: 'Signal 429',
        rationale: 'Tell clients they are over limit.',
      },
      {
        id: 'backoff',
        label: 'Clients backoff',
        rationale: 'Clients wait and retry safely.',
      },
    ],
    distractors: [
      {
        id: 'block-all',
        label: 'Block everyone',
        rationale: 'That shuts down good users too.',
      },
      {
        id: 'ignore-429',
        label: 'Hide 429 from clients',
        rationale: 'Without 429, clients keep hammering.',
      },
    ],
  },
})

const sphinxVariantMcqs: Record<string, Omit<McqCard, 'kind'>> = {
  'token-bucket-leaky-bucket': {
    id: 'sphinx-token-bucket-v2',
    conceptId: 'token-bucket-leaky-bucket',
    incomingThreat:
      'A partner sends 500 rps for 2 seconds then goes quiet — fixed 100 rps cap rejects the whole batch.',
    scenario:
      'Reinforcement: burst-friendly limiting. Correct approach?',
    category: 'loadBalancing',
    choices: [
      {
        id: 'A',
        text: 'Token bucket with burst capacity: allow short spikes up to bucket size, enforce average rate over time.',
      },
      {
        id: 'B',
        text: 'Strict 100 rps with zero burst — reject any second above the line.',
      },
      {
        id: 'C',
        text: 'No rate limit on partners — SLAs are trust-based.',
      },
      {
        id: 'D',
        text: 'Rate limit only successful responses, not errors.',
      },
    ],
    correct: 'A',
    hintEliminate: 'C',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.26,
    xp: 12,
    breakdown: {
      A: 'Burst buckets absorb short spikes while capping sustained load.',
      B: 'Zero burst rejects legitimate micro-bursts common in real traffic.',
      C: 'Unlimited partners can still take you down.',
      D: 'Limiting only successes still allows overload via errors/retries.',
    },
    beginner: {
      incomingThreat: 'A partner sends short bursts that a flat cap rejects entirely.',
      scenario: 'How should you allow brief spikes?',
      choices: [
        {
          id: 'A',
          text: 'Token bucket with burst capacity for short spikes, average rate over time.',
        },
        {
          id: 'B',
          text: 'Hard cap with zero burst allowance.',
        },
        {
          id: 'C',
          text: 'No limits for partners.',
        },
        {
          id: 'D',
          text: 'Only count successful responses toward the limit.',
        },
      ],
      breakdown: {
        A: 'Burst buckets handle real traffic shapes.',
        B: 'Zero burst rejects normal micro-spikes.',
        C: 'Partners can still overload you.',
        D: 'Errors and retries still consume capacity.',
      },
    },
  },
  'retry-after-429': {
    id: 'sphinx-retry-after-v2',
    conceptId: 'retry-after-429',
    incomingThreat:
      'Global quota fills; one noisy tenant exhausts everyone’s share with no per-tenant isolation.',
    scenario:
      'Reinforcement: per-user vs global quotas with 429. Sound design?',
    category: 'loadBalancing',
    choices: [
      {
        id: 'A',
        text: 'Layer per-user limits under a global ceiling; 429 with Retry-After when either bound is hit.',
      },
      {
        id: 'B',
        text: 'Only a global limit — one noisy tenant can exhaust everyone’s quota silently.',
      },
      {
        id: 'C',
        text: 'Per-user limits only with no global cap — aggregate abuse still melts the fleet.',
      },
      {
        id: 'D',
        text: 'Return 403 instead of 429 so clients never retry.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 7,
    uptimePenalty: 0.25,
    xp: 12,
    breakdown: {
      A: 'Per-user fairness + global safety net; 429 signals backoff for both.',
      B: 'Global-only lets one tenant starve others without per-tenant isolation.',
      C: 'No global cap allows unbounded aggregate load.',
      D: '403 mislabels rate limits as auth failures and breaks retry semantics.',
    },
    beginner: {
      incomingThreat: 'One noisy tenant fills the global quota; others get blocked too.',
      scenario: 'How should per-user and global limits work?',
      choices: [
        {
          id: 'A',
          text: 'Per-user limits plus a global ceiling; 429 with Retry-After when either is exceeded.',
        },
        {
          id: 'B',
          text: 'Only a global limit with no per-user isolation.',
        },
        {
          id: 'C',
          text: 'Only per-user limits with no global cap.',
        },
        {
          id: 'D',
          text: 'Return 403 instead of 429.',
        },
      ],
      breakdown: {
        A: 'Both layers protect fairness and total capacity.',
        B: 'Global-only lets one tenant hurt everyone.',
        C: 'No global cap allows fleet-wide overload.',
        D: '403 is the wrong signal for rate limits.',
      },
    },
  },
  'client-backoff-rate-limits': {
    id: 'sphinx-client-backoff-v2',
    conceptId: 'client-backoff-rate-limits',
    incomingThreat:
      'Mobile clients sync on the hour — synchronized retries spike 429s into a retry storm.',
    scenario:
      'Reinforcement: client backoff on rate limits. Correct pattern?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Exponential backoff with full jitter; respect Retry-After; add jitter so retries desynchronize.',
      },
      {
        id: 'B',
        text: 'Fixed 1s retry for every client — keeps the herd synchronized.',
      },
      {
        id: 'C',
        text: 'Retry only on 500, never on 429 — 429 means “try harder now.”',
      },
      {
        id: 'D',
        text: 'Disable retries entirely on mobile — users must force-quit the app.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.24,
    xp: 12,
    breakdown: {
      A: 'Jitter spreads retries; Retry-After aligns with server intent.',
      B: 'Fixed intervals synchronize thundering herds.',
      C: '429 explicitly means slow down — ignoring it amplifies load.',
      D: 'No retries breaks UX; backoff is the fix, not abandonment.',
    },
    beginner: {
      incomingThreat: 'Many clients retry at the same second and spike load again.',
      scenario: 'How should clients backoff on 429?',
      choices: [
        {
          id: 'A',
          text: 'Exponential backoff with jitter; honor Retry-After; desynchronize retries.',
        },
        {
          id: 'B',
          text: 'Every client retries after exactly 1 second.',
        },
        {
          id: 'C',
          text: 'Ignore 429 and retry immediately.',
        },
        {
          id: 'D',
          text: 'Never retry — user must restart the app.',
        },
      ],
      breakdown: {
        A: 'Jitter and Retry-After prevent synchronized storms.',
        B: 'Fixed timing syncs the herd.',
        C: 'Immediate 429 retries make overload worse.',
        D: 'Backoff beats giving up.',
      },
    },
  },
}

const sphinxFlowVariant = flow({
  id: 'sphinx-rate-limit-path-v2',
  conceptId: 'rate-limit-remediation-path',
  incomingThreat:
    'Path drill: measure → apply → signal → backoff got tangled.',
  scenario:
    'Reinforcement: order the rate-limit remediation path.',
  category: 'loadBalancing',
  damageOnHit: 16,
  bossHealOnMiss: 6,
  uptimePenalty: 0.25,
  xp: 12,
  stages: [
    {
      id: 'measure',
      label: 'Measure abuse',
      rationale: 'Find hot paths and abusers.',
    },
    {
      id: 'apply',
      label: 'Apply limits',
      rationale: 'Configure quotas and buckets.',
    },
    {
      id: 'signal',
      label: 'Signal 429',
      rationale: 'Return clear throttle responses.',
    },
    {
      id: 'backoff',
      label: 'Clients backoff',
      rationale: 'Clients wait before retrying.',
    },
  ],
  distractors: [
    {
      id: 'block-all',
      label: 'Block all traffic',
      rationale: 'Overkill for targeted abuse.',
    },
  ],
  beginner: {
    incomingThreat: 'The rate-limit order got scrambled again.',
    scenario: 'Put measure → apply → signal → backoff back in order.',
    stages: [
      {
        id: 'measure',
        label: 'Measure',
        rationale: 'See the abuse pattern.',
      },
      {
        id: 'apply',
        label: 'Apply',
        rationale: 'Set the limits.',
      },
      {
        id: 'signal',
        label: 'Signal',
        rationale: 'Return 429 when over quota.',
      },
      {
        id: 'backoff',
        label: 'Backoff',
        rationale: 'Clients wait and retry.',
      },
    ],
    distractors: [
      {
        id: 'block-all',
        label: 'Block everyone',
        rationale: 'That is not targeted throttling.',
      },
    ],
  },
})

export const rateLimitSphinx: BossEncounter = {
  id: 'rate-limit-sphinx',
  name: 'Rate-Limit Sphinx',
  blurb:
    'Abuse asks riddles at the gate — measure overload, apply quotas, signal 429, and teach clients to backoff.',
  maxHp: 92,
  threatType: 'Abuse / Overload',
  artKey: 'sphinx',
  deck: [mcq(sphinxMcqs[0]), mcq(sphinxMcqs[1]), sphinxFlow, mcq(sphinxMcqs[2])],
  variants: {
    ...Object.fromEntries(
      Object.entries(sphinxVariantMcqs).map(([k, v]) => [k, mcq(v)]),
    ),
    'rate-limit-remediation-path': sphinxFlowVariant,
  },
}
