/* ============================================================
   DSA Visualizer Studio — Smart explanation layer.
   Shows the current step narration, floating live annotations
   (sum, suffix max, pointer) and the keyboard shortcut legend.
   ============================================================ */

import { useVizStore } from '../store'

export function ExplanationLayer() {
  const frame = useVizStore((s) => s.frames[s.index])
  const index = useVizStore((s) => s.index)
  const total = useVizStore((s) => s.frames.length)

  if (!frame) return null
  const phase =
    frame.phase === 'forward' ? 'Forward scan — running sum' :
      frame.phase === 'reverse' ? 'Reverse scan — suffix max' :
        frame.phase === 'init' ? 'Initialization' : 'Complete'

  return (
    <section className="explain-layer">
      <div className="explain-meta">
        <span className={`phase-pill phase-${frame.phase}`}>{phase}</span>
        <span className="step-indicator">
          step {index} / {total - 1}
        </span>
      </div>

      <p className="explain-narr">{frame.narr}</p>

      <div className="floating-vars">
        <div className="fv-box">
          <span className="fv-label">sum</span>
          <span className="fv-value">{frame.sum}</span>
        </div>
        <div className="fv-box">
          <span className="fv-label">suffix max</span>
          <span className="fv-value">{frame.sufMax ?? '—'}</span>
        </div>
        <div className="fv-box">
          <span className="fv-label">i</span>
          <span className="fv-value">{frame.i < 0 ? '—' : frame.i}</span>
        </div>
      </div>
    </section>
  )
}

export function KeyboardHelp() {
  const keys = [
    ['Space', 'Play / Pause'],
    ['→', 'Next step'],
    ['←', 'Previous step'],
    ['Home', 'Jump to start'],
    ['End', 'Jump to end'],
    ['R', 'Reset to start'],
    ['S', 'Cycle speed'],
  ]
  return (
    <div className="kbd-help">
      {keys.map(([k, d]) => (
        <span key={k} className="kbd-item">
          <kbd>{k}</kbd> {d}
        </span>
      ))}
    </div>
  )
}