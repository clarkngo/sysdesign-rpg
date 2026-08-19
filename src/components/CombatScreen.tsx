import { useEffect, useRef } from 'react'
import combatBg from '../assets/combat-bg.png'
import heroArt from '../assets/hero.png'
import { BOSS_ART } from '../game/bestiary'
import { playSfx } from '../audio/gameAudio'
import {
  isFlowCard,
  isMcqCard,
  type ArtKey,
  type ChoiceId,
  type EncounterCard,
  type FlowCard,
  type McqCard,
} from '../game/encounters'
import { MASTERY_LABELS } from '../game/encounters'
import type { Phase, ResolveResult } from '../game/useEncounter'
import FlowPuzzle from './FlowPuzzle'

const ENEMY_ART = BOSS_ART

interface Props {
  enemyName: string
  enemyMaxHp: number
  enemyHp: number
  uptime: number
  artKey: ArtKey
  card: EncounterCard | null
  phase: Phase
  scenarioIndex: number
  scenarioTotal: number
  eliminated: ChoiceId | null
  hintUsed: boolean
  flowHintFirst: boolean
  hintCost: number
  lastResult: ResolveResult | null
  hitFlash: boolean
  onAnswer: (choice: ChoiceId) => void
  onSubmitFlow: (order: string[]) => void
  onHint: () => void
  onContinue: () => void
}

function hpFill(current: number, max: number) {
  return `${Math.max(0, Math.min(100, (current / max) * 100))}%`
}

function stageLabel(card: FlowCard, id: string) {
  return (
    card.stages.find((s) => s.id === id)?.label ??
    card.distractors?.find((s) => s.id === id)?.label ??
    id
  )
}

function stageRationale(card: FlowCard, id: string) {
  return (
    card.stages.find((s) => s.id === id)?.rationale ??
    card.distractors?.find((s) => s.id === id)?.rationale ??
    ''
  )
}

