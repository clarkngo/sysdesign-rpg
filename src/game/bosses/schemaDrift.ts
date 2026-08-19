import { mcq, flow, type BossEncounter, type McqCard } from '../types'

const mimicMcqs: Omit<McqCard, 'kind'>[] = [
  {
    id: 'mimic-expand-contract',
    conceptId: 'expand-contract-migrations',
    incomingThreat:
      'A “simple” column rename deploys and old pods start writing nulls into the new name — reads disagree across versions.',
    scenario:
      'You must change a schema while mixed app versions run. Which migration pattern keeps deploys safe?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Expand/contract: add new fields first, dual-write/read through transition, then remove old fields after all callers migrate.',
      },
      {
        id: 'B',
        text: 'Rename columns in place and hard-cut every service in the same second with no overlap.',
      },
      {
        id: 'C',
        text: 'Drop the old column before any code knows the new one.',
      },
      {
        id: 'D',
        text: 'Edit production rows by hand during peak traffic with no migration plan.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.3,
    xp: 14,
    breakdown: {
      A: 'Expand → dual-compatible window → contract avoids mixed-version breakage.',
      B: 'Instant hard-cuts fail under rolling deploys.',
      C: 'Dropping early orphans old writers/readers.',
      D: 'Manual peak edits invite corruption.',
    },
    beginner: {
      incomingThreat:
        'A column rename broke old pods that were still running.',
      scenario:
        'How do you change a schema safely while versions overlap?',
      choices: [
        {
          id: 'A',
          text: 'Expand first (add new fields), run both for a while, then contract (remove old) later.',
        },
        {
          id: 'B',
          text: 'Rename in place and force every service to cut over in the same second.',
        },
        {
          id: 'C',
          text: 'Delete the old column before any code uses the new one.',
        },
        {
          id: 'D',
          text: 'Edit live rows by hand at peak with no plan.',
        },
      ],
      breakdown: {
        A: 'Expand → overlap → contract keeps mixed versions safe.',
        B: 'Hard cuts break during rolling deploys.',
        C: 'Dropping early breaks old code.',
        D: 'Hand edits at peak risk data loss.',
      },
    },
  },
  {
    id: 'mimic-backward-compatible',
    conceptId: 'backward-compatible-deploys',
    incomingThreat:
      'API clients on v1 still send the old field while the server only accepts the new shape — 400s spike mid-rollout.',
    scenario:
      'Rolling deploys mean old and new binaries coexist. What deploy rule prevents schema/API drift outages?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Ship backward-compatible changes first (accept old + new); only drop old shapes after clients/servers have moved.',
      },
      {
        id: 'B',
        text: 'Reject all old fields immediately on the first canary pod.',
      },
      {
        id: 'C',
        text: 'Skip versioning and change request shapes every hour.',
      },
      {
        id: 'D',
        text: 'Deploy DB-breaking changes before any application code.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 22,
    bossHealOnMiss: 7,
    uptimePenalty: 0.32,
    xp: 15,
    breakdown: {
      A: 'Compatibility windows let rolling fleets and clients migrate safely.',
      B: 'Early hard rejection breaks still-rolling old callers.',
      C: 'Unversioned thrash guarantees client breakage.',
      D: 'Schema breaks before code readiness cause outages.',
    },
    beginner: {
      incomingThreat:
        'Old clients still send the old field while new servers reject it mid-rollout.',
      scenario:
        'What deploy rule avoids this?',
      choices: [
        {
          id: 'A',
          text: 'Accept old and new shapes first; remove the old shape only after everyone moved.',
        },
        {
          id: 'B',
          text: 'Reject old fields on the very first canary pod.',
        },
        {
          id: 'C',
          text: 'Change request shapes every hour with no versions.',
        },
        {
          id: 'D',
          text: 'Break the database schema before updating any app code.',
        },
      ],
      breakdown: {
        A: 'Compatibility first, cleanup later.',
        B: 'Early rejection breaks old callers still in the fleet.',
        C: 'No versioning means constant breakage.',
        D: 'DB breaks before code is ready cause outages.',
      },
    },
  },
  {
    id: 'mimic-dual-write-online',
    conceptId: 'dual-write-online-migration',
    incomingThreat:
      'A dual-write migration silently diverged — one store got the update, the other did not, and nobody reconciled.',
    scenario:
      'You are moving data online with dual writes and a backfill. What pitfall must you plan for, and what pattern helps?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Dual writes can diverge; use idempotent writes, reconciliation/backfill checks, and a clear cutover — prefer expand/contract over forever dual-write.',
      },
      {
        id: 'B',
        text: 'Dual-write forever with no comparison jobs and call it done.',
      },
      {
        id: 'C',
        text: 'Write only to the new store while old readers still point at the empty old store.',
      },
      {
        id: 'D',
        text: 'Skip backfill because “traffic will fill it eventually.”',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.28,
    xp: 14,
    breakdown: {
      A: 'Divergence is the dual-write tax — reconcile, verify, then contract.',
      B: 'Endless dual-write without checks hides silent split-brain data.',
      C: 'Writers ahead of readers create empty reads.',
      D: 'Cold keys never backfill themselves.',
    },
    beginner: {
      incomingThreat:
        'Dual writes drifted — one database got the change, the other did not.',
      scenario:
        'What must an online migration plan include?',
      choices: [
        {
          id: 'A',
          text: 'Expect dual-write drift; reconcile/backfill, verify, then stop dual-writing.',
        },
        {
          id: 'B',
          text: 'Dual-write forever and never compare the two stores.',
        },
        {
          id: 'C',
          text: 'Write only to the new store while readers still use the empty old one.',
        },
        {
          id: 'D',
          text: 'Skip backfill and hope traffic fills everything.',
        },
      ],
      breakdown: {
        A: 'Reconcile and cut over — do not dual-write forever blindly.',
        B: 'No checks means silent data drift.',
        C: 'Readers on empty stores look like data loss.',
        D: 'Unused keys never get filled by traffic.',
      },
    },
  },
]

