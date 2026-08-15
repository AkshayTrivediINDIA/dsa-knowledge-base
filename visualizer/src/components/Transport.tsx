/* ============================================================
   DSA Visualizer Studio — Transport controls.
   Play/pause, prev/next step, jump to start/end, timeline scrubber
   and the 0.25x–3x speed slider.
   ============================================================ */

import { useVizStore } from '../store'
import type { SpeedMultiplier } from '../core/types'

const SPEEDS: SpeedMultiplier[] = [0.25, 0.5, 0.75, 1, 1.5, 2, 3]

export function Transport() {
  const playing = useVizStore((s) => s.playing)
  const toggle = useVizStore((s) => s.toggle)
  const stepNext = useVizStore((s) => s.stepNext)
  const stepPrev = useVizStore((s) => s.stepPrev)
  const toStart = useVizStore((s) => s.toStart)
  const toEnd = useVizStore((s) => s.toEnd)
  const index = useVizStore((s) => s.index)
  const goto = useVizStore((s) => s.goto)
  const speed = useVizStore((s) => s.speed)
  const setSpeed = useVizStore((s) => s.setSpeed)
  const frames = useVizStore((s) => s.frames)
  const total = frames.length
  const pct = total > 1 ? (index / (total - 1)) * 100 : 0

  return (
    <div className="transport">
      <div className="transport-row">
        <div className="transport-btns">
          <button type="button" className="ctl" onClick={toStart} title="Jump to start (Home)" aria-label="Jump to start">
            ⏮
          </button>
          <button type="button" className="ctl" onClick={stepPrev} title="Previous step (←)" aria-label="Previous step">
            ◀
          </button>
          <button
            type="button"
            className={`ctl play ${playing ? 'on' : ''}`}
            onClick={toggle}
            title={playing ? 'Pause (Space)' : 'Play (Space)'}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? '❚❚' : '▶'}
          </button>
          <button type="button" className="ctl" onClick={stepNext} title="Next step (→)" aria-label="Next step">
            ▶
          </button>
          <button type="button" className="ctl" onClick={toEnd} title="Jump to end (End)" aria-label="Jump to end">
            ⏭
          </button>
        </div>

        <div className="scrub">
          <input
            type="range"
            className="scrubber"
            min={0}
            max={Math.max(total - 1, 0)}
            step={1}
            value={index}
            onChange={(e) => goto(Number(e.target.value))}
            aria-label="Timeline scrubber"
            style={{ background: `linear-gradient(to right, var(--accent-cyan), var(--accent-cyan) ${pct}%, rgba(255,255,255,0.12) ${pct}%)` }}
          />
          <span className="scrub-label">
            step {index} / {Math.max(total - 1, 0)}
          </span>
        </div>
      </div>

      <div className="speed-row">
        <span className="speed-label">Speed</span>
        <div className="speed-btns">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              className={`speed-btn ${s === speed ? 'active' : ''}`}
              onClick={() => setSpeed(s)}
              title={`Set speed to ${s}x`}
            >
              {s}×
            </button>
          ))}
        </div>
        <input
          type="range"
          className="speed-slider"
          min={0}
          max={SPEEDS.length - 1}
          step={1}
          value={SPEEDS.indexOf(speed)}
          onChange={(e) => setSpeed(SPEEDS[Number(e.target.value)])}
          aria-label="Speed slider"
        />
      </div>
    </div>
  )
}