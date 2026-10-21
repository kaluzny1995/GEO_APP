# GEO_APP React Test Suite

This document inventories the automated tests for the React application. It is
updated whenever the test suite or test counts change.

## Current status

- **Test files:** 24
- **Tests:** 167 passing
- **Framework:** Vitest 2.1.9 + jsdom
- **Libraries:** React Testing Library, `@testing-library/user-event`,
  `@testing-library/jest-dom`
- **Last verified:** 2026-10-21 with `npm test`, `npm run lint` and
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
| App shell and routing | 3 | 14 |
| Overview page | 1 | 8 |
| Data quality views and charts | 6 | 63 |
| Event categories and locations | 4 | 17 |
| Shared UI components | 4 | 14 |
| Utilities, API clients and visual config | 6 | 51 |
| **Total** | **24** | **167** |

## App shell and routing (14)

### `src/App.test.jsx` (4)

Covers the admin shell, route matching, default redirect and unknown-route
redirect.

- renders sidebar, navbar, and content
- navigates to overview by default
- navigates to data quality view when route matches
- redirects unknown routes to overview

### `src/components/Sidebar.test.jsx` (4)

Covers branding, navigation links and footer content in the sidebar.

- renders brand logo and name
- renders Overview nav link
- renders Data Quality nav link pointing to `/data-quality`
- renders footer text

### `src/test/consoleError.test.jsx` (6)

Covers console hygiene: no Chart.js registration/canvas errors, no React Router
future-flag warnings and no uncaught errors during the initial render.

- should not log Chart.js registration errors when rendering DataQualityView
- should not log Chart.js registration errors when rendering Dashboard
- should not log Chart.js registration errors when rendering ChartsView
- should not log canvas reuse errors
- should not log React Router future flag warnings
- should not log any uncaught errors during initial render

## Overview page (8)

### `src/views/Landing.test.jsx` (8)

Covers the landing copy, dashboard links, quality-rule glossary, workflow
instructions, event-count explanation and dataset inventory.

- renders title and description
- renders what is GEO_APP section
- renders dashboard buttons for quality, categories and locations
- lists the data quality rules and what they mean
- explains that defaults load automatically and dropdowns reload metrics
- renders instructions for the Data Quality dashboard
- describes the event count tabs
- lists available datasets

## Data quality views and charts (63)

### `src/views/DataQualityView.test.jsx` (26)

Covers initial loading, table/date selection, API discovery and caching,
gauges, KPI cards, charts, rule table, score badge and error states.

- loads the default table and overall snapshot on mount
- loads metrics when the table dropdown changes
- renders the title, dataset name and date
- renders back to overview link
- renders dataset selector with all 19 tables
- renders date selector with available snapshots
- displays quality gauges computed from long-format metrics
- places the rule table before the gauges in the layout
- explains each quality gauge with a description
- shows +/- change vs the previous snapshot for dated snapshots
- does not show change badges for the overall snapshot
- shows No data for dimensions with no underlying metrics
- renders KPI cards with real values
- renders Quality trend chart from the fetched snapshot
- plots the trend across all available snapshot dates
- renders Radar chart with the four quality dimensions
- renders Rule pass % chart
- renders Rule status chart
- renders Data quality table with rule-level checks
- shows the overall score and health badge
- shows an error card when the API request fails
- shows a red API-down alert when the API is unreachable
- shows a message when no snapshots are available
- discovers all snapshot dates for the table
- fetches the selected snapshot via the per-date endpoint
- caches the discovered date list per table (single probe request)

### `src/components/DataQualityTable.test.jsx` (6)

Covers rule-table headers, rows, filtering, sorting and status badges.

- renders table with headers
- renders all rows
- renders filter input
- filters rows by query
- sorts by passRate when clicking header
- shows correct badge tones

### `src/components/GaugeCard.test.jsx` (12)

Covers gauge rendering, tooltips, score badges, deltas and empty states.

- renders label and value
- renders description and title tooltip when provided
- renders the title above the gauge
- renders gauge SVG
- shows Good badge for >= 90
- shows Warning badge for 75-89
- shows Critical badge for < 75
- shows the +/- change in the badge when delta is provided
- shows negative deltas in red with a minus sign
- shows unchanged deltas in yellow
- does not show a delta when there is no data
- shows No data instead of 0% when value is null

### `src/components/QualityCharts.test.jsx` (7)

Covers the legacy quality chart wrapper and the data/options passed to each
chart.

- renders three chart sections
- renders line chart
- renders bar chart
- renders doughnut chart
- passes correct data to line chart
- passes correct data to bar chart
- passes correct data to doughnut chart

### `src/views/Dashboard.test.jsx` (8)

Covers the legacy mock-data dashboard composition and callbacks.

- renders dataset name and overall score
- renders dataset selector
- calls onDatasetChange when selecting different dataset
- renders all 4 KPI cards
- renders QualityCharts
- renders quality gauges
- renders data quality table
- shows correct overall score badge

### `src/views/ChartsView.test.jsx` (4)

Covers the legacy charts view header, selector and chart rendering.

- renders title and description
- renders dataset selector
- calls onDatasetChange when selecting different dataset
- renders QualityCharts

## Event categories and locations (17)

### `src/views/EventCountsView.test.jsx` (4)

Covers category/location loading, summary rendering, transpose behavior and
API-down retry.

- loads and summarizes event categories
- loads and summarizes event locations
- transposes the category matrix and restores the original layout
- shows the API-down alert and retries the request

