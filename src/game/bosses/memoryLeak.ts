import { mcq, flow, type BossEncounter, type McqCard } from '../types'

const leakMcqs: Omit<McqCard, 'kind'>[] = [
  {
    id: 'leak-unbounded-cache',
    conceptId: 'unbounded-cache',
    incomingThreat:
      'Heap charts only go up — an in-process map is caching every unique key forever.',
    scenario:
      'A service caches user profiles in a local ConcurrentHashMap with no max size, TTL, or eviction. After a traffic spike, RSS climbs until the JVM thrashes. What is the right containment?',
    category: 'caching',
    choices: [
      {
        id: 'A',
        text: 'Bound the cache (LRU/size + TTL) or move it to a sized external store with eviction.',
      },
      {
        id: 'B',
        text: 'Disable the GC so allocations are never interrupted.',
      },
      {
        id: 'C',
        text: 'Add keys faster so the map “warms” before memory runs out.',
      },
      {
        id: 'D',
        text: 'Double the heap and leave the unbounded map unchanged.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.3,
    xp: 14,
    breakdown: {
      A: 'Bounded eviction (or an external sized cache) stops unbounded heap growth at the source.',
      B: 'Disabling GC guarantees an OOM — it is not a strategy.',
      C: 'Faster fills accelerate the leak.',
      D: 'Bigger heaps delay the crash without fixing the growth curve.',
    },
    beginner: {
      incomingThreat:
        'Memory keeps rising because an in-memory cache never deletes anything.',
      scenario:
        'A map stores every profile forever. What should you do?',
      choices: [
        {
          id: 'A',
          text: 'Cap the cache size and/or TTL (or use a cache that evicts).',
        },
        {
          id: 'B',
          text: 'Turn off garbage collection so nothing pauses.',
        },
        {
          id: 'C',
          text: 'Insert keys even faster to “warm” the cache.',
        },
        {
          id: 'D',
          text: 'Give the process more RAM and keep the unlimited map.',
        },
      ],
      breakdown: {
        A: 'Limits and eviction stop endless growth.',
        B: 'No GC means you crash harder, not softer.',
        C: 'Filling faster makes memory die sooner.',
        D: 'More RAM only postpones the same leak.',
      },
    },
  },
  {
    id: 'leak-connection-pool',
    conceptId: 'connection-pool-leak',
    incomingThreat:
      'DB waiters pile up — checked-out connections never return to the pool.',
    scenario:
      'Under load, threads block on getConnection() while active count equals max. Heap dumps show Connection objects retained by request-scoped caches that skip finally/close. Primary fix?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Guarantee release (try-with-resources / finally), pool timeouts, and leak detection metrics.',
      },
      {
        id: 'B',
        text: 'Set max pool size to Integer.MAX_VALUE so checkout never waits.',
      },
      {
        id: 'C',
        text: 'Open a new TCP connection per query and never pool.',
      },
      {
        id: 'D',
        text: 'Ignore close() errors and keep references “for reuse later.”',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 22,
    bossHealOnMiss: 7,
    uptimePenalty: 0.32,
    xp: 15,
    breakdown: {
      A: 'Deterministic release + timeouts + leak metrics fix and detect pool exhaustion.',
      B: 'Unbounded pools exhaust the database and the OS — a larger leak.',
      C: 'No pooling multiplies handshake cost and FD usage under load.',
      D: 'Hoarding references is the definition of a pool leak.',
    },
    beginner: {
      incomingThreat:
        'The app ran out of database connections because some were never given back.',
      scenario:
        'What is the main fix for a connection pool leak?',
      choices: [
        {
          id: 'A',
          text: 'Always return connections (try/finally), set timeouts, and watch leak metrics.',
        },
        {
          id: 'B',
          text: 'Allow unlimited pool size so checkout never blocks.',
        },
        {
          id: 'C',
          text: 'Skip the pool and open a brand-new connection for every query.',
        },
        {
          id: 'D',
          text: 'Never close connections — keep them around for later.',
        },
      ],
      breakdown: {
        A: 'Return what you borrow, time out stuck checkouts, and alert on leaks.',
        B: 'Unlimited pools can knock over the database.',
        C: 'No pooling is slow and burns file descriptors.',
        D: 'Not closing is exactly how the pool empties.',
      },
    },
  },
  {
    id: 'leak-restart-vs-root',
    conceptId: 'restart-vs-root-cause',
    incomingThreat:
      'On-call wants to “just bounce the pods” while GC pressure and heap growth resume every hour.',
    scenario:
      'Rolling restarts temporarily clear RSS, but the same growth curve returns. Leadership asks if a liveness-kill loop is enough. What is the sound incident posture?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Use restart/circuit as a temporary brake; fix the leak (bound caches, close resources) as the real remediation.',
      },
      {
        id: 'B',
        text: 'Schedule restarts every 5 minutes forever and close the ticket.',
      },
      {
        id: 'C',
        text: 'Raise GC frequency to maximum so the leak never allocates.',
      },
      {
        id: 'D',
        text: 'Disable memory metrics to reduce alert noise.',
      },
    ],
    correct: 'A',
    hintEliminate: 'D',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.28,
    xp: 14,
    breakdown: {
      A: 'Restarts buy time; root-cause bounds and resource hygiene stop the slime from regrowing.',
      B: 'Perpetual bounce masks the bug and burns availability/error budgets.',
      C: 'GC cannot free reachable leak graphs — it only burns CPU.',
      D: 'Hiding metrics guarantees a surprise OOM.',
    },
    beginner: {
      incomingThreat:
        'Restarting pods helps for a bit, then memory climbs again.',
      scenario:
        'Are endless restarts enough, or do you still need a real fix?',
      choices: [
        {
          id: 'A',
          text: 'Restart to buy time, then fix the leak (limits, close resources).',
        },
        {
          id: 'B',
          text: 'Restart every 5 minutes forever and call it done.',
        },
        {
          id: 'C',
          text: 'Run garbage collection constantly so leaks cannot allocate.',
        },
        {
          id: 'D',
          text: 'Turn off memory alerts so the noise stops.',
        },
      ],
      breakdown: {
        A: 'Restarts are a bandage; fixing the leak is the cure.',
        B: 'Forever restarts hide the bug and hurt uptime.',
        C: 'GC cannot free objects your code still holds.',
        D: 'Silencing alerts just makes the crash a surprise.',
      },
    },
  },
]

