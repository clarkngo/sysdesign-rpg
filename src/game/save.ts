import type { ChoiceId, MasteryKey } from './encounters'
import type { Phase, ResolveResult } from './useEncounter'

export const SAVE_VERSION = 1
export const STORAGE_KEY = 'sysdesign-rpg-save-v1'

export interface GameSave {
  version: number
  exportedAt: string
  bossId: string
  enemyHp: number
  uptime: number
  mastery: Record<MasteryKey, number>
  phase: Phase
  cardId: string | null
  remainingIds: string[]
  requeueIds: string[]
  eliminated: ChoiceId | null
  hintUsed: boolean
  flowHintFirst?: boolean
  scenariosSeen: number
  lastResult: ResolveResult | null
}

export function loadSave(): GameSave | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as GameSave
    if (data.version !== SAVE_VERSION) return null
    return data
  } catch {
    return null
  }
}

export function writeSave(save: GameSave) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save))
}

export function clearSave() {
  localStorage.removeItem(STORAGE_KEY)
}

export function downloadSave(save: GameSave, filename = 'sysdesign-rpg-save.json') {
  const blob = new Blob([JSON.stringify(save, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function parseSaveFile(text: string): GameSave {
  const data = JSON.parse(text) as GameSave
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid save file')
  }
  if (data.version !== SAVE_VERSION) {
    throw new Error(`Unsupported save version: ${String(data.version)}`)
  }
  if (!data.bossId || !data.mastery || !Array.isArray(data.remainingIds)) {
    throw new Error('Save file is missing required fields')
  }
  return data
}

export function readSaveFromFile(file: File): Promise<GameSave> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(parseSaveFile(String(reader.result ?? '')))
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsText(file)
  })
}
