import { mcq, flow, type BossEncounter, type McqCard } from '../types'

const stormMcqs: Omit<McqCard, 'kind'>[] = [
  {
    id: 'storm-retry-amplification',
    conceptId: 'retry-amplification',
    incomingThreat:
      'Error rates spike and every client retries at once — downstream QPS explodes.',
    scenario:
      'A dependency returns 503s. Clients and intermediate services each retry immediately with no jitter. Latency and failure rate climb together. What is the core mistake?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Synchronized immediate retries amplify load into a retry storm; add backoff, jitter, and budgets.',
      },
      {
        id: 'B',
        text: 'Retries are always free — increase maxAttempts to Integer.MAX_VALUE.',
      },
      {
        id: 'C',
        text: 'Disable health checks so failing instances keep receiving traffic forever.',
      },
      {
        id: 'D',
        text: 'Remove timeouts so callers wait indefinitely instead of retrying.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.3,
    xp: 14,
    breakdown: {
      A: 'Uncoordinated hammering turns a partial outage into a cascade; backoff + jitter + retry budgets break the storm.',
      B: 'Unbounded retries guarantee a stampede against an already failing dependency.',
      C: 'Keeping unhealthy instances in rotation prolongs the outage.',
      D: 'Infinite waits exhaust threads and hide failure — they do not stop amplification.',
    },
    beginner: {
      incomingThreat:
        'Everything fails, so every client retries at the same time — traffic explodes.',
      scenario:
        'A service is sick. Callers all retry instantly with no pause. What went wrong?',
      choices: [
        {
          id: 'A',
          text: 'Same-time retries make the outage worse; use backoff, jitter, and retry limits.',
        },
        {
          id: 'B',
          text: 'Retries cost nothing — retry forever.',
        },
        {
          id: 'C',
          text: 'Keep sending traffic to failing instances forever.',
        },
        {
          id: 'D',
          text: 'Never time out — just wait forever instead of retrying.',
        },
      ],
      breakdown: {
        A: 'Backoff, jitter, and budgets stop a retry storm.',
        B: 'Endless retries hammer a dying service.',
        C: 'Sick instances need to be shed, not fed.',
        D: 'Waiting forever just hangs your callers.',
      },
    },
  },
  {
    id: 'storm-backoff-jitter',
    conceptId: 'exponential-backoff-jitter',
    incomingThreat:
      'Retries use exponential backoff but still sync into a thundering herd every second.',
    scenario:
      'You added 1s, 2s, 4s backoff. Metrics show retry waves aligning across pods. Which change breaks the herd?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Add randomized jitter (and caps) so retry timers desynchronize.',
      },
      {
        id: 'B',
        text: 'Use the same fixed sleep on every client so retries stay aligned.',
      },
      {
        id: 'C',
        text: 'Retry in a tight spin loop with zero delay for “lowest latency.”',
      },
      {
        id: 'D',
        text: 'Reset backoff to zero after every success within a burst of failures.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 22,
    bossHealOnMiss: 7,
    uptimePenalty: 0.32,
    xp: 15,
    breakdown: {
      A: 'Jitter desynchronizes retries; caps prevent unbounded wait — classic storm breaker.',
      B: 'Identical delays recreate synchronized waves.',
      C: 'Zero-delay spins maximize overload.',
      D: 'Resetting backoff during ongoing failure restarts the stampede.',
    },
    beginner: {
      incomingThreat:
        'Backoff is in place, but every pod still retries on the same beat.',
      scenario:
        'Exponential delays are aligned across clients. What breaks the herd?',
      choices: [
        {
          id: 'A',
          text: 'Add random jitter (and a max delay) so retries spread out.',
        },
        {
          id: 'B',
          text: 'Use the exact same sleep on every client.',
        },
        {
          id: 'C',
          text: 'Retry with no delay in a tight loop.',
        },
        {
          id: 'D',
          text: 'Reset backoff to zero whenever anything briefly succeeds.',
        },
      ],
      breakdown: {
        A: 'Random jitter spreads retries so they do not pile up.',
        B: 'Same delay means same stampede waves.',
        C: 'No delay is maximum hammering.',
        D: 'Resetting backoff during trouble restarts the storm.',
      },
    },
  },
  {
    id: 'storm-circuit-bulkhead',
    conceptId: 'circuit-breaker-bulkhead',
    incomingThreat:
      'One slow dependency is starving thread pools across the whole service mesh.',
    scenario:
      'Calls to Payments hang; workers pile up; unrelated Checkout starts timing out. Fail-fast and isolation are needed. Best containment pattern?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Open a circuit on Payments and isolate with bulkheads so other pools stay healthy.',
      },
      {
        id: 'B',
        text: 'Share one global unbounded thread pool across every dependency.',
      },
      {
        id: 'C',
        text: 'Hammer Payments harder until it recovers under load.',
      },
      {
        id: 'D',
        text: 'Disable circuit breakers so every call always waits the full timeout.',
      },
    ],
    correct: 'A',
    hintEliminate: 'C',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.28,
    xp: 14,
    breakdown: {
      A: 'Circuits fail fast; bulkheads limit blast radius — stop cascading failure without “hammering harder.”',
      B: 'One shared pool lets one dependency exhaust everything.',
      C: 'Hammering a sick dependency is how storms spread.',
      D: 'Always waiting full timeout maximizes resource exhaustion.',
    },
    beginner: {
      incomingThreat:
        'One slow dependency is dragging down unrelated parts of the app.',
      scenario:
        'Payments is hung and Checkout is dying too. What containment helps?',
      choices: [
        {
          id: 'A',
          text: 'Open a circuit on Payments and isolate pools (bulkheads) so others stay up.',
        },
        {
          id: 'B',
          text: 'Share one giant thread pool for every dependency.',
        },
        {
          id: 'C',
          text: 'Send even more traffic at Payments until it recovers.',
        },
        {
          id: 'D',
          text: 'Turn off circuit breakers so every call always waits the full timeout.',
        },
      ],
      breakdown: {
        A: 'Fail fast on Payments; keep other pools separate.',
        B: 'One shared pool lets one bad dependency take everything down.',
        C: 'Hammering a sick service makes the storm worse.',
        D: 'Always waiting full timeout burns workers.',
      },
    },
  },
]

