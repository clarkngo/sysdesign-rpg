import { mcq, flow, type BossEncounter, type McqCard } from '../types'

const wyrmMcqs: Omit<McqCard, 'kind'>[] = [
  {
    id: 'wyrm-multi-az',
    conceptId: 'redundant-azs',
    incomingThreat:
      'An entire availability zone just went dark — your control plane lived only there.',
    scenario:
      'Checkout API + stateful sessions all pinned to a single AZ “for latency.” That AZ fails. How should production have been laid out?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Run active capacity in ≥2 AZs with cross-AZ load balancing and no single-AZ hard dependency.',
      },
      {
        id: 'B',
        text: 'Keep one AZ hot and rely on a weekend DR runbook to rebuild elsewhere.',
      },
      {
        id: 'C',
        text: 'Colocate every dependency in the same rack for cable simplicity.',
      },
      {
        id: 'D',
        text: 'Disable health checks so traffic keeps hitting the dead AZ.',
      },
    ],
    correct: 'A',
    hintEliminate: 'D',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.32,
    xp: 14,
    breakdown: {
      A: 'Multi-AZ active capacity plus LB health routing is the baseline for AZ failure survival.',
      B: 'Cold weekend DR is RTO measured in hours — not an availability design for checkout.',
      C: 'Rack/AZ colocation maximizes correlated failure — classic SPOF nesting.',
      D: 'Blind traffic to a dead AZ turns outage into cascading errors.',
    },
    beginner: {
      incomingThreat:
        'One whole data-center zone died — and that was the only place your app ran.',
      scenario:
        'How should a production checkout service be deployed so one zone outage does not take everything down?',
      choices: [
        {
          id: 'A',
          text: 'Run healthy capacity in at least two zones and balance traffic across them.',
        },
        {
          id: 'B',
          text: 'Keep one zone only and rebuild elsewhere when someone has time.',
        },
        {
          id: 'C',
          text: 'Put every service in the same rack so cables are short.',
        },
        {
          id: 'D',
          text: 'Stop health checks so traffic still goes to the dead zone.',
        },
      ],
      breakdown: {
        A: 'Two+ zones with load balancing survive a single zone failure.',
        B: 'Manual rebuild is slow — users are already down.',
        C: 'One rack/zone is a single point of failure.',
        D: 'Sending traffic to a dead zone makes the outage worse.',
      },
    },
  },
  {
    id: 'wyrm-circuit-breaker',
    conceptId: 'circuit-breakers',
    incomingThreat:
      'A dependency is timing out; every pod is retrying it into a death spiral.',
    scenario:
      'Payments SDK latency spiked to 5s. Your service retries 3× with no backoff, saturating threads and the dependency. What stops the stampede while still recovering?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Open a circuit breaker with capped retries/backoff and a fallback or fast-fail path.',
      },
      {
        id: 'B',
        text: 'Remove timeouts so calls wait forever for a success.',
      },
      {
        id: 'C',
        text: 'Multiply retry count by 10 to “push through” the outage.',
      },
      {
        id: 'D',
        text: 'Hard-code the dependency IP and skip the service discovery layer.',
      },
    ],
    correct: 'A',
    hintEliminate: 'C',
    damageOnHit: 22,
    bossHealOnMiss: 7,
    uptimePenalty: 0.3,
    xp: 15,
    breakdown: {
      A: 'Breakers shed load, limit retries, and probe for recovery — standard dependency isolation.',
      B: 'Infinite waits exhaust pools and turn a slow dependency into a total outage.',
      C: 'More retries amplify load on a dying dependency — opposite of containment.',
      D: 'Pinning IPs removes failover and discovery; it does not fix overload.',
    },
    beginner: {
      incomingThreat:
        'A slow dependency is getting hammered by retries from every server.',
      scenario:
        'Payments is timing out. What protects your service and the dependency?',
      choices: [
        {
          id: 'A',
          text: 'Trip a circuit breaker: fail fast, limited retries, then carefully try again.',
        },
        {
          id: 'B',
          text: 'Remove timeouts and wait as long as it takes.',
        },
        {
          id: 'C',
          text: 'Retry 10× more often to force success.',
        },
        {
          id: 'D',
          text: 'Hard-code the dependency’s IP and skip discovery.',
        },
      ],
      breakdown: {
        A: 'Circuit breakers stop the pile-on and allow safe recovery probes.',
        B: 'Waiting forever fills up your threads and spreads the outage.',
        C: 'More retries make a sick dependency worse.',
        D: 'A fixed IP removes failover — it does not fix overload.',
      },
    },
  },
  {
    id: 'wyrm-redis-replica',
    conceptId: 'ha-data-plane',
    incomingThreat:
      'Your only Redis node vanished — sessions, locks, and rate limits went with it.',
    scenario:
      'Cache + session store is a solitary Redis with no replica and no multi-AZ primary. The instance dies. What is the availability-minded fix?',
    category: 'caching',
    choices: [
      {
        id: 'A',
        text: 'Redis primary + replica (or managed multi-AZ) with automatic failover; app tolerates brief reconnect.',
      },
      {
        id: 'B',
        text: 'Keep one Redis forever; restart the box faster when it dies.',
      },
      {
        id: 'C',
        text: 'Store sessions only in a single app pod’s memory.',
      },
      {
        id: 'D',
        text: 'Point every service at a different unmanaged Redis with no shared failover plan.',
      },
    ],
    correct: 'A',
    hintEliminate: 'C',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.28,
    xp: 14,
    breakdown: {
      A: 'Replicated / multi-AZ Redis with failover removes the single-node SPOF for the data plane.',
      B: 'Faster restarts shrink downtime but never remove the SPOF.',
      C: 'Per-pod memory is an even sharper SPOF and breaks horizontal scale.',
      D: 'Fragmented unmanaged instances multiply failure modes without a failover story.',
    },
    beginner: {
      incomingThreat:
        'Your one Redis server died — and sessions died with it.',
      scenario:
        'How do you stop Redis from being a single point of failure?',
      choices: [
        {
          id: 'A',
          text: 'Use a primary plus replica (or multi-AZ managed Redis) with automatic failover.',
        },
        {
          id: 'B',
          text: 'Keep one Redis and reboot it faster when it fails.',
        },
        {
          id: 'C',
          text: 'Keep sessions only in one app server’s RAM.',
        },
        {
          id: 'D',
          text: 'Give each service its own Redis with no shared failover plan.',
        },
      ],
      breakdown: {
        A: 'A replica + failover means one node dying does not end the service.',
        B: 'Faster reboot still means downtime when that one box dies.',
        C: 'One pod’s memory is an even worse single point of failure.',
        D: 'Many lonely Redis boxes still fail alone — no HA plan.',
      },
    },
  },
]

