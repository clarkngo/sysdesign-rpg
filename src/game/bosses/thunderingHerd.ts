import { mcq, flow, type BossEncounter, type McqCard } from '../types'

const herdMcqs: Omit<McqCard, 'kind'>[] = [
  {
    id: 'herd-sync-expiry',
    conceptId: 'ttl-jitter-singleflight',
    incomingThreat:
      'Cache expiry synced across every app node — identical DB reads are about to stampede.',
    scenario:
      'Your API sits behind an app tier with Redis + Postgres. Hot key /trending uses a fixed 60s TTL. At expiry, all 200 pods miss at once and hammer Postgres. P99 is climbing; pool saturation is one turn away.',
    category: 'caching',
    choices: [
      {
        id: 'A',
        text: 'Raise Redis TTL to 1h and add more Postgres read replicas.',
      },
      {
        id: 'B',
        text: 'TTL jitter + singleflight coalescing + stale-while-revalidate.',
      },
      {
        id: 'C',
        text: 'Put /trending on CDN for 24h and disable origin caching.',
      },
      {
        id: 'D',
        text: 'Double every pod’s DB pool size; add a 50ms query timeout.',
      },
    ],
    correct: 'B',
    hintEliminate: 'D',
    damageOnHit: 22,
    bossHealOnMiss: 8,
    uptimePenalty: 0.35,
    breakdown: {
      A: 'Longer TTL delays the herd but does not stop synchronized expiry. More replicas absorb load but raise cost and lag without fixing the stampede pattern.',
      B: 'Jitter desynchronizes expiry. Singleflight collapses concurrent misses into one refresh. Stale-while-revalidate keeps latency flat while the origin is protected.',
      C: 'Edge caching helps reads, but a 24h TTL drifts freshness for trending data, and disabling origin caching leaves you naked when the CDN misses or purges.',
      D: 'Bigger pools amplify the stampede (more concurrent identical queries). Aggressive timeouts turn load into error spikes without reducing origin work.',
    },
    xp: 14,
    beginner: {
      incomingThreat:
        'Every app node’s cache expires at the same time — they will all hit the database together.',
      scenario:
        'Hot key /trending expires every 60 seconds on all 200 pods at once. Postgres gets hammered. What fixes the stampede?',
      choices: [
        {
          id: 'A',
          text: 'Make the cache last 1 hour and add more database copies.',
        },
        {
          id: 'B',
          text: 'Randomize expiry times, let one refresh run at a time, and serve old data while refreshing.',
        },
        {
          id: 'C',
          text: 'Cache /trending on the CDN for a full day and turn off the app cache.',
        },
        {
          id: 'D',
          text: 'Give every pod twice as many DB connections and time out queries in 50ms.',
        },
      ],
      breakdown: {
        A: 'A longer TTL only delays the same synchronized miss. Extra replicas do not stop identical queries.',
        B: 'Jitter spreads expiry. Singleflight means one refresh. Stale-while-revalidate keeps users happy while the DB is protected.',
        C: 'Day-long CDN cache makes trending stale, and no app cache leaves you exposed on CDN misses.',
        D: 'More connections make more identical queries. Short timeouts turn load into errors.',
      },
    },
  },
  {
    id: 'herd-singleflight',
    conceptId: 'request-coalescing',
    incomingThreat:
      'A celebrity post just went viral — thousands of identical cache misses are racing the origin.',
    scenario:
      'Even with jitter, a cold start after deploy empties Redis for /profile/{id}. The first wave of traffic all miss. You need one refresh per key, not one per request.',
    category: 'loadBalancing',
    choices: [
      {
        id: 'A',
        text: 'Shard Redis by user id and add a second replica region.',
      },
      {
        id: 'B',
        text: 'Raise rate limits globally so fewer clients hit the API.',
      },
      {
        id: 'C',
        text: 'Coalesce in-flight misses with singleflight / request collapsing per key.',
      },
      {
        id: 'D',
        text: 'Disable caching for profiles and read Postgres with strong consistency.',
      },
    ],
    correct: 'C',
    hintEliminate: 'D',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.3,
    breakdown: {
      A: 'Sharding and multi-region help capacity and locality, but every shard still stampedes independently on a cold key.',
      B: 'Rate limiting protects the edge somewhat, but honest traffic still fans out into duplicate origin fetches.',
      C: 'Singleflight ensures only one caller refreshes a given key while others wait on that promise — classic stampede break.',
      D: 'Bypassing cache maximizes origin load and latency under virality; strong consistency does not solve concurrency of identical reads.',
    },
    xp: 14,
    beginner: {
      incomingThreat:
        'A viral post emptied the cache — thousands of requests all try to reload the same key.',
      scenario:
        'After a deploy, Redis is empty for /profile/{id}. Many requests miss at once. How do you get one reload per key, not one per request?',
      choices: [
        {
          id: 'A',
          text: 'Split Redis by user id and add another region.',
        },
        {
          id: 'B',
          text: 'Block more clients with stricter rate limits.',
        },
        {
          id: 'C',
          text: 'Share one in-flight fetch per key (singleflight / request collapsing).',
        },
        {
          id: 'D',
          text: 'Turn off caching and always read Postgres for every profile.',
        },
      ],
      breakdown: {
        A: 'Sharding helps scale, but each shard can still stampede on a cold key.',
        B: 'Rate limits cut some traffic but do not stop duplicate origin fetches.',
        C: 'Singleflight: one caller refreshes; others wait on the same result.',
        D: 'No cache means maximum DB load when something goes viral.',
      },
    },
  },
  {
    id: 'herd-swr',
    conceptId: 'stale-while-revalidate',
    incomingThreat:
      'Origin refresh is slow; users are staring at spinners while the herd waits on a single loader.',
    scenario:
      'You coalesced misses, but the origin query for /trending takes ~800ms. Holding every waiter until refresh completes tanks UX. Product needs freshness minutes, not milliseconds.',
    category: 'caching',
    choices: [
      {
        id: 'A',
        text: 'Serve stale cached value immediately and revalidate asynchronously (SWR).',
      },
      {
        id: 'B',
        text: 'Block all readers until the refresh finishes to guarantee fresh data.',
      },
      {
        id: 'C',
        text: 'Delete the key on every write and force hard misses forever.',
      },
      {
        id: 'D',
        text: 'Move the query into the browser so clients hit Postgres directly.',
      },
    ],
    correct: 'A',
    hintEliminate: 'D',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.28,
    breakdown: {
      A: 'Stale-while-revalidate returns last-known-good instantly, then refreshes in the background — best latency/freshness trade-off for soft-realtime feeds.',
      B: 'Blocking waiters couples UX to origin latency and recreates a thundering herd of waiters on timeouts.',
      C: 'Write-through invalidation without soft TTL/SWR maximizes miss storms after every update.',
      D: 'Client→DB skips your cache and control plane; you lose authz, pooling, and amplify load.',
    },
    xp: 14,
    beginner: {
      incomingThreat:
        'The one shared reload is slow — users wait on spinners while it finishes.',
      scenario:
        'You already coalesce misses, but /trending takes ~800ms from the DB. Slightly old data is OK. What should users see during the refresh?',
      choices: [
        {
          id: 'A',
          text: 'Show the last cached value now; refresh in the background (SWR).',
        },
        {
          id: 'B',
          text: 'Make everyone wait until the new value is ready.',
        },
        {
          id: 'C',
          text: 'Delete the key on every write so every read misses hard.',
        },
        {
          id: 'D',
          text: 'Have the browser query Postgres directly.',
        },
      ],
      breakdown: {
        A: 'Stale-while-revalidate keeps pages fast and still updates soon after.',
        B: 'Blocking everyone ties UX to DB speed and stacks up waiters.',
        C: 'Hard deletes after every write create miss storms.',
        D: 'Browsers talking to the DB bypass your cache, auth, and pooling.',
      },
    },
  },
  {
    id: 'herd-replicas',
    conceptId: 'replicas-vs-stampede',
    incomingThreat:
      'On-call proposes “just add five read replicas” as the permanent fix for cache stampedes.',
    scenario:
      'Finance approved more Postgres replicas. Leadership wants to know if horizontal DB capacity replaces cache stampede mitigations for hot keys.',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Yes — enough replicas make synchronized cache expiry irrelevant.',
      },
      {
        id: 'B',
        text: 'Replicas absorb spikes short-term, but stampedes still waste capacity; fix expiry + coalescing at the cache layer.',
      },
      {
        id: 'C',
        text: 'Switch the hot key to a cross-region multi-primary database.',
      },
      {
        id: 'D',
        text: 'Remove Redis and rely solely on replica lag as a natural buffer.',
      },
    ],
    correct: 'B',
    hintEliminate: 'D',
    damageOnHit: 18,
    bossHealOnMiss: 8,
    uptimePenalty: 0.32,
    breakdown: {
      A: 'Replicas raise ceiling but N identical queries still multiply cost; synchronized expiry scales waste with fleet size.',
      B: 'Replicas are a safety net. Stampede control (jitter, coalescing, SWR) stops unnecessary identical work before it hits storage.',
      C: 'Multi-primary adds consistency/conflict complexity unrelated to read stampedes on a single hot key.',
      D: 'Replica lag is not a cache; it adds staleness without collapsing duplicate work.',
    },
    xp: 12,
    beginner: {
      incomingThreat:
        'Someone says “just add five more database copies” will permanently fix cache stampedes.',
      scenario:
        'You can buy more Postgres read replicas. Does that replace jitter and coalescing for hot keys?',
      choices: [
        {
          id: 'A',
          text: 'Yes — enough replicas make synced cache expiry a non-issue.',
        },
        {
          id: 'B',
          text: 'Replicas help briefly, but you still fix expiry + coalescing in the cache.',
        },
        {
          id: 'C',
          text: 'Move the hot key to a multi-primary database across regions.',
        },
        {
          id: 'D',
          text: 'Delete Redis and use replica lag as your only buffer.',
        },
      ],
      breakdown: {
        A: 'More replicas still run N identical queries; synced expiry wastes that capacity.',
        B: 'Replicas are a backup. Stop duplicate work at the cache with jitter and coalescing.',
        C: 'Multi-primary adds hard consistency problems and does not fix read stampedes.',
        D: 'Lag is not a cache — it does not collapse duplicate work.',
      },
    },
  },
  {
    id: 'herd-cdn',
    conceptId: 'cdn-freshness',
    incomingThreat:
      'Edge team wants a 24-hour CDN TTL on /trending to “end stampedes forever.”',
    scenario:
      'Marketing needs /trending to reflect new posts within a few minutes. Security wants origin protection. Edge caching is on the table.',
    category: 'caching',
    choices: [
      {
        id: 'A',
        text: '24h CDN TTL, purge never — origin cache optional.',
      },
      {
        id: 'B',
        text: 'Short edge TTL (1–2 min) + soft TTL/SWR at origin + jittered purge/revalidate.',
      },
      {
        id: 'C',
        text: 'Bypass CDN entirely and pin every request to one origin pod.',
      },
      {
        id: 'D',
        text: 'Cache HTML only in the browser with localStorage for 7 days.',
      },
    ],
    correct: 'B',
    hintEliminate: 'C',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.3,
    breakdown: {
      A: 'Day-long edge TTL protects origin but violates freshness SLOs; rare purges still create herd events.',
      B: 'Short edge TTL + origin SWR/jitter balances freshness and stampede protection without pinning traffic.',
      C: 'Single-pod pinning creates a SPOF and concentrates load — opposite of herd defense.',
      D: 'Client-only caches fragment consistency, skip auth/edge controls, and cannot coordinate revalidation.',
    },
    xp: 14,
    beginner: {
      incomingThreat:
        'The edge team wants a 24-hour CDN cache on /trending to “stop stampedes forever.”',
      scenario:
        'Marketing needs new posts in a few minutes. You also need to protect the origin. Best CDN setup?',
      choices: [
        {
          id: 'A',
          text: 'Cache at the CDN for 24 hours and almost never purge.',
        },
        {
          id: 'B',
          text: 'Short CDN TTL (1–2 min) plus soft cache / SWR at origin with jitter.',
        },
        {
          id: 'C',
          text: 'Skip the CDN and send every request to one origin pod.',
        },
        {
          id: 'D',
          text: 'Only cache HTML in the browser for 7 days.',
        },
      ],
      breakdown: {
        A: 'Day-long CDN cache protects origin but fails freshness; rare purges still stampede.',
        B: 'Short edge life + origin SWR/jitter balances freshness and protection.',
        C: 'One pod is a single point of failure and concentrates load.',
        D: 'Browser-only caches cannot coordinate and skip edge controls.',
      },
    },
  },
]

