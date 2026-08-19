export type MasteryKey =
  | 'caching'
  | 'database'
  | 'loadBalancing'
  | 'faultTolerance'
  | 'security'

export type ChoiceId = 'A' | 'B' | 'C' | 'D'

export type Difficulty = 'beginner' | 'standard'

export type ArtKey =
  | 'herd'
  | 'hydra'
  | 'wyrm'
  | 'leak'
  | 'storm'
  | 'golem'
  | 'wraith'
  | 'shadow'
  | 'lurker'
  | 'wisp'
  | 'mimic'
  | 'kraken'
  | 'sphinx'
  | 'serpent'
  | 'chronos'
  | 'imp'

export interface Choice {
  id: ChoiceId
  text: string
}

interface CardBase {
  id: string
  conceptId: string
  incomingThreat: string
  scenario: string
  category: MasteryKey
  damageOnHit: number
  bossHealOnMiss: number
  uptimePenalty: number
  xp: number
}

export interface McqCard extends CardBase {
  kind: 'mcq'
  choices: Choice[]
  correct: ChoiceId
  hintEliminate: ChoiceId
  breakdown: Record<ChoiceId, string>
  /** Easier wording; same correct id / concept */
  beginner?: {
    incomingThreat?: string
    scenario?: string
    choices?: Choice[]
    breakdown?: Record<ChoiceId, string>
  }
}

export interface FlowStage {
  id: string
  label: string
  rationale: string
}

export interface FlowCard extends CardBase {
  kind: 'flow'
  stages: FlowStage[]
  distractors?: FlowStage[]
  beginner?: {
    incomingThreat?: string
    scenario?: string
    stages?: FlowStage[]
    distractors?: FlowStage[]
  }
}

export type EncounterCard = McqCard | FlowCard

export interface BossEncounter {
  id: string
  name: string
  blurb: string
  maxHp: number
  threatType: string
  artKey: ArtKey
  deck: EncounterCard[]
  variants: Record<string, EncounterCard>
}

export const MASTERY_LABELS: Record<MasteryKey, string> = {
  caching: 'Caching & CDN Strategy',
  database: 'DB Sharding & Consistency',
  loadBalancing: 'Load Balancing & Queuing',
  faultTolerance: 'Fault Tolerance & HA',
  security: 'Security, IAM & API Gateway',
}

export const HINT_UPTIME_COST = 0.08
export const DIFFICULTY_KEY = 'sysdesign-rpg-difficulty'
export const DEFAULT_DIFFICULTY: Difficulty = 'beginner'

export function isMcqCard(card: EncounterCard): card is McqCard {
  return card.kind === 'mcq'
}

export function isFlowCard(card: EncounterCard): card is FlowCard {
  return card.kind === 'flow'
}

export function flowPool(card: FlowCard): FlowStage[] {
  return [...card.stages, ...(card.distractors ?? [])]
}

export function mcq(card: Omit<McqCard, 'kind'>): McqCard {
  return { ...card, kind: 'mcq' }
}

export function flow(card: Omit<FlowCard, 'kind'>): FlowCard {
  return { ...card, kind: 'flow' }
}

/** Same scenario identity; beginner uses clearer Q&A wording. */
export function withDifficulty(
  card: EncounterCard,
  difficulty: Difficulty,
): EncounterCard {
  if (difficulty === 'standard') return card
  if (card.kind === 'mcq') {
    const b = card.beginner
    if (!b) return card
    return {
      ...card,
      incomingThreat: b.incomingThreat ?? card.incomingThreat,
      scenario: b.scenario ?? card.scenario,
      choices: b.choices ?? card.choices,
      breakdown: b.breakdown ?? card.breakdown,
    }
  }
  const b = card.beginner
  if (!b) return card
  return {
    ...card,
    incomingThreat: b.incomingThreat ?? card.incomingThreat,
    scenario: b.scenario ?? card.scenario,
    stages: b.stages ?? card.stages,
    distractors: b.distractors ?? card.distractors,
  }
}

export function loadDifficulty(): Difficulty {
  try {
    const v = localStorage.getItem(DIFFICULTY_KEY)
    if (v === 'standard' || v === 'beginner') return v
  } catch {
    /* ignore */
  }
  return DEFAULT_DIFFICULTY
}

export function saveDifficulty(d: Difficulty) {
  localStorage.setItem(DIFFICULTY_KEY, d)
}