const wyrmFlow = flow({
  id: 'wyrm-ha-request-path',
  conceptId: 'ha-request-path',
  incomingThreat:
    'The wyrm tangled your HA path — hops are disordered and a SPOF shortcut is in the pool.',
  scenario:
    'Order the healthy multi-AZ request path so traffic avoids a failed AZ and still reaches a sound data plane.',
  category: 'faultTolerance',
  damageOnHit: 18,
  bossHealOnMiss: 7,
  uptimePenalty: 0.3,
  xp: 16,
  stages: [
    {
      id: 'client',
      label: 'Client',
      rationale: 'Request enters at the edge caller.',
    },
    {
      id: 'health-lb',
      label: 'LB + health checks',
      rationale: 'Only route to instances/AZs that pass health probes.',
    },
    {
      id: 'multi-az-app',
      label: 'Multi-AZ app tier',
      rationale: 'Serve from remaining healthy AZs — no single-AZ pin.',
    },
    {
      id: 'ha-data',
      label: 'Multi-AZ DB / Redis',
      rationale: 'Stateful dependencies must also survive AZ loss.',
    },
    {
      id: 'respond',
      label: 'Respond to client',
      rationale: 'Complete the request from the healthy path.',
    },
  ],
  distractors: [
    {
      id: 'dead-az',
      label: 'Pin traffic to failed AZ',
      rationale: 'Ignoring health checks feeds the outage.',
    },
    {
      id: 'single-redis',
      label: 'Lone Redis in one AZ',
      rationale: 'Data-plane SPOF collapses HA even if the app is multi-AZ.',
    },
  ],
  beginner: {
    incomingThreat:
      'The high-availability steps are mixed up — fix the order.',
    scenario:
      'Put the request path in order so a dead zone is skipped and data still has a replica.',
    stages: [
      {
        id: 'client',
        label: 'Client sends request',
        rationale: 'Traffic starts at the client.',
      },
      {
        id: 'health-lb',
        label: 'Load balancer checks health',
        rationale: 'Only send traffic to healthy targets.',
      },
      {
        id: 'multi-az-app',
        label: 'App servers in other zones',
        rationale: 'Serve from zones that are still up.',
      },
      {
        id: 'ha-data',
        label: 'Database / Redis with failover',
        rationale: 'Stateful stores must be multi-AZ too.',
      },
      {
        id: 'respond',
        label: 'Return the response',
        rationale: 'Finish on the healthy path.',
      },
    ],
    distractors: [
      {
        id: 'dead-az',
        label: 'Keep sending to the dead zone',
        rationale: 'That ignores health and prolongs the outage.',
      },
      {
        id: 'single-redis',
        label: 'One Redis in one zone',
        rationale: 'App HA cannot save a single-node data store.',
      },
    ],
  },
})

