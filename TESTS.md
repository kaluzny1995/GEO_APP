# GEO_APP React Test Suite

This document inventories the automated tests for the React application. It is
updated whenever the test suite or test counts change.

## Current status

- **Test files:** 39
- **Tests:** 281 passing
- **Framework:** Vitest 2.1.9 + jsdom
- **Libraries:** React Testing Library, `@testing-library/user-event`,
  `@testing-library/jest-dom`
- **Last verified:** 2026-11-06 with `npm test`, `npm run lint` and
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

## App shell and routing (22)

### `src/App.test.jsx` (7)

Covers the admin shell, route matching, default redirect and unknown-route
redirect.

- renders sidebar, navbar, and content
- navigates to overview by default
- navigates to system flow view when route matches
- navigates to data quality view when route matches
- navigates to data source files view when route matches
- navigates to data quantity view when route matches
- redirects unknown routes to overview

### `src/routes.test.js` (3)

Covers the sidebar route order and the configured System Flow and
Data Source Files paths.

- places System Flow after Overview and before Data Source Files and Data Quality
- uses the configured system-flow path
- uses the configured data-source-files path

### `src/components/Sidebar.test.jsx` (6)

Covers branding, navigation links and footer content in the sidebar.

- renders brand logo and name
- renders Overview nav link
- renders System Flow nav link pointing to `/system-flow`
- renders Data Quality nav link pointing to `/data-quality`
- renders Data Quantity nav link pointing to `/data-quantity`
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

## Overview page (13)

### `src/views/Landing.test.jsx` (13)

Covers the landing copy, dashboard links, quality-rule glossary, workflow
instructions, event-count explanation and dataset inventory.

- renders title and description
- renders what is GEO_APP section
- renders dashboard buttons for system flow, source files, quality, quantity, categories and locations
- renders instructions for the System flow view
- lists the data quality rules and what they mean
- explains that defaults load automatically and dropdowns reload metrics
- renders instructions for the Data Quality dashboard
- renders instructions for the Data Quantity dashboard
- renders instructions for the Data Source Files dashboard
- renders instructions for the Event Categories dashboard
- renders instructions for the Event Locations dashboard
- orders the view cards like the sidebar navigation
- lists available datasets

## System flow (21)

### `src/data/systemFlow.test.js` (10)

Covers the repository/source inventory, Airflow UI tile, database composition,
flow formats and edge lookup.

- lists the six repositories in pipeline order
- gives every repository a folder image and the expected technology logos
- lists nine data sources: seven JSON APIs and two CSV feeds
- uses the Airflow image for Airflow UI and the Streamlit image for GEO_Visual
- combines the database symbol with Supabase and PostgreSQL
- describes the CSV store with a labelled folder symbol
- uses every flow kind in at least one relationship
- models the pipeline formats between components
- exposes an edge lookup for the diagram connectors
- connects Airflow to the download, ETL and metadata database nodes

### `src/components/SystemFlowDiagram.test.jsx` (6)

Covers repository/source nodes, readable technology labels, the combined
database node, edge badges, connector labels and GEO_E2E orchestration links.
The technology checks include the requests, Pydantic, JDBC, SQLModel, asyncpg,
Vite, Chart.js, Bootstrap, pandas, Plotly and psycopg logos.

- renders every repository node with its name and folder image
- renders every data source with its name and JSON or CSV format badge
- renders a readable label under every technology image
- combines Supabase and PostgreSQL in the database node
- renders a badge group for every relationship
- renders connector labels and the GEO_E2E orchestration links

### `src/views/SystemFlowView.test.jsx` (5)

Covers the view header, responsive diagram, legend, technology inventory and
reading instructions.

- renders the title, subtitle and back link
- renders the interactive system flow diagram
- renders the flow legend for every transfer format
- renders the complete technology inventory for all six repositories
- explains how to read the diagram and the responsive labels

## Data source files view (32)

### `src/views/DataSourceFilesView.test.jsx` (8)

Covers the source dropdown, timeline, CSV table, missing-date highlighting,
sorting, pagination, full-table download and error states.

- lists sources and renders files with a red row for a missing date
- reloads the list from the already-fetched files when the source changes
- sorts by file name ascending and descending
- plots records and file sizes with missing dates marked
- paginates the table and downloads every row, not just the current page
- returns to the first page when the sort changes
- shows the API-down alert and retries the request
- shows an empty state when no source folders contain CSV files