const herdVariantMcqs: Record<string, Omit<McqCard, 'kind'>> = {
  'ttl-jitter-singleflight': {
    id: 'herd-sync-expiry-v2',
    conceptId: 'ttl-jitter-singleflight',
    incomingThreat:
      'The herd returns: another fixed-TTL key is about to expire across the fleet in unison.',
    scenario:
      'Lesson check: /leaderboard also uses a shared 30s TTL with no jitter. Same stampede pattern is forming. Pick the mitigation that attacks the root cause.',
    category: 'caching',
    choices: [
      {
        id: 'A',
        text: 'Add 10× more Redis memory so keys never evict.',
      },
      {
        id: 'B',
        text: 'Keep fixed TTLs; rely on Postgres autovacuum to keep up.',
      },
      {
        id: 'C',
        text: 'Add TTL jitter, coalesce misses, and serve stale while revalidating.',
      },
      {
        id: 'D',
        text: 'Restart half the pods so expiry clocks desync by chance.',
      },
    ],
    correct: 'C',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.25,
    breakdown: {
      A: 'Memory avoids eviction but not synchronized TTL expiry — the herd still lands on schedule.',
      B: 'Autovacuum does not absorb identical read stampedes; it is unrelated maintenance.',
      C: 'Same correct pattern as before: desync expiry, collapse duplicate work, keep serving during refresh.',
      D: 'Chaos restarts are not a control plane; they cause more incidents than they prevent.',
    },
    xp: 12,
    beginner: {
      incomingThreat:
        'Another fixed-TTL key is about to expire on every node at once.',
      scenario:
        '/leaderboard uses a shared 30s TTL with no jitter. Same stampede. What fixes the root cause?',
      choices: [
        {
          id: 'A',
          text: 'Give Redis 10× more memory so nothing evicts.',
        },
        {
          id: 'B',
          text: 'Keep fixed TTLs and trust Postgres autovacuum.',
        },
        {
          id: 'C',
          text: 'Jitter TTLs, coalesce misses, and serve stale while refreshing.',
        },
        {
          id: 'D',
          text: 'Restart half the pods and hope clocks desync.',
        },
      ],
      breakdown: {
        A: 'More memory stops eviction, not synced TTL expiry.',
        B: 'Autovacuum does not stop identical read stampedes.',
        C: 'Desync expiry, collapse duplicate work, keep serving during refresh.',
        D: 'Random restarts are chaos, not a real control.',
      },
    },
  },
  'request-coalescing': {
    id: 'herd-singleflight-v2',
    conceptId: 'request-coalescing',
    incomingThreat:
      'Cold key after failover: many waiters are each opening their own origin query.',
    scenario:
      'Reinforcement: under a cache flush, how do you ensure one refresh per key instead of one per concurrent request?',
    category: 'loadBalancing',
    choices: [
      {
        id: 'A',
        text: 'Open a new DB connection per incoming request for fairness.',
      },
      {
        id: 'B',
        text: 'Use singleflight / request collapsing so waiters share one fetch.',
      },
      {
        id: 'C',
        text: 'Randomly drop 50% of requests until the cache warms.',
      },
      {
        id: 'D',
        text: 'Serialize the entire API with a global mutex.',
      },
    ],
    correct: 'B',
    hintEliminate: 'D',
    damageOnHit: 16,
    bossHealOnMiss: 6,
    uptimePenalty: 0.25,
    breakdown: {
      A: 'More connections amplify the stampede against Postgres.',
      B: 'Coalescing is the targeted fix for duplicate in-flight loads of the same key.',
      C: 'Blind shedding hurts availability without guaranteeing a single refresh.',
      D: 'A global mutex destroys throughput and creates a worse bottleneck than the herd.',
    },
    xp: 12,
    beginner: {
      incomingThreat:
        'After failover, many requests each start their own origin query for the same cold key.',
      scenario:
        'Cache was flushed. How do you get one refresh per key, not one per request?',
      choices: [
        {
          id: 'A',
          text: 'Open a new DB connection for every request.',
        },
        {
          id: 'B',
          text: 'Use singleflight so waiters share one fetch.',
        },
        {
          id: 'C',
          text: 'Randomly drop half the requests until the cache warms.',
        },
        {
          id: 'D',
          text: 'Lock the whole API with one global mutex.',
        },
      ],
      breakdown: {
        A: 'More connections make the stampede worse.',
        B: 'Coalescing is the right fix for duplicate in-flight loads.',
        C: 'Blind drops hurt users and still may not leave one refresh.',
        D: 'A global lock kills throughput worse than the herd.',
      },
    },
  },
  'stale-while-revalidate': {
    id: 'herd-swr-v2',
    conceptId: 'stale-while-revalidate',
    incomingThreat:
      'Users bounce while waiting on a slow coalesced refresh.',
    scenario:
      'Reinforcement: origin is slow but slightly stale /trending is acceptable. What do you serve during refresh?',
    category: 'caching',
    choices: [
      {
        id: 'A',
        text: 'HTTP 503 until the new value is ready.',
      },
      {
        id: 'B',
        text: 'Empty body with Cache-Control: no-store.',
      },
      {
        id: 'C',
        text: 'Last-known-good (stale) immediately; revalidate in the background.',
      },
      {
        id: 'D',
        text: 'Redirect everyone to a maintenance page.',
      },
    ],
    correct: 'C',
    hintEliminate: 'D',
    damageOnHit: 16,
    bossHealOnMiss: 6,
    uptimePenalty: 0.22,
    breakdown: {
      A: 'Hard errors convert latency into outage for a soft-realtime feed.',
      B: 'no-store prevents reuse and increases origin pressure.',
      C: 'SWR preserves UX while the singleflight refresh completes.',
      D: 'Maintenance mode is an incident response of last resort, not a cache strategy.',
    },
    xp: 12,
    beginner: {
      incomingThreat: 'Users leave while waiting on a slow shared refresh.',
      scenario:
        'Origin is slow, but slightly old /trending is fine. What do you return during refresh?',
      choices: [
        {
          id: 'A',
          text: 'Return HTTP 503 until the new value is ready.',
        },
        {
          id: 'B',
          text: 'Return an empty body with no-store.',
        },
        {
          id: 'C',
          text: 'Return the last good value now; refresh in the background.',
        },
        {
          id: 'D',
          text: 'Send everyone to a maintenance page.',
        },
      ],
      breakdown: {
        A: 'Errors turn slow refresh into an outage.',
        B: 'no-store blocks reuse and hits the origin harder.',
        C: 'SWR keeps UX good while the one refresh finishes.',
        D: 'Maintenance mode is last-resort, not a cache strategy.',
      },
    },
  },
  'replicas-vs-stampede': {
    id: 'herd-replicas-v2',
    conceptId: 'replicas-vs-stampede',
    incomingThreat:
      'Someone still argues that “DB scale” alone ends cache herds.',
    scenario:
      'Reinforcement: why don’t read replicas replace jitter + coalescing for hot-key stampedes?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Because identical queries still multiply work; replicas raise ceiling, not remove waste.',
      },
      {
        id: 'B',
        text: 'Because replicas cannot serve SELECT statements.',
      },
      {
        id: 'C',
        text: 'Because Redis cannot run without a primary Postgres.',
      },
      {
        id: 'D',
        text: 'Because CAP theorem forbids caches when replicas exist.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 16,
    bossHealOnMiss: 6,
    uptimePenalty: 0.22,
    breakdown: {
      A: 'Correct: scale without stampede control burns money and still risks pool exhaustion.',
      B: 'Replicas exist specifically to serve reads.',
      C: 'Caches and primaries are independent concerns; this is a non sequitur.',
      D: 'CAP does not outlaw caching when replicas are present.',
    },
    xp: 10,
    beginner: {
      incomingThreat: 'Someone still says “just scale the DB” ends cache herds.',
      scenario:
        'Why don’t read replicas replace jitter + coalescing for hot-key stampedes?',
      choices: [
        {
          id: 'A',
          text: 'Identical queries still multiply work; replicas raise capacity, not remove waste.',
        },
        {
          id: 'B',
          text: 'Replicas cannot run SELECT queries.',
        },
        {
          id: 'C',
          text: 'Redis cannot run without a primary Postgres.',
        },
        {
          id: 'D',
          text: 'CAP theorem bans caches when replicas exist.',
        },
      ],
      breakdown: {
        A: 'Scale without stampede control wastes money and can still exhaust pools.',
        B: 'Replicas exist to serve reads.',
        C: 'Caches and databases are separate concerns.',
        D: 'CAP does not forbid caching with replicas.',
      },
    },
  },
  'cdn-freshness': {
    id: 'herd-cdn-v2',
    conceptId: 'cdn-freshness',
    incomingThreat:
      'Edge proposes day-long TTLs again after a partial outage.',
    scenario:
      'Reinforcement: marketing needs minute-level freshness and origin needs protection. Best CDN posture?',
    category: 'caching',
    choices: [
      {
        id: 'A',
        text: '24h immutable CDN objects with no revalidation.',
      },
      {
        id: 'B',
        text: 'Short edge TTL plus origin soft-TTL/SWR and jittered revalidation.',
      },
      {
        id: 'C',
        text: 'Disable the CDN whenever traffic spikes.',
      },
      {
        id: 'D',
        text: 'Serve only POST requests from the CDN.',
      },
    ],
    correct: 'B',
    hintEliminate: 'D',
    damageOnHit: 16,
    bossHealOnMiss: 6,
    uptimePenalty: 0.22,
    breakdown: {
      A: 'Immutable day-long TTL fails freshness SLOs.',
      B: 'Short edge life + origin SWR is the balanced control.',
      C: 'Disabling the CDN during spikes removes your shield when you need it most.',
      D: 'CDNs primarily accelerate safe GETs; POSTs are rarely cacheable.',
    },
    xp: 12,
    beginner: {
      incomingThreat: 'Edge wants day-long TTLs again after a partial outage.',
      scenario:
        'Need minute-level freshness and origin protection. Best CDN setup?',
      choices: [
        {
          id: 'A',
          text: '24h immutable CDN objects with no revalidation.',
        },
        {
          id: 'B',
          text: 'Short edge TTL plus origin soft-TTL/SWR with jitter.',
        },
        {
          id: 'C',
          text: 'Turn off the CDN whenever traffic spikes.',
        },
        {
          id: 'D',
          text: 'Only serve POST requests from the CDN.',
        },
      ],
      breakdown: {
        A: 'Day-long immutable cache fails freshness goals.',
        B: 'Short edge life + origin SWR is the balanced approach.',
        C: 'Disabling the CDN in a spike removes your shield when you need it.',
        D: 'CDNs mainly help safe GETs; POSTs are rarely cacheable.',
      },
    },
  },
}

