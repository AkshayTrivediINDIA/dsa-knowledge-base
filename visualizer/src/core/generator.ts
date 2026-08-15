/* ============================================================
   DSA Visualizer Studio — StepGenerator for Array Traversal
   Emits an immutable list of TraversalFrame events for:
     phase 1  forward  : running sum (i: 0 -> n-1)
     phase 2  reverse  : suffix max (i: n-1 -> 0)
   Pre-computed up-front so the timeline can scrub freely.
   ============================================================ */

import type { Counters, TraversalFrame } from './types'

export interface TraversalCfg {
  values: number[]
}

interface Active {
  i: number
  phase: 'init' | 'forward' | 'reverse' | 'done'
  sum: number
  sufMax: number | null
}

/** 1-based code line numbers for each phase, shared across languages
    (each language file maps its own lines to the same semantic phase). */
export const CODE_LINE = {
  init: 3,
  forwardLoop: 6,
  forwardAdd: 7,
  reverseLoop: 10,
  reverseUpdate: 11,
  reverseStore: 12,
  done: 14,
}

function cloneValues(v: number[]): number[] {
  return v.slice()
}

function initialCounters(): Counters {
  return { reads: 0, writes: 0, comparisons: 0, steps: 0 }
}

function emit(
  acc: TraversalFrame[],
  cfg: TraversalCfg,
  st: Active,
  status: TraversalFrame['status'],
  narr: string,
  codeLine: number,
  counters: Counters,
  pointer: number | null,
): TraversalFrame {
  const frame: TraversalFrame = {
    step: acc.length,
    values: cloneValues(cfg.values),
    status,
    i: st.i,
    phase: st.phase,
    sum: st.sum,
    sufMax: st.sufMax,
    pointer,
    counters: { ...counters },
    narr,
    codeLine,
  }
  acc.push(frame)
  return frame
}

/** Generate the full timeline of frames for the given array. */
export function generateTraversalFrames(values: number[]): TraversalFrame[] {
  const cfg: TraversalCfg = { values }
  const frames: TraversalFrame[] = []
  const n = values.length
  const counters = initialCounters()

  const st: Active = { i: -1, phase: 'init', sum: 0, sufMax: null }

  /* ---- init ---- */
  emit(
    frames, cfg, st,
    {},
    `We traverse every element of the array exactly once. Start with a running sum of 0.`,
    CODE_LINE.init,
    counters,
    null,
  )

  /* ---- forward: running sum ---- */
  st.phase = 'forward'
  for (let i = 0; i < n; i++) {
    st.i = i
    const status: Record<number, string> = {}
    for (let k = 0; k < n; k++) status[k] = k < i ? 'found' : 'idle'
    status[i] = 'active'
    const before = st.sum
    st.sum = before + values[i]
    counters.reads += 1
    counters.writes += 1
    emit(
      frames, cfg, st, status as TraversalFrame['status'],
      `i = ${i}: sum = ${before} + ${values[i]} = ${st.sum}. Reading a[${i}] into the running total.`,
      i === 0 ? CODE_LINE.forwardLoop : CODE_LINE.forwardAdd,
      counters,
      i,
    )
  }
  st.i = n - 1
  counters.steps += 1
  emit(
    frames, cfg, st,
    {},
    `Forward pass complete — total sum = ${st.sum}. Now scan from the right to find the suffix maximum at every position.`,
    CODE_LINE.reverseLoop,
    counters,
    null,
  )

  /* ---- reverse: suffix max ---- */
  st.phase = 'reverse'
  st.sufMax = null
  for (let j = n - 1; j >= 0; j--) {
    st.i = j
    const status: Record<number, string> = {}
    for (let k = 0; k < n; k++) status[k] = k > j ? 'sorted' : 'idle'
    status[j] = 'active'
    if (st.sufMax === null || values[j] > st.sufMax) {
      st.sufMax = values[j]
    }
    counters.reads += 1
    counters.comparisons += 1
    counters.writes += 1
    emit(
      frames, cfg, st, status as TraversalFrame['status'],
      `i = ${j}: suffix max = ${st.sufMax} (largest of a[${j}..${n - 1}]). a[${j}] = ${values[j]}.`,
      CODE_LINE.reverseUpdate,
      counters,
      j,
    )
  }
  st.i = 0
  st.phase = 'done'
  counters.steps += 1
  emit(
    frames, cfg, st,
    {},
    `Done! Suffix max array = [${values
      .map((_, idx) => maxSuffix(values, idx))
      .join(', ')}] — the max of a[i..n-1] at every index.`,
    CODE_LINE.done,
    counters,
    null,
  )

  return frames
}

function maxSuffix(values: number[], from: number): number {
  let m = -Infinity
  for (let k = from; k < values.length; k++) if (values[k] > m) m = values[k]
  return m
}