### `src/api/dataSourceFiles.test.js` (5)

Covers normalization of the `GET /data-source-files` response and API-down
classification.

- normalizes the API payload and sorts source names
- keeps missing numeric fields as null
- derives sources from files when the API omits the source list
- returns an empty payload for an invalid response body
- classifies network failures as API-down connection errors

### `src/utils/dataSourceFiles.test.js` (16)

Covers date-range expansion, missing-date placeholders, timeline series,
pagination, sorting and formatting.

- returns every calendar date inclusively
- returns an empty list for invalid or reversed ranges
- inserts a missing row for every date without a file
- shows missing dates before a source first file when the range starts earlier
- filters by source and keeps undated files visible
- builds dated series, nulls for missing dates and a zero marker
- sorts dated rows chronologically
- keeps undated files out of the series but counts them
- returns empty series for no rows
- slices the requested page and reports the range
- clamps a page outside the available range
- returns one empty page for an empty list
- sorts file names ascending and descending, keeping missing rows last
- sorts records and size numerically
- keeps missing rows in chronological order when sorting by date
- formats records, sizes and missing values

### `src/components/DataSourceFilesChart.test.jsx` (3)

Covers the two-axis timeline data, missing-date markers and scale configuration.

- renders a line chart
- plots records, size and the missing-date marker
- uses two linear y-axes

## Data quality views and charts (66)

### `src/views/DataQualityView.test.jsx` (27)

Covers initial loading, table/date selection, API discovery and caching,
gauges, KPI cards, charts, rule table, score badge and error states.

- loads the default table and overall snapshot on mount and renders its download menu
- loads metrics when the table dropdown changes
- renders the title, dataset name and date
- renders back to overview link
- renders dataset selector with all 19 fallback tables
- adds relations returned by the API table list (e.g. views)
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

### `src/components/DataQualityTable.test.jsx` (8)

Covers rule-table headers, rows, filtering, sorting, status badges and downloads.

- renders table with headers
- renders all rows
- renders a download menu for the table
- downloads the filtered table rows
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

## Data quantity flow (20)

### `src/views/DataQuantityView.test.jsx` (6)

Covers latest-snapshot defaulting, sorted date selection, flow labels, retry
behavior and empty/API-down states.

- defaults to the latest dated snapshot and fetches all table counts
- lists the available dates in sorted order and reloads on selection
- renders filtered-out, added and union row labels
- shows an error and retries the request
- shows an API-down alert when the API is unreachable
- shows a message when no snapshots are available

### `src/components/DataQuantityDiagram.test.jsx` (4)

Covers plain/ETL cards, filtered/added/even arrow badges, SVG union connectors
and missing-count rendering.

- renders every plain and ETL table plus the union total
- labels filtered, added and even rows on the plain-to-ETL links
- draws one curved union connector per ETL table
- shows missing values when counts are unavailable

### `src/utils/dataQuantity.test.js` (4)

Covers locale formatting, differences, flow-pair derivation and missing values.

- formats quantities with the configured locale and handles missing values
- sums known quantities and ignores missing values
- computes differences and labels only when both counts are known
- builds one flow row per configured plain/ETL pair

### `src/api/dataQuantity.test.js` (6)

Covers the date-discovery and actual-count endpoints, response mapping and error
propagation.

- fetches the snapshot dates from the data-quantity endpoint
- fetches actual row counts for a snapshot and maps them by table
- ignores untracked tables and non-numeric counts
- returns an empty object when the API returns a non-list body
- propagates request failures
- tracks every table configured in the app

## Event categories and locations (20)

### `src/views/EventCountsView.test.jsx` (5)

Covers category/location loading, summary rendering, transpose behavior,
downloads and API-down retry.

- loads and summarizes event categories
- loads and summarizes event locations
- transposes the category matrix and restores the original layout
- downloads the matrix in its current transposition state
- shows the API-down alert and retries the request

### `src/components/EventCountsTable.test.jsx` (8)

Covers event-count rows, heat coloring, location labels, filtering, empty state,
sorting and downloads.

- renders category rows with overall share and danger-level cells
- heat-colors non-zero count text and mutes zero counts
- renders a download menu with the table title
- downloads the filtered table with count and share columns
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

## Shared UI components (23)

### `src/components/Tooltip.test.jsx` (2)

Covers tooltip visibility on hover and keyboard focus, and Escape dismissal.

- shows the label on hover and hides it when the pointer leaves
- shows the label on focus and hides it on Escape