const herdFlow = flow({
  id: 'herd-read-path',
  conceptId: 'stampede-safe-read-path',
  incomingThreat:
    'The herd scrambled your read path — hops are out of order and a bad shortcut snuck into the pool.',
  scenario:
    'Rebuild the stampede-safe path for hot /trending reads. Place hops in the order a request should travel when edge + app coalescing + soft cache protect the origin.',
  category: 'caching',
  damageOnHit: 18,
  bossHealOnMiss: 8,
  uptimePenalty: 0.3,
  xp: 16,
  stages: [
    {
      id: 'client',
      label: 'Client',
      rationale: 'Traffic originates at the user/device — always the entry of the path.',
    },
    {
      id: 'edge',
      label: 'Edge / CDN',
      rationale: 'Absorb and cache at the edge first to shed duplicate GETs before they hit origin infra.',
    },
    {
      id: 'app-coalesce',
      label: 'App + singleflight',
      rationale: 'Application tier coalesces in-flight misses so one key refresh runs at a time.',
    },
    {
      id: 'cache-swr',
      label: 'Cache (SWR)',
      rationale: 'Serve last-known-good while revalidating — keeps latency flat during refresh.',
    },
    {
      id: 'origin',
      label: 'Origin (DB)',
      rationale: 'Postgres is the source of truth and last resort — protected by every hop above.',
    },
  ],
  distractors: [
    {
      id: 'direct-db',
      label: 'Browser → DB direct',
      rationale: 'Skipping your edge/app/cache control plane maximizes load and bypasses authz.',
    },
  ],
  beginner: {
    incomingThreat:
      'The read-path steps are mixed up — and a bad shortcut is in the pile.',
    scenario:
      'Order the safe path for hot /trending: client → edge → app coalesce → soft cache → DB.',
    stages: [
      {
        id: 'client',
        label: 'Client',
        rationale: 'Requests start at the user.',
      },
      {
        id: 'edge',
        label: 'Edge / CDN',
        rationale: 'Cache at the edge first to shed duplicate GETs.',
      },
      {
        id: 'app-coalesce',
        label: 'App + singleflight',
        rationale: 'App collapses in-flight misses to one refresh.',
      },
      {
        id: 'cache-swr',
        label: 'Cache (SWR)',
        rationale: 'Serve last-known-good while refreshing.',
      },
      {
        id: 'origin',
        label: 'Origin (DB)',
        rationale: 'Database is last — protected by hops above.',
      },
    ],
    distractors: [
      {
        id: 'direct-db',
        label: 'Browser → DB direct',
        rationale: 'Skipping edge/app/cache overloads the DB and skips auth.',
      },
    ],
  },
})

