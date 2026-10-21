# GEO_APP — Data Quality & Quantity Dashboard

React JS data-visualization app for **data quality & quantity tables, charts, gauges and badges**.

UI is a **Vite port inspired by [Black Dashboard React](https://www.creative-tim.com/product/black-dashboard-react)** by Creative Tim (MIT). Original template is CRA + Bootstrap 4; this repo re-implements the dark admin look on **Vite + React 18 + React Router + Bootstrap 5 + Chart.js**, with GEO-specific data quality & quantity views.

## Features

- `/overview` — welcome page with what GEO_APP is for, step-by-step
  instructions for reading the dashboard, a glossary of data-quality rules and
  their meanings, and a button group linking to all three dashboards (Data
  Quality, Event Categories, Event Locations)
- `/data-quality` — data-quality dashboard for a table and snapshot: KPI cards,
  quality gauges, line/radar/bar/doughnut charts (the trend line covers all
  discovered snapshot dates), and a sortable/filterable rule-level table. Table
  and snapshot selectors are in the toolbar, listed alphabetically, and default
  to `avalanche_org` / `overall`, which load automatically when the view opens.
  The selection lives in component state (the URL always stays `/data-quality`);
  changing either dropdown reloads the metrics. The snapshot list is discovered
  from the API (last 120 days + `overall`) and cached per table.
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
- Data comes from **GEO_API** at `http://localhost:8000` — see
  [DATA_QUALITY_METRICS.md](DATA_QUALITY_METRICS.md) for the endpoint contract,
  long-format metrics, validation rules and dimension mapping.

## Configuration

App-wide values (branding, routes, React Router v7 future flags, API base URL
and endpoint paths, request timeout, probe window, default table, tracked table
names, metric names and rule
IDs, score/rule thresholds, labels, number/percent/score formatting, danger
levels, default heatmap orientations and the country → region mapping) live in
[`src/config.js`](src/config.js); visual chart/heatmap defaults live in
[`src/variables/charts.js`](src/variables/charts.js). The
API base URL defaults to
`http://localhost:8000` and can be overridden with the `VITE_API_BASE`
environment variable.

## API

The app expects GEO_API running at `http://localhost:8000` (the base URL is set
in `src/config.js`). Data-quality snapshots come from the `/data-quality/...`
endpoints; see [DATA_QUALITY_METRICS.md](DATA_QUALITY_METRICS.md) for their
contract.

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
checks, is documented in [TESTS.md](TESTS.md). The suite currently contains 24
test files and 167 passing tests. `npm test` runs the suite once; use
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
│   ├── routes.js            # route table (overview, data quality, event tabs)
│   ├── api/client.js        # shared fetch + timeout / API-down handling
│   ├── api/dataQuality.js   # GEO_API data-quality client (date discovery)
│   ├── api/eventCounts.js   # GEO_API event-count endpoints
│   ├── views/               # Landing, DataQualityView, EventCountsView, …
│   ├── components/          # Sidebar, GaugeCard, tables, matrix components, …
│   ├── utils/quality.js     # overallScore / toneFor / changeTone helpers
│   ├── utils/eventCounts.js # event-count grouping, region lookup, matrices
│   ├── variables/charts.js  # chart colors and base options
│   ├── test/                # Vitest setup (Chart.js/CSS mocks) + console checks
│   └── assets/css/bd-vite.css  # dark theme (original, inspired by Black Dashboard)
```

## Credits

- UI inspiration: **Black Dashboard React v1.2.2 © 2023 Creative Tim, MIT**  
  https://github.com/creativetimofficial/black-dashboard-react
- This repo contains an original Vite re-implementation (`bd-vite.css`, components), **not** a copy of the template source. See `LICENSE.md`.

## License

MIT — see `LICENSE.md`.
