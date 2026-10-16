# GEO_APP — Data-Quality Dashboard

React JS data-visualization app for **data-quality tables, charts, gauges and badges**.

UI is a **Vite port inspired by [Black Dashboard React](https://www.creative-tim.com/product/black-dashboard-react)** by Creative Tim (MIT). Original template is CRA + Bootstrap 4; this repo re-implements the dark admin look on **Vite + React 18 + React Router + Bootstrap 5 + Chart.js**, with GEO-specific data-quality views.

## Features

- `/admin/dashboard` — KPI cards, quality trend, rule bars, status doughnut, gauges, table preview
- `/admin/tables` — sortable + filterable data-quality rule table
- `/admin/charts` — Chart.js line / bar / doughnut
- `/admin/gauges` — SVG dimension gauges (completeness, validity, uniqueness, consistency)
- `/admin/badges` — status pills (good / warning / critical / info)
- Dataset switcher (Places · Rivers · Volcanoes) — swap `src/data/mockData.js` for your API

## Quickstart

```bash
nvm use || nvm install 20
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## Create the private GitHub repo

This folder is scaffolded locally, **not yet pushed** (per workspace policy I don't push).

```bash
cd "GEO_APP"
git init -b main
git add .
git commit -m "feat: GEO_APP Vite port of Black Dashboard with data-quality views"
gh repo create GEO_APP --private --source=. --push
# or: create empty private repo "GEO_APP" on github.com, then:
# git remote add origin git@github.com:<you>/GEO_APP.git
# git push -u origin main
```

## Project structure

```
GEO_APP/
├── index.html
├── package.json
├── vite.config.js
├── jsconfig.json
├── src/
│   ├── main.jsx            # HashRouter + Bootstrap + theme CSS
│   ├── App.jsx             # Admin shell (Sidebar + TopNavbar + Routes)
│   ├── routes.js           # dashboard / tables / charts / gauges / badges
│   ├── data/mockData.js    # replace with GEO_API
│   ├── utils/quality.js
│   ├── variables/charts.js # Chart.js dark defaults
│   ├── components/         # Sidebar, TopNavbar, Footer, StatCard, Badge,
│   │                       # GaugeCard, DataQualityTable, QualityCharts
│   ├── views/              # Dashboard, Tables, ChartsView, Gauges, Badges
│   └── assets/css/bd-vite.css  # dark theme (original, inspired by Black Dashboard)
└── .github/workflows/ci.yml
```

## Credits

- UI inspiration: **Black Dashboard React v1.2.2 © 2023 Creative Tim, MIT**  
  https://github.com/creativetimofficial/black-dashboard-react
- This repo contains an original Vite re-implementation (`bd-vite.css`, components), **not** a copy of the template source. See `LICENSE.md`.

## License

MIT — see `LICENSE.md`.
