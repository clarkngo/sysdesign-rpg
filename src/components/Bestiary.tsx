import { useEffect, useRef, useState } from 'react'
import {
  BOSS_ART,
  getBestiaryEntries,
  masteryLabel,
  type BestiaryEntry,
} from '../game/bestiary'

interface Props {
  onBack: () => void
  onEngage?: (bossId: string) => void
}

export default function Bestiary({ onBack, onEngage }: Props) {
  const entries = getBestiaryEntries()
  const [selectedId, setSelectedId] = useState(entries[0]?.bossId ?? null)
  const selected =
    entries.find((e) => e.bossId === selectedId) ?? entries[0] ?? null
  const selectedIndex = Math.max(
    0,
    entries.findIndex((e) => e.bossId === selected?.bossId),
  )
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  useEffect(() => {
    const id = selected?.bossId
    if (!id) return
    itemRefs.current.get(id)?.scrollIntoView({ block: 'nearest' })
  }, [selected?.bossId])

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
      if (entries.length === 0) return

      const move = (next: number) => {
        e.preventDefault()
        setSelectedId(entries[next]!.bossId)
      }

      if (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'J') {
        move(Math.min(entries.length - 1, selectedIndex + 1))
        return
      }
      if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'K') {
        move(Math.max(0, selectedIndex - 1))
        return
      }
      if (e.key === 'Home') {
        move(0)
        return
      }
      if (e.key === 'End') {
        move(entries.length - 1)
        return
      }
      if (
        (e.key === 'Enter' || e.key === ' ') &&
        onEngage &&
        selected &&
        target?.tagName !== 'BUTTON'
      ) {
        e.preventDefault()
        onEngage(selected.bossId)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [entries, selected, selectedIndex, onEngage])

  return (
    <section className="hub bestiary">
      <header className="hub-header">
        <h1>Incident Bestiary</h1>
        <p>
          Field guide to Architecture Anomalies. Study their habitats and
          weaknesses before you engage.
        </p>
      </header>

      <div className="bestiary-layout">
        <ul className="bestiary-list" aria-label="Boss list">
          {entries.map((entry) => (
            <li key={entry.bossId}>
              <button
                type="button"
                ref={(el) => {
                  if (el) itemRefs.current.set(entry.bossId, el)
                  else itemRefs.current.delete(entry.bossId)
                }}
                className={`bestiary-list-item ${selected?.bossId === entry.bossId ? 'active' : ''}`}
                aria-current={selected?.bossId === entry.bossId ? 'true' : undefined}
                onClick={() => setSelectedId(entry.bossId)}
              >
                <img src={BOSS_ART[entry.artKey]} alt="" />
                <span>
                  <strong>{entry.name}</strong>
                  <em>{entry.threatType}</em>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {selected && <BestiaryDetail entry={selected} onEngage={onEngage} />}
      </div>

      <div className="bestiary-footer">
        <span className="hotkey-hint">↑↓ / J K browse · Enter engage</span>
        <button type="button" className="shell-btn" onClick={onBack}>
          Back to incidents
        </button>
      </div>
    </section>
  )
}

function BestiaryDetail({
  entry,
  onEngage,
}: {
  entry: BestiaryEntry
  onEngage?: (bossId: string) => void
}) {
  return (
    <article className="bestiary-detail">
      <div className="bestiary-portrait">
        <img src={BOSS_ART[entry.artKey]} alt={entry.name} />
      </div>
      <div className="bestiary-copy">
        <h2>{entry.name}</h2>
        <p className="boss-threat">{entry.threatType}</p>
        <dl className="bestiary-stats">
          <div>
            <dt>Max severity</dt>
            <dd>{entry.maxHp} HP</dd>
          </div>
          <div>
            <dt>Scenarios</dt>
            <dd>{entry.scenarioCount}</dd>
          </div>
        </dl>
        <p className="bestiary-blurb">{entry.blurb}</p>
        <h3>Habitat</h3>
        <p>{entry.habitat}</p>
        <h3>Known weakness</h3>
        <p>{entry.weakness}</p>
        <h3>Field notes</h3>
        <p>{entry.fieldNotes}</p>
        <h3>Mastery tracks</h3>
        <ul className="bestiary-tags">
          {entry.masteryTracks.map((m) => (
            <li key={m}>{masteryLabel(m)}</li>
          ))}
        </ul>
        {onEngage && (
          <button
            type="button"
            className="continue"
            onClick={() => onEngage(entry.bossId)}
          >
            Engage this incident
          </button>
        )}
      </div>
    </article>
  )
}
