Read AGENTS.md fully.

Audit and optimize the app for performance.

## Tasks

1. **Convex query optimization**:
   - Audit all queries for read amplification (fetching more data than needed)
   - Ensure every query uses an index — no full table scans
   - Add pagination to all list queries (use `paginationOptsValidator`)
   - Use `take(n)` for dashboard summaries instead of `.collect()`
   - Review `withIndex` usage — ensure compound indexes where needed
2. **React Native performance**:
   - Add `FlashList` (from `@shopify/flash-list`) for long lists (jobs, drivers, bookings) instead of `FlatList`
   - Memoize expensive computations with `useMemo` and `useCallback`
   - Lazy-load screens with `React.lazy` for non-tab routes
   - Optimize images: use `expo-image` with caching and proper `contentFit`
   - Reduce re-renders: extract `React.memo` wrappers for list item components
3. **Bundle size**:
   - Audit dependencies with `npx expo install --check`
   - Remove unused packages (check if `react-native-metamap-sdk` is still in `package.json`)
   - Tree-shake imports: use named imports, avoid `import * from`
4. **Convex function limits**:
   - Check for functions that might exceed Convex's execution time limits
   - Break large operations into batched mutations
   - Use `ctx.storage` efficiently for file operations
5. **Network optimization**:
   - Use Convex subscriptions judiciously — not every query needs real-time updates
   - Batch related queries where possible
   - Add loading skeletons to prevent layout shift
6. **Startup performance**:
   - Minimize work in root `_layout.tsx` (ConvexProvider + ClerkProvider init)
   - Use `expo-splash-screen` to control splash timing
   - Preload fonts with `expo-font` before hiding splash

## Metrics to Track

- Time to interactive (splash → first screen)
- Convex query latency (ms per query)
- List scroll FPS (target: 60fps)
- Bundle size (target: < 15MB for Android)
- Memory usage during typical flows

## Rules

- Measure before optimizing — don't optimize prematurely
- Focus on user-perceived performance (skeletons, optimistic updates)
- Run `bun run typecheck` and `bun run lint` — fix all errors
