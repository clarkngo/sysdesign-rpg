import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  HINT_UPTIME_COST,
  isFlowCard,
  isMcqCard,
  withDifficulty,
  type BossEncounter,
  type ChoiceId,
  type Difficulty,
  type EncounterCard,
  type MasteryKey,
} from './encounters'
import {
  clearSave,
  loadSave,
  writeSave,
  type GameSave,
} from './save'

export type Phase = 'choose' | 'resolve' | 'victory'

export interface ResolveResult {
  correct: boolean
  kind: 'mcq' | 'flow'
  choice: ChoiceId | null
  submittedOrder: string[] | null
  firstWrongIndex: number | null
  xp: number
  damageDealt: number
  bossHealed: number
  uptimeLost: number
  requeued: boolean
}

const INITIAL_MASTERY: Record<MasteryKey, number> = {
  caching: 12,
  database: 8,
  loadBalancing: 10,
  faultTolerance: 6,
  security: 4,
}

const INITIAL_UPTIME = 99.95

function clampUptime(value: number) {
  return Math.max(90, +value.toFixed(2))
}

function cardIndex(boss: BossEncounter): Map<string, EncounterCard> {
  const map = new Map<string, EncounterCard>()
  for (const c of boss.deck) map.set(c.id, c)
  for (const c of Object.values(boss.variants)) map.set(c.id, c)
  return map
}

function resolveCards(boss: BossEncounter, ids: string[]): EncounterCard[] {
  const idx = cardIndex(boss)
  return ids.map((id) => idx.get(id)).filter((c): c is EncounterCard => Boolean(c))
}

function normalizeResult(raw: ResolveResult | null): ResolveResult | null {
  if (!raw) return null
  return {
    correct: raw.correct,
    kind: raw.kind ?? (raw.choice ? 'mcq' : 'flow'),
    choice: raw.choice ?? null,
    submittedOrder: raw.submittedOrder ?? null,
    firstWrongIndex: raw.firstWrongIndex ?? null,
    xp: raw.xp,
    damageDealt: raw.damageDealt,
    bossHealed: raw.bossHealed,
    uptimeLost: raw.uptimeLost,
    requeued: raw.requeued,
  }
}

function freshState(boss: BossEncounter) {
  return {
    enemyHp: boss.maxHp,
    uptime: INITIAL_UPTIME,
    mastery: { ...INITIAL_MASTERY },
    phase: 'choose' as Phase,
    remaining: boss.deck.slice(1),
    requeue: [] as EncounterCard[],
    card: (boss.deck[0] ?? null) as EncounterCard | null,
    eliminated: null as ChoiceId | null,
    hintUsed: false,
    flowHintFirst: false,
    lastResult: null as ResolveResult | null,
    scenariosSeen: 1,
  }
}

function hydrateFromSave(boss: BossEncounter, save: GameSave) {
  if (save.bossId !== boss.id) return freshState(boss)
  const idx = cardIndex(boss)
  const card = save.cardId ? idx.get(save.cardId) ?? null : null
  return {
    enemyHp: save.enemyHp,
    uptime: save.uptime,
    mastery: { ...INITIAL_MASTERY, ...save.mastery },
    phase: save.phase,
    remaining: resolveCards(boss, save.remainingIds),
    requeue: resolveCards(boss, save.requeueIds),
    card,
    eliminated: save.eliminated,
    hintUsed: save.hintUsed,
    flowHintFirst: Boolean(save.flowHintFirst),
    lastResult: normalizeResult(save.lastResult),
    scenariosSeen: save.scenariosSeen,
  }
}

function ordersMatch(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, i) => id === b[i])
}

function firstMismatch(submitted: string[], correct: string[]) {
  const n = Math.max(submitted.length, correct.length)
  for (let i = 0; i < n; i++) {
    if (submitted[i] !== correct[i]) return i
  }
  return null
}