const herdFlowVariant = flow({
  id: 'herd-read-path-v2',
  conceptId: 'stampede-safe-read-path',
  incomingThreat:
    'Path drill: the herd shuffled the hops again after a partial mitigation.',
  scenario:
    'Reinforcement: order the safe read path for a viral hot key under stampede risk.',
  category: 'caching',
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
      id: 'edge',
      label: 'CDN / edge cache',
      rationale: 'Edge first for cacheable reads.',
    },
    {
      id: 'app-coalesce',
      label: 'API + request coalesce',
      rationale: 'Collapse duplicate misses in the app tier.',
    },
    {
      id: 'cache-swr',
      label: 'Redis soft-TTL / SWR',
      rationale: 'Stale-while-revalidate before origin.',
    },
    {
      id: 'origin',
      label: 'Primary DB',
      rationale: 'Origin last.',
    },
  ],
  distractors: [
    {
      id: 'fanout',
      label: 'Fan-out every pod to DB',
      rationale: 'That is the stampede — never the intended path.',
    },
  ],
  beginner: {
    incomingThreat: 'The safe read-path order got scrambled again.',
    scenario:
      'Put the stampede-safe path back in order for a viral hot key.',
    stages: [
      {
        id: 'client',
        label: 'Client',
        rationale: 'Start at the caller.',
      },
      {
        id: 'edge',
        label: 'CDN / edge cache',
        rationale: 'Edge first for cacheable reads.',
      },
      {
        id: 'app-coalesce',
        label: 'API + request coalesce',
        rationale: 'Collapse duplicate misses in the app.',
      },
      {
        id: 'cache-swr',
        label: 'Redis soft-TTL / SWR',
        rationale: 'Serve stale while refreshing before origin.',
      },
      {
        id: 'origin',
        label: 'Primary DB',
        rationale: 'Database last.',
      },
    ],
    distractors: [
      {
        id: 'fanout',
        label: 'Fan-out every pod to DB',
        rationale: 'That is the stampede — never the intended path.',
      },
    ],
  },
})

const herdDeck = [
  mcq(herdMcqs[0]),
  mcq(herdMcqs[1]),
  herdFlow,
  mcq(herdMcqs[2]),
  mcq(herdMcqs[3]),
  mcq(herdMcqs[4]),
]

const herdVariants = {
  ...Object.fromEntries(
    Object.entries(herdVariantMcqs).map(([k, v]) => [k, mcq(v)]),
  ),
  'stampede-safe-read-path': herdFlowVariant,
}

export const thunderingHerd: BossEncounter = {
  id: 'thundering-herd',
  name: 'Thundering Herd',
  blurb:
    'Synchronized cache expiry stamps the origin — desync TTLs, coalesce misses, or the herd tramples your pools.',
  maxHp: 100,
  threatType: 'Cascading Failure',
  artKey: 'herd',
  deck: herdDeck,
  variants: herdVariants,
}