const leakFlow = flow({
  id: 'leak-remediation-path',
  conceptId: 'leak-remediation-path',
  incomingThreat:
    'The slime blurred your playbook — remediation steps are out of order.',
  scenario:
    'Order the resource-exhaustion response: observe the growth, limit blast radius, fix the root leak, then verify recovery.',
  category: 'faultTolerance',
  damageOnHit: 18,
  bossHealOnMiss: 7,
  uptimePenalty: 0.3,
  xp: 16,
  stages: [
    {
      id: 'observe',
      label: 'Observe',
      rationale: 'Confirm heap/pool/FD growth with metrics and profiles before changing prod wildly.',
    },
    {
      id: 'limit',
      label: 'Limit',
      rationale: 'Contain blast radius: shed load, restart/circuit, tighten caps while investigating.',
    },
    {
      id: 'fix',
      label: 'Fix root',
      rationale: 'Remove the leak — bound caches, close resources, patch the retaining path.',
    },
    {
      id: 'verify',
      label: 'Verify',
      rationale: 'Watch steady-state RSS/pools under load to prove the curve flattened.',
    },
  ],
  distractors: [
    {
      id: 'blind-scale',
      label: 'Blindly add heap forever',
      rationale: 'Scaling without a fix only delays OOM.',
    },
    {
      id: 'mute-metrics',
      label: 'Mute memory alerts',
      rationale: 'You cannot verify what you refuse to see.',
    },
  ],
  beginner: {
    incomingThreat:
      'The fix steps are mixed up — put the memory-leak response in order.',
    scenario:
      'Order: see the problem → contain it → fix the real leak → confirm memory is stable.',
    stages: [
      {
        id: 'observe',
        label: 'Observe metrics / profiles',
        rationale: 'First prove what is growing and why.',
      },
      {
        id: 'limit',
        label: 'Limit damage',
        rationale: 'Restart, shed load, or cap usage while you dig in.',
      },
      {
        id: 'fix',
        label: 'Fix the root leak',
        rationale: 'Bound caches, return connections, stop retaining objects.',
      },
      {
        id: 'verify',
        label: 'Verify it stays flat',
        rationale: 'Confirm memory/pools stay healthy under load.',
      },
    ],
    distractors: [
      {
        id: 'blind-scale',
        label: 'Just keep adding RAM',
        rationale: 'More RAM without a fix only delays the crash.',
      },
      {
        id: 'mute-metrics',
        label: 'Turn off memory alerts',
        rationale: 'You need metrics to know you are healed.',
      },
    ],
  },
})