const stormFlow = flow({
  id: 'storm-remediation-path',
  conceptId: 'storm-remediation-path',
  incomingThreat:
    'The specter scrambled your outage playbook — remediation hops are out of order.',
  scenario:
    'Order the cascading-failure response: detect errors, open the circuit, back off with jitter, then probe half-open.',
  category: 'faultTolerance',
  damageOnHit: 18,
  bossHealOnMiss: 7,
  uptimePenalty: 0.3,
  xp: 16,
  stages: [
    {
      id: 'detect',
      label: 'Detect errors',
      rationale: 'Confirm elevated error/latency rates before changing behavior blindly.',
    },
    {
      id: 'open-circuit',
      label: 'Open circuit',
      rationale: 'Fail fast to stop sending load into the dying dependency.',
    },
    {
      id: 'backoff',
      label: 'Backoff + jitter',
      rationale: 'Space and desynchronize retries so recovery is not stampeded.',
    },
    {
      id: 'half-open',
      label: 'Probe half-open',
      rationale: 'Allow limited trial calls; close only if health returns.',
    },
  ],
  distractors: [
    {
      id: 'hammer',
      label: 'Hammer harder',
      rationale: 'More load on a sick dependency deepens the cascade.',
    },
    {
      id: 'disable-timeouts',
      label: 'Disable timeouts',
      rationale: 'Unbounded waits exhaust pools instead of shedding load.',
    },
  ],
  beginner: {
    incomingThreat:
      'The fix steps are mixed up — put the retry-storm response in order.',
    scenario:
      'Order: see the errors → open the circuit → back off with jitter → carefully probe recovery.',
    stages: [
      {
        id: 'detect',
        label: 'Detect errors',
        rationale: 'First confirm failure rates are up.',
      },
      {
        id: 'open-circuit',
        label: 'Open the circuit',
        rationale: 'Stop sending traffic into the failing dependency.',
      },
      {
        id: 'backoff',
        label: 'Backoff with jitter',
        rationale: 'Wait and spread retries so you do not stampede.',
      },
      {
        id: 'half-open',
        label: 'Probe half-open',
        rationale: 'Try a few calls; only fully reopen if healthy.',
      },
    ],
    distractors: [
      {
        id: 'hammer',
        label: 'Send more traffic',
        rationale: 'Hammering a sick service makes it worse.',
      },
      {
        id: 'disable-timeouts',
        label: 'Turn off timeouts',
        rationale: 'Endless waits burn your workers.',
      },
    ],
  },
})

