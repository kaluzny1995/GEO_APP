← [Test suite](../../TESTS.md)

# App Shell, Overview & System Flow Tests

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
The technology checks include the requests, Pydantic, PySpark, JDBC, REST,
SQLModel, SQLAlchemy, asyncpg, React Router, Vite, Chart.js, Bootstrap, pandas,
Plotly and psycopg logos.

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
