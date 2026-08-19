import { mcq, flow, type BossEncounter, type McqCard } from '../types'

const wispMcqs: Omit<McqCard, 'kind'>[] = [
  {
    id: 'wisp-cold-start-basics',
    conceptId: 'serverless-cold-starts',
    incomingThreat:
      'First requests after idle take seconds — p99 latency spikes while the runtime boots and imports a fat package.',
    scenario:
      'A serverless API sits idle overnight. Morning traffic hits cold containers; users see multi-second TTFs. What is the core cold-start problem?',
    category: 'loadBalancing',
    choices: [
      {
        id: 'A',
        text: 'New instances pay init + dependency load before serving; shrink init and/or keep capacity warm for critical paths.',
      },
      {
        id: 'B',
        text: 'Cold starts are free — always scale to zero with no mitigations.',
      },
      {
        id: 'C',
        text: 'Bundle every unused SDK so the cold path “has everything ready.”',
      },
      {
        id: 'D',
        text: 'Run heavy DB migrations inside every cold invoke.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.3,
    xp: 14,
    breakdown: {
      A: 'Cold start = boot + import cost; lean init and warm capacity cut the spike.',
      B: 'Scale-to-zero without mitigations guarantees cold p99 hits.',
      C: 'Fatter bundles make cold starts worse.',
      D: 'Migrations in invoke path add catastrophic latency.',
    },
    beginner: {
      incomingThreat:
        'After idle time, the first requests are painfully slow while the function boots.',
      scenario:
        'What is a cold start, and how do you fight it?',
      choices: [
        {
          id: 'A',
          text: 'New instances must start and load code first — shrink that work and/or keep some warm.',
        },
        {
          id: 'B',
          text: 'Cold starts cost nothing; always scale to zero with no plan.',
        },
        {
          id: 'C',
          text: 'Ship every unused library so cold starts have “more ready.”',
        },
        {
          id: 'D',
          text: 'Run big database migrations on every cold request.',
        },
      ],
      breakdown: {
        A: 'Less init work + warm capacity = fewer cold spikes.',
        B: 'Scale-to-zero without mitigations means slow first hits.',
        C: 'Bigger packages make cold starts slower.',
        D: 'Migrations in the request path are disastrous.',
      },
    },
  },
  {
    id: 'wisp-provisioned-concurrency',
    conceptId: 'provisioned-concurrency',
    incomingThreat:
      'Checkout and auth lambdas show brutal cold p99 even after code slimming — product cannot tolerate scale-from-zero.',
    scenario:
      'Critical user paths need predictable latency. Keep-warm cron is flaky. What capacity pattern fits?',
    category: 'loadBalancing',
    choices: [
      {
        id: 'A',
        text: 'Use provisioned concurrency (or min instances) for critical functions; leave noncritical paths on-demand.',
      },
      {
        id: 'B',
        text: 'Provision thousands of warm instances for every batch job forever.',
      },
      {
        id: 'C',
        text: 'Disable concurrency limits so one cold instance handles the world serially.',
      },
      {
        id: 'D',
        text: 'Delete the function and hope clients retry until something is warm.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 22,
    bossHealOnMiss: 7,
    uptimePenalty: 0.32,
    xp: 15,
    breakdown: {
      A: 'Provisioned concurrency / min instances buy predictable latency where it matters.',
      B: 'Warming everything forever wastes money without product need.',
      C: 'Serial single-instance bottlenecks create queues, not warmth.',
      D: 'Deleting the function is not a latency strategy.',
    },
    beginner: {
      incomingThreat:
        'Checkout is still slow on cold starts even after trimming the package.',
      scenario:
        'How do you keep critical paths warm without warming everything?',
      choices: [
        {
          id: 'A',
          text: 'Provision concurrency (or min instances) for critical functions; leave the rest on-demand.',
        },
        {
          id: 'B',
          text: 'Keep thousands of warm instances for every batch job forever.',
        },
        {
          id: 'C',
          text: 'Allow only one instance and let everyone wait in line.',
        },
        {
          id: 'D',
          text: 'Delete the function and hope retries find something warm.',
        },
      ],
      breakdown: {
        A: 'Warm only what users feel; save cost elsewhere.',
        B: 'Warming everything burns money.',
        C: 'One instance creates a queue, not low latency.',
        D: 'Deleting the function does not help users.',
      },
    },
  },
  {
    id: 'wisp-lean-init',
    conceptId: 'lean-init-outside-handler',
    incomingThreat:
      'Every invoke re-imports SDKs and rebuilds clients inside the handler — even warm invokes feel heavy.',
    scenario:
      'Init cost dominates both cold and warm paths. Where should clients and heavy setup live, and what about dependencies?',
    category: 'caching',
    choices: [
      {
        id: 'A',
        text: 'Initialize clients outside the handler (reuse across invokes); trim dependencies so cold imports stay small.',
      },
      {
        id: 'B',
        text: 'Reconstruct every SDK client on each request “for freshness.”',
      },
      {
        id: 'C',
        text: 'Vendor the entire monorepo into the deployment package.',
      },
      {
        id: 'D',
        text: 'Sleep 5 seconds at the start of every handler to “warm the CPU.”',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.28,
    xp: 14,
    breakdown: {
      A: 'Reuse init across warm invokes; lean deps shrink cold import time.',
      B: 'Per-request client construction wastes CPU on every call.',
      C: 'Giant packages maximize cold-start import cost.',
      D: 'Artificial sleep adds latency without fixing init.',
    },
    beginner: {
      incomingThreat:
        'Every request rebuilds SDK clients and the package is huge.',
      scenario:
        'How should you structure init and dependencies?',
      choices: [
        {
          id: 'A',
          text: 'Create clients once outside the handler; keep the package lean.',
        },
        {
          id: 'B',
          text: 'Build new SDK clients on every single request.',
        },
        {
          id: 'C',
          text: 'Ship the whole monorepo in the deploy zip.',
        },
        {
          id: 'D',
          text: 'Sleep 5 seconds at the start of every request.',
        },
      ],
      breakdown: {
        A: 'Reuse init + small packages = faster cold and warm paths.',
        B: 'Rebuilding clients every time wastes work.',
        C: 'Huge packages make cold starts worse.',
        D: 'Sleeping only adds delay.',
      },
    },
  },
]

const wispFlow = flow({
  id: 'wisp-cold-start-path',
  conceptId: 'cold-start-remediation-path',
  incomingThreat:
    'The Wisp fogged your cold-start playbook — steps are out of order.',
  scenario:
    'Order the cold-start response: measure p99 init → reduce package/init → provision concurrency for critical paths → verify.',
  category: 'loadBalancing',
  damageOnHit: 18,
  bossHealOnMiss: 7,
  uptimePenalty: 0.3,
  xp: 16,
  stages: [
    {
      id: 'measure',
      label: 'Measure p99 init',
      rationale: 'Separate cold vs warm latency and quantify init/import cost before changing prod.',
    },
    {
      id: 'reduce',
      label: 'Reduce package / init',
      rationale: 'Trim deps, move setup outside the handler, shrink the cold path.',
    },
    {
      id: 'provision',
      label: 'Provision concurrency',
      rationale: 'Keep critical paths warm with provisioned concurrency / min instances.',
    },
    {
      id: 'verify',
      label: 'Verify',
      rationale: 'Confirm p99 cold and warm latency meet SLOs under realistic traffic.',
    },
  ],
  distractors: [
    {
      id: 'ignore-p99',
      label: 'Only watch average latency',
      rationale: 'Averages hide cold-start spikes users feel.',
    },
    {
      id: 'warm-everything',
      label: 'Warm every function forever',
      rationale: 'Burns budget without prioritizing critical paths.',
    },
  ],
  beginner: {
    incomingThreat:
      'The cold-start fix steps got mixed up — put them in order.',
    scenario:
      'Order: measure slow init → slim the package/init → warm critical paths → confirm latency is good.',
    stages: [
      {
        id: 'measure',
        label: 'Measure p99 init',
        rationale: 'First see how bad cold starts are.',
      },
      {
        id: 'reduce',
        label: 'Reduce package / init',
        rationale: 'Make startup cheaper.',
      },
      {
        id: 'provision',
        label: 'Provision concurrency',
        rationale: 'Keep important functions warm.',
      },
      {
        id: 'verify',
        label: 'Verify',
        rationale: 'Prove p99 latency is acceptable.',
      },
    ],
    distractors: [
      {
        id: 'ignore-p99',
        label: 'Only watch averages',
        rationale: 'Averages hide the spikes users hit.',
      },
      {
        id: 'warm-everything',
        label: 'Warm every function forever',
        rationale: 'Too expensive and unfocused.',
      },
    ],
  },
})

const wispVariantMcqs: Record<string, Omit<McqCard, 'kind'>> = {
  'serverless-cold-starts': {
    id: 'wisp-cold-start-basics-v2',
    conceptId: 'serverless-cold-starts',
    incomingThreat:
      'A new deploy forces a wave of cold starts right as a marketing push lands.',
    scenario:
      'Reinforcement: sudden cold fleet. Correct framing?',
    category: 'loadBalancing',
    choices: [
      {
        id: 'A',
        text: 'Expect cold init after scale-from-zero/deploys; mitigate with lean packages and warm capacity on critical routes.',
      },
      {
        id: 'B',
        text: 'Assume every invoke is warm forever after the first success.',
      },
      {
        id: 'C',
        text: 'Add synchronous sleep loops to “pre-heat” inside the handler.',
      },
      {
        id: 'D',
        text: 'Raise error budgets by hiding latency SLOs.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.26,
    xp: 12,
    breakdown: {
      A: 'Deploys and scale-from-zero recreate cold starts — plan for them.',
      B: 'Idle scale-down and new instances bring cold paths back.',
      C: 'Sleep does not replace real warm capacity or lean init.',
      D: 'Hiding SLOs does not fix user-visible latency.',
    },
    beginner: {
      incomingThreat: 'A deploy plus a traffic spike brings a wave of slow first requests.',
      scenario: 'How should you think about cold starts?',
      choices: [
        {
          id: 'A',
          text: 'Expect them after idle/deploys; slim packages and warm critical paths.',
        },
        {
          id: 'B',
          text: 'Believe the first warm invoke means cold starts never return.',
        },
        {
          id: 'C',
          text: 'Sleep inside the handler to “pre-heat.”',
        },
        {
          id: 'D',
          text: 'Hide latency goals so the spike looks fine.',
        },
      ],
      breakdown: {
        A: 'Plan for cold starts; lean + warm where it matters.',
        B: 'Idle and new instances bring cold starts back.',
        C: 'Sleep adds delay; it is not a real warm pool.',
        D: 'Hiding SLOs does not help users.',
      },
    },
  },
  'provisioned-concurrency': {
    id: 'wisp-provisioned-concurrency-v2',
    conceptId: 'provisioned-concurrency',
    incomingThreat:
      'Keep-warm pings miss during a platform blip; auth p99 regresses again.',
    scenario:
      'Reinforcement: unreliable keep-warm vs platform-managed capacity. Prefer?',
    category: 'loadBalancing',
    choices: [
      {
        id: 'A',
        text: 'Prefer provisioned concurrency / min instances for latency-critical functions over fragile ping crons alone.',
      },
      {
        id: 'B',
        text: 'Rely only on an unpaid external cron that might fail silently.',
      },
      {
        id: 'C',
        text: 'Set reserved concurrency to 0 so nothing can run.',
      },
      {
        id: 'D',
        text: 'Force all traffic through a single cold instance.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 7,
    uptimePenalty: 0.25,
    xp: 12,
    breakdown: {
      A: 'Managed warm capacity is more reliable than hope-based ping crons.',
      B: 'Silent cron failure recreates cold starts.',
      C: 'Zero concurrency is an outage.',
      D: 'Single-instance funnels create queues.',
    },
    beginner: {
      incomingThreat: 'Keep-warm pings failed and auth got slow again.',
      scenario: 'What is the better warm strategy for critical paths?',
      choices: [
        {
          id: 'A',
          text: 'Use provisioned concurrency / min instances, not only fragile ping crons.',
        },
        {
          id: 'B',
          text: 'Depend only on an unpaid cron that might stop quietly.',
        },
        {
          id: 'C',
          text: 'Set concurrency to zero so nothing runs.',
        },
        {
          id: 'D',
          text: 'Send all traffic through one cold instance.',
        },
      ],
      breakdown: {
        A: 'Platform-managed warm capacity is more reliable.',
        B: 'Failed crons mean cold starts return.',
        C: 'Zero concurrency = downtime.',
        D: 'One instance creates a bottleneck.',
      },
    },
  },
  'lean-init-outside-handler': {
    id: 'wisp-lean-init-v2',
    conceptId: 'lean-init-outside-handler',
    incomingThreat:
      'Cold import time ballooned after someone added three unused analytics SDKs.',
    scenario:
      'Reinforcement: dependency and init hygiene. Correct move?',
    category: 'caching',
    choices: [
      {
        id: 'A',
        text: 'Remove unused deps; lazy-load rare paths; keep shared clients initialized once outside the handler.',
      },
      {
        id: 'B',
        text: 'Eager-import every optional module at top level “just in case.”',
      },
      {
        id: 'C',
        text: 'Copy node_modules twice into the zip for redundancy.',
      },
      {
        id: 'D',
        text: 'Parse a huge config file from disk on every request.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.24,
    xp: 12,
    breakdown: {
      A: 'Lean deps + one-time init is the cold-start hygiene toolkit.',
      B: 'Eager unused imports inflate cold start.',
      C: 'Duplicate packages double download/unpack cost.',
      D: 'Per-request heavy I/O hurts warm and cold alike.',
    },
    beginner: {
      incomingThreat: 'Unused SDKs made cold imports much slower.',
      scenario: 'What should you do?',
      choices: [
        {
          id: 'A',
          text: 'Drop unused deps, lazy-load rare code, init shared clients once outside the handler.',
        },
        {
          id: 'B',
          text: 'Import every optional module at startup “just in case.”',
        },
        {
          id: 'C',
          text: 'Ship two copies of node_modules in the zip.',
        },
        {
          id: 'D',
          text: 'Reread a huge config file on every request.',
        },
      ],
      breakdown: {
        A: 'Smaller packages + reuse init = faster starts.',
        B: 'Importing unused code slows cold start.',
        C: 'Duplicate packages make deploys heavier.',
        D: 'Heavy per-request I/O hurts every invoke.',
      },
    },
  },
}

const wispFlowVariant = flow({
  id: 'wisp-cold-start-path-v2',
  conceptId: 'cold-start-remediation-path',
  incomingThreat:
    'Path drill: measure → reduce → provision → verify got shuffled.',
  scenario:
    'Reinforcement: order the cold-start remediation path.',
  category: 'loadBalancing',
  damageOnHit: 16,
  bossHealOnMiss: 6,
  uptimePenalty: 0.25,
  xp: 12,
  stages: [
    {
      id: 'measure',
      label: 'Measure p99 init',
      rationale: 'Quantify cold cost first.',
    },
    {
      id: 'reduce',
      label: 'Reduce package / init',
      rationale: 'Shrink the cold path.',
    },
    {
      id: 'provision',
      label: 'Provision concurrency',
      rationale: 'Warm critical capacity.',
    },
    {
      id: 'verify',
      label: 'Verify',
      rationale: 'Prove SLOs hold.',
    },
  ],
  distractors: [
    {
      id: 'ignore-p99',
      label: 'Only watch averages',
      rationale: 'Spikes stay hidden.',
    },
  ],
  beginner: {
    incomingThreat: 'The cold-start order got scrambled again.',
    scenario: 'Put measure → reduce → provision → verify back in order.',
    stages: [
      {
        id: 'measure',
        label: 'Measure',
        rationale: 'See cold latency first.',
      },
      {
        id: 'reduce',
        label: 'Reduce',
        rationale: 'Slim init and packages.',
      },
      {
        id: 'provision',
        label: 'Provision',
        rationale: 'Warm critical paths.',
      },
      {
        id: 'verify',
        label: 'Verify',
        rationale: 'Confirm latency is good.',
      },
    ],
    distractors: [
      {
        id: 'ignore-p99',
        label: 'Only watch averages',
        rationale: 'You will miss the spikes.',
      },
    ],
  },
})

export const coldStartWisp: BossEncounter = {
  id: 'cold-start-wisp',
  name: 'Cold Start Wisp',
  blurb:
    'Idle fades into fog — measure init, slim the package, warm critical paths, then prove p99 is back.',
  maxHp: 88,
  threatType: 'Latency',
  artKey: 'wisp',
  deck: [mcq(wispMcqs[0]), mcq(wispMcqs[1]), wispFlow, mcq(wispMcqs[2])],
  variants: {
    ...Object.fromEntries(
      Object.entries(wispVariantMcqs).map(([k, v]) => [k, mcq(v)]),
    ),
    'cold-start-remediation-path': wispFlowVariant,
  },
}
