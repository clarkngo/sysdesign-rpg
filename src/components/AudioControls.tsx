import { useEffect, useState } from 'react'
import {
  isBgmMuted,
  isSfxMuted,
  setBgmMuted,
  setSfxMuted,
  startBgm,
  unlockAudio,
} from '../audio/gameAudio'

export default function AudioControls() {
  const [bgmOff, setBgmOff] = useState(isBgmMuted)
  const [sfxOff, setSfxOff] = useState(isSfxMuted)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const kick = async () => {
      await unlockAudio()
      await startBgm()
      setReady(true)
      window.removeEventListener('pointerdown', kick)
      window.removeEventListener('keydown', kick)
    }
    window.addEventListener('pointerdown', kick)
    window.addEventListener('keydown', kick)
    return () => {
      window.removeEventListener('pointerdown', kick)
      window.removeEventListener('keydown', kick)
    }
  }, [])

  async function enable() {
    await unlockAudio()
    await startBgm()
    setReady(true)
  }

  return (
    <div className="audio-controls" title={ready ? undefined : 'Click to enable audio'}>
      <button
        type="button"
        className="audio-toggle"
        aria-pressed={bgmOff}
        aria-label={bgmOff ? 'Unmute music' : 'Mute music'}
        onClick={async () => {
          await enable()
          const next = !bgmOff
          setBgmMuted(next)
          setBgmOff(next)
        }}
      >
        {bgmOff ? 'Music off' : 'Music on'}
      </button>
      <button
        type="button"
        className="audio-toggle"
        aria-pressed={sfxOff}
        aria-label={sfxOff ? 'Unmute sound effects' : 'Mute sound effects'}
        onClick={async () => {
          await enable()
          const next = !sfxOff
          setSfxMuted(next)
          setSfxOff(next)
        }}
      >
        {sfxOff ? 'SFX off' : 'SFX on'}
      </button>
    </div>
  )
}
