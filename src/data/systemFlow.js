// Static architecture map for the System Flow view.
//
// The view is deliberately data-driven: nodes, source feeds, technologies and
// relationships live here, so adding a source or a repository is a data change
// rather than a diagram rewrite. Image imports are resolved by Vite.
import avalancheOrgLogo from '../assets/logos/data-source/avalanche_org_no_text_logo.webp'
import eonetLogo from '../assets/logos/data-source/eonet_no_text_logo.webp'
import gdacsLogo from '../assets/logos/data-source/gdacs_logo.png'
import ibtracsLogo from '../assets/logos/data-source/ibtracs_logo.gif'
import nifcLogo from '../assets/logos/data-source/nifc_no_text_logo.svg'
import openMeteoLogo from '../assets/logos/data-source/openmeteo_no_text_logo.png'
import usgsEarthquakeLogo from '../assets/logos/data-source/usgs_earthquake_no_text_logo.png'
import usgsNwisLogo from '../assets/logos/data-source/usgs_nwis_no_text_logo.png'
import usgsVolcanoLogo from '../assets/logos/data-source/usgs_volcano_no_text_logo.png'

import airflowLogo from '../assets/logos/technology/airflow_no_text_logo.webp'
import anacondaLogo from '../assets/logos/technology/anaconda_logo.png'
import databaseLogo from '../assets/logos/technology/database_no_text_symbol.png'
import dockerComposeLogo from '../assets/logos/technology/docker_compose_no_text_logo.png'
import dockerLogo from '../assets/logos/technology/docker_logo.png'
import fastapiLogo from '../assets/logos/technology/fastapi_logo.webp'
import folderLogo from '../assets/logos/technology/folder_no_text_symbol.png'
import postgresqlLogo from '../assets/logos/technology/postgresql_no_text_logo.webp'
import pytestLogo from '../assets/logos/technology/pytest_logo.webp'
import pythonMypyLogo from '../assets/logos/technology/python_mypy_logo.png'
import pythonLogo from '../assets/logos/technology/python_no_text_logo.webp'
import reactLogo from '../assets/logos/technology/react_js_no_text_logo.webp'
import reactTestingLogo from '../assets/logos/technology/react_testing_no_text_logo.webp'
import ruffLogo from '../assets/logos/technology/ruff_no_text_logo.png'
import sparkLogo from '../assets/logos/technology/spark_logo.webp'
import streamlitLogo from '../assets/logos/technology/streamlit_no_text_logo.png'
import supabaseLogo from '../assets/logos/technology/supabase_no_text_logo.png'
import toxLogo from '../assets/logos/technology/tox_logo.svg'
import uvicornLogo from '../assets/logos/technology/uvicorn_logo.png'
import vitestLogo from '../assets/logos/technology/vitest_no_text_logo.svg'

// Every source and technology tile shows its name underneath the image. The
// `no_text` assets are still preferred because they keep the image itself free
// of a duplicate wordmark; wordmark logos get a reinforcing label as well.
export const TECHNOLOGIES = {
  airflow: {
    id: 'airflow',
    name: 'Airflow UI',
    logo: airflowLogo,
    logoName: 'airflow_no_text_logo.webp',
  },
  anaconda: {
    id: 'anaconda',
    name: 'Anaconda',
    logo: anacondaLogo,
    logoName: 'anaconda_logo.png',
    wide: true,
  },
  docker: {
    id: 'docker',
    name: 'Docker',
    logo: dockerLogo,
    logoName: 'docker_logo.png',
    wide: true,
  },
  dockerCompose: {
    id: 'docker-compose',
    name: 'Docker Compose',
    logo: dockerComposeLogo,
    logoName: 'docker_compose_no_text_logo.png',
  },
  fastapi: {
    id: 'fastapi',
    name: 'FastAPI',
    logo: fastapiLogo,
    logoName: 'fastapi_logo.webp',
    wide: true,
  },
  mypy: {
    id: 'mypy',
    name: 'mypy',
    logo: pythonMypyLogo,
    logoName: 'python_mypy_logo.png',
    wide: true,
  },
  postgresql: {
    id: 'postgresql',
    name: 'PostgreSQL',
    logo: postgresqlLogo,
    logoName: 'postgresql_no_text_logo.webp',
  },
  pytest: {
    id: 'pytest',
    name: 'pytest',
    logo: pytestLogo,
    logoName: 'pytest_logo.webp',
    wide: true,
  },
  python: {
    id: 'python',
    name: 'Python',
    logo: pythonLogo,
    logoName: 'python_no_text_logo.webp',
  },
  react: {
    id: 'react',
    name: 'React',
    logo: reactLogo,
    logoName: 'react_js_no_text_logo.webp',
  },
  reactTesting: {
    id: 'react-testing',
    name: 'React Testing Library',
    logo: reactTestingLogo,
    logoName: 'react_testing_no_text_logo.webp',
  },
  ruff: {
    id: 'ruff',
    name: 'Ruff',
    logo: ruffLogo,
    logoName: 'ruff_no_text_logo.png',
  },
  spark: {
    id: 'spark',
    name: 'Apache Spark',
    logo: sparkLogo,
    logoName: 'spark_logo.webp',
    wide: true,
  },
  streamlit: {
    id: 'streamlit',
    name: 'Streamlit',
    logo: streamlitLogo,
    logoName: 'streamlit_no_text_logo.png',
  },
  supabase: {
    id: 'supabase',
    name: 'Supabase',
    logo: supabaseLogo,
    logoName: 'supabase_no_text_logo.png',
  },
  tox: {
    id: 'tox',
    name: 'tox',
    logo: toxLogo,
    logoName: 'tox_logo.svg',
    wide: true,
  },
  uvicorn: {
    id: 'uvicorn',
    name: 'Uvicorn',
    logo: uvicornLogo,
    logoName: 'uvicorn_logo.png',
    wide: true,
  },
  vitest: {
    id: 'vitest',
    name: 'Vitest',
    logo: vitestLogo,
    logoName: 'vitest_no_text_logo.svg',
  },
}