const mimicFlow = flow({
  id: 'mimic-schema-path',
  conceptId: 'schema-migration-path',
  incomingThreat:
    'The Mimic swapped your migration steps — order is wrong.',
  scenario:
    'Order the safe schema change: expand schema → deploy dual-compatible code → migrate data → contract/cleanup.',
  category: 'database',
  damageOnHit: 18,
  bossHealOnMiss: 7,
  uptimePenalty: 0.3,
  xp: 16,
  stages: [
    {
      id: 'expand',
      label: 'Expand schema',
      rationale: 'Add new columns/tables/indexes without removing the old shape yet.',
    },
    {
      id: 'dual-compatible',
      label: 'Deploy dual-compatible code',
      rationale: 'Ship readers/writers that understand old and new during the overlap window.',
    },
    {
      id: 'migrate',
      label: 'Migrate data',
      rationale: 'Backfill and dual-write/reconcile until the new shape is complete and verified.',
    },
    {
      id: 'contract',
      label: 'Contract / cleanup',
      rationale: 'Remove old fields, dual-writes, and compatibility shims after cutover.',
    },
  ],
  distractors: [
    {
      id: 'drop-first',
      label: 'Drop old columns first',
      rationale: 'Breaks mixed-version readers/writers.',
    },
    {
      id: 'skip-compat',
      label: 'Skip compatibility window',
      rationale: 'Rolling deploys will fail mid-fleet.',
    },
  ],
  beginner: {
    incomingThreat:
      'The schema migration steps got mixed up — put them in order.',
    scenario:
      'Order: expand schema → ship dual-compatible code → migrate data → clean up/contract.',
    stages: [
      {
        id: 'expand',
        label: 'Expand schema',
        rationale: 'Add the new shape; keep the old one.',
      },
      {
        id: 'dual-compatible',
        label: 'Deploy dual-compatible code',
        rationale: 'Code must handle old and new together.',
      },
      {
        id: 'migrate',
        label: 'Migrate data',
        rationale: 'Backfill and reconcile into the new shape.',
      },
      {
        id: 'contract',
        label: 'Contract / cleanup',
        rationale: 'Remove the old shape after everyone moved.',
      },
    ],
    distractors: [
      {
        id: 'drop-first',
        label: 'Drop old columns first',
        rationale: 'Old code will break.',
      },
      {
        id: 'skip-compat',
        label: 'Skip compatibility window',
        rationale: 'Rolling deploys need overlap time.',
      },
    ],
  },
})

