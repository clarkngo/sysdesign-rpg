import { mcq, flow, type BossEncounter, type McqCard } from '../types'

const chronosMcqs: Omit<McqCard, 'kind'>[] = [
  {
    id: 'chronos-ntp-limits',
    conceptId: 'ntp-clock-limits',
    incomingThreat:
      'Nodes drift apart — leases expire early on one machine and late on another; the Chronarch rewrites time.',
    scenario:
      'Distributed nodes use wall clocks for coordination. What is the realistic limit of NTP-synchronized clocks?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'NTP keeps clocks close but not identical — expect milliseconds to seconds of skew; never assume perfect sync.',
      },
      {
        id: 'B',
        text: 'NTP guarantees all nodes share the exact same nanosecond forever.',
      },
      {
        id: 'C',
        text: 'Clock sync is unnecessary if every server runs Linux.',
      },
      {
        id: 'D',
        text: 'Disable NTP so all nodes free-run — consistency improves.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.3,
    xp: 14,
    breakdown: {
      A: 'Real systems have skew bounds; design protocols with safety margins.',
      B: 'Perfect sync is physically and practically unreachable.',
      C: 'OS choice does not eliminate drift.',
      D: 'Free-running clocks diverge faster.',
    },
    beginner: {
      incomingThreat:
        'Servers disagree on the current time — leases and TTLs behave unpredictably.',
      scenario:
        'What should you assume about NTP-synchronized clocks?',
      choices: [
        {
          id: 'A',
          text: 'Clocks stay close but not identical — expect some skew; never assume perfect sync.',
        },
        {
          id: 'B',
          text: 'NTP makes every node share the exact same nanosecond.',
        },
        {
          id: 'C',
          text: 'Linux servers never need clock sync.',
        },
        {
          id: 'D',
          text: 'Turn off NTP for better consistency.',
        },
      ],
      breakdown: {
        A: 'Design for skew margins, not perfect time.',
        B: 'Perfect sync does not exist in practice.',
        C: 'All systems drift without sync.',
        D: 'No NTP means more drift.',
      },
    },
  },
  {
    id: 'chronos-lease-ttl-skew',
    conceptId: 'lease-ttl-skew-margin',
    incomingThreat:
      'A leader holds the lock until TTL, but a slow clock lets two writers both think they own the shard.',
    scenario:
      'You use lease-based leader election with TTL. How do you account for clock skew?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Add a skew safety margin to lease TTL; treat lease as expired early on the holder; use fencing tokens on writes.',
      },
      {
        id: 'B',
        text: 'Set TTL to 1ms — shorter is always safer with skew.',
      },
      {
        id: 'C',
        text: 'Ignore skew — if NTP is enabled, clocks match exactly.',
      },
      {
        id: 'D',
        text: 'Extend TTL to infinity so leaders never expire.',
      },
    ],
    correct: 'A',
    hintEliminate: 'C',
    damageOnHit: 22,
    bossHealOnMiss: 7,
    uptimePenalty: 0.32,
    xp: 15,
    breakdown: {
      A: 'Skew margins + early expiry + fencing prevent split-brain writes.',
      B: 'Absurdly short TTL causes churn and false failovers.',
      C: 'NTP reduces but does not eliminate skew.',
      D: 'Infinite leases never recover from crashed leaders.',
    },
    beginner: {
      incomingThreat:
        'Two nodes both think they are leader because clocks disagree on lease expiry.',
      scenario:
        'How should lease TTL handle clock skew?',
      choices: [
        {
          id: 'A',
          text: 'Add skew margin to TTL; expire leases early on the holder; fence stale writers.',
        },
        {
          id: 'B',
          text: 'Use a 1ms TTL — shorter always fixes skew.',
        },
        {
          id: 'C',
          text: 'Ignore skew if NTP is running.',
        },
        {
          id: 'D',
          text: 'Make TTL infinite so leaders never step down.',
        },
      ],
      breakdown: {
        A: 'Margins and fencing prevent double leadership.',
        B: 'Tiny TTL causes constant churn.',
        C: 'NTP still leaves skew.',
        D: 'Infinite leases trap failed nodes as leaders.',
      },
    },
  },
  {
    id: 'chronos-client-clock-auth',
    conceptId: 'client-clock-auth',
    incomingThreat:
      'Mobile clients set exp=9999999999 locally — sessions never die when the device clock lies.',
    scenario:
      'Auth tokens use an exp claim. A client adjusts its clock to stay “valid.” What is sound expiry design?',
    category: 'security',
    choices: [
      {
        id: 'A',
        text: 'Validate exp server-side with server clock; do not trust client-reported time for auth; prefer monotonic server timestamps for session revocation.',
      },
      {
        id: 'B',
        text: 'Trust the client clock for exp — users control their devices fairly.',
      },
      {
        id: 'C',
        text: 'Remove exp entirely so skew cannot cause logouts.',
      },
      {
        id: 'D',
        text: 'Ask the client to send “current time” and accept it for expiry checks.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.28,
    xp: 14,
    breakdown: {
      A: 'Server-side expiry and revocation lists beat client wall clocks.',
      B: 'Client clocks are attacker-controlled.',
      C: 'No expiry means stolen tokens live forever.',
      D: 'Client-sent time is trivially spoofed.',
    },
    beginner: {
      incomingThreat:
        'Users change their phone clock to keep expired tokens working.',
      scenario:
        'How should token expiry work?',
      choices: [
        {
          id: 'A',
          text: 'Check exp on the server with server time; never trust client clocks for auth.',
        },
        {
          id: 'B',
          text: 'Trust the client device clock for expiry.',
        },
        {
          id: 'C',
          text: 'Remove expiry so clock skew cannot log anyone out.',
        },
        {
          id: 'D',
          text: 'Let the client tell you what time it is for expiry.',
        },
      ],
      breakdown: {
        A: 'Server time is authoritative for auth.',
        B: 'Client clocks can be manipulated.',
        C: 'No expiry = forever-valid stolen tokens.',
        D: 'Client time is easy to fake.',
      },
    },
  },
]

const chronosFlow = flow({
  id: 'chronos-clock-skew-path',
  conceptId: 'clock-skew-remediation-path',
  incomingThreat:
    'The Chronarch scrambled your time playbook — steps are out of order.',
  scenario:
    'Order the clock-skew response: detect skew symptoms → widen lease/TTL margins or fence → prefer monotonic/logical where needed → monitor clock health.',
  category: 'faultTolerance',
  damageOnHit: 18,
  bossHealOnMiss: 7,
  uptimePenalty: 0.3,
  xp: 16,
  stages: [
    {
      id: 'detect',
      label: 'Detect skew symptoms',
      rationale: 'Watch premature lease expiry, duplicate leaders, and token edge cases in logs and metrics.',
    },
    {
      id: 'widen',
      label: 'Widen lease/TTL margins or fence',
      rationale: 'Add skew buffers to TTL; expire leases early; issue fencing tokens on critical writes.',
    },
    {
      id: 'logical',
      label: 'Prefer monotonic / logical where needed',
      rationale: 'Use logical clocks, version vectors, or HLC where ordering matters more than wall time.',
    },
    {
      id: 'monitor',
      label: 'Monitor clock health',
      rationale: 'Alert on NTP drift, stepped clocks, and chrony/ntpd sync loss across the fleet.',
    },
  ],
  distractors: [
    {
      id: 'trust-client',
      label: 'Trust client clocks',
      rationale: 'Client time is not authoritative.',
    },
    {
      id: 'disable-ntp',
      label: 'Disable NTP everywhere',
      rationale: 'Free-running clocks diverge faster.',
    },
  ],
  beginner: {
    incomingThreat:
      'The clock-skew fix steps got mixed up — put them in order.',
    scenario:
      'Order: spot skew issues → add TTL margins or fencing → use logical clocks where needed → watch clock health.',
    stages: [
      {
        id: 'detect',
        label: 'Detect skew symptoms',
        rationale: 'First notice duplicate leaders and odd expiries.',
      },
      {
        id: 'widen',
        label: 'Widen lease/TTL margins or fence',
        rationale: 'Add safety margins and fencing.',
      },
      {
        id: 'logical',
        label: 'Prefer monotonic / logical where needed',
        rationale: 'Use logical ordering when wall time is unreliable.',
      },
      {
        id: 'monitor',
        label: 'Monitor clock health',
        rationale: 'Alert on drift and sync loss.',
      },
    ],
    distractors: [
      {
        id: 'trust-client',
        label: 'Trust client clocks',
        rationale: 'Clients can lie about time.',
      },
      {
        id: 'disable-ntp',
        label: 'Disable NTP',
        rationale: 'That makes drift worse.',
      },
    ],
  },
})

const chronosVariantMcqs: Record<string, Omit<McqCard, 'kind'>> = {
  'ntp-clock-limits': {
    id: 'chronos-ntp-limits-v2',
    conceptId: 'ntp-clock-limits',
    incomingThreat:
      'A VM live-migrates and its clock jumps forward 30 seconds — leases flip and jobs double-run.',
    scenario:
      'Reinforcement: synchronized clocks limits after a step. Correct assumption?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Clocks can step or drift suddenly — design for bounded skew and detect jumps; do not assume monotonic wall time.',
      },
      {
        id: 'B',
        text: 'VM migration always preserves sub-millisecond clock continuity.',
      },
      {
        id: 'C',
        text: 'Use wall-clock alone for distributed ordering — it is a total order globally.',
      },
      {
        id: 'D',
        text: 'Set all node clocks manually once at boot and never sync again.',
      },
    ],
    correct: 'A',
    hintEliminate: 'C',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.26,
    xp: 12,
    breakdown: {
      A: 'Steps and drift happen — protocols need margins and jump detection.',
      B: 'Live migration and hypervisors can step clocks.',
      C: 'Wall clock is not a global total order under skew.',
      D: 'Manual once-and-forget drifts without ongoing sync.',
    },
    beginner: {
      incomingThreat: 'After a VM move, the clock jumped 30 seconds and jobs ran twice.',
      scenario: 'What should you assume about clock sync?',
      choices: [
        {
          id: 'A',
          text: 'Clocks can jump or drift — design for bounded skew; do not trust perfect wall time.',
        },
        {
          id: 'B',
          text: 'VM migration never affects the clock.',
        },
        {
          id: 'C',
          text: 'Wall clock gives perfect global ordering.',
        },
        {
          id: 'D',
          text: 'Set the clock once at boot and never sync.',
        },
      ],
      breakdown: {
        A: 'Expect jumps; add margins and detection.',
        B: 'Migration can step clocks.',
        C: 'Skew breaks global wall-clock ordering.',
        D: 'Without sync, clocks drift apart.',
      },
    },
  },
  'lease-ttl-skew-margin': {
    id: 'chronos-lease-ttl-skew-v2',
    conceptId: 'lease-ttl-skew-margin',
    incomingThreat:
      'Stale leader writes corrupt data after failover — the old leader’s clock was slow.',
    scenario:
      'Reinforcement: logical clocks / fencing tokens vs wall-clock alone. Prefer?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Fencing tokens (or epoch numbers) on storage writes; wall-clock lease is not enough alone under skew.',
      },
      {
        id: 'B',
        text: 'Wall-clock lease expiry alone guarantees no stale writes.',
      },
      {
        id: 'C',
        text: 'Disable fencing — it adds latency with no benefit.',
      },
      {
        id: 'D',
        text: 'Use client local time to decide which write wins.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 7,
    uptimePenalty: 0.25,
    xp: 12,
    breakdown: {
      A: 'Fencing rejects stale leaders even if their clock says the lease is valid.',
      B: 'Skew can extend a dead leader’s perceived lease.',
      C: 'Without fencing, stale writers can corrupt state.',
      D: 'Client time is untrusted for write ordering.',
    },
    beginner: {
      incomingThreat: 'An old leader wrote after failover because its clock was slow.',
      scenario: 'What beats wall-clock lease alone?',
      choices: [
        {
          id: 'A',
          text: 'Fencing tokens on writes — stale leaders get rejected even if their clock lies.',
        },
        {
          id: 'B',
          text: 'Wall-clock lease alone is always enough.',
        },
        {
          id: 'C',
          text: 'Skip fencing to save latency.',
        },
        {
          id: 'D',
          text: 'Let the client clock pick the winning write.',
        },
      ],
      breakdown: {
        A: 'Fencing blocks stale writers under skew.',
        B: 'Skew can keep dead leaders alive too long.',
        C: 'No fencing risks corruption.',
        D: 'Client time is not authoritative.',
      },
    },
  },
  'client-clock-auth': {
    id: 'chronos-client-clock-auth-v2',
    conceptId: 'client-clock-auth',
    incomingThreat:
      'JWT exp checks pass on a laptop set to 2030 — revoked sessions still work offline.',
    scenario:
      'Reinforcement: don’t trust client clocks for auth expiry alone. Complete pattern?',
    category: 'security',
    choices: [
      {
        id: 'A',
        text: 'Server validates exp with server time; maintain revocation list / short-lived tokens; optional logical session version for force logout.',
      },
      {
        id: 'B',
        text: 'Embed “trust client exp” flag in the token payload.',
      },
      {
        id: 'C',
        text: 'Make tokens never expire — skew cannot break auth then.',
      },
      {
        id: 'D',
        text: 'Sync auth decisions to the client’s timezone setting.',
      },
    ],
    correct: 'A',
    hintEliminate: 'C',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.24,
    xp: 12,
    breakdown: {
      A: 'Server-side expiry + revocation handles skew and stolen tokens.',
      B: 'Client-controlled flags are attacker-controlled.',
      C: 'Non-expiring tokens are permanent breach keys.',
      D: 'Timezone is unrelated to trust boundaries.',
    },
    beginner: {
      incomingThreat: 'A laptop set to 2030 keeps using “expired” tokens offline.',
      scenario: 'How do you handle auth expiry safely?',
      choices: [
        {
          id: 'A',
          text: 'Server checks exp with server time; use short tokens and revocation lists.',
        },
        {
          id: 'B',
          text: 'Add a “trust client exp” flag in the token.',
        },
        {
          id: 'C',
          text: 'Never expire tokens.',
        },
        {
          id: 'D',
          text: 'Use the client timezone for expiry.',
        },
      ],
      breakdown: {
        A: 'Server time + revocation beats client clocks.',
        B: 'Clients control that flag.',
        C: 'No expiry = permanent stolen tokens.',
        D: 'Timezone does not fix trust.',
      },
    },
  },
}

