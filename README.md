# GEO_APP — Data Quality & Quantity Dashboard

React JS data-visualization app for **data quality & quantity tables, charts, gauges and badges**.

UI is a **Vite port inspired by [Black Dashboard React](https://www.creative-tim.com/product/black-dashboard-react)** by Creative Tim (MIT). Original template is CRA + Bootstrap 4; this repo re-implements the dark admin look on **Vite + React 18 + React Router + Bootstrap 5 + Chart.js**, with GEO-specific data quality & quantity views.

## Features

- `/overview` — welcome page with what GEO_APP is for, step-by-step
  instructions for reading the dashboard, a glossary of data-quality rules and
  their meanings, and a button group linking to all four dashboards (Data
  Quality, Data Quantity, Event Categories, Event Locations)
- `/data-quality` — data-quality dashboard for a table and snapshot: KPI cards,
  quality gauges, line/radar/bar/doughnut charts (the trend line covers all
  discovered snapshot dates), and a sortable/filterable rule-level table. Table
  and snapshot selectors are in the toolbar, listed alphabetically, and default
  to `avalanche_org` / `overall`, which load automatically when the view opens.
  The selection lives in component state (the URL always stays `/data-quality`);
  changing either dropdown reloads the metrics. The snapshot list is discovered
  from the API (last 120 days + `overall`) and cached per table.
- `/data-quantity` — row-quantity flow diagram for the nine plain source tables,
  their nine ETL tables and `union_etl`. The snapshot selector defaults to the
  latest dated snapshot (falling back to `overall`) and reloads all 19
  `total_records` counts. Each plain → ETL arrow reports rows filtered out (or
  how many more rows the ETL table has), and every ETL table is connected to the
  union card with an SVG flow curve.
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
- the data-quality table, both heatmap matrices and both category/location
  tables have a download menu with CSV, JSON, XML and TXT options. Tables export
  the rows currently visible after filtering/sorting; matrix exports follow the
  current row/column orientation and include totals.
- Data comes from **GEO_API** at `http://localhost:8000` — see
  [DATA_QUALITY_METRICS.md](DATA_QUALITY_METRICS.md) for the endpoint contract,
  long-format metrics, validation rules and dimension mapping.

## Configuration

App-wide values (branding, routes, React Router v7 future flags, API base URL
and endpoint paths, request timeout, probe window, default table, tracked table
names, metric names and rule
IDs, score/rule thresholds, labels, number/percent/score formatting, danger
levels, default heatmap orientations, download formats and the country → region
mapping) live in
[`src/config.js`](src/config.js); visual chart/heatmap defaults live in
[`src/variables/charts.js`](src/variables/charts.js). The
API base URL defaults to
`http://localhost:8000` and can be overridden with the `VITE_API_BASE`
environment variable.

## API

The app expects GEO_API running at `http://localhost:8000` (the base URL is set
in `src/config.js`). Data-quality snapshots come from the `/data-quality/...`
endpoints; see [DATA_QUALITY_METRICS.md](DATA_QUALITY_METRICS.md) for their
contract. The Data Quantity view reads `total_records` from the same endpoint
for all 19 tables and discovers snapshots by probing the union table's
`file-dates` endpoint.

Event counts come from two long-format endpoints:

- `GET /event-counts/category` — rows of
  `{ source_name, subsource_name, event_category, event_subcategory, danger_rating, count }`
- `GET /event-counts/location` — rows of
  `{ source_name, subsource_name, country_code, state_province, danger_rating, count }`

The views sum these rows into an overall total plus the four danger levels.
Events rated `none` or `no_rating` count toward overall totals only. The
heatmap matrices sum the lower dimensions: event category × source (categories
tab) and source × region (locations tab), with each cell showing its share of
all events.

If the API is unreachable or times out, the views show a red alert — "API
server is down! Please check the API server." — with a Retry button; other
errors (e.g. HTTP 500) show a plain error card.

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
checks, is documented in [TESTS.md](TESTS.md). The suite currently contains 30
test files and 207 passing tests. `npm test` runs the suite once; use
`npm run test:watch` for watch mode and `npm run test:coverage` for coverage.

## Project structure

```
GEO_APP/
├── index.html
├── package.json
├── vite.config.js
├── vitest.config.js
├── DATA_QUALITY_METRICS.md  # GEO_API endpoint contract, metrics & rules
├── TESTS.md                 # automated test inventory & manual checks
├── src/
│   ├── main.jsx             # BrowserRouter + Bootstrap + theme CSS
│   ├── App.jsx              # Admin shell (Sidebar + TopNavbar + Routes)
│   ├── config.js            # app config (API, tables, thresholds, labels, regions)
│   ├── routes.js            # route table (overview, quality, quantity, event tabs)
│   ├── api/client.js        # shared fetch + timeout / API-down handling
│   ├── api/dataQuality.js   # GEO_API data-quality client (date discovery)
│   ├── api/dataQuantity.js  # parallel total_records fetcher for the flow diagram
│   ├── api/eventCounts.js   # GEO_API event-count endpoints
│   ├── views/               # Landing, DataQualityView, DataQuantityView, …
│   ├── components/          # Sidebar, GaugeCard, tables, DownloadMenu, diagram, …
│   ├── utils/quality.js     # overallScore / toneFor / changeTone helpers
│   ├── utils/dataQuantity.js # quantity extraction, flow pairs, difference labels
│   ├── utils/eventCounts.js # event-count grouping, region lookup, matrices
│   ├── utils/tableExport.js # CSV/JSON/XML/TXT serializers and file downloads
│   ├── variables/charts.js  # chart colors and base options
│   ├── test/                # Vitest setup (Chart.js/CSS mocks) + console checks
│   └── assets/css/bd-vite.css  # dark theme (original, inspired by Black Dashboard)
```

## Related Projects

GEO_APP is the presentation layer of the GIS data pipeline. The five projects sit as siblings under `GeographicData/`:

- **[GEO_API](../GEO_API)** — the FastAPI backend this dashboard talks to (`src/config.js` → `http://localhost:8000`); provides the `/data-quality/...` and `/event-counts/...` endpoints.
- **[GEO_ETL](../GEO_ETL)** — PySpark ETL that writes the `geo.data_quality` metrics and `geo.union_etl` counts GEO_API serves.
- **[GEO_Download](../GEO_Download)** — fetches the raw source data into dated CSVs.
- **[GEO_E2E](../GEO_E2E)** — Airflow orchestrator that schedules the download and the ETL, and hosts the shared Supabase credentials setup.

## Credits

- UI inspiration: **Black Dashboard React v1.2.2 © 2023 Creative Tim, MIT**  
  https://github.com/creativetimofficial/black-dashboard-react
- This repo contains an original Vite re-implementation (`bd-vite.css`, components), **not** a copy of the template source. See `LICENSE.md`.

## License

MIT — see `LICENSE.md`.
