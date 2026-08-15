/* ============================================================
   DSA Visualizer Studio — Zustand store + playback controller.
   Holds the pre-computed frames, current step, playback engine
   (requestAnimationFrame), speed, and gamification state.
   ============================================================ */

import { create } from 'zustand'
import { clamp } from './core/types'
import type { InputMode, RenderMode, SpeedMultiplier, TraversalFrame } from './core/types'
import { generateInput } from './core/types'
import { generateTraversalFrames } from './core/generator'

const STEP_MS_BASE = 900 // ms per step at 1x

interface RunState {
  values: number[]
  mode: InputMode
  frames: TraversalFrame[]
  index: number
  playing: boolean
  speed: SpeedMultiplier
  renderMode: RenderMode
  selectedLang: string
  arrSize: number
  customInput: string
  dark: boolean
  showTooltip: boolean

  xp: number
  streak: number
  lastActionDay: string
  achievements: string[]
  totalStepsSeen: number

  // actions
  setValues: (values: number[], mode: InputMode) => void
  setSize: (n: number) => void
  setCustom: (s: string) => void
  regenerate: () => void
  play: () => void
  pause: () => void
  toggle: () => void
  goto: (idx: number) => void
  stepNext: () => void
  stepPrev: () => void
  toStart: () => void
  toEnd: () => void
  setSpeed: (s: SpeedMultiplier) => void
  setRenderMode: (m: RenderMode) => void
  setSelectedLang: (l: string) => void
  setDark: (d: boolean) => void
  setShowTooltip: (t: boolean) => void
  reward: (points: number, achievement?: string) => void
  importRun: (values: number[]) => void
}

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

const DEFAULT_MODE: InputMode = 'random'
const DEFAULT_SIZE = 9

function build(vals: number[], mode: InputMode): { values: number[]; frames: TraversalFrame[] } {
  const values = vals.length ? vals : generateInput(mode, DEFAULT_SIZE, '')
  return { values, frames: generateTraversalFrames(values) }
}

const initial = build(generateInput(DEFAULT_MODE, DEFAULT_SIZE, ''), DEFAULT_MODE)

export const useVizStore = create<RunState>()((set, get) => ({
  values: initial.values,
  mode: DEFAULT_MODE,
  frames: initial.frames,
  index: 0,
  playing: false,
  speed: 1,
  renderMode: 'bar',
  selectedLang: 'python',
  arrSize: DEFAULT_SIZE,
  customInput: '',
  dark: true,
  showTooltip: true,

  xp: 0,
  streak: 0,
  lastActionDay: '',
  achievements: [],
  totalStepsSeen: 0,

  setValues: (values, mode) => {
    const b = build(values, mode)
    set({ ...b, mode, values: b.values, playing: false, index: 0 })
  },

  setSize: (n) => set({ arrSize: n }),

  setCustom: (s) => set({ customInput: s }),

  regenerate: () => {
    const { mode, arrSize, customInput } = get()
    const values = generateInput(mode, arrSize, customInput)
    get().setValues(values, mode)
  },

  play: () => {
    const { frames, index } = get()
    if (index >= frames.length - 1) set({ index: 0 })
    set({ playing: true })
  },

  pause: () => set({ playing: false }),

  toggle: () => {
    if (get().playing) get().pause()
    else get().play()
  },

  goto: (idx) => {
    const { frames } = get()
    const i = clamp(idx, 0, frames.length - 1)
    set({ index: i, totalStepsSeen: get().totalStepsSeen + 0 })
  },

  stepNext: () => {
    const { frames, index } = get()
    get().pause()
    if (index < frames.length - 1) {
      set({ index: index + 1 })
      get().reward(1)
    }
  },

  stepPrev: () => {
    const { index } = get()
    get().pause()
    if (index > 0) set({ index: index - 1 })
  },

  toStart: () => {
    get().pause()
    set({ index: 0 })
  },

  toEnd: () => {
    const { frames } = get()
    get().pause()
    set({ index: frames.length - 1 })
  },

  setSpeed: (s) => set({ speed: s }),
  setRenderMode: (m) => set({ renderMode: m }),
  setSelectedLang: (l) => set({ selectedLang: l }),
  setDark: (d) => set({ dark: d }),
  setShowTooltip: (t) => set({ showTooltip: t }),

  reward: (points, achievement) => {
    const today = todayKey()
    const { streak, lastActionDay, xp, achievements, totalStepsSeen } = get()
    let newStreak = streak
    if (lastActionDay !== today) {
      newStreak = lastActionDay === yesterdayKey() ? streak + 1 : 1
    }
    const list = [...achievements]
    if (achievement && !list.includes(achievement)) list.push(achievement)
    set({
      xp: xp + points,
      streak: newStreak,
      lastActionDay: today,
      achievements: list,
      totalStepsSeen: totalStepsSeen + 1,
    })
  },

  importRun: (values) => {
    get().setValues(values, 'custom')
    const size = values.length
    set({ arrSize: size, customInput: values.join(', ') })
  },
}))

function yesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

/** Frame interval in ms that respects the current speed multiplier. */
export function stepIntervalMs(speed: SpeedMultiplier): number {
  return STEP_MS_BASE / speed
}

/** rAF playback driver. Returns a disposer. */
export function startPlayer(onStep: () => void): () => void {
  let raf = 0
  let last = performance.now()
  let acc = 0
  const tick = (now: number) => {
    const dt = now - last
    last = now
    acc += dt
    const { playing, speed, index, frames } = useVizStore.getState()
    if (playing) {
      const interval = stepIntervalMs(speed)
      while (acc >= interval) {
        acc -= interval
        if (index >= frames.length - 1) {
          useVizStore.getState().pause()
          useVizStore.getState().reward(5)
          break
        }
        useVizStore.getState().goto(index + 1)
      }
    } else {
      acc = 0
    }
    onStep()
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}