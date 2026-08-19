import { useCallback, useEffect, useMemo, useState } from 'react'
import { flowPool, type FlowCard } from '../game/encounters'
import { playSfx } from '../audio/gameAudio'

interface Props {
  card: FlowCard
  hintFirst: boolean
  onSubmit: (order: string[]) => void
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function FlowPuzzle({ card, hintFirst, onSubmit }: Props) {
  const pool = useMemo(() => flowPool(card), [card])
  const [bank, setBank] = useState(() => shuffle(pool.map((s) => s.id)))
  const [slots, setSlots] = useState<(string | null)[]>(() =>
    card.stages.map(() => null),
  )

  useEffect(() => {
    setBank(shuffle(pool.map((s) => s.id)))
    setSlots(card.stages.map(() => null))
  }, [card.id, pool, card.stages])

  useEffect(() => {
    if (!hintFirst) return
    const firstId = card.stages[0]?.id
    if (!firstId) return
    setSlots((prev) => {
      if (prev[0] === firstId) return prev
      const next = [...prev]
      const occupied = next.indexOf(firstId)
      if (occupied >= 0) next[occupied] = null
      next[0] = firstId
      return next
    })
    setBank((prev) => prev.filter((id) => id !== firstId))
  }, [hintFirst, card])

  const labelFor = (id: string) =>
    pool.find((s) => s.id === id)?.label ?? id

  const filled = slots.every(Boolean)
  const firstHintId = card.stages[0]?.id

  const removeAt = useCallback(
    (index: number) => {
      setSlots((prev) => {
        const id = prev[index]
        if (!id) return prev
        if (hintFirst && index === 0 && id === firstHintId) return prev
        void playSfx('click')
        const next = [...prev]
        next[index] = null
        setBank((bankPrev) => (bankPrev.includes(id) ? bankPrev : [...bankPrev, id]))
        return next
      })
    },
    [hintFirst, firstHintId],
  )

  const undoLast = useCallback(() => {
    setSlots((prev) => {
      let lastFilled = -1
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i]) {
          lastFilled = i
          break
        }
      }
      if (lastFilled < 0) return prev
      const id = prev[lastFilled]
      if (!id) return prev
      if (hintFirst && lastFilled === 0 && id === firstHintId) return prev
      void playSfx('click')
      const next = [...prev]
      next[lastFilled] = null
      setBank((bankPrev) => (bankPrev.includes(id) ? bankPrev : [...bankPrev, id]))
      return next
    })
  }, [hintFirst, firstHintId])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      if (e.key === 'Backspace') {
        e.preventDefault()
        e.stopPropagation()
        undoLast()
        return
      }

      if (!filled) return
      if (e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        void playSfx('click')
        onSubmit(slots as string[])
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [filled, slots, onSubmit, undoLast])

  function place(id: string) {
    const empty = slots.findIndex((s) => s == null)
    if (empty < 0) return
    void playSfx('click')
    setSlots((prev) => {
      const next = [...prev]
      next[empty] = id
      return next
    })
    setBank((prev) => prev.filter((x) => x !== id))
  }

  function clearPath() {
    void playSfx('click')
    const keepFirst =
      hintFirst && slots[0] === firstHintId ? slots[0] : null
    const returning = slots.filter(
      (id): id is string => Boolean(id) && id !== keepFirst,
    )
    setSlots(card.stages.map((_, i) => (i === 0 ? keepFirst : null)))
    setBank((prev) => shuffle([...prev, ...returning]))
  }

  return (
    <div className="flow-puzzle">
      <p className="flow-instructions">
        Build the request path in order. Tap a hop to place it; tap a filled
        slot or press Backspace to undo.
      </p>

      <div className="flow-slots" aria-label="Path slots">
        {slots.map((id, i) => (
          <button
            key={`slot-${i}`}
            type="button"
            className={`flow-slot ${id ? 'filled' : ''} ${hintFirst && i === 0 && id ? 'hinted' : ''}`}
            onClick={() => removeAt(i)}
            disabled={!id || (hintFirst && i === 0 && id === firstHintId)}
          >
            <span className="flow-slot-index">{i + 1}</span>
            <span className="flow-slot-label">
              {id ? labelFor(id) : 'Empty hop'}
            </span>
          </button>
        ))}
      </div>

      <div className="flow-bank" aria-label="Available hops">
        {bank.map((id) => (
          <button
            key={id}
            type="button"
            className="flow-chip"
            onClick={() => place(id)}
          >
            {labelFor(id)}
          </button>
        ))}
        {bank.length === 0 && (
          <span className="flow-bank-empty">All hops placed</span>
        )}
      </div>

      <div className="flow-actions">
        <button type="button" className="shell-btn" onClick={clearPath}>
          Clear
        </button>
        <button
          type="button"
          className="continue"
          disabled={!filled}
          onClick={() => {
            if (!filled) return
            void playSfx('click')
            onSubmit(slots as string[])
          }}
        >
          Submit path
          <kbd className="kbd">Enter</kbd>
        </button>
      </div>
    </div>
  )
}
