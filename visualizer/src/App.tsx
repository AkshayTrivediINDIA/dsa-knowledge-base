/* ============================================================
   DSA Visualizer Studio — full-screen VS Code-style app shell.
   Title bar + editor tabs + activity bar + status bar around the
   workbench (canvas / stats / controls / code). Dark workbench
   background inspired by Claude.ai, blue accents from VS Code.
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

  const inSite = typeof window !== 'undefined' && /\/viz\/?$/.test(window.location.pathname)

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
      <header className="titlebar">
        <div className="titlebar-left">
          <span className="win-dot win-close" aria-hidden="true" />
          <span className="win-dot win-min" aria-hidden="true" />
          <span className="win-dot win-max" aria-hidden="true" />
          <span className="titlebar-title">DSA Visualizer Studio — Array Traversal</span>
        </div>
        <div className="titlebar-right">
          <span className="algo-badge">O(n) · O(1) space</span>
          {inSite && (
            <a className="brand-back" href="../" title="Back to DSA Knowledge Base">←</a>
          )}
        </div>
      </header>

      <div className="tabbar" role="tablist" aria-label="Editor tabs">
        <span className="ed-tab active" role="tab" aria-selected="true">
          <span className="tab-glyph">◈</span> visualization.ts
        </span>
        <span className="ed-tab" role="tab" aria-selected="false">
          <span className="tab-glyph">◆</span> traversal.cpp
        </span>
        <span className="ed-tab" role="tab" aria-selected="false">
          <span className="tab-glyph">¶</span> explanation.md
        </span>
        <span className="ed-tab" role="tab" aria-selected="false">
          <span className="tab-glyph">◔</span> stats.json
        </span>
        <div className="tabbar-fill" />
        <button type="button" className="tabbar-action" title="Command palette">⌘K</button>
      </div>

      <div className="workbench">
        <aside className="activitybar" aria-label="Activity bar">
          <span className="ab-icon active" title="Explorer">◰</span>
          <span className="ab-icon" title="Run & Debug">▶</span>
          <span className="ab-icon" title="Extensions">▦</span>
          <span className="ab-fill" />
          <span className="ab-icon" title="Settings">⚙</span>
        </aside>

        <main className="workbench-main">
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
        </main>
      </div>

      <footer className="statusbar">
        <span className="sb-item"><span className="sb-glyph">⎇</span> main</span>
        <span className="sb-item">O(n)</span>
        <span className="sb-fill" />
        <span className="sb-item">Ln 12, Col 4</span>
        <span className="sb-item">Spaces: 2</span>
        <span className="sb-item">UTF-8</span>
        <span className="sb-item sb-lang">TypeScript</span>
      </footer>
    </div>
  )
}
