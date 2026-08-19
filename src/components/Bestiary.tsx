import { useState } from 'react'
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
                className={`bestiary-list-item ${selected?.bossId === entry.bossId ? 'active' : ''}`}
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
