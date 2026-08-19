import { useRef } from 'react'
import { downloadSave, readSaveFromFile, type GameSave } from '../game/save'

interface Props {
  buildSave: () => GameSave
  onImport: (save: GameSave) => void
  onReset: () => void
  notice: string | null
}

export default function SaveControls({
  buildSave,
  onImport,
  onReset,
  notice,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="save-controls">
      {notice && <span className="save-notice">{notice}</span>}
      <button
        type="button"
        className="shell-btn"
        onClick={() => downloadSave(buildSave())}
      >
        Export JSON
      </button>
      <button
        type="button"
        className="shell-btn"
        onClick={() => fileRef.current?.click()}
      >
        Import JSON
      </button>
      <button
        type="button"
        className="shell-btn danger"
        onClick={() => {
          if (window.confirm('Reset fight progress and mastery to defaults?')) {
            onReset()
          }
        }}
      >
        Reset
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (!file) return
          try {
            const save = await readSaveFromFile(file)
            onImport(save)
          } catch (err) {
            window.alert(
              err instanceof Error ? err.message : 'Could not import save',
            )
          }
        }}
      />
    </div>
  )
}