export const SYSTEM_FLOW_REPOS = {
  e2e: {
    id: 'e2e',
    name: 'GEO_E2E',
    role: 'Orchestration',
    description: 'Airflow DAG schedules every download and ETL job; Docker Compose runs the stack.',
    logo: folderLogo,
    logoName: 'folder_no_text_symbol.png',
    technologies: [
      TECHNOLOGIES.airflow,
      TECHNOLOGIES.dockerCompose,
      TECHNOLOGIES.docker,
      TECHNOLOGIES.spark,
      TECHNOLOGIES.anaconda,
      TECHNOLOGIES.supabase,
      TECHNOLOGIES.postgresql,
      TECHNOLOGIES.python,
    ],
    techNote: 'DAG: geo_pipeline',
  },
  download: {
    id: 'download',
    name: 'GEO_Download',
    role: 'Data acquisition',
    description: 'Fetches 9 public APIs and writes dated CSV snapshots plus reference lookups.',
    logo: folderLogo,
    logoName: 'folder_no_text_symbol.png',
    technologies: [
      TECHNOLOGIES.python,
      TECHNOLOGIES.pytest,
      TECHNOLOGIES.ruff,
      TECHNOLOGIES.mypy,
      TECHNOLOGIES.tox,
    ],
    techNote: 'requests · Pydantic',
  },
  etl: {
    id: 'etl',
    name: 'GEO_ETL',
    role: 'Transformation',
    description: 'PySpark casts, deduplicates and enriches CSV data, then loads the geo schema.',
    logo: folderLogo,
    logoName: 'folder_no_text_symbol.png',
    technologies: [
      TECHNOLOGIES.spark,
      TECHNOLOGIES.python,
      TECHNOLOGIES.postgresql,
      TECHNOLOGIES.pytest,
      TECHNOLOGIES.ruff,
      TECHNOLOGIES.mypy,
      TECHNOLOGIES.tox,
    ],
    techNote: 'Pydantic · JDBC',
  },
  api: {
    id: 'api',
    name: 'GEO_API',
    role: 'Serving',
    description: 'FastAPI REST layer over the geo schema; serves quality, quantity and event JSON.',
    logo: folderLogo,
    logoName: 'folder_no_text_symbol.png',
    technologies: [
      TECHNOLOGIES.fastapi,
      TECHNOLOGIES.uvicorn,
      TECHNOLOGIES.python,
      TECHNOLOGIES.postgresql,
      TECHNOLOGIES.pytest,
      TECHNOLOGIES.ruff,
      TECHNOLOGIES.mypy,
      TECHNOLOGIES.tox,
    ],
    techNote: 'SQLModel · asyncpg',
  },
  app: {
    id: 'app',
    name: 'GEO_APP',
    role: 'Presentation',
    description: 'React dashboards consume GEO_API JSON for quality, quantity and event views.',
    logo: folderLogo,
    logoName: 'folder_no_text_symbol.png',
    technologies: [TECHNOLOGIES.react, TECHNOLOGIES.vitest, TECHNOLOGIES.reactTesting],
    techNote: 'Vite · Chart.js · Bootstrap',
  },
  visual: {
    id: 'visual',
    name: 'GEO_Visual',
    role: 'Analytics',
    description: 'Streamlit dashboards read the geo views directly from Supabase Postgres.',
    logo: folderLogo,
    logoName: 'folder_no_text_symbol.png',
    technologies: [
      TECHNOLOGIES.streamlit,
      TECHNOLOGIES.python,
      TECHNOLOGIES.postgresql,
      TECHNOLOGIES.pytest,
      TECHNOLOGIES.ruff,
      TECHNOLOGIES.mypy,
      TECHNOLOGIES.tox,
    ],
    techNote: 'pandas · Plotly',
  },
}

