/* ============================================================
   DSA Visualizer Studio — Real-time stats dashboard.
   Big-O badges, live counters (reads/writes/comparisons/steps),
   and a small live complexity curve (operations vs input size)
   sketched on inline <canvas>.
   ============================================================ */

import { useEffect, useRef } from 'react'
import { useVizStore } from '../store'

export function StatsDashboard() {
  const frame = useVizStore((s) => s.frames[s.index])
  const values = useVizStore((s) => s.values)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const counters = frame ? frame.counters : { reads: 0, writes: 0, comparisons: 0, steps: 0 }
  const n = values.length

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = canvas.getBoundingClientRect()
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const W = rect.width
    const H = rect.height
    ctx.clearRect(0, 0, W, H)

    // O(n) line: y = k*x
    const maxOps = Math.max(3, n * 2)
    const pad = 6
    const py = (ops: number) => pad + (1 - ops / maxOps) * (H - pad * 2)

    // axis grid
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    for (let i = 0; i < 4; i++) {
      const y = pad + (i / 3) * (H - pad * 2)
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke()
    }

    // actual operations so far (linear — traversal)
    ctx.strokeStyle = '#ff5c8a'
    ctx.lineWidth = 1.8
    ctx.beginPath()
    const curve: Array<[number, number]> = []
    for (let i = 1; i <= Math.max(1, Math.round(W / 8)); i++) {
      const x = i * (W / Math.max(1, Math.round(W / 8)))
      const ops = Math.min(i, n)
      curve.push([x, py(ops)])
    }
    curve.forEach(([x, y], idx) => (idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.stroke()

    // current position dot
    const progress = frame ? frame.step : 0
    const cx = pad + (progress / Math.max(1, 40)) * (W - pad * 2)
    const cy = py(Math.min(progress + 1, n))
    ctx.fillStyle = '#ff5c8a'
    ctx.beginPath()
    ctx.arc(cx, cy, 2.6, 0, Math.PI * 2)
    ctx.fill()

    // O(1) reference band at bottom
    ctx.strokeStyle = 'rgba(0,229,255,0.35)'
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(pad, H - pad)
    ctx.lineTo(W - pad, H - pad)
    ctx.stroke()
    ctx.setLineDash([])
  }, [frame, n])

  const BigO = ({ label, value }: { label: string; value: string }) => (
    <div className="bigo">
      <span className="bigo-label">{label}</span>
      <span className="bigo-value">{value}</span>
    </div>
  )

  return (
    <section className="panel stats-panel">
      <div className="panel-head">
        <div className="panel-title"><span className="dot dot-pink" /> Complexity & Stats</div>
      </div>

      <div className="bigo-row">
        <BigO label="Time" value={frame?.phase === 'done' ? 'O(n)' : 'O(n)'} />
        <BigO label="Space" value="O(1)" />
        <BigO label="Best" value="O(n)" />
        <BigO label="Avg" value="O(n)" />
        <BigO label="Worst" value="O(n)" />
      </div>

      <div className="counters">
        <Counter label="reads" value={counters.reads} />
        <Counter label="writes" value={counters.writes} />
        <Counter label="comparisons" value={counters.comparisons} />
        <Counter label="steps" value={counters.steps} />
      </div>

      <div className="curve-head">
        <span>Complexity curve <em>(ops vs n)</em></span>
        <span className="curve-key"><i className="ck ck-data" /> traversal ops</span>
      </div>
      <canvas ref={canvasRef} className="curve-canvas" style={{ width: '100%', height: '92px' }} aria-label="Complexity curve chart" />
    </section>
  )
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="counter">
      <span className="counter-val">{value}</span>
      <span className="counter-label">{label}</span>
    </div>
  )
}