### `src/components/EventCountsTable.test.jsx` (6)

Covers event-count rows, heat coloring, location labels, filtering, empty state
and sorting.

- renders category rows with overall share and danger-level cells
- heat-colors non-zero count text and mutes zero counts
- renders location column labels
- filters rows by the search query
- shows an empty message when nothing matches
- sorts by source when the header is clicked

### `src/components/EventCategoryMatrix.test.jsx` (3)

Covers the category × source heatmap, transposition and empty state.

- renders the matrix with totals and heat-colored non-zero cells
- swaps rows and columns when transposed
- shows an empty message when there are no counts

### `src/components/SourceRegionMatrix.test.jsx` (4)

Covers the source × region heatmap, transposition, unknown-region fallback and
empty state.

- renders the source × region matrix with totals and heat-colored non-zero cells
- swaps rows and columns when transposed
- groups unknown country codes under Other
- shows an empty message when there are no counts

## Shared UI components (14)

### `src/components/Tooltip.test.jsx` (2)

Covers tooltip visibility on hover and keyboard focus, and Escape dismissal.

- shows the label on hover and hides it when the pointer leaves
- shows the label on focus and hides it on Escape

### `src/components/Icon.test.jsx` (3)

Covers the local SVG icon component and unknown-icon fallback.

- renders the circular-arrows-couple icon as a decorative SVG
- accepts a custom size and class name
- renders nothing for an unknown icon name

### `src/components/StatCard.test.jsx` (4)

Covers KPI card values, direction classes and change indicators.

- renders label, value, and delta
- applies delta-up class when up is true
- applies delta-down class when up is false
- renders a colored change indicator when provided

### `src/components/Badge.test.jsx` (5)

Covers badge tones and children rendering.

- renders with default tone
- renders with ok tone
- renders with warn tone
- renders with bad tone
- renders children

## Utilities, API clients and visual config (51)

### `src/utils/eventCounts.test.js` (11)

Covers danger normalization, summaries, grouping, region mapping and matrix
construction/transposition.

- normalizes danger levels and flags ratings outside the four levels
- summarizes total and per-level counts with shares
- groups category rows by source/subsource/category/subcategory
- groups location rows by country/state and uses placeholders for missing values
- builds a category × source matrix with row and column totals
- maps country codes to region groups
- assigns every configured country code to exactly one region
- keeps every region group in the configured column order
- builds a source × region matrix in the configured region order
- transposes a matrix while preserving row and column totals
- formats counts and percentages with the configured locale

### `src/utils/quality.test.js` (16)

Covers score calculation, DAMA dimension mapping, score flooring, tone
thresholds and change direction.

- overallScore > calculates average of metrics
- overallScore > returns 0 for empty metrics
- overallScore > handles single metric
- overallScore > rounds down to one decimal (never overstates)
- dimensionsFromMetrics > computes all four DAMA dimensions from long-format rows
- dimensionsFromMetrics > floors to one decimal so small defects are visible
- dimensionsFromMetrics > includes domain/range rules but excludes blank checks for consistency
- dimensionsFromMetrics > returns null consistency when only blank checks exist
- dimensionsFromMetrics > returns nulls when no metrics are present
- dimensionsFromMetrics > tolerates invalid input
- changeTone > returns ok for improvements and bad for regressions
- changeTone > returns warn for no change or missing delta
- changeTone > inverts when an increase is bad (fail rate)
- toneFor > returns ok for >= 90
- toneFor > returns warn for 75-89
- toneFor > returns bad for < 75

### `src/api/dataQuality.test.js` (3)

Covers API-down classification for network failures/timeouts and pass-through
of HTTP errors.

- classifies network failures as API-down connection errors
- classifies aborted requests (timeout) as API-down connection errors
- passes through HTTP errors without the connection flag

### `src/api/eventCounts.test.js` (3)

Covers the category and location endpoints and API-down classification.

- requests the category endpoint
- requests the location endpoint
- classifies network failures as API-down connection errors

### `src/variables/charts.test.js` (8)

Covers pass-rate axis scaling and heatmap intensity/text-color calculations.

- passRateBarOptions > starts the y-axis just below the weakest rule
- passRateBarOptions > caps the axis at 95 when all rules are near-perfect
- passRateBarOptions > keeps the full range for low pass rates and never goes below zero
- passRateBarOptions > defaults to a 95-100 axis for empty input
- heatIntensity > returns null for zero values or zero maximum
- heatIntensity > ramps from the configured minimum to full intensity
- heatTextColor > blends from a readable gray to the accent color
- heatTextColor > clamps intensity to the 0-1 range

### `src/data/mockData.test.js` (10)

Covers the legacy mock dataset, KPI and gauge shapes used by the retained
mock-data views.

- datasets > has 3 datasets
- datasets > each dataset has required fields
- datasets > metrics have all four dimensions
- datasets > trend has month and score
- datasets > rules have id, rule, scope, passRate, fails, status
- kpis > has 4 KPIs
- kpis > each KPI has id, label, value, delta, up
- gaugesFor > returns 4 gauges for a dataset
- gaugesFor > each gauge has id, label, value
- gaugesFor > gauge ids match metric keys

## Manual browser checks

These checks are not part of `npm test`; repeat them after related UI/CSS
changes:

- Transpose toggle: in headless Chrome, the icon remains visible in both the
  default white state and the pressed pink state on hover, rotates 180°, and
  shows the “Transpose” tooltip.
