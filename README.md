# GEO_APP — Data-Quality Dashboard

React JS data-visualization app for **data-quality tables, charts, gauges and badges**.

UI is a **Vite port inspired by [Black Dashboard React](https://www.creative-tim.com/product/black-dashboard-react)** by Creative Tim (MIT). Original template is CRA + Bootstrap 4; this repo re-implements the dark admin look on **Vite + React 18 + React Router + Bootstrap 5 + Chart.js**, with GEO-specific data-quality views.

## Features

- `/admin/overview` — welcome page with what GEO_APP is for, step-by-step
  instructions for reading the dashboard, and a button linking to it
- `/admin/data-quality/:tableName/:fileDate` — data-quality dashboard for a table
  and snapshot: KPI cards, quality gauges, line/radar/bar/doughnut charts (the
  trend line covers all discovered snapshot dates), and a sortable/filterable
  rule-level table. Table and snapshot selectors are in the
  toolbar, listed alphabetically, and default to `avalanche_org`. The snapshot
  list is discovered from the API (last 120 days + `overall`) and cached per
  table.
- Data comes from **GEO_API** at `http://localhost:8000` — see
  [DATA_QUALITY_METRICS.md](DATA_QUALITY_METRICS.md) for the endpoint contract,
  long-format metrics and dimension mapping.

## API

The data-quality view expects GEO_API running at `http://localhost:8000`
(the base URL is set in `src/api/dataQuality.js`). If the API is unreachable or
times out, the view shows a red alert — "API server is down! Please check the
API server." — with a Retry button; other errors (e.g. HTTP 500) show a plain
error card.

## Install

```bash
nvm use || nvm install 20
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
npm test         # Vitest + React Testing Library
npm run lint     # ESLint
```

## Project structure

```
GEO_APP/
├── index.html
├── package.json
├── vite.config.js
├── vitest.config.js
├── DATA_QUALITY_METRICS.md  # GEO_API endpoint contract & metric mapping
├── src/
│   ├── main.jsx             # HashRouter + Bootstrap + theme CSS
│   ├── App.jsx              # Admin shell (Sidebar + TopNavbar + Routes)
│   ├── routes.js            # route table (overview, dashboard, data quality, …)
│   ├── api/dataQuality.js   # GEO_API client (fetch, timeout, date discovery)
│   ├── views/               # Landing, DataQualityView, Dashboard, ChartsView, …
│   ├── components/          # Sidebar, StatCard, GaugeCard, DataQualityTable, …
│   ├── utils/quality.js     # overallScore / toneFor helpers
│   ├── variables/charts.js  # chart colors and base options
│   ├── test/                # Vitest setup (Chart.js/CSS mocks) + console checks
│   └── assets/css/bd-vite.css  # dark theme (original, inspired by Black Dashboard)
└── .github/workflows/ci.yml
```

## Credits

- UI inspiration: **Black Dashboard React v1.2.2 © 2023 Creative Tim, MIT**  
  https://github.com/creativetimofficial/black-dashboard-react
- This repo contains an original Vite re-implementation (`bd-vite.css`, components), **not** a copy of the template source. See `LICENSE.md`.

## License

MIT — see `LICENSE.md`.
