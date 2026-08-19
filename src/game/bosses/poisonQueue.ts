import { mcq, flow, type BossEncounter, type McqCard } from '../types'

const wraithMcqs: Omit<McqCard, 'kind'>[] = [
  {
    id: 'wraith-poison-message',
    conceptId: 'poison-messages',
    incomingThreat:
      'One malformed payload crashes the consumer on every delivery — the queue never drains.',
    scenario:
      'A single bad JSON message causes an uncaught exception; the broker redelivers forever and lag climbs. What is this failure mode?',
    category: 'loadBalancing',
    choices: [
      {
        id: 'A',
        text: 'A poison message driving an infinite retry loop — isolate it (DLQ) instead of blocking the queue.',
      },
      {
        id: 'B',
        text: 'Healthy backpressure — leave the bad message at the head forever.',
      },
      {
        id: 'C',
        text: 'Proof that all producers should share one global mutable cursor.',
      },
      {
        id: 'D',
        text: 'A sign to disable acknowledgements so nothing is ever retried.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.3,
    xp: 14,
    breakdown: {
      A: 'Poison messages must be quarantined (DLQ / skip) so valid work can proceed.',
      B: 'Parking a poison at the head starves the entire consumer group.',
      C: 'Shared mutable cursors are a concurrency hazard, not a poison fix.',
      D: 'Never acking loses progress and can still loop on redelivery policies.',
    },
    beginner: {
      incomingThreat:
        'One bad message keeps crashing the worker, so the queue never empties.',
      scenario:
        'The same malformed message is redelivered forever. What is going on?',
      choices: [
        {
          id: 'A',
          text: 'A poison message in an infinite retry loop — move it aside (DLQ).',
        },
        {
          id: 'B',
          text: 'Normal backpressure — leave the bad message at the front forever.',
        },
        {
          id: 'C',
          text: 'All producers should share one global cursor.',
        },
        {
          id: 'D',
          text: 'Turn off acknowledgements so nothing is ever retried.',
        },
      ],
      breakdown: {
        A: 'Quarantine the poison so good messages can flow.',
        B: 'A stuck head-of-line poison blocks everything.',
        C: 'Shared cursors are not the fix.',
        D: 'Never acking loses progress and may still redeliver.',
      },
    },
  },
  {
    id: 'wraith-dlq-idempotent',
    conceptId: 'dlq-idempotent-consumers',
    incomingThreat:
      'Ops wants to “just replay the DLQ” while the consumer still is not idempotent.',
    scenario:
      'Poison messages were moved to a dead-letter queue. Before replay, side effects may run twice. What pair of practices is required?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Fix the consumer, ensure idempotent processing, then replay DLQ safely in controlled batches.',
      },
      {
        id: 'B',
        text: 'Blindly dump the entire DLQ into prod at max concurrency with no dedupe.',
      },
      {
        id: 'C',
        text: 'Delete the DLQ unread so failures never surface.',
      },
      {
        id: 'D',
        text: 'Replay by publishing random new ids that ignore the original keys.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 22,
    bossHealOnMiss: 7,
    uptimePenalty: 0.32,
    xp: 15,
    breakdown: {
      A: 'DLQ is quarantine — remediate the handler and make processing idempotent before controlled replay.',
      B: 'Blind max-concurrency replay re-poisons prod and duplicates side effects.',
      C: 'Deleting unread DLQ hides data-loss and bug signal.',
      D: 'New random ids break correlation and can double-apply business effects.',
    },
    beginner: {
      incomingThreat:
        'Bad messages are in the DLQ. Someone wants to replay them before the bug is fixed.',
      scenario:
        'What should you do before and during DLQ replay?',
      choices: [
        {
          id: 'A',
          text: 'Fix the consumer, make it idempotent, then replay carefully in batches.',
        },
        {
          id: 'B',
          text: 'Dump the whole DLQ into prod as fast as possible with no dedupe.',
        },
        {
          id: 'C',
          text: 'Delete the DLQ without reading it.',
        },
        {
          id: 'D',
          text: 'Replay with brand-new random ids that ignore the originals.',
        },
      ],
      breakdown: {
        A: 'Fix first, idempotent processing, then careful replay.',
        B: 'Blind fast replay re-breaks prod and doubles side effects.',
        C: 'Deleting unread DLQ loses signal and data.',
        D: 'New ids can apply the same business action twice.',
      },
    },
  },
  {
    id: 'wraith-visibility-timeout',
    conceptId: 'visibility-timeout',
    incomingThreat:
      'Long handlers lose the message mid-work; another consumer picks it up and both commit.',
    scenario:
      'Visibility timeout is shorter than processing time; retries overlap. Infinite loops appear when failures always requeue. Correct control?',
    category: 'loadBalancing',
    choices: [
      {
        id: 'A',
        text: 'Align visibility timeout with processing, extend while working, cap retries, then DLQ.',
      },
      {
        id: 'B',
        text: 'Set visibility timeout to zero so every consumer always races the same message.',
      },
      {
        id: 'C',
        text: 'Never ACK or delete — rely on timeout alone forever.',
      },
      {
        id: 'D',
        text: 'Disable the DLQ and retry without a maximum attempt count.',
      },
    ],
    correct: 'A',
    hintEliminate: 'D',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.28,
    xp: 14,
    breakdown: {
      A: 'Visibility must cover work (with extensions); bounded retries + DLQ stop infinite loops.',
      B: 'Zero visibility guarantees duplicate concurrent processing.',
      C: 'Never completing messages creates permanent invisibility churn and lag.',
      D: 'Unbounded retry without DLQ is the poison loop.',
    },
    beginner: {
      incomingThreat:
        'Work takes longer than the visibility timeout, so two workers process the same message.',
      scenario:
        'How do you stop overlap and infinite requeues?',
      choices: [
        {
          id: 'A',
          text: 'Match/extend visibility to processing time, cap retries, then send to DLQ.',
        },
        {
          id: 'B',
          text: 'Set visibility timeout to zero so everyone races the same message.',
        },
        {
          id: 'C',
          text: 'Never acknowledge — only rely on timeouts forever.',
        },
        {
          id: 'D',
          text: 'Turn off the DLQ and retry with no attempt limit.',
        },
      ],
      breakdown: {
        A: 'Cover the work window, limit retries, quarantine failures.',
        B: 'Zero visibility means duplicate processing.',
        C: 'Never acking leaves messages stuck in retry churn.',
        D: 'Unlimited retries without DLQ is the poison loop.',
      },
    },
  },
]

const wraithFlow = flow({
  id: 'wraith-poison-path',
  conceptId: 'wraith-poison-path',
  incomingThreat:
    'The wraith scrambled your poison playbook — remediation hops are out of order.',
  scenario:
    'Order the poison-message response: detect the poison, isolate to DLQ, fix the consumer, then replay safely.',
  category: 'faultTolerance',
  damageOnHit: 18,
  bossHealOnMiss: 7,
  uptimePenalty: 0.3,
  xp: 16,
  stages: [
    {
      id: 'detect',
      label: 'Detect poison',
      rationale: 'Spot repeated failures / crash loops on the same payload.',
    },
    {
      id: 'isolate-dlq',
      label: 'Isolate to DLQ',
      rationale: 'Quarantine so the main queue can drain healthy work.',
    },
    {
      id: 'fix-consumer',
      label: 'Fix consumer',
      rationale: 'Patch parsing/handlers and harden idempotency before replay.',
    },
    {
      id: 'replay',
      label: 'Replay safely',
      rationale: 'Controlled, observable replay with dedupe and rate limits.',
    },
  ],
  distractors: [
    {
      id: 'blind-replay',
      label: 'Blind full-speed replay',
      rationale: 'Reintroduces poison and duplicates side effects.',
    },
    {
      id: 'drop-silent',
      label: 'Drop without recording',
      rationale: 'Silent drops are data loss without a path to repair.',
    },
  ],
  beginner: {
    incomingThreat:
      'The fix steps are mixed up — put the poison-queue response in order.',
    scenario:
      'Order: find the poison → move it to DLQ → fix the consumer → replay carefully.',
    stages: [
      {
        id: 'detect',
        label: 'Detect the poison',
        rationale: 'See which message keeps failing.',
      },
      {
        id: 'isolate-dlq',
        label: 'Isolate to DLQ',
        rationale: 'Quarantine so other messages can proceed.',
      },
      {
        id: 'fix-consumer',
        label: 'Fix the consumer',
        rationale: 'Repair the bug and make processing idempotent.',
      },
      {
        id: 'replay',
        label: 'Replay safely',
        rationale: 'Replay in controlled batches with dedupe.',
      },
    ],
    distractors: [
      {
        id: 'blind-replay',
        label: 'Replay everything at full speed',
        rationale: 'That can re-poison prod.',
      },
      {
        id: 'drop-silent',
        label: 'Drop with no record',
        rationale: 'Silent drops lose data and evidence.',
      },
    ],
  },
})

const wraithVariantMcqs: Record<string, Omit<McqCard, 'kind'>> = {
  'poison-messages': {
    id: 'wraith-poison-message-v2',
    conceptId: 'poison-messages',
    incomingThreat:
      'Lag charts flatline upward — the same payload still crashes the worker on redelivery.',
    scenario:
      'Reinforcement: head-of-line crash loop. Correct containment?',
    category: 'loadBalancing',
    choices: [
      {
        id: 'A',
        text: 'Treat as poison; after max receives, route to DLQ and continue.',
      },
      {
        id: 'B',
        text: 'Increase parallel consumers that all crash on the same message.',
      },
      {
        id: 'C',
        text: 'Block the entire topic until a human edits bytes in place on the broker.',
      },
      {
        id: 'D',
        text: 'Disable logging so crash stacks stop paging.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.26,
    xp: 12,
    breakdown: {
      A: 'Bounded retries then DLQ unblocks the queue without losing the artifact.',
      B: 'More crashers amplify thrash without progress.',
      C: 'Hard-stopping the topic is availability death; edit-in-place is brittle.',
      D: 'Hiding stacks does not drain the poison.',
    },
    beginner: {
      incomingThreat: 'The same bad message still crashes the worker on every retry.',
      scenario: 'How do you contain it?',
      choices: [
        {
          id: 'A',
          text: 'After enough failures, send it to a DLQ and keep going.',
        },
        {
          id: 'B',
          text: 'Start more consumers that all crash on the same message.',
        },
        {
          id: 'C',
          text: 'Pause the whole topic until someone edits the message on the broker.',
        },
        {
          id: 'D',
          text: 'Turn off logs so crash alerts stop.',
        },
      ],
      breakdown: {
        A: 'DLQ after max retries unblocks the queue.',
        B: 'More crashers do not fix the poison.',
        C: 'Stopping the topic hurts everyone.',
        D: 'Hiding logs does not remove the bad message.',
      },
    },
  },
  'dlq-idempotent-consumers': {
    id: 'wraith-dlq-idempotent-v2',
    conceptId: 'dlq-idempotent-consumers',
    incomingThreat:
      'A “quick” DLQ flush double-charged customers after a partial success path.',
    scenario:
      'Reinforcement: replay after quarantine. Non-negotiable requirement?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Idempotent consumers (and fix-first) before controlled DLQ replay.',
      },
      {
        id: 'B',
        text: 'At-most-never delivery by dropping ACK semantics entirely.',
      },
      {
        id: 'C',
        text: 'Replay only the messages that already succeeded in prod.',
      },
      {
        id: 'D',
        text: 'Share side-effect tokens across tenants without scoping.',
      },
    ],
    correct: 'A',
    hintEliminate: 'C',
    damageOnHit: 18,
    bossHealOnMiss: 7,
    uptimePenalty: 0.25,
    xp: 12,
    breakdown: {
      A: 'Idempotency makes safe replay possible; fix-first avoids re-poisoning.',
      B: 'Breaking ACK semantics loses reliability guarantees.',
      C: 'Replaying successes is how you double-apply effects.',
      D: 'Unscoped tokens invite cross-tenant corruption.',
    },
    beginner: {
      incomingThreat: 'A fast DLQ replay charged some customers twice.',
      scenario: 'What must be true before you replay?',
      choices: [
        {
          id: 'A',
          text: 'The consumer is fixed and idempotent; then replay carefully.',
        },
        {
          id: 'B',
          text: 'Stop acknowledging messages entirely.',
        },
        {
          id: 'C',
          text: 'Only replay messages that already succeeded.',
        },
        {
          id: 'D',
          text: 'Reuse the same side-effect tokens across all tenants.',
        },
      ],
      breakdown: {
        A: 'Fix + idempotency enables safe replay.',
        B: 'Breaking acks loses reliability.',
        C: 'Replaying successes causes duplicates.',
        D: 'Shared tokens across tenants are dangerous.',
      },
    },
  },
  'visibility-timeout': {
    id: 'wraith-visibility-timeout-v2',
    conceptId: 'visibility-timeout',
    incomingThreat:
      'Overlapping deliveries returned after a slow batch job outlived visibility.',
    scenario:
      'Reinforcement: long work vs short visibility. Correct control set?',
    category: 'loadBalancing',
    choices: [
      {
        id: 'A',
        text: 'Extend visibility during work; bound retries; DLQ exhausted attempts.',
      },
      {
        id: 'B',
        text: 'Shrink visibility further to “fail faster” into more duplicates.',
      },
      {
        id: 'C',
        text: 'Process without heartbeats and hope the timeout is lucky.',
      },
      {
        id: 'D',
        text: 'ACK at receive time before doing any work.',
      },
    ],
    correct: 'A',
    hintEliminate: 'D',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.24,
    xp: 12,
    breakdown: {
      A: 'Heartbeat/extend + capped retries + DLQ is the standard long-work pattern.',
      B: 'Shorter visibility increases duplicate overlap.',
      C: 'Hope is not a delivery control.',
      D: 'Early ACK before work risks silent loss on crash.',
    },
    beginner: {
      incomingThreat: 'Slow jobs outlive visibility and get processed twice.',
      scenario: 'What control set helps?',
      choices: [
        {
          id: 'A',
          text: 'Extend visibility while working, cap retries, then DLQ.',
        },
        {
          id: 'B',
          text: 'Make visibility even shorter.',
        },
        {
          id: 'C',
          text: 'Skip heartbeats and hope the timeout is fine.',
        },
        {
          id: 'D',
          text: 'Acknowledge as soon as you receive, before doing work.',
        },
      ],
      breakdown: {
        A: 'Extend, limit retries, quarantine failures.',
        B: 'Shorter visibility means more duplicates.',
        C: 'Hope is not a control.',
        D: 'Early ack risks losing work on crash.',
      },
    },
  },
}

const wraithFlowVariant = flow({
  id: 'wraith-poison-path-v2',
  conceptId: 'wraith-poison-path',
  incomingThreat:
    'Path drill: the wraith shuffled detect → DLQ → fix → replay.',
  scenario:
    'Reinforcement: order the poison-message remediation path.',
  category: 'faultTolerance',
  damageOnHit: 16,
  bossHealOnMiss: 6,
  uptimePenalty: 0.25,
  xp: 12,
  stages: [
    {
      id: 'detect',
      label: 'Detect poison',
      rationale: 'Identify the looping failure.',
    },
    {
      id: 'isolate-dlq',
      label: 'Isolate to DLQ',
      rationale: 'Quarantine the payload.',
    },
    {
      id: 'fix-consumer',
      label: 'Fix consumer',
      rationale: 'Repair and harden idempotency.',
    },
    {
      id: 'replay',
      label: 'Replay safely',
      rationale: 'Controlled reprocessing.',
    },
  ],
  distractors: [
    {
      id: 'blind-replay',
      label: 'Replay without a fix',
      rationale: 'Re-poisons the pipeline.',
    },
  ],
  beginner: {
    incomingThreat: 'The remediation order got scrambled again.',
    scenario: 'Put detect → DLQ → fix → replay back in order.',
    stages: [
      {
        id: 'detect',
        label: 'Detect',
        rationale: 'Find the poison.',
      },
      {
        id: 'isolate-dlq',
        label: 'DLQ',
        rationale: 'Isolate it.',
      },
      {
        id: 'fix-consumer',
        label: 'Fix',
        rationale: 'Repair the consumer.',
      },
      {
        id: 'replay',
        label: 'Replay',
        rationale: 'Replay carefully.',
      },
    ],
    distractors: [
      {
        id: 'blind-replay',
        label: 'Replay before fixing',
        rationale: 'That brings the poison back.',
      },
    ],
  },
})

export const poisonQueueWraith: BossEncounter = {
  id: 'poison-queue-wraith',
  name: 'Poison Queue Wraith',
  blurb:
    'One cursed message loops forever — quarantine to the DLQ, harden the consumer, then replay without raising the dead.',
  maxHp: 90,
  threatType: 'Data Loss',
  artKey: 'wraith',
  deck: [mcq(wraithMcqs[0]), mcq(wraithMcqs[1]), wraithFlow, mcq(wraithMcqs[2])],
  variants: {
    ...Object.fromEntries(
      Object.entries(wraithVariantMcqs).map(([k, v]) => [k, mcq(v)]),
    ),
    'wraith-poison-path': wraithFlowVariant,
  },
}
