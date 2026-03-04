# Bolt's Journal - Isabel Lucena Fotografia

This journal tracks critical learnings discovered during performance optimizations.

## 2025-02-25 - Initial Discovery
**Learning:** Identifying a performance bottleneck in the `GalleryGrid` component where view/like increments cause O(N) re-renders of all photo cards because of an unstable `handleOpen` callback and redundant effects.
**Action:** Use stable callbacks via `useRef` and memoize derived state to ensure O(1) re-renders when updating photo metrics.

## 2025-05-15 - Gallery Optimization & Context Pruning
**Learning:** Unused derived state in global contexts (like `allPhotos` flattening) creates significant CPU overhead and GC pressure on every state update, even if the result is never consumed. Additionally, forcing network reloads on every navigation mount (`force: true`) negates the benefits of in-memory caching.
**Action:** Prune unused expensive `useMemo` from context and ensure navigation leverages existing state by default. Always verify usage with `grep` before removing context properties.
