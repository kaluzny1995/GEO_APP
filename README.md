# GEO_APP — Data-Quality Dashboard

React JS data-visualization app for **data-quality tables, charts, gauges and badges**.

UI is a **Vite port inspired by [Black Dashboard React](https://www.creative-tim.com/product/black-dashboard-react)** by Creative Tim (MIT). Original template is CRA + Bootstrap 4; this repo re-implements the dark admin look on **Vite + React 18 + React Router + Bootstrap 5 + Chart.js**, with GEO-specific data-quality views.

## Features

- `/admin/overview` — front page with title and description of what GEO_APP is for

## Install

```bash
nvm use || nvm install 20
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
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
│   ├── routes.js           # overview (front page only for now)
│   ├── views/              # Landing (more views can be added later)
│   └── assets/css/bd-vite.css  # dark theme (original, inspired by Black Dashboard)
└── .github/workflows/ci.yml
```

## Credits

- UI inspiration: **Black Dashboard React v1.2.2 © 2023 Creative Tim, MIT**  
  https://github.com/creativetimofficial/black-dashboard-react
- This repo contains an original Vite re-implementation (`bd-vite.css`, components), **not** a copy of the template source. See `LICENSE.md`.

## License

MIT — see `LICENSE.md`.
