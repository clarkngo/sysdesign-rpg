import AudioControls from './components/AudioControls'
import CombatScreen from './components/CombatScreen'
import MasteryDashboard from './components/MasteryDashboard'
import SaveControls from './components/SaveControls'
import { MASTERY_LABELS, thunderingHerd } from './game/encounters'
import { useEncounter } from './game/useEncounter'
import './App.css'

export default function App() {
  const fight = useEncounter(thunderingHerd)

  return (
    <div className="app-shell">
      <div className="shell-top">
        <h1 className="game-title">SysDesign RPG</h1>
        <div className="shell-actions">
          <SaveControls
            buildSave={fight.buildSave}
            onImport={fight.applySave}
            onReset={fight.resetFight}
            notice={fight.saveNotice}
          />
          <AudioControls />
        </div>
      </div>
      <CombatScreen
        enemyName={fight.boss.name}
        enemyMaxHp={fight.boss.maxHp}
        enemyHp={fight.enemyHp}
        uptime={fight.uptime}
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
    </div>
  )
}
