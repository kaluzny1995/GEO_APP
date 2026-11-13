# GEO_APP React Test Suite

This document inventories the automated tests for the React application. It is
updated whenever the test suite or test counts change.

## Current status

- **Test files:** 39
- **Tests:** 281 passing
- **Framework:** Vitest 2.1.9 + jsdom
- **Libraries:** React Testing Library, `@testing-library/user-event`,
  `@testing-library/jest-dom`
- **Last verified:** 2026-11-13 with `npm test`, `npm run lint` and
  `npm run build`

## How to run

```bash
npm test                  # run the full suite once (vitest run)
npm run test:watch        # run Vitest in watch mode
npm run test:coverage     # generate the v8 coverage report
npm run lint              # ESLint over src/
npm run build             # production Vite build
```

For a flat list of every test case, run:

```bash
npx vitest run --reporter=verbose
```

## Test environment

- `vitest.config.js` uses the `jsdom` environment and loads
  `src/test/setup.jsx` before each suite.
- Chart.js is mocked so canvas is not required; `react-chartjs-2` renders
  lightweight `div` elements with test IDs and serialized chart data/options.
- Bootstrap and the app CSS files are mocked, so tests assert DOM structure,
  text, ARIA state and component logic rather than computed styles.
- Router tests pass the shared `ROUTER_FUTURE_FLAGS` from `src/config.js` to
  `BrowserRouter`, `MemoryRouter` and `HashRouter`, keeping React Router v7
  opt-in warnings out of the output.
- React Router future-flag warnings and Chart.js module-registration messages
  are checked by `src/test/consoleError.test.jsx`.

## Suite overview

| Area | Test files | Tests |
|------|-----------:|------:|
| App shell and routing | 4 | 22 |
| Overview page | 1 | 13 |
| System flow | 3 | 21 |
| Data source files view | 4 | 32 |
| Data quality views and charts | 6 | 66 |
| Data quantity flow | 4 | 20 |
| Event categories and locations | 4 | 20 |
| Shared UI components | 6 | 23 |
| Utilities, API clients and visual config | 7 | 64 |
| **Total** | **39** | **281** |

## Detailed suites

| Page | Contents |
|------|----------|
| [App shell, overview & system flow](docs/testing/frontend.md) | Routing, sidebar, console guards, welcome page and the system-flow diagram/view. |
| [Data views](docs/testing/data-views.md) | Source files, data quality charts/tables, quantity flows and event category/location views. |
| [Shared UI, utilities & manual checks](docs/testing/shared-and-utils.md) | Reusable components, API clients, visual config, table export and browser checks. |
