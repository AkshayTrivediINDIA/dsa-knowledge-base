/* ============================================================
   DSA Visualizer Studio — Canvas renderer.
   Draws bars / dots / 3D-ish columns for the current frame with
   smooth position interpolation between steps. Handles tooltips
   (hover shows value, index, status) and the travelling pointer.
   Pure Canvas 2D — no external deps. DPR-aware for crisp text.
   ============================================================ */

import { useEffect, useRef, useState, useCallback } from 'react'
import type { ElementStatus, TraversalFrame } from '../core/types'
import { useVizStore } from '../store'

interface DrawOpts {
  width: number
  height: number
  dpr: number
}

interface HoverInfo {
  index: number
  value: number
  status: ElementStatus
  x: number
  y: number
}

const STATUS_COLORS: Record<ElementStatus, string> = {
  idle: '#2e3a52',
  active: '#4ba3ff',
  comparing: '#d7ba7d',
  swapping: '#f48771',
  sorted: '#4ec9b0',
  found: '#c586c0',
}

const STATUS_LABELS: Record<ElementStatus, string> = {
  idle: 'idle',
  active: 'active',
  comparing: 'comparing',
  swapping: 'swapping',
  sorted: 'sorted',
  found: 'processed',
}

export function CanvasViz() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frame = useVizStore((s) => s.frames[s.index])
  const renderMode = useVizStore((s) => s.renderMode)
  const showTooltip = useVizStore((s) => s.showTooltip)
  const playing = useVizStore((s) => s.playing)
  const dims = useRef<DrawOpts>({ width: 0, height: 0, dpr: 1 })

  /* previous frame keeps the last-known values for interpolation */
  const prevFrame = useRef<TraversalFrame | null>(frame)
  const animStart = useRef<number>(performance.now())
  const hover = useRef<HoverInfo | null>(null)
  const pendingHover = useRef(false)

  const [tip, setTip] = useState<HoverInfo | null>(null)

  useEffect(() => {
    prevFrame.current = frame
    animStart.current = performance.now()
  }, [frame])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      dims.current = { width: rect.width, height: rect.height, dpr }
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  const frameValues = (f: TraversalFrame | null): number[] => (f ? f.values : [])
  const maxValue = Math.max(...frameValues(frame), 1)

  const handlePointer = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!showTooltip) return
      const canvas = canvasRef.current
      if (!canvas || !frame) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const n = frame.values.length
      const slot = Math.max(1, rect.width / n)
      const idx = Math.floor(x / slot)
      if (idx >= 0 && idx < n) {
        pendingHover.current = true
        hover.current = {
          index: idx,
          value: frame.values[idx],
          status: frame.status[idx] || 'idle',
          x,
          y,
        }
        setTip(hover.current)
      } else {
        pendingHover.current = false
        hover.current = null
        setTip(null)
      }
    },
    [showTooltip, frame],
  )

  const clearTip = useCallback(() => {
    pendingHover.current = false
    hover.current = null
    setTip(null)
  }, [])

  /* ---------- animation loop ---------- */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0

    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

    const draw = (now: number) => {
      const { width, height, dpr } = dims.current
      if (width <= 0) { raf = requestAnimationFrame(draw); return }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const prev = prevFrame.current && prevFrame.current.step !== (frame?.step ?? -1) ? prevFrame.current : null
      const a = frameValues(prev)
      const b = frameValues(frame)
      const n = Math.max(a.length, b.length, 1)
      const t = Math.min((now - animStart.current) / 300, 1)
      const k = ease(t)

      // background grid
      ctx.clearRect(0, 0, width, height)
      drawGrid(ctx, width, height)

      const slot = width / n
      const pad = Math.max(2, slot * 0.18)
      const barW = Math.max(2, slot - pad * 2)
      const base = height - 40
      const maxBar = height - 90
      const maxV = Math.max(maxValue, ...a, ...b, 1)

      const current = frame
      for (let i = 0; i < n; i++) {
        const va = i < a.length ? a[i] : 0
        const vb = i < b.length ? b[i] : 0
        const v = va + (vb - va) * k
        const h = Math.max(2, (v / maxV) * maxBar)
        const x = i * slot + pad
        const status = current ? current.status[i] || 'idle' : 'idle'
        const color = STATUS_COLORS[status]
        const xCenter = i * slot + slot / 2

        if (renderMode === 'dot') {
          // dot connected with a thin curve
          const y = base - h
          ctx.beginPath()
          ctx.arc(xCenter, y, Math.max(2, barW * 0.55), 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.globalAlpha = status === 'idle' ? 0.55 : 1
          ctx.fill()
          ctx.globalAlpha = 1
        } else if (renderMode === 'column') {
          // faux 3D column: darker front + lighter side
          const depth = Math.min(10, barW * 0.5)
          const yTop = base - h
          ctx.fillStyle = shade(color, -28)
          ctx.fillRect(x + depth, yTop - 3, barW, h + 3)
          ctx.fillStyle = color
          ctx.fillRect(x, yTop, barW, h)
        } else {
          ctx.fillStyle = color
          ctx.fillRect(x, base - h, barW, h)
        }
      }

      /* travelling pointer arrow under the active scan position */
      const idx = frame ? frame.i : -1
      if (frame && idx >= 0 && current!.phase !== 'done') {
        const xCenter = idx * slot + slot / 2
        drawPointer(ctx, xCenter, height - 18, '#4ba3ff')
      }

      /* value + index labels per element */
      ctx.font = '600 11px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      for (let i = 0; i < n; i++) {
        const xCenter = i * slot + slot / 2
        const v = b[i] ?? 0
        ctx.fillStyle = 'rgba(255,255,255,0.55)'
        ctx.fillText(String(v), xCenter, base + 18)
        ctx.fillStyle = 'rgba(255,255,255,0.28)'
        ctx.fillText(String(i), xCenter, base + 32)
      }

      /* keep animating only while playing or while an interpolation is
         still in flight (t < 1). Once settled and paused, stop the rAF
         loop entirely so an idle canvas doesn't burn CPU/GPU on mobile. */
      if (playing || t < 1) raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [frame, renderMode, playing])

  const n = frame ? frame.values.length : 1
  void n

  return (
    <div className="canvas-wrap" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        className="viz-canvas"
        onPointerMove={handlePointer}
        onPointerLeave={clearTip}
        onPointerDown={clearTip}
        aria-label="Algorithm visualization canvas"
        style={{ width: '100%', height: '100%', cursor: showTooltip ? 'crosshair' : 'default' }}
      />
      {tip && showTooltip && (
        <div
          className="viz-tooltip"
          style={{
            left: Math.min(Math.max(tip.x + 14, 4), dims.current.width - 120),
            top: Math.max(tip.y - 12, 4),
          }}
        >
          <div className="vt-line">
            <span className="vt-key">index</span>
            <span className="vt-val">{tip.index}</span>
          </div>
          <div className="vt-line">
            <span className="vt-key">value</span>
            <span className="vt-val" style={{ color: STATUS_COLORS[tip.status] }}>
              {tip.value}
            </span>
          </div>
          <div className="vt-line">
            <span className="vt-key">status</span>
            <span className="vt-val" style={{ color: STATUS_COLORS[tip.status] }}>
              {STATUS_LABELS[tip.status]}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function shade(hex: string, amt: number): string {
  const h = hex.replace('#', '')
  const num = parseInt(h, 16)
  let r = (num >> 16) + amt
  let g = ((num >> 8) & 0xff) + amt
  let b = (num & 0xff) + amt
  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))
  return `rgb(${r},${g},${b})`
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = 'rgba(255,255,255,0.045)'
  ctx.lineWidth = 1
  const step = 46
  for (let y = 60; y < height; y += step) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

function drawPointer(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2.4
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x, y - 12)
  ctx.stroke()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x - 6, y - 8)
  ctx.lineTo(x + 6, y - 8)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}