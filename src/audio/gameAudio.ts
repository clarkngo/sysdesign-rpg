/** Procedural Web Audio BGM themes + SFX (no asset files). */

type SfxName = 'hit' | 'miss' | 'hint' | 'click' | 'victory'

export type BgmTheme =
  | 'hub'
  | 'herd'
  | 'hydra'
  | 'wyrm'
  | 'leak'
  | 'storm'
  | 'golem'
  | 'wraith'
  | 'shadow'
  | 'lurker'
  | 'wisp'
  | 'mimic'
  | 'kraken'
  | 'sphinx'
  | 'serpent'
  | 'chronos'
  | 'imp'
  | 'victory'

type MelodyNote = readonly [semi: number, beats: number]

interface TrackDef {
  id: BgmTheme
  label: string
  root: number
  beat: number
  melody: readonly MelodyNote[]
  bassRoot: number
  bassPattern: readonly number[]
  lead: OscillatorType
  leadPeak: number
  squarePeak: number
  bassPeak: number
}

const TRACKS: Record<BgmTheme, TrackDef> = {
  hub: {
    id: 'hub',
    label: 'NOC Ambient',
    root: 196,
    beat: 0.34,
    melody: [
      [0, 1],
      [2, 1],
      [4, 1],
      [7, 1],
      [4, 1],
      [2, 1],
      [0, 1],
      [-3, 1],
    ],
    bassRoot: 98,
    bassPattern: [0, 0, 7, 0, 5, 0, 7, 0],
    lead: 'sine',
    leadPeak: 0.16,
    squarePeak: 0.03,
    bassPeak: 0.1,
  },
  herd: {
    id: 'herd',
    label: 'Stampede March',
    root: 220,
    beat: 0.28,
    melody: [
      [0, 1],
      [3, 0.5],
      [5, 0.5],
      [7, 1],
      [5, 0.5],
      [3, 0.5],
      [0, 1],
      [-2, 1],
    ],
    bassRoot: 110,
    bassPattern: [0, 0, 0, 0, 0, 0, 0, 0],
    lead: 'triangle',
    leadPeak: 0.22,
    squarePeak: 0.08,
    bassPeak: 0.14,
  },
  hydra: {
    id: 'hydra',
    label: 'Partition Duality',
    root: 185,
    beat: 0.3,
    melody: [
      [0, 1],
      [1, 0.5],
      [6, 0.5],
      [7, 1],
      [6, 0.5],
      [1, 0.5],
      [0, 1],
      [-5, 1],
    ],
    bassRoot: 92.5,
    bassPattern: [0, 7, 0, 6, 0, 7, 0, 1],
    lead: 'sawtooth',
    leadPeak: 0.12,
    squarePeak: 0.06,
    bassPeak: 0.12,
  },
  wyrm: {
    id: 'wyrm',
    label: 'Choke-Point Drone',
    root: 147,
    beat: 0.4,
    melody: [
      [0, 2],
      [5, 1],
      [3, 1],
      [0, 2],
      [-2, 1],
      [3, 1],
    ],
    bassRoot: 73.5,
    bassPattern: [0, 0, 5, 5, 0, 0, -2, -2],
    lead: 'triangle',
    leadPeak: 0.18,
    squarePeak: 0.04,
    bassPeak: 0.16,
  },
  leak: {
    id: 'leak',
    label: 'Heap Bubble',
    root: 247,
    beat: 0.24,
    melody: [
      [0, 0.5],
      [4, 0.5],
      [7, 0.5],
      [12, 0.5],
      [7, 0.5],
      [4, 0.5],
      [0, 1],
      [2, 0.5],
      [5, 0.5],
      [9, 1],
    ],
    bassRoot: 123.5,
    bassPattern: [0, 4, 7, 4, 0, 5, 9, 5],
    lead: 'square',
    leadPeak: 0.1,
    squarePeak: 0.05,
    bassPeak: 0.11,
  },
  storm: {
    id: 'storm',
    label: 'Retry Squall',
    root: 208,
    beat: 0.22,
    melody: [
      [0, 0.5],
      [3, 0.5],
      [0, 0.5],
      [7, 0.5],
      [0, 0.5],
      [10, 0.5],
      [7, 1],
      [3, 1],
      [-2, 1],
    ],
    bassRoot: 104,
    bassPattern: [0, 0, 3, 0, 7, 0, 3, 0],
    lead: 'sawtooth',
    leadPeak: 0.11,
    squarePeak: 0.07,
    bassPeak: 0.13,
  },
  golem: {
    id: 'golem',
    label: 'Shard Grind',
    root: 165,
    beat: 0.36,
    melody: [
      [0, 1.5],
      [5, 0.5],
      [7, 1],
      [5, 1],
      [0, 1],
      [-5, 1],
    ],
    bassRoot: 82.5,
    bassPattern: [0, 0, 0, 5, 0, 0, 7, 5],
    lead: 'triangle',
    leadPeak: 0.19,
    squarePeak: 0.05,
    bassPeak: 0.15,
  },
  wraith: {
    id: 'wraith',
    label: 'Dead-Letter Dirge',
    root: 175,
    beat: 0.32,
    melody: [
      [0, 1],
      [3, 1],
      [6, 1],
      [3, 1],
      [0, 1],
      [-4, 1],
      [3, 2],
    ],
    bassRoot: 87.5,
    bassPattern: [0, 6, 0, 3, 0, 6, -4, 0],
    lead: 'sine',
    leadPeak: 0.17,
    squarePeak: 0.04,
    bassPeak: 0.12,
  },
  shadow: {
    id: 'shadow',
    label: 'Least Privilege',
    root: 233,
    beat: 0.29,
    melody: [
      [0, 1],
      [5, 0.5],
      [7, 0.5],
      [0, 1],
      [8, 1],
      [7, 1],
      [5, 1],
      [0, 1],
    ],
    bassRoot: 116.5,
    bassPattern: [0, 5, 7, 0, 8, 7, 5, 0],
    lead: 'triangle',
    leadPeak: 0.15,
    squarePeak: 0.06,
    bassPeak: 0.11,
  },
  lurker: {
    id: 'lurker',
    label: 'Replica Drift',
    root: 185,
    beat: 0.33,
    melody: [
      [0, 1],
      [2, 1],
      [5, 1],
      [2, 1],
      [0, 1],
      [-2, 1],
      [3, 2],
    ],
    bassRoot: 92.5,
    bassPattern: [0, 0, 5, 0, 2, 0, 5, 0],
    lead: 'sine',
    leadPeak: 0.16,
    squarePeak: 0.04,
    bassPeak: 0.12,
  },
  wisp: {
    id: 'wisp',
    label: 'Cold Init',
    root: 247,
    beat: 0.27,
    melody: [
      [0, 0.5],
      [4, 0.5],
      [7, 1],
      [4, 0.5],
      [0, 0.5],
      [9, 1],
      [7, 1],
      [4, 1],
    ],
    bassRoot: 123.5,
    bassPattern: [0, 4, 0, 7, 0, 4, 9, 0],
    lead: 'triangle',
    leadPeak: 0.18,
    squarePeak: 0.05,
    bassPeak: 0.1,
  },
  mimic: {
    id: 'mimic',
    label: 'Schema Masquerade',
    root: 208,
    beat: 0.31,
    melody: [
      [0, 1],
      [3, 0.5],
      [6, 0.5],
      [3, 1],
      [0, 1],
      [5, 1],
      [3, 1],
      [-2, 1],
    ],
    bassRoot: 104,
    bassPattern: [0, 3, 6, 0, 5, 3, 0, 6],
    lead: 'square',
    leadPeak: 0.14,
    squarePeak: 0.07,
    bassPeak: 0.13,
  },
  kraken: {
    id: 'kraken',
    label: 'Saturation Depths',
    root: 165,
    beat: 0.35,
    melody: [
      [0, 1],
      [-3, 1],
      [0, 1],
      [4, 1],
      [0, 1],
      [5, 1],
      [4, 1],
      [-5, 1],
    ],
    bassRoot: 82.5,
    bassPattern: [0, 0, -3, 0, 4, 0, 5, 0],
    lead: 'sawtooth',
    leadPeak: 0.17,
    squarePeak: 0.05,
    bassPeak: 0.15,
  },
  sphinx: {
    id: 'sphinx',
    label: 'Quota Riddle',
    root: 196,
    beat: 0.32,
    melody: [
      [0, 1],
      [2, 0.5],
      [5, 0.5],
      [7, 1],
      [5, 1],
      [2, 1],
      [0, 1],
      [-2, 1],
    ],
    bassRoot: 98,
    bassPattern: [0, 0, 5, 0, 7, 0, 5, 0],
    lead: 'triangle',
    leadPeak: 0.18,
    squarePeak: 0.05,
    bassPeak: 0.12,
  },
  serpent: {
    id: 'serpent',
    label: 'Query Coil',
    root: 233,
    beat: 0.26,
    melody: [
      [0, 0.5],
      [3, 0.5],
      [5, 0.5],
      [7, 0.5],
      [5, 0.5],
      [3, 0.5],
      [0, 1],
      [7, 1],
    ],
    bassRoot: 116.5,
    bassPattern: [0, 3, 0, 5, 0, 3, 7, 0],
    lead: 'square',
    leadPeak: 0.12,
    squarePeak: 0.08,
    bassPeak: 0.11,
  },
  chronos: {
    id: 'chronos',
    label: 'Skewed Pendulum',
    root: 174,
    beat: 0.33,
    melody: [
      [0, 1],
      [4, 1],
      [1, 1],
      [5, 1],
      [0, 1],
      [-3, 1],
      [4, 1],
      [1, 1],
    ],
    bassRoot: 87,
    bassPattern: [0, 4, 1, 5, 0, -3, 4, 1],
    lead: 'sine',
    leadPeak: 0.17,
    squarePeak: 0.04,
    bassPeak: 0.13,
  },
  imp: {
    id: 'imp',
    label: 'Double Key',
    root: 261,
    beat: 0.25,
    melody: [
      [0, 0.5],
      [0, 0.5],
      [4, 0.5],
      [4, 0.5],
      [7, 1],
      [5, 1],
      [4, 1],
      [0, 1],
    ],
    bassRoot: 130.5,
    bassPattern: [0, 0, 4, 4, 7, 5, 4, 0],
    lead: 'sawtooth',
    leadPeak: 0.14,
    squarePeak: 0.06,
    bassPeak: 0.12,
  },
  victory: {
    id: 'victory',
    label: 'Incident Contained',
    root: 262,
    beat: 0.26,
    melody: [
      [0, 0.5],
      [4, 0.5],
      [7, 0.5],
      [12, 1],
      [7, 0.5],
      [4, 0.5],
      [0, 1],
      [5, 1],
      [7, 1],
    ],
    bassRoot: 131,
    bassPattern: [0, 0, 4, 4, 5, 5, 7, 7],
    lead: 'triangle',
    leadPeak: 0.2,
    squarePeak: 0.06,
    bassPeak: 0.12,
  },
}

