← [Test suite](../../TESTS.md)

# Data Views Tests

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