export function useEncounter(boss: BossEncounter, difficulty: Difficulty) {
  const [hydrated] = useState(() => {
    const existing = loadSave()
    if (existing && existing.bossId === boss.id) {
      return hydrateFromSave(boss, existing)
    }
    return freshState(boss)
  })

  const [enemyHp, setEnemyHp] = useState(hydrated.enemyHp)
  const [uptime, setUptime] = useState(hydrated.uptime)
  const [mastery, setMastery] = useState(hydrated.mastery)
  const [phase, setPhase] = useState<Phase>(hydrated.phase)
  const [remaining, setRemaining] = useState<EncounterCard[]>(hydrated.remaining)
  const [requeue, setRequeue] = useState<EncounterCard[]>(hydrated.requeue)
  const [card, setCard] = useState<EncounterCard | null>(hydrated.card)
  const [eliminated, setEliminated] = useState<ChoiceId | null>(hydrated.eliminated)
  const [hintUsed, setHintUsed] = useState(hydrated.hintUsed)
  const [flowHintFirst, setFlowHintFirst] = useState(hydrated.flowHintFirst)
  const [lastResult, setLastResult] = useState<ResolveResult | null>(
    hydrated.lastResult,
  )
  const [hitFlash, setHitFlash] = useState(false)
  const [scenariosSeen, setScenariosSeen] = useState(hydrated.scenariosSeen)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)

  const scenarioTotal = boss.deck.length
  const scenarioIndex = Math.min(Math.max(scenariosSeen, 1), scenarioTotal)

  const overall = useMemo(
    () =>
      Math.round(
        Object.values(mastery).reduce((a, b) => a + b, 0) /
          Object.values(mastery).length,
      ),
    [mastery],
  )

  const buildSave = useCallback((): GameSave => {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      bossId: boss.id,
      difficulty,
      enemyHp,
      uptime,
      mastery,
      phase,
      cardId: card?.id ?? null,
      remainingIds: remaining.map((c) => c.id),
      requeueIds: requeue.map((c) => c.id),
      eliminated,
      hintUsed,
      flowHintFirst,
      scenariosSeen,
      lastResult,
    }
  }, [
    boss.id,
    difficulty,
    enemyHp,
    uptime,
    mastery,
    phase,
    card,
    remaining,
    requeue,
    eliminated,
    hintUsed,
    flowHintFirst,
    scenariosSeen,
    lastResult,
  ])

  useEffect(() => {
    writeSave(buildSave())
  }, [buildSave])

  const applySave = useCallback(
    (save: GameSave) => {
      const next = hydrateFromSave(boss, save)
      setEnemyHp(next.enemyHp)
      setUptime(next.uptime)
      setMastery(next.mastery)
      setPhase(next.phase)
      setRemaining(next.remaining)
      setRequeue(next.requeue)
      setCard(next.card)
      setEliminated(next.eliminated)
      setHintUsed(next.hintUsed)
      setFlowHintFirst(next.flowHintFirst)
      setLastResult(next.lastResult)
      setScenariosSeen(next.scenariosSeen)
      setHitFlash(false)
      writeSave({ ...save, exportedAt: new Date().toISOString() })
      setSaveNotice('Save imported')
      window.setTimeout(() => setSaveNotice(null), 2500)
    },
    [boss],
  )

  const resetFight = useCallback(() => {
    const next = freshState(boss)
    setEnemyHp(next.enemyHp)
    setUptime(next.uptime)
    setMastery(next.mastery)
    setPhase(next.phase)
    setRemaining(next.remaining)
    setRequeue(next.requeue)
    setCard(next.card)
    setEliminated(next.eliminated)
    setHintUsed(next.hintUsed)
    setFlowHintFirst(next.flowHintFirst)
    setLastResult(next.lastResult)
    setScenariosSeen(next.scenariosSeen)
    setHitFlash(false)
    clearSave()
    writeSave({
      version: 1,
      exportedAt: new Date().toISOString(),
      bossId: boss.id,
      enemyHp: next.enemyHp,
      uptime: next.uptime,
      mastery: next.mastery,
      phase: next.phase,
      cardId: next.card?.id ?? null,
      remainingIds: next.remaining.map((c) => c.id),
      requeueIds: [],
      eliminated: null,
      hintUsed: false,
      flowHintFirst: false,
      scenariosSeen: 1,
      lastResult: null,
    })
    setSaveNotice('Progress reset')
    window.setTimeout(() => setSaveNotice(null), 2500)
  }, [boss])

  const flash = useCallback(() => {
    setHitFlash(true)
    window.setTimeout(() => setHitFlash(false), 450)
  }, [])

  const enqueueVariant = useCallback(
    (conceptId: string) => {
      const variant = boss.variants[conceptId]
      if (!variant) return false
      setRequeue((q) =>
        q.some((c) => c.conceptId === variant.conceptId) ? q : [...q, variant],
      )
      return true
    },
    [boss],
  )

  const useHint = useCallback(() => {
    if (phase !== 'choose' || !card || hintUsed || enemyHp <= 0) return
    setHintUsed(true)
    setUptime((u) => clampUptime(u - HINT_UPTIME_COST))
    if (isMcqCard(card)) {
      setEliminated(card.hintEliminate)
    } else if (isFlowCard(card)) {
      setFlowHintFirst(true)
    }
  }, [phase, card, hintUsed, enemyHp])

  const answer = useCallback(
    (choice: ChoiceId) => {
      if (phase !== 'choose' || !card || !isMcqCard(card) || enemyHp <= 0) return
      if (eliminated === choice) return

      const correct = choice === card.correct
      flash()
      setPhase('resolve')

      if (correct) {
        const damageDealt = card.damageOnHit
        setEnemyHp((hp) => Math.max(0, hp - damageDealt))
        setMastery((m) => ({
          ...m,
          [card.category]: Math.min(100, m[card.category] + card.xp),
        }))
        setLastResult({
          correct: true,
          kind: 'mcq',
          choice,
          submittedOrder: null,
          firstWrongIndex: null,
          xp: card.xp,
          damageDealt,
          bossHealed: 0,
          uptimeLost: 0,
          requeued: false,
        })
        return
      }

      const willRequeue = enqueueVariant(card.conceptId)
      setUptime((u) => clampUptime(u - card.uptimePenalty))
      setEnemyHp((hp) => Math.min(boss.maxHp, hp + card.bossHealOnMiss))
      setLastResult({
        correct: false,
        kind: 'mcq',
        choice,
        submittedOrder: null,
        firstWrongIndex: null,
        xp: 0,
        damageDealt: 0,
        bossHealed: card.bossHealOnMiss,
        uptimeLost: card.uptimePenalty,
        requeued: willRequeue,
      })
    },
    [phase, card, enemyHp, eliminated, flash, boss.maxHp, enqueueVariant],
  )

  const submitFlow = useCallback(
    (order: string[]) => {
      if (phase !== 'choose' || !card || !isFlowCard(card) || enemyHp <= 0) return
      const correctIds = card.stages.map((s) => s.id)
      const correct = ordersMatch(order, correctIds)
      flash()
      setPhase('resolve')

      if (correct) {
        const damageDealt = card.damageOnHit
        setEnemyHp((hp) => Math.max(0, hp - damageDealt))
        setMastery((m) => ({
          ...m,
          [card.category]: Math.min(100, m[card.category] + card.xp),
        }))
        setLastResult({
          correct: true,
          kind: 'flow',
          choice: null,
          submittedOrder: order,
          firstWrongIndex: null,
          xp: card.xp,
          damageDealt,
          bossHealed: 0,
          uptimeLost: 0,
          requeued: false,
        })
        return
      }

      const willRequeue = enqueueVariant(card.conceptId)
      setUptime((u) => clampUptime(u - card.uptimePenalty))
      setEnemyHp((hp) => Math.min(boss.maxHp, hp + card.bossHealOnMiss))
      setLastResult({
        correct: false,
        kind: 'flow',
        choice: null,
        submittedOrder: order,
        firstWrongIndex: firstMismatch(order, correctIds),
        xp: 0,
        damageDealt: 0,
        bossHealed: card.bossHealOnMiss,
        uptimeLost: card.uptimePenalty,
        requeued: willRequeue,
      })
    },
    [phase, card, enemyHp, flash, boss.maxHp, enqueueVariant],
  )

  const continueFight = useCallback(() => {
    if (phase !== 'resolve') return

    if (enemyHp <= 0) {
      setPhase('victory')
      setLastResult(null)
      setEliminated(null)
      setHintUsed(false)
      setFlowHintFirst(false)
      return
    }

    let next: EncounterCard | undefined
    let nextRemaining = remaining
    let nextRequeue = requeue

    if (remaining.length > 0) {
      next = remaining[0]
      nextRemaining = remaining.slice(1)
    } else if (requeue.length > 0) {
      next = requeue[0]
      nextRequeue = requeue.slice(1)
      nextRemaining = []
    }

    if (!next) {
      setPhase('victory')
      setCard(null)
      setLastResult(null)
      setEliminated(null)
      setHintUsed(false)
      setFlowHintFirst(false)
      setRemaining([])
      setRequeue([])
      return
    }

    setRemaining(nextRemaining)
    setRequeue(nextRequeue)
    setCard(next)
    setScenariosSeen((n) => n + 1)
    setPhase('choose')
    setLastResult(null)
    setEliminated(null)
    setHintUsed(false)
    setFlowHintFirst(false)
  }, [phase, enemyHp, remaining, requeue])

  const displayCard = useMemo(
    () => (card ? withDifficulty(card, difficulty) : null),
    [card, difficulty],
  )

  return {
    boss,
    enemyHp,
    uptime,
    mastery,
    overall,
    phase,
    card: displayCard,
    scenarioIndex,
    scenarioTotal,
    eliminated,
    hintUsed,
    flowHintFirst,
    lastResult,
    hitFlash,
    hintCost: HINT_UPTIME_COST,
    saveNotice,
    buildSave,
    applySave,
    resetFight,
    answer,
    submitFlow,
    useHint,
    continueFight,
  }
}
