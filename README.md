# GEO_APP — System Flow, Data Quality & Quantity Dashboard

React JS data-visualization app for **system architecture, data quality & quantity tables, charts, gauges and badges**.

UI is a **Vite port inspired by [Black Dashboard React](https://www.creative-tim.com/product/black-dashboard-react)** by Creative Tim (MIT). Original template is CRA + Bootstrap 4; this repo re-implements the dark admin look on **Vite + React 18 + React Router + Bootstrap 5 + Chart.js**, with GEO-specific data quality & quantity views.

## Features

- `/overview` — welcome page with what GEO_APP is for, step-by-step
  instructions for reading the dashboard, a glossary of data-quality rules and
  their meanings, and a button group linking to the six analysis dashboards
  (System Flow, Data Source Files, Data Quality, Data Quantity, Event Categories,
  Event Locations). System Flow leads the group with its own blue-violet button.
- `/system-flow` — responsive architecture map of the six GEO repositories and
  their technologies. Data sources feed GEO_Download (JSON and CSV edges), dated
  CSVs flow through GEO_ETL into Supabase PostgreSQL (SQL/JDBC), GEO_API serves
  the geo schema as JSON over HTTP to GEO_APP, and GEO_Visual reads the same
  views directly over SQL. GEO_E2E sits above the pipeline with Airflow CLI
  edges and its metadata-database edge. The vertical flow reflows with the
  window width; every source and technology image has a readable label
  underneath, and the database node combines the database symbol with the
  Supabase and PostgreSQL logos. See [SYSTEM_FLOW.md](SYSTEM_FLOW.md) for the
  full inventory.
- `/data-source-files` — CSV snapshot inventory for GEO_Download's `data`
  folder, published by GEO_ETL's PySpark DATA_SOURCE_FILE job. A source dropdown lists
  every subfolder that contains `.csv` files; the table shows one row per
  calendar date with file name, filesystem modification time, record count
  (header excluded) and size in kB. Dates with no CSV for the selected source
  are highlighted red with a `Missing` badge. A two-axis timeline plots record
  counts (left linear axis) and file size in kB (right linear axis); missing
  dates break both lines and are marked with red bands and crosses. The table
  is paginated, and its download menu exports every row for the selected source
  (including missing and undated files), not just the current page. Columns can
  be sorted ascending/descending by date, file name, created time, records and
  size.
- `/data-quality` — data-quality dashboard for a table and snapshot: KPI cards,
  quality gauges, line/radar/bar/doughnut charts (the trend line covers all
  discovered snapshot dates), and a sortable/filterable rule-level table. Table
  and snapshot selectors are in the toolbar, listed alphabetically, and default
  to `avalanche_org` / `overall`, which load automatically when the view opens.
  The table list is read from `GET /data-quality/tables`, so every `geo` relation
  (source tables, `*_etl` tables, the `*_vw` views and `union_etl`) appears
  without a frontend release; `src/config.js` keeps the 19 measured tables as an
  offline fallback. The selection lives in component state (the URL always stays
  `/data-quality`); changing either dropdown reloads the metrics. The snapshot
  list is discovered from the API (last 120 days + `overall`, probed in batches
  of 100 dates — the API's per-request cap) and cached per table.
- `/data-quantity` — row-quantity flow diagram for the nine plain source tables,
  their nine ETL tables and `union_etl`. The snapshot selector defaults to the
  latest dated snapshot (falling back to `overall`) and reloads all 19 actual
  `COUNT(*)` values straight from the database. Each plain → ETL arrow reports
  rows filtered out (or how many more rows the ETL table has), and every ETL
  table is connected to the union card with an SVG flow curve.
- `/event-categories` — event counts by event category/subcategory, broken down
  by source/subsource: overall count and share of all events, plus the count and
  share for each of the four danger levels (low, medium, high, extreme); count
  text is heat-colored by magnitude, and a category × source heatmap matrix sits
  between the KPI badges and the table
- `/event-locations` — the same breakdown by country/state/province, plus a
  source × region heatmap matrix with counts and shares (countries grouped into
  USA, Canada, South and Central America, Europe, Asia, Africa, Oceania,
  Waters/Oceans and Antarctica; see `COUNTRY_REGIONS` in `src/config.js`)
- both heatmap matrices can be transposed (rows/columns swapped) with the
  icon toggle in the card header; hover it to see the “Transpose” tooltip
- the data-quality table, both heatmap matrices, both category/location tables
  and the Data Source Files table have a download menu with CSV, JSON, XML and
  TXT options. Tables export the rows currently visible after filtering/sorting;
  the Data Source Files download always includes every row for the selected
  source, not just the current page. Matrix exports follow the current
  row/column orientation and include totals.
- Data comes from **GEO_API** at `http://localhost:8000` — see
  [DATA_QUALITY_METRICS.md](DATA_QUALITY_METRICS.md) for the endpoint contract,
  long-format metrics, validation rules and dimension mapping.

## Configuration

App-wide values (branding, routes, React Router v7 future flags, API base URL
and endpoint paths, request timeout, probe window, default table, fallback table
names, event-count limit, Data Source Files page size, metric names and rule
IDs, score/rule thresholds, labels, number/percent/score formatting, danger
levels, default heatmap orientations, download formats and the country → region
mapping) live in
[`src/config.js`](src/config.js); visual chart/heatmap defaults live in
[`src/variables/charts.js`](src/variables/charts.js). The
API base URL defaults to
`http://localhost:8000` and can be overridden with the `VITE_API_BASE`
environment variable.

## API

The System Flow view is a static architecture map built from
`src/data/systemFlow.js`; it makes no API request. The data views expect GEO_API
running at `http://localhost:8000` (the base URL is set
in `src/config.js`). Data-quality snapshots come from the `/data-quality/...`
endpoints; see [DATA_QUALITY_METRICS.md](DATA_QUALITY_METRICS.md) for their
contract. The Data Quality view also reads:

- `GET /data-quality/tables` — the authoritative `geo` table/view list for the
  table dropdown (source + `_etl` + `_vw` relations, excluding
  `data_quality`)

The Data Quantity view uses the dedicated quantity endpoints:

- `GET /data-quantity/dates` — every snapshot date present in `geo.union_etl`
  (plus `overall`)
- `GET /data-quantity/{file_date}` — the actual `COUNT(*)` of each of the 19
  tracked tables for that snapshot

Those counts are read from the tables themselves, so they always match the
database. The view deliberately does **not** reuse `total_records` from
`geo.data_quality`: that metric is written by GEO_ETL and can lag behind later
backfills (for example, `union_etl` gained IBTRACS rows after its last metric
run), which made the union card disagree with the table.

The Data Source Files view uses:

- `GET /data-source-files` — the CSV inventory published by GEO_ETL's PySpark
  DATA_SOURCE_FILE job to `geo.data_source_files`, with file name, snapshot date parsed
  from the name, filesystem modification time, record count (header excluded)
  and size in kB. It also returns the configured pipeline start date and the
  latest snapshot date, which the view uses to insert missing-date rows.
  Root-level reference CSVs are excluded. The view plots the dated rows on the
  two-axis timeline, paginates the table and exports the full selected-source
  row set through the shared download menu.

Event counts come from two long-format endpoints:

- `GET /event-counts/category` — rows of
  `{ source_name, subsource_name, event_category, event_subcategory, danger_rating, count }`
- `GET /event-counts/location` — rows of
  `{ source_name, subsource_name, country_code, state_province, danger_rating, count }`

Both endpoints return all groups by default (bounded at 10,000) and the app
requests `?limit=10000` explicitly. The earlier default of 100 truncated the
alphabetically-later sources (NIFC, OpenMeteo, USGS_*), and the location result
has more than 1,000 groups, which is why sources were missing from the heatmaps
and tables.

The views sum these rows into an overall total plus the four danger levels.
Events rated `none` or `no_rating` count toward overall totals only. The
heatmap matrices sum the lower dimensions: event category × source (categories
tab) and source × region (locations tab), with each cell showing its share of
all events.

If the API is unreachable or times out, the views show a red alert — "API
server is down! Please check the API server." — with a Retry button; other
errors (e.g. HTTP 500) show a plain error card.

## Docker

GEO_APP is built as the **`geo_react_app`** image by the Compose stack in
[GEO_E2E](../GEO_E2E). It is a two-stage build: Node 20 compiles the Vite app, and
nginx Alpine serves only the resulting `dist` — no source, tests or lint tooling in
the final image.

- The app is published on **http://localhost:3000**.
- `VITE_API_BASE` is compiled at build time and defaults to `http://localhost:8000`.
  It must be reachable from the browser, not from inside the Compose network.
- The container depends on `geo_fastapi` being healthy before it starts.
- nginx uses a history fallback so React Router paths (`/overview`, `/system-flow`, `/data-source-files`, `/data-quality`, …)
  work on a direct refresh.

```bash
cd ../GEO_E2E
./up.sh -d --build geo_react_app   # preflight (six repos + Supabase .env), then compose up
```

After changing `src/`, `public/`, `index.html` or the API URL, rebuild the image:

```bash
docker compose build geo_react_app
./up.sh -d geo_react_app
```

`docker compose restart geo_react_app` does **not** pick up source changes.

## Install

```bash
nvm use || nvm install 20
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
npm test         # Vitest + React Testing Library
npm run test:coverage  # v8 coverage report
npm run lint     # ESLint
```

## Testing

The full automated test inventory, including every test case and manual browser
checks, is documented in [TESTS.md](TESTS.md). The suite currently contains 39
test files and 281 passing tests. `npm test` runs the suite once; use
`npm run test:watch` for watch mode and `npm run test:coverage` for coverage.

## Project structure

```
GEO_APP/
├── index.html
├── package.json
├── vite.config.js
├── vitest.config.js
├── DATA_QUALITY_METRICS.md  # GEO_API endpoint contract, metrics & rules
├── SYSTEM_FLOW.md           # repository/technology map and flow inventory
├── TESTS.md                 # automated test inventory & manual checks
├── src/
│   ├── main.jsx             # BrowserRouter + Bootstrap + theme CSS
│   ├── App.jsx              # Admin shell (Sidebar + TopNavbar + Routes)
│   ├── config.js            # app config (API, tables, thresholds, labels, regions)
│   ├── routes.js            # route table (overview, system flow, source files, quality, …)
│   ├── api/client.js        # shared fetch + timeout / API-down handling
│   ├── api/dataQuality.js   # GEO_API data-quality client (date discovery)
│   ├── api/dataQuantity.js  # actual table-count fetcher for the flow diagram
│   ├── api/dataSourceFiles.js # GEO_Download CSV metadata fetcher
│   ├── api/eventCounts.js   # GEO_API event-count endpoints
│   ├── data/systemFlow.js   # system-flow nodes, edges, logos, layouts and stacks
│   ├── views/               # Landing, SystemFlowView, DataSourceFilesView, DataQualityView, …
│   ├── components/          # Sidebar, SystemFlowDiagram, GaugeCard, tables, DownloadMenu, …
│   ├── utils/quality.js     # overallScore / toneFor / changeTone helpers
│   ├── utils/dataQuantity.js # quantity extraction, flow pairs, difference labels
│   ├── utils/dataSourceFiles.js # date-range expansion, missing rows, sorting
│   ├── utils/eventCounts.js # event-count grouping, region lookup, matrices
│   ├── utils/tableExport.js # CSV/JSON/XML/TXT serializers and file downloads
│   ├── variables/charts.js  # chart colors and base options
│   ├── test/                # Vitest setup (Chart.js/CSS mocks) + console checks
│   └── assets/css/bd-vite.css  # dark theme (original, inspired by Black Dashboard)
```

## Related Projects

GEO_APP is the React presentation layer of the GIS data pipeline. The six projects sit as siblings under `GeographicData/`:

- **[GEO_API](../GEO_API)** — the FastAPI backend this dashboard talks to (`src/config.js` → `http://localhost:8000`); provides the `/data-quality/...`, `/data-source-files` and `/event-counts/...` endpoints.
- **[GEO_ETL](../GEO_ETL)** — PySpark ETL that writes the `geo.data_quality` metrics and `geo.union_etl` counts GEO_API serves.
- **[GEO_Download](../GEO_Download)** — fetches the raw source data into dated CSVs.
- **[GEO_E2E](../GEO_E2E)** — Airflow orchestrator that schedules the download and the ETL, and hosts the shared Supabase credentials setup.
- **[GEO_Visual](../GEO_Visual)** — Streamlit dashboard served by the `geo_streamlit` container in GEO_E2E; it reads the same Supabase views directly (read-only SQL) for analytical pages and does not use GEO_API.

## Credits

- UI inspiration: **Black Dashboard React v1.2.2 © 2023 Creative Tim, MIT**  
  https://github.com/creativetimofficial/black-dashboard-react
- This repo contains an original Vite re-implementation (`bd-vite.css`, components), **not** a copy of the template source. See `LICENSE.md`.

## License

MIT — see `LICENSE.md`.
