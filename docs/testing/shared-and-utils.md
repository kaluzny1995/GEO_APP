← [Test suite](../../TESTS.md)

# Shared UI, Utilities & Manual Checks

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
