import { useEffect, useState } from 'react'
import {
  cycleBgmTheme,
  getBgmLabel,
  isBgmMuted,
  isSfxMuted,
  setBgmMuted,
  setBgmTheme,
  setSfxMuted,
  startBgm,
  unlockAudio,
  type BgmTheme,
} from '../audio/gameAudio'

interface Props {
  /** Auto theme from screen/boss; click track name to cycle. */
  theme?: BgmTheme
}

export default function AudioControls({ theme }: Props) {
  const [bgmOff, setBgmOff] = useState(isBgmMuted)
  const [sfxOff, setSfxOff] = useState(isSfxMuted)
  const [ready, setReady] = useState(false)
  const [trackLabel, setTrackLabel] = useState(() => getBgmLabel())

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

  useEffect(() => {
    if (!theme) return
    void (async () => {
      await unlockAudio()
      setBgmTheme(theme)
      setTrackLabel(getBgmLabel(theme))
      if (!bgmOff) await startBgm()
    })()
  }, [theme, bgmOff])

  async function enable() {
    await unlockAudio()
    await startBgm()
    setReady(true)
  }

  return (
    <div
      className="audio-controls"
      title={ready ? undefined : 'Click to enable audio'}
    >
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
        className="audio-toggle track-toggle"
        aria-label={`Music track: ${trackLabel}. Click for next track.`}
        title={`${trackLabel} — click for next`}
        onClick={async () => {
          await enable()
          const next = cycleBgmTheme()
          setTrackLabel(getBgmLabel(next))
        }}
      >
        ♪ {trackLabel}
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