const stormVariantMcqs: Record<string, Omit<McqCard, 'kind'>> = {
  'retry-amplification': {
    id: 'storm-retry-amplification-v2',
    conceptId: 'retry-amplification',
    incomingThreat:
      'A brief blip returned — clients again retry in lockstep and QPS triples.',
    scenario:
      'Reinforcement: synchronized retries after 5xx. Correct diagnosis?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Retry storm — constrain with budgets, backoff, and jitter.',
      },
      {
        id: 'B',
        text: 'Retries are mandatory fan-out; multiply attempts per hop.',
      },
      {
        id: 'C',
        text: 'Remove client-side rate limits during incidents.',
      },
      {
        id: 'D',
        text: 'Treat every timeout as success to reduce error charts.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.26,
    xp: 12,
    breakdown: {
      A: 'Amplification is the disease; budgets and desynchronized backoff are the cure.',
      B: 'Fan-out retries multiply load at every hop — classic cascade fuel.',
      C: 'Dropping limits during an incident accelerates collapse.',
      D: 'Lying about success hides outages and corrupts SLOs.',
    },
    beginner: {
      incomingThreat: 'A short blip, then retries pile up and traffic triples.',
      scenario: 'What is happening, and what helps?',
      choices: [
        {
          id: 'A',
          text: 'A retry storm — limit retries, add backoff and jitter.',
        },
        {
          id: 'B',
          text: 'Retry more at every hop in the chain.',
        },
        {
          id: 'C',
          text: 'Remove rate limits during the outage.',
        },
        {
          id: 'D',
          text: 'Count timeouts as success so graphs look green.',
        },
      ],
      breakdown: {
        A: 'Cap and desynchronize retries to stop the storm.',
        B: 'More retries per hop multiply the load.',
        C: 'Dropping limits speeds up collapse.',
        D: 'Fake success hides the real outage.',
      },
    },
  },
  'exponential-backoff-jitter': {
    id: 'storm-backoff-jitter-v2',
    conceptId: 'exponential-backoff-jitter',
    incomingThreat:
      'Backoff curves match across the fleet — retry walls hit the dependency every few seconds.',
    scenario:
      'Reinforcement: exponential delays without randomization. Missing piece?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Jitter (plus a max delay) to desynchronize retry timers.',
      },
      {
        id: 'B',
        text: 'A global barrier so all pods retry at the exact same instant.',
      },
      {
        id: 'C',
        text: 'Linear decrease of delay as errors rise.',
      },
      {
        id: 'D',
        text: 'Negative sleep to “catch up” after timeouts.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 7,
    uptimePenalty: 0.25,
    xp: 12,
    breakdown: {
      A: 'Jitter is what turns exponential backoff into a herd-breaker.',
      B: 'A sync barrier is the opposite of jitter.',
      C: 'Shorter delays under more errors accelerate the storm.',
      D: 'Negative sleep is nonsense and implies busy-spinning.',
    },
    beginner: {
      incomingThreat: 'Every pod retries on the same schedule again.',
      scenario: 'Backoff without randomness — what is missing?',
      choices: [
        {
          id: 'A',
          text: 'Jitter (and a max wait) so retries are not synchronized.',
        },
        {
          id: 'B',
          text: 'A barrier so all pods retry at the exact same time.',
        },
        {
          id: 'C',
          text: 'Shorter waits as errors get worse.',
        },
        {
          id: 'D',
          text: 'Negative sleep to go faster after timeouts.',
        },
      ],
      breakdown: {
        A: 'Random jitter spreads the load.',
        B: 'Forcing sync is the stampede.',
        C: 'Faster retries under failure make storms worse.',
        D: 'Negative sleep is not a real strategy.',
      },
    },
  },
  'circuit-breaker-bulkhead': {
    id: 'storm-circuit-bulkhead-v2',
    conceptId: 'circuit-breaker-bulkhead',
    incomingThreat:
      'Thread pools are cross-contaminated again — one dependency’s latency infects the fleet.',
    scenario:
      'Reinforcement: choose fail-fast isolation over hammering.',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Circuit-break the bad dependency; bulkhead its concurrency from the rest.',
      },
      {
        id: 'B',
        text: 'Raise all timeouts to 10 minutes and keep calling.',
      },
      {
        id: 'C',
        text: 'Clone the failing service’s load onto every healthy peer.',
      },
      {
        id: 'D',
        text: 'Share one semaphore across unrelated services for “fairness.”',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.24,
    xp: 12,
    breakdown: {
      A: 'Fail-fast + isolation is the antidote to cascading pool starvation.',
      B: 'Huge timeouts maximize resource hold time during failure.',
      C: 'Spreading bad load infects healthy peers.',
      D: 'One shared limit couples unrelated failure domains.',
    },
    beginner: {
      incomingThreat: 'One slow dependency is starving other work again.',
      scenario: 'What is better than hammering it?',
      choices: [
        {
          id: 'A',
          text: 'Open a circuit and isolate its thread pool from the rest.',
        },
        {
          id: 'B',
          text: 'Make timeouts 10 minutes and keep calling.',
        },
        {
          id: 'C',
          text: 'Push the same bad load onto every healthy peer.',
        },
        {
          id: 'D',
          text: 'Share one limit across unrelated services.',
        },
      ],
      breakdown: {
        A: 'Fail fast and isolate — stop the cascade.',
        B: 'Long timeouts hold workers hostage.',
        C: 'Spreading bad load infects healthy peers.',
        D: 'Shared limits couple failures together.',
      },
    },
  },
}