const leakVariantMcqs: Record<string, Omit<McqCard, 'kind'>> = {
  'unbounded-cache': {
    id: 'leak-unbounded-cache-v2',
    conceptId: 'unbounded-cache',
    incomingThreat:
      'Heap is climbing again after someone “temporarily” removed the size cap.',
    scenario:
      'Reinforcement: in-process cache growth under unique-key cardinality. Correct control?',
    category: 'caching',
    choices: [
      {
        id: 'A',
        text: 'Enforce max entries/TTL/eviction (or external bounded cache).',
      },
      {
        id: 'B',
        text: 'Store every key as a stringified full DB row “for convenience.”',
      },
      {
        id: 'C',
        text: 'Pin soft references incorrectly so nothing is ever collectable.',
      },
      {
        id: 'D',
        text: 'Log an info line on each put and call it observability.',
      },
    ],
    correct: 'A',
    hintEliminate: 'D',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.26,
    xp: 12,
    breakdown: {
      A: 'Bounds are non-negotiable for process-local caches.',
      B: 'Fatter values accelerate RSS death.',
      C: 'Broken reference tricks are still leaks if graphs stay reachable.',
      D: 'Logs without eviction do not stop growth.',
    },
    beginner: {
      incomingThreat: 'Someone removed the cache size limit “for now.”',
      scenario: 'What must an in-memory cache have?',
      choices: [
        {
          id: 'A',
          text: 'A max size and/or TTL so old entries leave.',
        },
        {
          id: 'B',
          text: 'Full database rows stored for every key.',
        },
        {
          id: 'C',
          text: 'Tricks that stop the GC from freeing anything.',
        },
        {
          id: 'D',
          text: 'A log line on every insert and nothing else.',
        },
      ],
      breakdown: {
        A: 'Size/TTL limits keep memory finite.',
        B: 'Huge values make the leak worse.',
        C: 'Blocking GC is how you OOM.',
        D: 'Logging is not eviction.',
      },
    },
  },
  'connection-pool-leak': {
    id: 'leak-connection-pool-v2',
    conceptId: 'connection-pool-leak',
    incomingThreat:
      'Pool exhaustion returned after a “quick” code path skipped close().',
    scenario:
      'Reinforcement: threads blocked on checkout, DB healthy. Likely fix set?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Fix release paths, add leakDetectionThreshold, bound wait timeouts.',
      },
      {
        id: 'B',
        text: 'Share one global Connection across all threads forever.',
      },
      {
        id: 'C',
        text: 'Catch SQLException and retry checkout in a tight loop with no backoff.',
      },
      {
        id: 'D',
        text: 'Lower DB max_connections below the app pool size.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 7,
    uptimePenalty: 0.25,
    xp: 12,
    breakdown: {
      A: 'Release + detection + timeouts are the pool-leak toolkit.',
      B: 'A shared Connection is a concurrency bug factory.',
      C: 'Tight retry loops amplify stampedes.',
      D: 'App pool > DB max guarantees systemic refusal — wrong direction.',
    },
    beginner: {
      incomingThreat: 'A code path forgot to close connections again.',
      scenario: 'What set of fixes belongs here?',
      choices: [
        {
          id: 'A',
          text: 'Always release connections, detect leaks, and time out waits.',
        },
        {
          id: 'B',
          text: 'Share one connection across every thread forever.',
        },
        {
          id: 'C',
          text: 'Retry checkout in a tight loop with no pause.',
        },
        {
          id: 'D',
          text: 'Make the database allow fewer connections than the app pool.',
        },
      ],
      breakdown: {
        A: 'Release, detect, and time out — the standard fix set.',
        B: 'One shared connection breaks under concurrency.',
        C: 'Tight retries make overload worse.',
        D: 'App pool bigger than DB max causes failures by design.',
      },
    },
  },
  'restart-vs-root-cause': {
    id: 'leak-restart-vs-root-v2',
    conceptId: 'restart-vs-root-cause',
    incomingThreat:
      'Autoscaling + restarts look “green” while the leak remains in the build.',
    scenario:
      'Reinforcement: choose the durable response to recurring heap growth.',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Mitigate with restarts/limits; ship the root-cause fix before calling it done.',
      },
      {
        id: 'B',
        text: 'Rely only on OOMKill as the recycling strategy.',
      },
      {
        id: 'C',
        text: 'Delete dashboards so growth is not visible.',
      },
      {
        id: 'D',
        text: 'Mark the service non-critical and stop paging.',
      },
    ],
    correct: 'A',
    hintEliminate: 'C',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.24,
    xp: 12,
    breakdown: {
      A: 'Mitigate then remediate — both halves matter.',
      B: 'OOMKill-as-a-service is chaos, not ops.',
      C: 'Invisible growth still crashes.',
      D: 'Stopping pages does not stop resource exhaustion.',
    },
    beginner: {
      incomingThreat: 'Restarts keep the service up, but the leak is still in the code.',
      scenario: 'What is the durable response?',
      choices: [
        {
          id: 'A',
          text: 'Use restarts/limits to cope, then ship the real leak fix.',
        },
        {
          id: 'B',
          text: 'Let the process OOM-kill forever as the plan.',
        },
        {
          id: 'C',
          text: 'Delete the memory graphs so nobody worries.',
        },
        {
          id: 'D',
          text: 'Stop paging and pretend the service is fine.',
        },
      ],
      breakdown: {
        A: 'Cope short-term, fix long-term.',
        B: 'Crash-looping on OOM is not a strategy.',
        C: 'Hiding graphs does not hide the crash.',
        D: 'Silence is not stability.',
      },
    },
  },
}

