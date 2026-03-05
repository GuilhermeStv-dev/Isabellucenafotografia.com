# Bolt's Journal - Isabel Lucena Fotografia

This journal tracks critical learnings discovered during performance optimizations.

## 2025-02-25 - Initial Discovery
**Learning:** Identifying a performance bottleneck in the `GalleryGrid` component where view/like increments cause O(N) re-renders of all photo cards because of an unstable `handleOpen` callback and redundant effects.
**Action:** Use stable callbacks via `useRef` and memoize derived state to ensure O(1) re-renders when updating photo metrics.

## 2025-02-25 - Data Fetching Strategy
**Learning:** Forcing a data refresh on every navigation to a gallery page (`force: true`) was causing significant perceived lag and unnecessary network traffic. Leveraging in-memory state for previously visited categories provides a much smoother user experience.
**Action:** Default to using cached state in `ensureCategoryPhotosLoaded` and only force refresh when explicitly requested by user actions (like a pull-to-refresh).
