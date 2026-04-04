---
name: frontend-playwright
description: >
  Use this skill for ALL frontend tasks in the crypto-dss project — adding components,
  modifying pages, fixing UI bugs, updating styles, or wiring new data into the dashboard.
  This skill MUST be used whenever the task involves anything in apps/frontend/, any React
  component, any UI feature, or any change that a user would see in the browser. It guides
  implementation and then verifies correctness with Playwright e2e tests.
---

# Frontend Implementation + Playwright Verification

You are working on the **Crypto DSS** frontend — a React + TypeScript + Vite app inside an Nx
monorepo. Every frontend task follows this two-phase flow: **implement → verify with Playwright**.

---

## Phase 1: Implement

### Project layout

```
apps/frontend/
  frontend/src/
    app/            ← App entry, routing
    components/     ← Reusable UI components
    pages/          ← Page-level components (Dashboard.tsx is the main one)
    hooks/          ← Custom React hooks
    api/            ← API/fetch helpers
  frontend-e2e/src/ ← Playwright specs
    playwright.config.ts  (baseURL = http://localhost:4300)
```

### Conventions to follow

**Styling**: Use inline styles with CSS variables — no external CSS files, no Tailwind.
The app defines these tokens (use them instead of hard-coded values):
- `var(--bg-base)` — page background
- `var(--bg-card)` — card/panel background
- `var(--font-mono)` — monospace font family
- Accent colors: `#00d4aa` (buy/green), `#ff3b30` (sell/red), `#ff9f0a` (hold/amber)

**Components**: Functional components with TypeScript. Props typed inline or as a named
interface above the component. Export named (not default).

**State**: Local `useState`/`useCallback`/`useEffect` for component state.
For real-time data, follow the `useSignalSocket` hook pattern.

**Shared types**: Import from `shared-types` (the Nx library), not from local files.

**Data flow**: API calls live in `src/api/signals.api.ts`. Hook into existing
`fetchLatestSignal`, `fetchSignalHistory`, `fetchCandles`, `generateSignal` — extend
that file if new endpoints are needed.

### Implementation checklist

Before moving to Phase 2, confirm:
- [ ] Component renders without TypeScript errors
- [ ] Props are properly typed
- [ ] Loading and error states are handled (use skeleton components like `SkeletonSignalCard`
      as a reference pattern)
- [ ] New component is wired into the page (usually `Dashboard.tsx`)
- [ ] No hard-coded colors — use CSS variables or the accent palette above

---

## Phase 2: Verify with Playwright

After implementation, always run e2e tests. This is not optional — it catches regressions
and confirms the feature works end-to-end in a real browser.

### Running the tests

```bash
# Build first (required for preview server)
npx nx run frontend-frontend:build

# Run e2e (starts preview server on :4300 automatically)
npx nx run frontend-frontend-e2e:e2e --project=chromium
```

For faster iteration during development:
```bash
# Run a single spec file
npx nx run frontend-frontend-e2e:e2e --project=chromium -- --grep "your test name"
```

### Writing Playwright tests

New tests go in `apps/frontend/frontend-e2e/src/`. Name the file after what it tests:
`dashboard.spec.ts`, `signal-card.spec.ts`, etc.

**Test structure template:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('ComponentName', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // wait for initial load to settle
    await page.waitForLoadState('networkidle');
  });

  test('renders correctly', async ({ page }) => {
    await expect(page.locator('[data-testid="your-element"]')).toBeVisible();
  });
});
```

**Selector strategy** (in order of preference):
1. `data-testid` attributes — add them to components when writing tests
2. ARIA roles: `page.getByRole('button', { name: '...' })`
3. Text: `page.getByText('...')`
4. Avoid CSS class selectors — they are implementation details

**What to test for new UI features:**
- The element renders and is visible
- Interactive elements (buttons, selects) respond to clicks/changes
- Loading states show skeletons, not blank gaps
- Error states display the error message
- Real-time data (WebSocket) updates the UI — mock with `page.route()` if needed

### If tests fail

1. Check the browser console in the Playwright trace: `npx playwright show-trace trace.zip`
2. For network errors: the backend may not be running — mock API calls with `page.route()`
3. For timing issues: use `await expect(locator).toBeVisible({ timeout: 10000 })` not sleeps
4. Fix the implementation first, then re-run — don't adjust tests to hide real failures

---

## Phase 3: Build Verification (mandatory)

Before declaring any task done, run a production build and confirm it succeeds.
A passing dev server is not enough — build errors only surface at compile time.

```bash
npx nx run frontend-frontend:build
```

The build must exit with code 0. If it fails:
- Read the full error output — TypeScript type errors, missing imports, and bad JSX all
  surface here even if the dev server was tolerant.
- Fix every error. Do not mark the task complete while the build is red.
- Re-run until the build is clean, then proceed to the Playwright step.

Common build failures and fixes:

| Error | Fix |
|-------|-----|
| `TS2345: Argument of type X is not assignable` | Align the prop/function types |
| `Module not found` | Check import path and that the file was saved |
| `JSX element has no corresponding closing tag` | Fix malformed JSX |
| `Property does not exist on type` | Add the missing field to the interface |

---

## Done criteria

A frontend task is complete when ALL three are true — in this order:

1. **Build passes** — `npx nx run frontend-frontend:build` exits with code 0, no errors
2. **Playwright tests pass** — at least one test covers the new UI path, all existing tests still pass
3. **Feature works visually** — the intended behavior is present in the browser

Never skip the build step even for "small" changes. A one-line edit can break a type that
fails silently in dev but blocks the production build.