const wyrmVariantMcqs: Record<string, Omit<McqCard, 'kind'>> = {
  'redundant-azs': {
    id: 'wyrm-multi-az-v2',
    conceptId: 'redundant-azs',
    incomingThreat:
      'Another AZ brownout — leadership still wants “one region is enough.”',
    scenario:
      'Reinforcement: minimize blast radius of AZ loss for a customer-facing API.',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Active-active (or hot standby) across AZs with health-aware routing.',
      },
      {
        id: 'B',
        text: 'Single AZ plus hope the provider never fails it.',
      },
      {
        id: 'C',
        text: 'Schedule all deploys only during the AZ outage.',
      },
      {
        id: 'D',
        text: 'Terminate instances in healthy AZs to “simplify” networking.',
      },
    ],
    correct: 'A',
    hintEliminate: 'D',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.26,
    xp: 12,
    breakdown: {
      A: 'Capacity and routing across AZs is the redundant layout.',
      B: 'Hope is not an HA strategy.',
      C: 'Deploying into an outage does not create redundancy.',
      D: 'Killing healthy capacity deepens the incident.',
    },
    beginner: {
      incomingThreat: 'Another zone is unhealthy. Leadership likes “one zone only.”',
      scenario: 'What layout survives a zone failure?',
      choices: [
        {
          id: 'A',
          text: 'Run in multiple zones and route only to healthy ones.',
        },
        {
          id: 'B',
          text: 'Stay in one zone and hope it never fails.',
        },
        {
          id: 'C',
          text: 'Only deploy while the zone is already down.',
        },
        {
          id: 'D',
          text: 'Shut down the healthy zones to simplify networking.',
        },
      ],
      breakdown: {
        A: 'Multiple healthy zones are how you survive one failure.',
        B: 'Hope is not high availability.',
        C: 'Deploy timing does not create redundancy.',
        D: 'Removing healthy capacity makes the outage worse.',
      },
    },
  },
  'circuit-breakers': {
    id: 'wyrm-circuit-breaker-v2',
    conceptId: 'circuit-breakers',
    incomingThreat:
      'Retry storms are back after a partial dependency recovery.',
    scenario:
      'Reinforcement: isolate a flapping dependency without melting your thread pool.',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Circuit breaker + timeout + bounded retries with jittered backoff.',
      },
      {
        id: 'B',
        text: 'Unlimited parallel retries until success.',
      },
      {
        id: 'C',
        text: 'Disable the breaker so every call always tries.',
      },
      {
        id: 'D',
        text: 'Clone the dependency in-process and skip the network.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 7,
    uptimePenalty: 0.25,
    xp: 12,
    breakdown: {
      A: 'Timeouts, bounds, and breakers are the control triad.',
      B: 'Unlimited retries are a self-DoS.',
      C: 'A always-closed breaker is no breaker.',
      D: 'In-process clones do not replace a real dependency’s data/plane.',
    },
    beginner: {
      incomingThreat: 'Retries are flooding a recovering dependency again.',
      scenario: 'What safely limits damage while it recovers?',
      choices: [
        {
          id: 'A',
          text: 'Use a circuit breaker, timeouts, and limited retries with backoff.',
        },
        {
          id: 'B',
          text: 'Retry with no limit until it works.',
        },
        {
          id: 'C',
          text: 'Turn the breaker off so every call always tries.',
        },
        {
          id: 'D',
          text: 'Copy the dependency into your process and skip the network.',
        },
      ],
      breakdown: {
        A: 'Breakers + timeouts + limited retries contain the failure.',
        B: 'Unlimited retries can take you down too.',
        C: 'A breaker that never opens does nothing.',
        D: 'You cannot fake a real external dependency in-process.',
      },
    },
  },
  'ha-data-plane': {
    id: 'wyrm-redis-replica-v2',
    conceptId: 'ha-data-plane',
    incomingThreat:
      'Single-node Redis failed again during a routine patch.',
    scenario:
      'Reinforcement: sessions and rate limits need an HA data plane. Best posture?',
    category: 'caching',
    choices: [
      {
        id: 'A',
        text: 'Managed multi-AZ Redis (or primary/replica) with tested failover.',
      },
      {
        id: 'B',
        text: 'One Redis VM and a sticky note with the SSH password.',
      },
      {
        id: 'C',
        text: 'Disable Redis and hit the primary DB on every request with no pool limits.',
      },
      {
        id: 'D',
        text: 'Run Redis only in the AZ that failed last time “for luck.”',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.24,
    xp: 12,
    breakdown: {
      A: 'Multi-AZ / replicated cache with failover is the SPOF fix.',
      B: 'Manual SSH is not failover.',
      C: 'Unbounded DB fan-out trades one outage for another.',
      D: 'Superstition is not topology.',
    },
    beginner: {
      incomingThreat: 'Single Redis died again during a patch.',
      scenario: 'What is the right HA setup for sessions/rate limits?',
      choices: [
        {
          id: 'A',
          text: 'Multi-AZ Redis (or primary + replica) with automatic failover.',
        },
        {
          id: 'B',
          text: 'One Redis and a note with the login password.',
        },
        {
          id: 'C',
          text: 'Skip Redis and hit the main DB with no limits.',
        },
        {
          id: 'D',
          text: 'Put Redis only in the zone that failed last time.',
        },
      ],
      breakdown: {
        A: 'Replicas + failover remove the single-node SPOF.',
        B: 'A password note is not high availability.',
        C: 'Unbounded DB load creates a new outage.',
        D: 'Picking a “lucky” zone is not a design.',
      },
    },
  },
}

const wyrmFlowVariant = flow({
  id: 'wyrm-ha-request-path-v2',
  conceptId: 'ha-request-path',
  incomingThreat:
    'Path drill: failover order scrambled after the last AZ blip.',
  scenario:
    'Reinforcement: order the healthy HA request / failover path.',
  category: 'faultTolerance',
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
      id: 'health-lb',
      label: 'Health-aware LB',
      rationale: 'Skip unhealthy targets.',
    },
    {
      id: 'multi-az-app',
      label: 'Surviving AZ app nodes',
      rationale: 'Serve from live capacity.',
    },
    {
      id: 'ha-data',
      label: 'HA data plane',
      rationale: 'Use failed-over DB/Redis.',
    },
    {
      id: 'respond',
      label: 'Client response',
      rationale: 'Complete on the healthy path.',
    },
  ],
  distractors: [
    {
      id: 'dead-az',
      label: 'Sticky route to dead AZ',
      rationale: 'That ignores health signals.',
    },
  ],
  beginner: {
    incomingThreat: 'The failover path got mixed up again.',
    scenario: 'Order the steps for a healthy multi-zone request.',
    stages: [
      {
        id: 'client',
        label: 'Client',
        rationale: 'Request starts here.',
      },
      {
        id: 'health-lb',
        label: 'LB with health checks',
        rationale: 'Avoid unhealthy targets.',
      },
      {
        id: 'multi-az-app',
        label: 'App in healthy zones',
        rationale: 'Use capacity that is still up.',
      },
      {
        id: 'ha-data',
        label: 'HA database / cache',
        rationale: 'Stateful layer must fail over too.',
      },
      {
        id: 'respond',
        label: 'Respond',
        rationale: 'Return success on the healthy path.',
      },
    ],
    distractors: [
      {
        id: 'dead-az',
        label: 'Send to the dead zone',
        rationale: 'Health checks exist to prevent this.',
      },
    ],
  },
})

export const spofWyrm: BossEncounter = {
  id: 'spof-wyrm',
  name: 'Single Point of Failure Wyrm',
  blurb:
    'One node, one AZ, one Redis — the wyrm feeds on every lonely dependency you left un-replicated.',
  maxHp: 94,
  threatType: 'Availability',
  artKey: 'wyrm',
  deck: [mcq(wyrmMcqs[0]), mcq(wyrmMcqs[1]), wyrmFlow, mcq(wyrmMcqs[2])],
  variants: {
    ...Object.fromEntries(
      Object.entries(wyrmVariantMcqs).map(([k, v]) => [k, mcq(v)]),
    ),
    'ha-request-path': wyrmFlowVariant,
  },
}
