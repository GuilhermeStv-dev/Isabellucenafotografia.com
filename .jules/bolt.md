# Bolt's Journal - Isabel Lucena Fotografia

This journal tracks critical learnings discovered during performance optimizations.

## 2025-02-25 - Initial Discovery
**Learning:** Identifying a performance bottleneck in the `GalleryGrid` component where view/like increments cause O(N) re-renders of all photo cards because of an unstable `handleOpen` callback and redundant effects.
**Action:** Use stable callbacks via `useRef` and memoize derived state to ensure O(1) re-renders when updating photo metrics.

## 2025-02-25 - Prop Stability and Derived State Memoization
**Learning:** Even if a component is wrapped in `React.memo`, it will still re-render if it receives objects created in-place in the parent's render loop (e.g., image sources from `getResponsiveImageSources`). Additionally, $O(N)$ calculations like `reduce` on large photo arrays can add significant overhead if executed on every render.
**Action:** Move image source calculations inside the child component and wrap in `useMemo`. Memoize stats like `totalViews` and `totalLikes` in the page component to avoid redundant $O(N)$ work.