const leakFlowVariant = flow({
  id: 'leak-remediation-path-v2',
  conceptId: 'leak-remediation-path',
  incomingThreat:
    'Path drill: the slime shuffled observe → limit → fix → verify.',
  scenario:
    'Reinforcement: order the resource-exhaustion remediation path.',
  category: 'faultTolerance',
  damageOnHit: 16,
  bossHealOnMiss: 6,
  uptimePenalty: 0.25,
  xp: 12,
  stages: [
    {
      id: 'observe',
      label: 'Observe growth',
      rationale: 'Measure first.',
    },
    {
      id: 'limit',
      label: 'Limit blast radius',
      rationale: 'Contain while you dig.',
    },
    {
      id: 'fix',
      label: 'Fix the leak',
      rationale: 'Remove the retaining path.',
    },
    {
      id: 'verify',
      label: 'Verify stability',
      rationale: 'Prove the curve flattened.',
    },
  ],
  distractors: [
    {
      id: 'blind-scale',
      label: 'Only scale heap',
      rationale: 'Delay is not remediation.',
    },
  ],
  beginner: {
    incomingThreat: 'The remediation order got scrambled again.',
    scenario: 'Put observe → limit → fix → verify back in order.',
    stages: [
      {
        id: 'observe',
        label: 'Observe',
        rationale: 'See the growth first.',
      },
      {
        id: 'limit',
        label: 'Limit',
        rationale: 'Contain the damage.',
      },
      {
        id: 'fix',
        label: 'Fix',
        rationale: 'Remove the root leak.',
      },
      {
        id: 'verify',
        label: 'Verify',
        rationale: 'Confirm memory stays healthy.',
      },
    ],
    distractors: [
      {
        id: 'blind-scale',
        label: 'Only add more heap',
        rationale: 'That delays the problem.',
      },
    ],
  },
})

export const memoryLeakSlime: BossEncounter = {
  id: 'memory-leak-slime',
  name: 'Memory Leak Slime',
  blurb:
    'RSS creeps, pools starve, GC thrashes — contain the ooze, then seal the leak or it returns.',
  maxHp: 92,
  threatType: 'Latency',
  artKey: 'leak',
  deck: [mcq(leakMcqs[0]), mcq(leakMcqs[1]), leakFlow, mcq(leakMcqs[2])],
  variants: {
    ...Object.fromEntries(
      Object.entries(leakVariantMcqs).map(([k, v]) => [k, mcq(v)]),
    ),
    'leak-remediation-path': leakFlowVariant,
  },
}
