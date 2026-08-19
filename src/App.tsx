import { useState } from 'react'
import type { BgmTheme } from './audio/gameAudio'
import AudioControls from './components/AudioControls'
import Bestiary from './components/Bestiary'
import BossSelect from './components/BossSelect'
import CombatScreen from './components/CombatScreen'
import MasteryDashboard from './components/MasteryDashboard'
import SaveControls from './components/SaveControls'
import {
  BOSSES,
  getBoss,
  loadDifficulty,
  MASTERY_LABELS,
  saveDifficulty,
  type ArtKey,
  type BossEncounter,
  type Difficulty,
} from './game/encounters'
import { clearSave } from './game/save'
import { useEncounter } from './game/useEncounter'
import './App.css'

type Screen = 'hub' | 'bestiary' | 'fight'

function themeForArt(artKey: ArtKey): BgmTheme {
  return artKey
}

function FightSession({
  boss,
  difficulty,
  onBack,
}: {
  boss: BossEncounter
  difficulty: Difficulty
  onBack: () => void
}) {
  const fight = useEncounter(boss, difficulty)
  const musicTheme: BgmTheme =
    fight.phase === 'victory' ? 'victory' : themeForArt(boss.artKey)

  return (
    <>
      <div className="shell-top">
        <div className="shell-title-row">
          <h1 className="game-title">SysDesign RPG</h1>
          <button type="button" className="shell-btn" onClick={onBack}>
            Boss select
          </button>
        </div>
        <div className="shell-actions">
          <span className="diff-chip">
            {difficulty === 'beginner' ? 'Beginner' : 'Standard'}
          </span>
          <SaveControls
            buildSave={fight.buildSave}
            onImport={fight.applySave}
            onReset={fight.resetFight}
            notice={fight.saveNotice}
          />
          <AudioControls theme={musicTheme} />
        </div>
      </div>
      <CombatScreen
        enemyName={fight.boss.name}
        enemyMaxHp={fight.boss.maxHp}
        enemyHp={fight.enemyHp}
        uptime={fight.uptime}
        artKey={fight.boss.artKey}
        card={fight.card}
        phase={fight.phase}
        scenarioIndex={fight.scenarioIndex}
        scenarioTotal={fight.scenarioTotal}
        eliminated={fight.eliminated}
        hintUsed={fight.hintUsed}
        hintCost={fight.hintCost}
        lastResult={fight.lastResult}
        hitFlash={fight.hitFlash}
        onAnswer={fight.answer}
        onSubmitFlow={fight.submitFlow}
        onHint={fight.useHint}
        onContinue={fight.continueFight}
        flowHintFirst={fight.flowHintFirst}
      />
      <MasteryDashboard
        overall={fight.overall}
        mastery={fight.mastery}
        labels={MASTERY_LABELS}
        uptime={fight.uptime}
        threatType={fight.boss.threatType}
      />
    </>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('hub')
  const [difficulty, setDifficulty] = useState<Difficulty>(() => loadDifficulty())
  const [activeBossId, setActiveBossId] = useState<string | null>(null)

  const boss = activeBossId ? getBoss(activeBossId) : null

  function handleDifficulty(d: Difficulty) {
    setDifficulty(d)
    saveDifficulty(d)
  }

  function handleStart(bossId: string, mode: 'new' | 'continue') {
    if (mode === 'new') clearSave()
    setActiveBossId(bossId)
    setScreen('fight')
  }

  return (
    <div className={`app-shell ${screen !== 'fight' ? 'app-shell-hub' : ''}`}>
      {screen === 'hub' && (
        <>
          <div className="shell-top">
            <h1 className="game-title">SysDesign RPG</h1>
            <div className="shell-actions">
              <button
                type="button"
                className="shell-btn"
                onClick={() => setScreen('bestiary')}
              >
                Bestiary
              </button>
              <AudioControls theme="hub" />
            </div>
          </div>
          <BossSelect
            bosses={BOSSES}
            difficulty={difficulty}
            onDifficultyChange={handleDifficulty}
            onStart={handleStart}
            onOpenBestiary={() => setScreen('bestiary')}
          />
        </>
      )}

      {screen === 'bestiary' && (
        <>
          <div className="shell-top">
            <h1 className="game-title">SysDesign RPG</h1>
            <div className="shell-actions">
              <AudioControls theme="hub" />
            </div>
          </div>
          <Bestiary
            onBack={() => setScreen('hub')}
            onEngage={(bossId) => handleStart(bossId, 'new')}
          />
        </>
      )}

      {screen === 'fight' && boss && (
        <FightSession
          key={`${boss.id}-${difficulty}`}
          boss={boss}
          difficulty={difficulty}
          onBack={() => {
            setScreen('hub')
            setActiveBossId(null)
          }}
        />
      )}
    </div>
  )
}
