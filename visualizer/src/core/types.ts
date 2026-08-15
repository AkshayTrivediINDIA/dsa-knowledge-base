/* ============================================================
   DSA Visualizer Studio — core event model
   Algorithms emit a pure list of events (frames). The UI never
   runs algorithm logic — it only renders events. This fully
   decouples algorithm code from visualization.
   ============================================================ */

export type ElementStatus = 'idle' | 'active' | 'comparing' | 'swapping' | 'sorted' | 'found'

/** One visual step in the timeline. Immutable. */
export interface TraversalFrame {
  /** Step index within the whole run. */
  step: number
  /** Snapshot of values at this step (reference-safe copy done by generator). */
  values: number[]
  /** Per-index status map for coloring. */
  status: Record<number, ElementStatus>
  /** Current scan pointer. */
  i: number
  /** Phase: forward (running sum) or reverse (suffix max). */
  phase: 'init' | 'forward' | 'reverse' | 'done'
  /** Running sum at this step. */
  sum: number
  /** Suffix max value at this step. */
  sufMax: number | null
  /** Pointer x-position used to draw the travelling arrow. */
  pointer: number | null
  /** Live counters. */
  counters: Counters
  /** Natural-language explanation for this step. */
  narr: string
  /** 1-based code line to highlight in the synced code panel. */
  codeLine: number
}

export interface Counters {
  reads: number
  writes: number
  comparisons: number
  steps: number
}

export interface VizMeta {
  title: string
  time: string
  space: string
  best: string
  average: string
  worst: string
}

/** Input generation modes for the control panel. */
export type InputMode = 'random' | 'sorted' | 'reverse' | 'nearly' | 'unique' | 'custom'

/** Visual rendering mode on the canvas. */
export type RenderMode = 'bar' | 'dot' | 'column'

export type SpeedMultiplier = 0.25 | 0.5 | 0.75 | 1 | 1.5 | 2 | 3

/** Hand-rolled lightweight generator yielding uniform ints. */
export function makeRng(seed: number): () => number {
  let s = seed >>> 0
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

/** Build an input array from a mode + size + optional custom string. */
export function generateInput(mode: InputMode, size: number, custom: string, seed = 7): number[] {
  const n = clamp(size, 5, 200)
  const rng = makeRng(seed)
  const values: number[] = []
  if (mode === 'custom') {
    const parts = custom
      .split(/[\s,]+/)
      .map((t) => Number(t))
      .filter((x) => !Number.isNaN(x))
      .slice(0, 200)
    return parts.length ? parts : [2, 5, 1, 8, 3]
  }
  for (let i = 0; i < n; i++) {
    values.push(Math.floor(rng() * 100) + 1)
  }
  if (mode === 'sorted') {
    values.sort((a, b) => a - b)
  } else if (mode === 'reverse') {
    values.sort((a, b) => b - a)
  } else if (mode === 'nearly') {
    values.sort((a, b) => a - b)
    for (let k = 0; k < Math.max(1, Math.floor(n / 10)); k++) {
      const a = Math.floor(rng() * n)
      const b = Math.floor(rng() * n)
      const t = values[a]
      values[a] = values[b]
      values[b] = t
    }
  } else if (mode === 'unique') {
    const set = new Set<number>()
    while (set.size < n) set.add(Math.floor(rng() * (n * 3)) + 1)
    values.length = 0
    values.push(...set)
  }
  return values
}
