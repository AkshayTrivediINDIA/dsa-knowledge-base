/* ============================================================
   DSA Visualizer Studio — Control panel.
   Array size slider, input generators (random/sorted/reverse/
   nearly/unique/custom), render mode (bar/dot/column), theme
   toggle, gamification meter and step JSON export/import.
   ============================================================ */

import { useRef } from 'react'
import { useVizStore } from '../store'
import type { InputMode, RenderMode } from '../core/types'

const MODES: Array<{ id: InputMode; label: string }> = [
  { id: 'random', label: 'Random' },
  { id: 'sorted', label: 'Sorted' },
  { id: 'reverse', label: 'Reverse' },
  { id: 'nearly', label: 'Nearly Sorted' },
  { id: 'unique', label: 'Few Unique' },
  { id: 'custom', label: 'Custom Input' },
]

const RENDER: Array<{ id: RenderMode; label: string }> = [
  { id: 'bar', label: 'Bar' },
  { id: 'dot', label: 'Dot' },
  { id: 'column', label: '3D Column' },
]

export function Controls() {
  const mode = useVizStore((s) => s.mode)
  const setValues = useVizStore((s) => s.setValues)
  const arrSize = useVizStore((s) => s.arrSize)
  const setSize = useVizStore((s) => s.setSize)
  const customInput = useVizStore((s) => s.customInput)
  const setCustom = useVizStore((s) => s.setCustom)
  const regenerate = useVizStore((s) => s.regenerate)
  const renderMode = useVizStore((s) => s.renderMode)
  const setRenderMode = useVizStore((s) => s.setRenderMode)
  const dark = useVizStore((s) => s.dark)
  const setDark = useVizStore((s) => s.setDark)
  const showTooltip = useVizStore((s) => s.showTooltip)
  const setShowTooltip = useVizStore((s) => s.setShowTooltip)
  const frames = useVizStore((s) => s.frames)
  const xp = useVizStore((s) => s.xp)
  const streak = useVizStore((s) => s.streak)
  const achievements = useVizStore((s) => s.achievements)
  const importRun = useVizStore((s) => s.importRun)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const pickMode = (m: InputMode) => {
    const { arrSize: size, customInput: ci } = useVizStore.getState()
    if (m === 'custom') {
      const vals = ci
        .split(/[\s,]+/)
        .map((t) => Number(t))
        .filter((x) => !Number.isNaN(x))
        .slice(0, 200)
      setValues(vals.length ? vals : [2, 5, 1, 8, 3], 'custom')
      return
    }
    const adopt = {
      sorted: ['random', 'reverse', 'nearly'],
      reverse: ['random', 'sorted', 'nearly'],
      nearly: ['random'],
    } as Record<string, string[]>
    void adopt
    const values = sampleByMode(m, size)
    setValues(values, m)
  }

  function sampleByMode(m: InputMode, n: number): number[] {
    const rng = () => Math.floor(Math.random() * 100) + 1
    const base = Array.from({ length: n }, rng)
    if (m === 'sorted') return base.sort((a, b) => a - b)
    if (m === 'reverse') return base.sort((a, b) => b - a)
    if (m === 'nearly') {
      base.sort((a, b) => a - b)
      const k = Math.floor(n / 10)
      for (let i = 0; i < k; i++) {
        const a = Math.floor(Math.random() * n)
        const b = Math.floor(Math.random() * n)
        ;[base[a], base[b]] = [base[b], base[a]]
      }
    }
    return base
  }

  const exportSteps = () => {
    const data = {
      algorithm: 'array-traversal',
      values: useVizStore.getState().values,
      steps: frames.map((f) => ({
        step: f.step,
        i: f.i,
        phase: f.phase,
        sum: f.sum,
        sufMax: f.sufMax,
        status: f.status,
        narr: f.narr,
      })),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'traversal-steps.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importSteps = () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (parsed && parsed.algorithm === 'array-traversal' && Array.isArray(parsed.values)) {
          importRun(parsed.values)
        }
      } catch {
        /* ignore malformed import */
      }
    }
    reader.readAsText(file)
  }

  return (
    <section className="panel controls-panel">
      <div className="panel-head">
        <div className="panel-title"><span className="dot dot-green" /> Inputs & Settings</div>
      </div>

      <div className="ctl-group">
        <div className="ctl-label">
          <span>Array size</span>
          <span className="ctl-value">{arrSize}</span>
        </div>
        <input
          type="range"
          className="slider"
          min={5}
          max={200}
          step={1}
          value={arrSize}
          onChange={(e) => {
            const n = Number(e.target.value)
            setSize(n)
            if (mode !== 'custom') {
              const vals = sampleByMode(mode, n)
              setValues(vals, mode)
            }
          }}
          aria-label="Array size slider"
        />
      </div>

      <div className="ctl-group">
        <div className="ctl-label"><span>Data generator</span></div>
        <div className="chip-row">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`chip ${mode === m.id ? 'active' : ''}`}
              onClick={() => pickMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        {mode === 'custom' && (
          <input
            type="text"
            className="text-input"
            placeholder="e.g. 2, 5, 1, 8, 3"
            value={customInput}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') pickMode('custom')
            }}
          />
        )}
        <div className="ctl-btns">
          <button type="button" className="btn btn-cyan" onClick={regenerate}>
            ↻ Generate new array
          </button>
        </div>
      </div>

      <div className="ctl-group">
        <div className="ctl-label"><span>Render mode</span></div>
        <div className="chip-row">
          {RENDER.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`chip ${renderMode === r.id ? 'active' : ''}`}
              onClick={() => setRenderMode(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ctl-group">
        <div className="ctl-label"><span>Preferences</span></div>
        <label className="toggle-row">
          <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />
          <span>Dark theme</span>
        </label>
        <label className="toggle-row">
          <input type="checkbox" checked={showTooltip} onChange={(e) => setShowTooltip(e.target.checked)} />
          <span>Hover tooltips</span>
        </label>
      </div>

      <div className="ctl-group">
        <div className="ctl-label"><span>Teaching tools</span></div>
        <div className="ctl-btns">
          <button type="button" className="btn btn-ghost" onClick={exportSteps}>
            ⬇ Export steps (JSON)
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            ⬆ Import steps
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={importSteps}
          />
        </div>
      </div>

      {xp > 0 || achievements.length > 0 || streak > 1 ? (
        <div className="game-panel">
          <div className="game-row">
            <span className="game-xp">{xp} XP</span>
            <span className="game-streak">🔥 {streak} day streak</span>
          </div>
          {achievements.length > 0 && (
            <div className="ach-list">
              {achievements.map((a) => (
                <span key={a} className="ach-item">🏆 {a}</span>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </section>
  )
}