/* ============================================================
   DSA Visualizer Studio — full-screen app shell.
   Wires the store playback engine, keyboard shortcuts and layout.
   ============================================================ */

import { useEffect } from 'react'
import { useVizStore, startPlayer } from './store'
import { CanvasViz } from './components/CanvasViz'
import { Transport } from './components/Transport'
import { CodePanel } from './components/CodePanel'
import { StatsDashboard } from './components/StatsDashboard'
import { Controls } from './components/Controls'
import { ExplanationLayer, KeyboardHelp } from './components/ExplanationLayer'
import type { SpeedMultiplier } from './core/types'

const SPEED_CYCLE: SpeedMultiplier[] = [0.25, 0.5, 0.75, 1, 1.5, 2, 3]

export default function App() {
  const dark = useVizStore((s) => s.dark)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => startPlayer(() => {}), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
      const s = useVizStore.getState()
      switch (e.key) {
        case ' ':
          e.preventDefault()
          s.toggle()
          break
        case 'ArrowRight':
          e.preventDefault()
          s.stepNext()
          break
        case 'ArrowLeft':
          e.preventDefault()
          s.stepPrev()
          break
        case 'Home':
          e.preventDefault()
          s.toStart()
          break
        case 'End':
          e.preventDefault()
          s.toEnd()
          break
        case 'r':
        case 'R':
          s.toStart()
          s.play()
          break
        case 's':
        case 'S': {
          const cur = SPEED_CYCLE.indexOf(s.speed)
          const next = SPEED_CYCLE[(cur + 1) % SPEED_CYCLE.length]
          s.setSpeed(next)
          break
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">◈</div>
          <div className="brand-text">
            <h1>DSA Visualizer Studio</h1>
            <p>Array Traversal — forward sum + reverse suffix max</p>
          </div>
        </div>
        <div className="topbar-meta">
          <span className="algo-badge">O(n) · O(1) space</span>
          <span className="live-dot" title="Full-screen teaching window" />
        </div>
      </header>

      <div className="stage">
        <div className="stage-main">
          <div className="viz-card glass">
            <div className="viz-card-head">
              <span className="viz-title">Visualization Canvas</span>
              <span className="viz-mode-hint">hover any bar → value · index · status</span>
            </div>
            <div className="viz-canvas-box">
              <CanvasViz />
            </div>
            <Transport />
          </div>

          <div className="side-stack">
            <StatsDashboard />
            <ExplanationLayer />
          </div>
        </div>

        <div className="stage-main">
          <div className="left-col">
            <Controls />
            <KeyboardHelp />
          </div>
          <div className="right-col">
            <CodePanel />
          </div>
        </div>
      </div>
    </div>
  )
}