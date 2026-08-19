import type { BossEncounter, Difficulty } from '../game/encounters'
import { BOSS_ART } from '../game/bestiary'
import { loadSave } from '../game/save'

interface Props {
  bosses: BossEncounter[]
  difficulty: Difficulty
  onDifficultyChange: (d: Difficulty) => void
  onStart: (bossId: string, mode: 'new' | 'continue') => void
  onOpenBestiary: () => void
}

export default function BossSelect({
  bosses,
  difficulty,
  onDifficultyChange,
  onStart,
  onOpenBestiary,
}: Props) {
  const save = loadSave()

  return (
    <section className="hub">
      <header className="hub-header">
        <h1>Choose your incident</h1>
        <p>
          Pick a boss to contain. Beginner mode keeps the same scenarios with
          clearer questions and answers.
        </p>
      </header>

      <div className="hub-toolbar">
        <div className="difficulty-toggle" role="group" aria-label="Difficulty">
          <span className="diff-label">Difficulty</span>
          <button
            type="button"
            className={`diff-btn ${difficulty === 'beginner' ? 'active' : ''}`}
            aria-pressed={difficulty === 'beginner'}
            onClick={() => onDifficultyChange('beginner')}
          >
            Beginner
          </button>
          <button
            type="button"
            className={`diff-btn ${difficulty === 'standard' ? 'active' : ''}`}
            aria-pressed={difficulty === 'standard'}
            onClick={() => onDifficultyChange('standard')}
          >
            Standard
          </button>
        </div>
        <button type="button" className="shell-btn" onClick={onOpenBestiary}>
          Bestiary
        </button>
      </div>

      <div className="boss-grid">
        {bosses.map((boss) => {
          const hasSave = save?.bossId === boss.id && save.phase !== 'victory'
          return (
            <article key={boss.id} className="boss-card">
              <img
                src={BOSS_ART[boss.artKey]}
                alt=""
                className="boss-card-art"
              />
              <div className="boss-card-body">
                <h2>{boss.name}</h2>
                <p className="boss-threat">{boss.threatType}</p>
                <p className="boss-blurb">{boss.blurb}</p>
                <div className="boss-card-actions">
                  <button
                    type="button"
                    className="continue"
                    onClick={() => onStart(boss.id, 'new')}
                  >
                    Engage
                  </button>
                  {hasSave && (
                    <button
                      type="button"
                      className="shell-btn"
                      onClick={() => onStart(boss.id, 'continue')}
                    >
                      Continue
                    </button>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
