# Bolt's Journal - Isabel Lucena Fotografia

This journal tracks critical learnings discovered during performance optimizations.

## 2025-02-25 - Initial Discovery
**Learning:** Identifying a performance bottleneck in the `GalleryGrid` component where view/like increments cause O(N) re-renders of all photo cards because of an unstable `handleOpen` callback and redundant effects.
**Action:** Use stable callbacks via `useRef` and memoize derived state to ensure O(1) re-renders when updating photo metrics.

## 2025-05-14 - Redundant Reductions in Page Hero
**Learning:** Even with memoized grid items, page-level re-renders (triggered by context updates) can still be slow if derived O(N) metrics (total views/likes) are not memoized. These calculations block the main thread before React even starts reconciliation.
**Action:** Always wrap array reductions and external library calls (like image optimization) in `useMemo` when they depend on props/context that change frequently.
