# Bolt's Journal - Isabel Lucena Fotografia

This journal tracks critical learnings discovered during performance optimizations.

## 2025-02-25 - Initial Discovery
**Learning:** Identifying a performance bottleneck in the `GalleryGrid` component where view/like increments cause O(N) re-renders of all photo cards because of an unstable `handleOpen` callback and redundant effects.
**Action:** Use stable callbacks via `useRef` and memoize derived state to ensure O(1) re-renders when updating photo metrics.

## 2025-03-06 - GalleryPage Navigation & Metrics Optimization
**Learning:** Navigation performance was degraded by a `force: true` flag in the photo loading logic, bypassing the in-memory cache. Additionally, total metrics (views/likes) were being recalculated using O(N) array reductions on every render.
**Action:** Leverage cached data by removing forced fetch flags and use `useMemo` for O(N) calculations and complex object generation (like image sources) to keep the main thread lean.