const stormFlowVariant = flow({
  id: 'storm-remediation-path-v2',
  conceptId: 'storm-remediation-path',
  incomingThreat:
    'Path drill: the specter shuffled detect → open → backoff → half-open.',
  scenario:
    'Reinforcement: order the circuit-breaker remediation path under a retry storm.',
  category: 'faultTolerance',
  damageOnHit: 16,
  bossHealOnMiss: 6,
  uptimePenalty: 0.25,
  xp: 12,
  stages: [
    {
      id: 'detect',
      label: 'Detect errors',
      rationale: 'See the failure spike first.',
    },
    {
      id: 'open-circuit',
      label: 'Open circuit',
      rationale: 'Fail fast to shed load.',
    },
    {
      id: 'backoff',
      label: 'Backoff + jitter',
      rationale: 'Desynchronize recovery pressure.',
    },
    {
      id: 'half-open',
      label: 'Half-open probe',
      rationale: 'Trial traffic before fully closing.',
    },
  ],
  distractors: [
    {
      id: 'hammer',
      label: 'Increase retry rate',
      rationale: 'That feeds the storm.',
    },
  ],
  beginner: {
    incomingThreat: 'The remediation order got scrambled again.',
    scenario: 'Put detect → open circuit → backoff → half-open back in order.',
    stages: [
      {
        id: 'detect',
        label: 'Detect',
        rationale: 'See the errors first.',
      },
      {
        id: 'open-circuit',
        label: 'Open circuit',
        rationale: 'Stop the bleeding.',
      },
      {
        id: 'backoff',
        label: 'Backoff',
        rationale: 'Wait with jitter.',
      },
      {
        id: 'half-open',
        label: 'Half-open',
        rationale: 'Probe carefully.',
      },
    ],
    distractors: [
      {
        id: 'hammer',
        label: 'Retry faster',
        rationale: 'That worsens the storm.',
      },
    ],
  },
})

export const retryStormSpecter: BossEncounter = {
  id: 'retry-storm-specter',
  name: 'Retry Storm Specter',
  blurb:
    'Every failure echoes as a thousand retries — break the circuit, jitter the backoff, or drown in the cascade.',
  maxHp: 95,
  threatType: 'Cascading Failure',
  artKey: 'storm',
  deck: [mcq(stormMcqs[0]), mcq(stormMcqs[1]), stormFlow, mcq(stormMcqs[2])],
  variants: {
    ...Object.fromEntries(
      Object.entries(stormVariantMcqs).map(([k, v]) => [k, mcq(v)]),
    ),
    'storm-remediation-path': stormFlowVariant,
  },
}