export default function CombatScreen({
  enemyName,
  enemyMaxHp,
  enemyHp,
  uptime,
  artKey,
  card,
  phase,
  scenarioIndex,
  scenarioTotal,
  eliminated,
  hintUsed,
  flowHintFirst,
  hintCost,
  lastResult,
  hitFlash,
  onAnswer,
  onSubmitFlow,
  onHint,
  onContinue,
}: Props) {
  const defeated = enemyHp <= 0 || phase === 'victory'
  const lastSfxKey = useRef<string | null>(null)
  const isFlow = card ? isFlowCard(card) : false
  const isMcq = card ? isMcqCard(card) : false
  const enemyArt = ENEMY_ART[artKey]
  useEffect(() => {
    if (!lastResult) return
    const key = `${lastResult.kind}-${lastResult.choice}-${lastResult.submittedOrder?.join(',')}-${lastResult.correct}-${lastResult.damageDealt}`
    if (lastSfxKey.current === key) return
    lastSfxKey.current = key
    void playSfx(lastResult.correct ? 'hit' : 'miss')
  }, [lastResult])

  useEffect(() => {
    if (phase === 'victory') void playSfx('victory')
  }, [phase])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (phase === 'choose' && card && isMcqCard(card) && !defeated) {
        const key = e.key.toUpperCase()
        const fromLetter =
          key === 'A' || key === 'B' || key === 'C' || key === 'D'
            ? (key as ChoiceId)
            : null
        const fromDigit =
          e.key === '1'
            ? 'A'
            : e.key === '2'
              ? 'B'
              : e.key === '3'
                ? 'C'
                : e.key === '4'
                  ? 'D'
                  : null
        const id = fromLetter ?? fromDigit
        if (id) {
          if (eliminated === id) return
          e.preventDefault()
          void playSfx('click')
          onAnswer(id)
          return
        }
        if (key === 'H' && !hintUsed) {
          e.preventDefault()
          void playSfx('hint')
          onHint()
        }
        return
      }

      if (phase === 'choose' && card && isFlowCard(card) && !defeated) {
        if ((e.key === 'h' || e.key === 'H') && !hintUsed) {
          e.preventDefault()
          void playSfx('hint')
          onHint()
        }
        return
      }

      if (phase === 'resolve' && card && lastResult && enemyHp > 0) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'n' || e.key === 'N') {
          e.preventDefault()
          void playSfx('click')
          onContinue()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    phase,
    card,
    defeated,
    eliminated,
    hintUsed,
    lastResult,
    enemyHp,
    onAnswer,
    onHint,
    onContinue,
  ])

  return (
    <section className="combat-frame">
      <div className="ornament ornament-tl" aria-hidden />
      <div className="ornament ornament-tr" aria-hidden />
      <div className="ornament ornament-bl" aria-hidden />
      <div className="ornament ornament-br" aria-hidden />

      <div className="combat-layout">
        <div
          className={`battle-stage ${hitFlash ? (lastResult?.correct ? 'flash-hit' : 'flash-miss') : ''}`}
          style={{ backgroundImage: `url(${combatBg})` }}
        >
          <div className="stage-vignette" />

          <div className="turn-chip">
            Scenario {Math.min(scenarioIndex, scenarioTotal)}/{scenarioTotal}
            {isFlow ? ' · Flow' : ''}
          </div>

          <div className="fighter hero">
            <img src={heroArt} alt="Cloud Architect" />
            <div className="uptime-chip">Uptime {uptime.toFixed(2)}%</div>
          </div>

          <div className={`fighter foe ${defeated ? 'defeated' : ''}`}>
            <div className="enemy-plate">
              <span className="enemy-name">{enemyName}</span>
              <div className="hp-track">
                <div
                  className="hp-fill"
                  style={{ width: hpFill(enemyHp, enemyMaxHp) }}
                />
              </div>
              <span className="hp-label">
                {enemyHp}/{enemyMaxHp}
              </span>
            </div>
            <img src={enemyArt} alt={enemyName} />
          </div>
        </div>

        <div className="solve-panel">
          <div className="solve-heading">
            <span className="sword-icon" aria-hidden>
              ⚔
            </span>
            <span>{isFlow ? 'Repair the path:' : 'Solve to attack:'}</span>
            {phase === 'choose' && card && isMcq && !defeated && (
              <span className="hotkey-hint">A–D or 1–4 choose · H hint</span>
            )}
            {phase === 'choose' && card && isFlow && !defeated && (
              <span className="hotkey-hint">Place hops · Backspace undo · H hint · Enter submit</span>
            )}
            {phase === 'resolve' && card && lastResult && enemyHp > 0 && (
              <span className="hotkey-hint">Enter / Space next</span>
            )}
          </div>

          {phase === 'choose' && card && isMcqCard(card) && !defeated && (
            <McqChoose
              card={card}
              eliminated={eliminated}
              hintUsed={hintUsed}
              hintCost={hintCost}
              onAnswer={onAnswer}
              onHint={onHint}
            />
          )}

          {phase === 'choose' && card && isFlowCard(card) && !defeated && (
            <>
              <p className="scenario">{card.scenario}</p>
              <p className="threat">⚠ {card.incomingThreat}</p>
              <div className="choose-toolbar">
                <button
                  type="button"
                  className="hint-btn"
                  onClick={() => {
                    void playSfx('hint')
                    onHint()
                  }}
                  disabled={hintUsed}
                >
                  {hintUsed
                    ? 'Hint used (first hop locked)'
                    : `Hint: place first hop (−${hintCost.toFixed(2)}% uptime)`}
                </button>
              </div>
              <FlowPuzzle
                card={card}
                hintFirst={flowHintFirst}
                onSubmit={onSubmitFlow}
              />
            </>
          )}

          {phase === 'resolve' && card && lastResult && (
            <div className="resolve">
              <p className={`outcome ${lastResult.correct ? 'win' : 'lose'}`}>
                {lastResult.correct
                  ? `Critical hit! −${lastResult.damageDealt} HP`
                  : `Outage spike! Uptime −${lastResult.uptimeLost}% · Herd +${lastResult.bossHealed} HP`}
              </p>
              {lastResult.correct && (
                <p className="xp">
                  +{lastResult.xp} XP · {MASTERY_LABELS[card.category]}
                </p>
              )}
              {!lastResult.correct && (
                <p className="xp muted">
                  Mastery unchanged
                  {lastResult.requeued
                    ? ' · concept re-queued for later'
                    : ''}
                </p>
              )}

              {isMcqCard(card) && lastResult.kind === 'mcq' && (
                <McqTradeoffs card={card} lastResult={lastResult} />
              )}

              {isFlowCard(card) && lastResult.kind === 'flow' && (
                <FlowReveal card={card} lastResult={lastResult} />
              )}

              {enemyHp > 0 ? (
                <button
                  type="button"
                  className="continue"
                  onClick={() => {
                    void playSfx('click')
                    onContinue()
                  }}
                >
                  Next scenario
                  <kbd className="kbd">Enter</kbd>
                </button>
              ) : (
                <p className="victory">Incident contained. System stabilized.</p>
              )}
            </div>
          )}

          {phase === 'victory' && (
            <div className="resolve">
              <p className="victory">Incident contained. System stabilized.</p>
              <p className="breakdown">
                You cleared the Thundering Herd scenarios without losing mastery
                on misses — only uptime and a later re-queue.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function McqChoose({
  card,
  eliminated,
  hintUsed,
  hintCost,
  onAnswer,
  onHint,
}: {
  card: McqCard
  eliminated: ChoiceId | null
  hintUsed: boolean
  hintCost: number
  onAnswer: (choice: ChoiceId) => void
  onHint: () => void
}) {
  return (
    <>
      <p className="scenario">{card.scenario}</p>
      <p className="threat">⚠ {card.incomingThreat}</p>
      <div className="choose-toolbar">
        <button
          type="button"
          className="hint-btn"
          onClick={() => {
            void playSfx('hint')
            onHint()
          }}
          disabled={hintUsed}
        >
          {hintUsed
            ? 'Hint used'
            : `Hint (−${hintCost.toFixed(2)}% uptime)`}
        </button>
      </div>
      <div className="choices">
        {card.choices.map((c) => {
          const isOut = eliminated === c.id
          return (
            <button
              key={c.id}
              type="button"
              className={`choice ${isOut ? 'eliminated' : ''}`}
              onClick={() => {
                void playSfx('click')
                onAnswer(c.id)
              }}
              disabled={isOut}
            >
              <strong>({c.id})</strong> {c.text}
            </button>
          )
        })}
      </div>
    </>
  )
}

function McqTradeoffs({
  card,
  lastResult,
}: {
  card: McqCard
  lastResult: ResolveResult
}) {
  return (
    <div className="tradeoffs">
      <h3>Trade-offs</h3>
      <ul>
        {card.choices.map((c) => {
          const isCorrect = c.id === card.correct
          const isPicked = c.id === lastResult.choice
          return (
            <li
              key={c.id}
              className={[
                isCorrect ? 'is-correct' : '',
                isPicked ? 'is-picked' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="trade-head">
                <strong>({c.id})</strong>
                <span className="trade-text">{c.text}</span>
                {isCorrect && <span className="badge ok">Optimal</span>}
                {isPicked && !isCorrect && (
                  <span className="badge bad">Your pick</span>
                )}
                {isPicked && isCorrect && (
                  <span className="badge ok">Your pick</span>
                )}
              </div>
              <p>{card.breakdown[c.id]}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function FlowReveal({
  card,
  lastResult,
}: {
  card: FlowCard
  lastResult: ResolveResult
}) {
  const submitted = lastResult.submittedOrder ?? []
  return (
    <div className="tradeoffs flow-reveal">
      <h3>Correct path</h3>
      <ol className="flow-correct-list">
        {card.stages.map((s, i) => (
          <li key={s.id} className="is-correct">
            <div className="trade-head">
              <strong>{i + 1}.</strong>
              <span className="trade-text">{s.label}</span>
              <span className="badge ok">Hop</span>
            </div>
            <p>{s.rationale}</p>
          </li>
        ))}
      </ol>
      {!lastResult.correct && (
        <>
          <h3>Your path</h3>
          <ol className="flow-correct-list">
            {submitted.map((id, i) => {
              const wrong = lastResult.firstWrongIndex === i
              const ok = card.stages[i]?.id === id
              return (
                <li
                  key={`${id}-${i}`}
                  className={ok ? 'is-correct' : wrong || !ok ? 'is-picked' : ''}
                >
                  <div className="trade-head">
                    <strong>{i + 1}.</strong>
                    <span className="trade-text">{stageLabel(card, id)}</span>
                    {ok ? (
                      <span className="badge ok">Match</span>
                    ) : (
                      <span className="badge bad">
                        {wrong ? 'First break' : 'Off'}
                      </span>
                    )}
                  </div>
                  <p>{stageRationale(card, id)}</p>
                </li>
              )
            })}
          </ol>
        </>
      )}
    </div>
  )
}
