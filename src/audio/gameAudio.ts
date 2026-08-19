/** Lightweight Web Audio BGM + SFX (no asset files). */

type SfxName = 'hit' | 'miss' | 'hint' | 'click' | 'victory'

const PREFS_KEY = 'sysdesign-rpg-audio-prefs'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let bgmGain: GainNode | null = null
let sfxGain: GainNode | null = null
let bgmTimer: number | null = null
let bgmMuted = false
let sfxMuted = false
let bgmStarted = false

const BGM_LEVEL = 0.38
const SFX_LEVEL = 0.35

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return
    const data = JSON.parse(raw) as { bgmMuted?: boolean; sfxMuted?: boolean }
    bgmMuted = Boolean(data.bgmMuted)
    sfxMuted = Boolean(data.sfxMuted)
  } catch {
    /* ignore */
  }
}

function savePrefs() {
  localStorage.setItem(
    PREFS_KEY,
    JSON.stringify({ bgmMuted, sfxMuted }),
  )
}

loadPrefs()

function applyGains() {
  if (bgmGain) bgmGain.gain.value = bgmMuted ? 0 : BGM_LEVEL
  if (sfxGain) sfxGain.gain.value = sfxMuted ? 0 : SFX_LEVEL
}

function ensure() {
  if (ctx) return ctx
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext
  ctx = new AudioCtx()
  master = ctx.createGain()
  master.gain.value = 1
  master.connect(ctx.destination)

  bgmGain = ctx.createGain()
  bgmGain.connect(master)

  sfxGain = ctx.createGain()
  sfxGain.connect(master)

  applyGains()
  return ctx
}

async function resume() {
  const c = ensure()
  if (c.state === 'suspended') await c.resume()
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType,
  gainNode: GainNode,
  peak = 0.2,
) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(peak, start + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(g)
  g.connect(gainNode)
  osc.start(start)
  osc.stop(start + dur + 0.02)
}

/** Short looping chiptune phrase (≈ 4 bars). */
function scheduleBgmBar(at: number) {
  if (!ctx || !bgmGain || bgmMuted) return
  const root = 220
  const melody = [
    [0, 1],
    [3, 0.5],
    [5, 0.5],
    [7, 1],
    [5, 0.5],
    [3, 0.5],
    [0, 1],
    [-2, 1],
  ] as const
  const beat = 0.28
  let t = at
  for (const [semi, len] of melody) {
    const f = root * 2 ** (semi / 12)
    tone(f, t, beat * len * 0.92, 'triangle', bgmGain, 0.22)
    tone(f / 2, t, beat * len * 0.92, 'square', bgmGain, 0.08)
    t += beat * len
  }
  for (let i = 0; i < 8; i++) {
    tone(110, at + i * beat, beat * 0.35, 'sine', bgmGain, 0.14)
  }
}

function clearBgmTimer() {
  if (bgmTimer != null) {
    window.clearTimeout(bgmTimer)
    bgmTimer = null
  }
}

function armBgmLoop() {
  if (!ctx || bgmTimer != null || bgmMuted || !bgmStarted) return
  const barLen = 0.28 * 8
  let next = ctx.currentTime + 0.05
  const tick = () => {
    if (!ctx || bgmMuted || !bgmStarted) return
    scheduleBgmBar(next)
    next += barLen
    bgmTimer = window.setTimeout(tick, barLen * 1000 * 0.9)
  }
  tick()
}

export async function unlockAudio() {
  await resume()
}

export async function startBgm() {
  await resume()
  if (bgmStarted) {
    if (!bgmMuted) armBgmLoop()
    return
  }
  bgmStarted = true
  armBgmLoop()
}

export function stopBgm() {
  bgmStarted = false
  clearBgmTimer()
}

export function isBgmMuted() {
  return bgmMuted
}

export function isSfxMuted() {
  return sfxMuted
}

export function setBgmMuted(value: boolean) {
  bgmMuted = value
  applyGains()
  savePrefs()
  if (bgmMuted) {
    clearBgmTimer()
  } else if (bgmStarted) {
    armBgmLoop()
  }
}

export function setSfxMuted(value: boolean) {
  sfxMuted = value
  applyGains()
  savePrefs()
}

export async function playSfx(name: SfxName) {
  await resume()
  if (!ctx || !sfxGain || sfxMuted) return
  const out = sfxGain
  const t0 = ctx.currentTime

  if (name === 'hit') {
    tone(523.25, t0, 0.08, 'square', out, 0.22)
    tone(659.25, t0 + 0.07, 0.1, 'square', out, 0.2)
    tone(783.99, t0 + 0.14, 0.18, 'triangle', out, 0.18)
    return
  }
  if (name === 'miss') {
    tone(220, t0, 0.12, 'sawtooth', out, 0.16)
    tone(165, t0 + 0.1, 0.2, 'sawtooth', out, 0.14)
    return
  }
  if (name === 'hint') {
    tone(440, t0, 0.06, 'triangle', out, 0.12)
    tone(554.37, t0 + 0.06, 0.1, 'triangle', out, 0.1)
    return
  }
  if (name === 'click') {
    tone(660, t0, 0.04, 'square', out, 0.08)
    return
  }
  ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    tone(f, t0 + i * 0.12, 0.2, 'triangle', out, 0.18)
  })
}