export const DATA_SOURCES = [
  {
    id: 'usgs-earthquake',
    name: 'USGS Earthquake',
    logo: usgsEarthquakeLogo,
    logoName: 'usgs_earthquake_no_text_logo.png',
    format: 'csv',
    description: 'FDSN event query exported as CSV',
  },
  {
    id: 'gdacs',
    name: 'GDACS',
    logo: gdacsLogo,
    logoName: 'gdacs_logo.png',
    format: 'json',
    description: 'Global disaster alert REST API',
  },
  {
    id: 'eonet',
    name: 'NASA EONET',
    logo: eonetLogo,
    logoName: 'eonet_no_text_logo.webp',
    format: 'json',
    description: 'Natural event API v3',
  },
  {
    id: 'openmeteo',
    name: 'Open-Meteo Flood',
    logo: openMeteoLogo,
    logoName: 'openmeteo_no_text_logo.png',
    format: 'json',
    description: 'River discharge forecast API',
  },
  {
    id: 'usgs-nwis',
    name: 'USGS NWIS',
    logo: usgsNwisLogo,
    logoName: 'usgs_nwis_no_text_logo.png',
    format: 'json',
    description: 'Streamflow and gauge-height services',
  },
  {
    id: 'avalanche-org',
    name: 'Avalanche.org',
    logo: avalancheOrgLogo,
    logoName: 'avalanche_org_no_text_logo.webp',
    format: 'json',
    description: 'Avalanche danger forecast API',
  },
  {
    id: 'ibtracs',
    name: 'IBTrACS',
    logo: ibtracsLogo,
    logoName: 'ibtracs_logo.gif',
    format: 'csv',
    description: 'NOAA best-track cyclone CSV',
  },
  {
    id: 'usgs-volcano',
    name: 'USGS Volcano',
    logo: usgsVolcanoLogo,
    logoName: 'usgs_volcano_no_text_logo.png',
    format: 'json',
    description: 'HANS notices and NCEI eruptions',
  },
  {
    id: 'nifc',
    name: 'NIFC',
    logo: nifcLogo,
    logoName: 'nifc_no_text_logo.svg',
    format: 'json',
    description: 'WFIGS wildfire perimeter ArcGIS API',
  },
]

export const SYSTEM_FLOW_STORE = {
  id: 'csv',
  name: 'data/ CSV files',
  role: 'Data store',
  description: 'Daily snapshots + reference lookups',
  logo: folderLogo,
  logoName: 'folder_no_text_symbol.png',
}

export const SYSTEM_FLOW_DATABASE = {
  id: 'db',
  name: 'Supabase PostgreSQL',
  role: 'Database',
  description: 'geo schema · tables, views, metrics',
  logo: databaseLogo,
  logoName: 'database_no_text_symbol.png',
  technologies: [TECHNOLOGIES.supabase, TECHNOLOGIES.postgresql],
}

export const FLOW_KINDS = {
  csv: {
    id: 'csv',
    label: 'CSV',
    icon: 'file-csv',
    color: '#6ee7b7',
    description: 'Dated CSV snapshots and reference lookups.',
  },
  json: {
    id: 'json',
    label: 'JSON',
    icon: 'file-json',
    color: '#fbbf24',
    description: 'Public API feeds and GEO_API REST responses.',
  },
  sql: {
    id: 'sql',
    label: 'SQL',
    icon: 'file-sql',
    color: '#60a5fa',
    description: 'JDBC, asyncpg and psycopg database traffic.',
  },
  http: {
    id: 'http',
    label: 'HTTP',
    icon: 'http',
    color: '#e14eca',
    description: 'Browser-to-GEO_API REST calls.',
  },
  cli: {
    id: 'cli',
    label: 'CLI',
    icon: 'terminal',
    color: '#c9c9d8',
    description: 'Airflow BashOperator subprocesses.',
  },
}