### `src/components/Icon.test.jsx` (4)

Covers the local SVG icon component, download/file icons and unknown-icon
fallback.

- renders the circular-arrows-couple icon as a decorative SVG
- accepts a custom size and class name
- renders download and file-format icons (CSV, JSON, SQL, XML, TXT, HTTP, CLI)
- renders nothing for an unknown icon name

### `src/components/Pagination.test.jsx` (4)

Covers the shared pagination controls, range label and disabled boundaries.

- shows the current range and page count
- navigates to first, previous, next and last page
- disables backward controls on the first page and forward controls on the last
- handles an empty table as a single empty page

### `src/components/DownloadMenu.test.jsx` (4)

Covers hover/focus opening, all four formats, selection, Escape and outside-click
dismissal.

- opens on hover, lists all formats and downloads the selected one
- opens on focus and closes on Escape
- closes when the pointer leaves the menu area
- closes when clicking outside

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

## Utilities, API clients and visual config (64)

### `src/utils/tableExport.test.js` (9)

Covers CSV/JSON/XML/TXT serialization, escaping, filenames, matrix orientation
and blob link downloads.

- serializes CSV with headers, escaping and empty values
- serializes JSON as an array of row objects
- serializes XML with escaped fields
- serializes TXT as tab-separated rows
- rejects unsupported formats
- builds safe filenames
- builds a matrix export in the displayed orientation
- builds a transposed matrix export
- creates a typed blob link, clicks it and revokes the URL

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

### `src/api/dataQuality.test.js` (7)

Covers API-down classification for network failures/timeouts, pass-through of
HTTP errors and the authoritative table/view list.

- classifies network failures as API-down connection errors
- classifies aborted requests (timeout) as API-down connection errors
- passes through HTTP errors without the connection flag
- fetches the authoritative table/view list and sorts it

### `src/api/eventCounts.test.js` (3)

Covers the category and location endpoints and API-down classification. Both
requests carry the explicit `?limit=10000` that keeps every source in the response.

- requests the category endpoint with the full 10,000-group limit
- requests the location endpoint with the full 10,000-group limit
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
- Download menus: on Data Quality, Event Categories and Event Locations, hover
  the download icon, confirm all four formats appear with file icons, and
  confirm selecting a format downloads the current table (including the
  transposed matrix orientation after using the transpose toggle).
- Data Quantity flow: open `/data-quantity` in headless Chrome, confirm the
  latest snapshot loads all nine plain/ETL rows, missing counts render as an
  italic red “no data” with a “No count” badge, filtered rows show badges, nine
  SVG curves reach the union card, and the diagram scrolls horizontally without
  overflowing the page on narrow screens.
- Data Quantity dates: switch the snapshot selector and confirm all 19 counts,
  badges and the union total reload; test the Retry path with the API stopped.
- Data Source Files: open `/data-source-files`, confirm the source dropdown
  lists every `GEO_Download/data` subfolder with CSV files, the timeline shows
  records on the left linear axis and size in kB on the right, missing dates
  break both lines and carry red bands/crosses, the table shows
  date/file/created/records/size with a red `Missing` row, each sortable header
  toggles ascending/descending, the pagination controls move between pages and
  reset to page 1 after sorting, and the download menu exports every row for
  the selected source (including missing and undated files) in all four
  formats. Confirm the Retry path works with the API stopped.
- System Flow: open `/system-flow`, confirm the GEO_E2E banner sits above the
  pipeline, the nine source logos feed GEO_Download with JSON and CSV badges,
  the CSV store → GEO_ETL → Supabase PostgreSQL path is connected, GEO_API →
  GEO_APP shows HTTP and JSON badges, GEO_Visual reads the database over SQL,
  every `no_text` asset has a visible label, the database card reads
  **Supabase PostgreSQL**, and the diagram scrolls horizontally without
  overflowing the page on narrow screens. Check the flow legend and the
  six-row technology inventory below the diagram.
- Overview: confirm the blue-violet **System Flow** button is first in the
  dashboard button group and links to `/system-flow`, and that the cards
  follow the sidebar order — What is GEO_APP for?, System Flow, Data Source
  Files, Data Quality, Data Quantity, Event Categories, Event Locations, Data
  quality rules, Available dataset tables. Each of the six view cards links to
  its route and describes its own layout; Event Categories and Event Locations
  have separate cards, and the Data Source Files card covers the timeline,
  missing-date highlighting, pagination and full-table download.