const chronosFlowVariant = flow({
  id: 'chronos-clock-skew-path-v2',
  conceptId: 'clock-skew-remediation-path',
  incomingThreat:
    'Path drill: detect → widen → logical → monitor got tangled.',
  scenario:
    'Reinforcement: order the clock-skew remediation path.',
  category: 'faultTolerance',
  damageOnHit: 16,
  bossHealOnMiss: 6,
  uptimePenalty: 0.25,
  xp: 12,
  stages: [
    {
      id: 'detect',
      label: 'Detect skew symptoms',
      rationale: 'Spot duplicate leaders and odd TTL behavior.',
    },
    {
      id: 'widen',
      label: 'Widen lease/TTL margins or fence',
      rationale: 'Skew buffers and fencing tokens.',
    },
    {
      id: 'logical',
      label: 'Prefer monotonic / logical where needed',
      rationale: 'Logical ordering over wall clock.',
    },
    {
      id: 'monitor',
      label: 'Monitor clock health',
      rationale: 'Alert on drift and sync loss.',
    },
  ],
  distractors: [
    {
      id: 'trust-client',
      label: 'Trust client clocks',
      rationale: 'Not authoritative.',
    },
  ],
  beginner: {
    incomingThreat: 'The clock-skew order got scrambled again.',
    scenario: 'Put detect → widen → logical → monitor back in order.',
    stages: [
      {
        id: 'detect',
        label: 'Detect',
        rationale: 'See skew symptoms.',
      },
      {
        id: 'widen',
        label: 'Widen / fence',
        rationale: 'Add margins and fencing.',
      },
      {
        id: 'logical',
        label: 'Logical clocks',
        rationale: 'Order without perfect wall time.',
      },
      {
        id: 'monitor',
        label: 'Monitor',
        rationale: 'Watch NTP health.',
      },
    ],
    distractors: [
      {
        id: 'trust-client',
        label: 'Trust client clocks',
        rationale: 'Clients can spoof time.',
      },
    ],
  },
})

export const clockSkewChronarch: BossEncounter = {
  id: 'clock-skew-chronarch',
  name: 'Clock-Skew Chronarch',
  blurb:
    'Time bends at the edge — detect skew, margin your leases, fence stale writers, and watch the clocks.',
  maxHp: 94,
  threatType: 'Consistency',
  artKey: 'chronos',
  deck: [mcq(chronosMcqs[0]), mcq(chronosMcqs[1]), chronosFlow, mcq(chronosMcqs[2])],
  variants: {
    ...Object.fromEntries(
      Object.entries(chronosVariantMcqs).map(([k, v]) => [k, mcq(v)]),
    ),
    'clock-skew-remediation-path': chronosFlowVariant,
  },
}