const mimicVariantMcqs: Record<string, Omit<McqCard, 'kind'>> = {
  'expand-contract-migrations': {
    id: 'mimic-expand-contract-v2',
    conceptId: 'expand-contract-migrations',
    incomingThreat:
      'Someone proposes ALTER … RENAME in prod during a rolling deploy.',
    scenario:
      'Reinforcement: mixed-version schema change. Correct pattern?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Add new column, dual-support, backfill, switch reads/writes, then drop old — expand/contract.',
      },
      {
        id: 'B',
        text: 'Rename in one migration and restart all regions with no overlap.',
      },
      {
        id: 'C',
        text: 'Truncate the table so “schema is clean.”',
      },
      {
        id: 'D',
        text: 'Store two incompatible JSON blobs in the same cell forever.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.26,
    xp: 12,
    breakdown: {
      A: 'Expand/contract is the durable zero-downtime pattern.',
      B: 'No-overlap renames fail under rolling fleets.',
      C: 'Truncate is data loss, not migration.',
      D: 'Ambiguous dual blobs without a plan become permanent drift.',
    },
    beginner: {
      incomingThreat: 'A one-step rename is proposed during a rolling deploy.',
      scenario: 'What pattern should you use instead?',
      choices: [
        {
          id: 'A',
          text: 'Add new column, support both, backfill, switch, then drop old.',
        },
        {
          id: 'B',
          text: 'Rename in one step and restart everywhere with no overlap.',
        },
        {
          id: 'C',
          text: 'Truncate the table to “clean” the schema.',
        },
        {
          id: 'D',
          text: 'Stuff two incompatible formats in one cell forever.',
        },
      ],
      breakdown: {
        A: 'That is expand/contract.',
        B: 'No-overlap renames break rolling deploys.',
        C: 'Truncate deletes data.',
        D: 'Permanent dual formats without a plan = drift.',
      },
    },
  },
  'backward-compatible-deploys': {
    id: 'mimic-backward-compatible-v2',
    conceptId: 'backward-compatible-deploys',
    incomingThreat:
      'Mobile clients on an old build still call /v1 while the gateway only routes /v2.',
    scenario:
      'Reinforcement: versioned APIs during migration. Sound approach?',
    category: 'faultTolerance',
    choices: [
      {
        id: 'A',
        text: 'Keep versioned APIs; support v1 until clients migrate; deprecate with a timeline, then remove.',
      },
      {
        id: 'B',
        text: 'Hard-cut /v1 off the moment /v2 ships.',
      },
      {
        id: 'C',
        text: 'Reuse the same URL with incompatible bodies and no negotiation.',
      },
      {
        id: 'D',
        text: 'Change field types in place weekly without notice.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 7,
    uptimePenalty: 0.25,
    xp: 12,
    breakdown: {
      A: 'Versioned APIs + deprecation windows are how clients migrate safely.',
      B: 'Instant hard-cuts break old mobile builds.',
      C: 'Silent incompatible bodies cause mysterious failures.',
      D: 'Unannounced type thrash destroys trust and clients.',
    },
    beginner: {
      incomingThreat: 'Old mobile apps still call /v1 after /v2 launched.',
      scenario: 'How should versioned APIs be handled?',
      choices: [
        {
          id: 'A',
          text: 'Keep /v1 working until clients migrate; deprecate, then remove later.',
        },
        {
          id: 'B',
          text: 'Turn off /v1 the second /v2 ships.',
        },
        {
          id: 'C',
          text: 'Reuse one URL with incompatible bodies and no warning.',
        },
        {
          id: 'D',
          text: 'Change field types every week with no notice.',
        },
      ],
      breakdown: {
        A: 'Support old versions through a deprecation window.',
        B: 'Instant cutoffs break old apps.',
        C: 'Silent breaking changes are chaos.',
        D: 'Surprise type changes break clients.',
      },
    },
  },
  'dual-write-online-migration': {
    id: 'mimic-dual-write-online-v2',
    conceptId: 'dual-write-online-migration',
    incomingThreat:
      'Cutover day: dual-write still on, backfill incomplete, dashboards disagree.',
    scenario:
      'Reinforcement: online migration readiness. What must be true before contracting?',
    category: 'database',
    choices: [
      {
        id: 'A',
        text: 'Backfill complete, reconciliation clean, readers on new shape — then stop dual-write and remove old paths.',
      },
      {
        id: 'B',
        text: 'Contract immediately while backfill is still running.',
      },
      {
        id: 'C',
        text: 'Ignore row-count mismatches as “eventual.”',
      },
      {
        id: 'D',
        text: 'Delete the old store before verifying the new one.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.24,
    xp: 12,
    breakdown: {
      A: 'Verify completeness before dual-write teardown and contract.',
      B: 'Contracting mid-backfill orphans data.',
      C: 'Mismatch is a stop-the-line signal, not noise.',
      D: 'Deleting the source of truth early is irreversible risk.',
    },
    beginner: {
      incomingThreat: 'Dual-write is still on and backfill is not finished.',
      scenario: 'When can you contract / clean up?',
      choices: [
        {
          id: 'A',
          text: 'After backfill and checks look good and readers use the new shape.',
        },
        {
          id: 'B',
          text: 'Right away, even while backfill is still running.',
        },
        {
          id: 'C',
          text: 'Whenever row counts disagree — call it “eventual.”',
        },
        {
          id: 'D',
          text: 'Delete the old store before checking the new one.',
        },
      ],
      breakdown: {
        A: 'Verify first, then stop dual-write and clean up.',
        B: 'Cleaning up mid-backfill loses data.',
        C: 'Mismatches mean stop and fix.',
        D: 'Deleting old data early is dangerous.',
      },
    },
  },
}

const mimicFlowVariant = flow({
  id: 'mimic-schema-path-v2',
  conceptId: 'schema-migration-path',
  incomingThreat:
    'Path drill: expand → dual-compatible → migrate → contract got shuffled.',
  scenario:
    'Reinforcement: order the expand/contract schema migration path.',
  category: 'database',
  damageOnHit: 16,
  bossHealOnMiss: 6,
  uptimePenalty: 0.25,
  xp: 12,
  stages: [
    {
      id: 'expand',
      label: 'Expand schema',
      rationale: 'Add without removing.',
    },
    {
      id: 'dual-compatible',
      label: 'Deploy dual-compatible code',
      rationale: 'Overlap window.',
    },
    {
      id: 'migrate',
      label: 'Migrate data',
      rationale: 'Backfill and reconcile.',
    },
    {
      id: 'contract',
      label: 'Contract / cleanup',
      rationale: 'Remove the old shape.',
    },
  ],
  distractors: [
    {
      id: 'drop-first',
      label: 'Drop old columns first',
      rationale: 'Breaks mixed versions.',
    },
  ],
  beginner: {
    incomingThreat: 'The migration order got scrambled again.',
    scenario: 'Put expand → dual-compatible → migrate → contract back in order.',
    stages: [
      {
        id: 'expand',
        label: 'Expand',
        rationale: 'Add the new schema.',
      },
      {
        id: 'dual-compatible',
        label: 'Dual-compatible code',
        rationale: 'Support both shapes.',
      },
      {
        id: 'migrate',
        label: 'Migrate',
        rationale: 'Move the data.',
      },
      {
        id: 'contract',
        label: 'Contract',
        rationale: 'Clean up the old shape.',
      },
    ],
    distractors: [
      {
        id: 'drop-first',
        label: 'Drop old columns first',
        rationale: 'That breaks old code.',
      },
    ],
  },
})

export const schemaDriftMimic: BossEncounter = {
  id: 'schema-drift-mimic',
  name: 'Schema Drift Mimic',
  blurb:
    'It wears yesterday’s schema — expand carefully, stay dual-compatible, migrate, then contract before the mimic wins.',
  maxHp: 94,
  threatType: 'Data Loss',
  artKey: 'mimic',
  deck: [mcq(mimicMcqs[0]), mcq(mimicMcqs[1]), mimicFlow, mcq(mimicMcqs[2])],
  variants: {
    ...Object.fromEntries(
      Object.entries(mimicVariantMcqs).map(([k, v]) => [k, mcq(v)]),
    ),
    'schema-migration-path': mimicFlowVariant,
  },
}