export const SYSTEM_FLOW_EDGES = [
  {
    id: 'sources-download-json',
    from: 'sources',
    to: 'download',
    kinds: ['json'],
    title: '7 public APIs return JSON to GEO_Download',
  },
  {
    id: 'sources-download-csv',
    from: 'sources',
    to: 'download',
    kinds: ['csv'],
    title: 'USGS Earthquake and IBTrACS return CSV to GEO_Download',
  },
  {
    id: 'download-csv',
    from: 'download',
    to: 'csv',
    kinds: ['csv'],
    title: 'GEO_Download writes dated CSV snapshots to data/',
  },
  {
    id: 'csv-etl',
    from: 'csv',
    to: 'etl',
    kinds: ['csv'],
    title: 'PySpark reads the CSV snapshots from GEO_Download/data',
  },
  {
    id: 'etl-db',
    from: 'etl',
    to: 'db',
    kinds: ['sql'],
    title: 'GEO_ETL writes geo.* tables and metrics over JDBC',
  },
  {
    id: 'db-api',
    from: 'db',
    to: 'api',
    kinds: ['sql'],
    title: 'GEO_API reads the geo schema through asyncpg',
  },
  {
    id: 'api-app',
    from: 'api',
    to: 'app',
    kinds: ['http', 'json'],
    title: 'GEO_APP calls GEO_API over HTTP and receives JSON',
  },
  {
    id: 'db-visual',
    from: 'db',
    to: 'visual',
    kinds: ['sql'],
    title: 'GEO_Visual reads geo views directly through psycopg',
  },
  {
    id: 'e2e-download',
    from: 'e2e',
    to: 'download',
    kinds: ['cli'],
    title: 'Airflow runs GEO_Download as a BashOperator subprocess',
  },
  {
    id: 'e2e-etl',
    from: 'e2e',
    to: 'etl',
    kinds: ['cli'],
    title: 'Airflow runs GEO_ETL jobs as BashOperator subprocesses',
  },
  {
    id: 'e2e-db',
    from: 'e2e',
    to: 'db',
    kinds: ['sql'],
    title: 'Airflow metadata lives in the Supabase geo_airflow schema',
  },
]

export const SYSTEM_FLOW_EDGE_BY_ID = Object.fromEntries(
  SYSTEM_FLOW_EDGES.map((edge) => [edge.id, edge])
)

export const REPOSITORY_STACKS = [
  {
    repo: 'GEO_E2E',
    role: 'Orchestration',
    technologies: [
      'Apache Airflow 3.3.2 (LocalExecutor)',
      'Airflow UI (:8090)',
      'Docker Compose',
      'Docker',
      'PySpark 3.5.5 / Spark standalone',
      'Anaconda',
      'Supabase Postgres (geo_airflow metadata)',
      'Python 3.11',
    ],
  },
  {
    repo: 'GEO_Download',
    role: 'Data acquisition',
    technologies: ['Python 3.11', 'requests', 'Pydantic 2', 'CSV', 'pytest', 'Ruff', 'mypy', 'tox'],
  },
  {
    repo: 'GEO_ETL',
    role: 'Transformation',
    technologies: [
      'PySpark 3.5.5',
      'Spark standalone',
      'Supabase Postgres (JDBC)',
      'Pydantic 2',
      'pytest',
      'Ruff',
      'mypy',
      'tox',
    ],
  },
  {
    repo: 'GEO_API',
    role: 'Serving',
    technologies: [
      'FastAPI',
      'Uvicorn',
      'Pydantic 2',
      'SQLModel + SQLAlchemy 2 async',
      'Supabase Postgres (asyncpg)',
      'pytest',
      'Ruff',
      'mypy',
      'tox',
    ],
  },
  {
    repo: 'GEO_APP',
    role: 'Presentation',
    technologies: [
      'React 18',
      'Vite',
      'React Router 6',
      'Bootstrap 5',
      'Chart.js 4',
      'Vitest',
      'React Testing Library',
    ],
  },
  {
    repo: 'GEO_Visual',
    role: 'Analytics',
    technologies: [
      'Streamlit',
      'pandas',
      'Plotly',
      'SQLAlchemy 2',
      'Supabase Postgres (psycopg 3)',
      'pytest',
      'Ruff',
      'mypy',
      'tox',
    ],
  },
]
