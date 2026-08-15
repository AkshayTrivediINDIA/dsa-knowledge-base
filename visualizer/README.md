# DSA Visualizer Studio

Full-screen, immersive algorithm visualizer — the interactive teaching window for
**Array Traversal** (forward running-sum + reverse suffix-max). Built as a separate
React 19 + TypeScript + Vite app so it can grow into a standalone product.

## Run it

```bash
cd visualizer
npm install
npm run dev          # local dev at http://localhost:5173
npm run build        # production build -> dist/
npm run preview      # serve the production build
```

> Note for Android / FUSE-mounted storage (e.g. `/sdcard`): install and build on a
> normal filesystem if `npm install` is slow — copy `src/` + config to `/tmp`, run
> `npm install && npm run build` there, then copy `dist/` back.

## What's inside

- **Canvas renderer** (no external viz lib): bars / dots / 3D-ish columns with smooth
  interpolation between steps, hover tooltips (value · index · status), travelling pointer.
- **Event-driven core**: `generateTraversalFrames()` in `src/core/generator.ts` pre-computes
  an immutable frame list — the UI only renders events, so algorithms stay decoupled.
- **Step playback**: play/pause, prev/next, jump to start/end, timeline scrubber,
  0.25x–3x speed slider, `Space ← → Home End R S` keyboard shortcuts.
- **5-language synced code panel**: C / C++ / Java / Python / Dart with live line
  highlight per step, copy button, and fold-to-focus.
- **Complexity & stats dashboard**: Big-O badges, live counters (reads / writes /
  comparisons / steps), and a live ops-vs-n complexity curve.
- **Smart explanation layer**: natural-language narration per step + floating live
  annotations (sum, suffix max, index).
- **Inputs**: array size 5–200, Random / Sorted / Reverse / Nearly Sorted / Few Unique /
  Custom, render-mode switcher, dark/light glassmorphic theme.
- **Teaching tools**: export/import the step timeline as JSON; XP / streak / achievements.

## Architecture

```
src/
  core/types.ts        event + frame + input/render models
  core/generator.ts    StepGenerator -> immutable TraversalFrame[]
  core/code.ts         the 5 language sources
  store.ts             Zustand store + rAF playback controller
  components/          CanvasViz, Transport, CodePanel, StatsDashboard,
                       Controls, ExplanationLayer
  App.tsx              full-screen shell + keyboard wiring
```

Phase 2 will add more algorithms (sorting, searching, recursion trees) by registering
new StepGenerators behind the same `TraversalFrame`-style event contract.
