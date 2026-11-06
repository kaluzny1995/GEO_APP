import { describe, expect, it } from 'vitest'
import {
  DATA_SOURCES,
  FLOW_KINDS,
  SYSTEM_FLOW_DATABASE,
  SYSTEM_FLOW_EDGE_BY_ID,
  SYSTEM_FLOW_EDGES,
  SYSTEM_FLOW_REPOS,
  SYSTEM_FLOW_STORE,
} from './systemFlow.js'

describe('systemFlow data', () => {
  it('lists the six repositories in pipeline order', () => {
    expect(Object.keys(SYSTEM_FLOW_REPOS)).toEqual([
      'e2e',
      'download',
      'etl',
      'api',
      'app',
      'visual',
    ])
    expect(Object.values(SYSTEM_FLOW_REPOS).map((repo) => repo.name)).toEqual([
      'GEO_E2E',
      'GEO_Download',
      'GEO_ETL',
      'GEO_API',
      'GEO_APP',
      'GEO_Visual',
    ])
  })

  it('gives every repository a folder image and the expected technology logos', () => {
    Object.values(SYSTEM_FLOW_REPOS).forEach((repo) => {
      expect(repo.logo).toBeTruthy()
      expect(repo.logoName).toContain('folder_no_text_symbol')
      expect(repo.technologies.length).toBeGreaterThan(0)
      repo.technologies.forEach((tech) => {
        expect(tech.logo).toBeTruthy()
        expect(tech.name).toBeTruthy()
      })
    })

    const expectedTechs = {
      e2e: ['pydantic'],
      download: ['requests', 'pydantic'],
      etl: ['pydantic', 'jdbc'],
      api: ['pydantic', 'sqlmodel', 'asyncpg'],
      app: ['vite', 'chartjs', 'bootstrap'],
      visual: ['pandas', 'plotly', 'psycopg', 'pydantic'],
    }
    Object.entries(expectedTechs).forEach(([repoId, techIds]) => {
      const actualIds = SYSTEM_FLOW_REPOS[repoId].technologies.map((tech) => tech.id)
      techIds.forEach((techId) => expect(actualIds).toContain(techId))
    })
  })

  it('lists nine data sources: seven JSON APIs and two CSV feeds', () => {
    expect(DATA_SOURCES).toHaveLength(9)
    expect(DATA_SOURCES.filter((source) => source.format === 'json')).toHaveLength(7)
    expect(
      DATA_SOURCES.filter((source) => source.format === 'csv').map((source) => source.name)
    ).toEqual(['USGS Earthquake', 'IBTrACS'])
  })

  it('uses the Airflow image for Airflow UI and the Streamlit image for GEO_Visual', () => {
    const airflow = SYSTEM_FLOW_REPOS.e2e.technologies.find((tech) => tech.id === 'airflow')
    expect(airflow.name).toBe('Airflow UI')
    expect(airflow.logoName).toBe('airflow_no_text_logo.webp')

    const streamlit = SYSTEM_FLOW_REPOS.visual.technologies.find((tech) => tech.id === 'streamlit')
    expect(streamlit.name).toBe('Streamlit')
    expect(streamlit.logoName).toBe('streamlit_no_text_logo.png')
  })

  it('combines the database symbol with Supabase and PostgreSQL', () => {
    expect(SYSTEM_FLOW_DATABASE.name).toBe('Supabase PostgreSQL')
    expect(SYSTEM_FLOW_DATABASE.logoName).toBe('database_no_text_symbol.png')
    expect(SYSTEM_FLOW_DATABASE.technologies.map((tech) => tech.name)).toEqual([
      'Supabase',
      'PostgreSQL',
    ])
  })

  it('describes the CSV store with a labelled folder symbol', () => {
    expect(SYSTEM_FLOW_STORE.name).toBe('data/ CSV files')
    expect(SYSTEM_FLOW_STORE.logoName).toContain('folder_no_text_symbol')
  })

  it('uses every flow kind in at least one relationship', () => {
    const usedKinds = new Set(SYSTEM_FLOW_EDGES.flatMap((edge) => edge.kinds))
    Object.keys(FLOW_KINDS).forEach((kind) => {
      expect(usedKinds.has(kind)).toBe(true)
    })
  })

  it('models the pipeline formats between components', () => {
    const byId = Object.fromEntries(SYSTEM_FLOW_EDGES.map((edge) => [edge.id, edge]))
    expect(byId['download-csv'].kinds).toEqual(['csv'])
    expect(byId['csv-etl'].kinds).toEqual(['csv'])
    expect(byId['etl-db'].kinds).toEqual(['sql'])
    expect(byId['db-api'].kinds).toEqual(['sql'])
    expect(byId['db-visual'].kinds).toEqual(['sql'])
    expect(byId['api-app'].kinds).toEqual(['http', 'json'])
    expect(byId['e2e-download'].kinds).toEqual(['cli'])
    expect(byId['e2e-etl'].kinds).toEqual(['cli'])
    expect(byId['e2e-db'].kinds).toEqual(['sql'])
  })

  it('exposes an edge lookup for the diagram connectors', () => {
    expect(Object.keys(SYSTEM_FLOW_EDGE_BY_ID)).toHaveLength(SYSTEM_FLOW_EDGES.length)
    SYSTEM_FLOW_EDGES.forEach((edge) => {
      expect(SYSTEM_FLOW_EDGE_BY_ID[edge.id]).toBe(edge)
    })
  })

  it('connects Airflow to the download, ETL and metadata database nodes', () => {
    const e2eTargets = SYSTEM_FLOW_EDGES.filter((edge) => edge.from === 'e2e').map(
      (edge) => edge.to
    )
    expect(e2eTargets).toEqual(['download', 'etl', 'db'])
  })
})