const THEME_ORDER: BgmTheme[] = [
  'hub',
  'herd',
  'hydra',
  'wyrm',
  'leak',
  'storm',
  'golem',
  'wraith',
  'shadow',
  'lurker',
  'wisp',
  'mimic',
  'kraken',
  'sphinx',
  'serpent',
  'chronos',
  'imp',
  'victory',
]

const PREFS_KEY = 'sysdesign-rpg-audio-prefs'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let bgmGain: GainNode | null = null
let sfxGain: GainNode | null = null
let bgmTimer: number | null = null
let bgmMuted = false
let sfxMuted = false
let bgmStarted = false
let currentTheme: BgmTheme = 'hub'
let nextBarAt = 0

const BGM_LEVEL = 0.38
const SFX_LEVEL = 0.35

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return
    const data = JSON.parse(raw) as {
      bgmMuted?: boolean
      sfxMuted?: boolean
      theme?: BgmTheme
    }
    bgmMuted = Boolean(data.bgmMuted)
    sfxMuted = Boolean(data.sfxMuted)
    if (data.theme && TRACKS[data.theme]) currentTheme = data.theme
  } catch {
    /* ignore */
  }
}

function savePrefs() {
  localStorage.setItem(
    PREFS_KEY,
    JSON.stringify({ bgmMuted, sfxMuted, theme: currentTheme }),
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

function barDuration(track: TrackDef) {
  return track.melody.reduce((sum, [, beats]) => sum + track.beat * beats, 0)
}

function scheduleBgmBar(at: number) {
  if (!ctx || !bgmGain || bgmMuted) return
  const track = TRACKS[currentTheme]
  let t = at
  for (const [semi, len] of track.melody) {
    const f = track.root * 2 ** (semi / 12)
    const dur = track.beat * len * 0.92
    tone(f, t, dur, track.lead, bgmGain, track.leadPeak)
    tone(f / 2, t, dur, 'square', bgmGain, track.squarePeak)
    t += track.beat * len
  }
  const bassBeats = Math.max(
    8,
    Math.round(barDuration(track) / track.beat),
  )
  for (let i = 0; i < bassBeats; i++) {
    const step = track.bassPattern[i % track.bassPattern.length] ?? 0
    const f = track.bassRoot * 2 ** (step / 12)
    tone(
      f,
      at + i * track.beat,
      track.beat * 0.35,
      'sine',
      bgmGain,
      track.bassPeak,
    )
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
  nextBarAt = ctx.currentTime + 0.05
  const tick = () => {
    if (!ctx || bgmMuted || !bgmStarted) return
    const track = TRACKS[currentTheme]
    const barLen = barDuration(track)
    scheduleBgmBar(nextBarAt)
    nextBarAt += barLen
    bgmTimer = window.setTimeout(tick, barLen * 1000 * 0.9)
  }
  tick()
}

function restartLoop() {
  clearBgmTimer()
  if (bgmStarted && !bgmMuted) armBgmLoop()
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

export function getBgmTheme(): BgmTheme {
  return currentTheme
}

export function getBgmLabel(theme: BgmTheme = currentTheme): string {
  return TRACKS[theme].label
}

export function setBgmTheme(theme: BgmTheme) {
  if (!TRACKS[theme] || theme === currentTheme) return
  currentTheme = theme
  savePrefs()
  restartLoop()
}

/** Cycle to the next track in the playlist. */
export function cycleBgmTheme(): BgmTheme {
  const idx = THEME_ORDER.indexOf(currentTheme)
  const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length]
  currentTheme = next
  savePrefs()
  restartLoop()
  return next
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
