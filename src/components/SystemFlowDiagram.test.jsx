import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import SystemFlowDiagram from './SystemFlowDiagram.jsx'
import { DATA_SOURCES, SYSTEM_FLOW_EDGES, SYSTEM_FLOW_REPOS } from '../data/systemFlow.js'

describe('SystemFlowDiagram', () => {
  it('renders every repository node with its name and folder image', () => {
    render(<SystemFlowDiagram />)

    Object.values(SYSTEM_FLOW_REPOS).forEach((repo) => {
      const node = screen.getByTestId(`system-flow-node-${repo.id}`)
      expect(node).toHaveTextContent(repo.name)
      expect(node.querySelector('img')).toBeInTheDocument()
    })
  })

  it('renders every data source with its name and JSON or CSV format badge', () => {
    render(<SystemFlowDiagram />)

    DATA_SOURCES.forEach((source) => {
      const node = screen.getByTestId(`system-flow-source-${source.id}`)
      expect(node).toHaveTextContent(source.name)
      expect(node).toHaveTextContent(source.format.toUpperCase())
      expect(node.querySelector('img')).toBeInTheDocument()
    })
  })

  it('renders a readable label under every technology image', () => {
    render(<SystemFlowDiagram />)

    const python = screen.getByTestId('system-flow-tech-download-python')
    expect(within(python).getByText('Python')).toBeInTheDocument()
    expect(python.querySelector('img')).toHaveAttribute('alt', '')

    const react = screen.getByTestId('system-flow-tech-app-react')
    expect(within(react).getByText('React')).toBeInTheDocument()

    const reactTesting = screen.getByTestId('system-flow-tech-app-react-testing')
    expect(within(reactTesting).getByText('React Testing Library')).toBeInTheDocument()

    const fastapi = screen.getByTestId('system-flow-tech-api-fastapi')
    expect(within(fastapi).getByText('FastAPI')).toBeInTheDocument()

    const spark = screen.getByTestId('system-flow-tech-etl-spark')
    expect(within(spark).getByText('Apache Spark')).toBeInTheDocument()

    const airflow = screen.getByTestId('system-flow-tech-e2e-airflow')
    expect(within(airflow).getByText('Airflow UI')).toBeInTheDocument()
    expect(airflow.querySelector('img').getAttribute('src')).toContain('airflow_no_text_logo')

    const streamlit = screen.getByTestId('system-flow-tech-visual-streamlit')
    expect(within(streamlit).getByText('Streamlit')).toBeInTheDocument()
    expect(streamlit.querySelector('img').getAttribute('src')).toContain('streamlit_no_text_logo')

    const expectedChips = [
      ['e2e', 'pydantic', 'Pydantic'],
      ['download', 'requests', 'requests'],
      ['download', 'pydantic', 'Pydantic'],
      ['etl', 'jdbc', 'JDBC'],
      ['api', 'sqlmodel', 'SQLModel'],
      ['api', 'asyncpg', 'asyncpg'],
      ['app', 'vite', 'Vite'],
      ['app', 'chartjs', 'Chart.js'],
      ['app', 'bootstrap', 'Bootstrap'],
      ['visual', 'pandas', 'pandas'],
      ['visual', 'plotly', 'Plotly'],
      ['visual', 'psycopg', 'psycopg'],
    ]
    expectedChips.forEach(([repoId, techId, label]) => {
      const chip = screen.getByTestId(`system-flow-tech-${repoId}-${techId}`)
      expect(within(chip).getByText(label)).toBeInTheDocument()
    })
  })

  it('combines Supabase and PostgreSQL in the database node', () => {
    render(<SystemFlowDiagram />)

    const database = screen.getByTestId('system-flow-node-db')
    expect(database).toHaveTextContent('Supabase PostgreSQL')
    expect(within(database).getByText('Supabase')).toBeInTheDocument()
    expect(within(database).getByText('PostgreSQL')).toBeInTheDocument()
    expect(database.querySelector('img').getAttribute('src')).toContain('database_no_text_symbol')
  })

  it('renders a badge group for every relationship', () => {
    const { container } = render(<SystemFlowDiagram />)

    SYSTEM_FLOW_EDGES.forEach((edge) => {
      expect(
        container.querySelector(`[data-testid="system-flow-edge-${edge.id}"]`)
      ).toBeInTheDocument()
      expect(screen.getByTestId(`system-flow-edge-badges-${edge.id}`)).toBeInTheDocument()
    })

    expect(screen.getAllByText('CSV').length).toBeGreaterThanOrEqual(4)
    expect(screen.getAllByText('SQL').length).toBeGreaterThanOrEqual(3)
    expect(screen.getByText('HTTP')).toBeInTheDocument()
    expect(screen.getAllByText('JSON').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('CLI')).toHaveLength(2)
  })

  it('renders connector labels and the GEO_E2E orchestration links', () => {
    render(<SystemFlowDiagram />)

    expect(screen.getByText('JSON / CSV')).toBeInTheDocument()
    expect(screen.getByText('CSV snapshots')).toBeInTheDocument()
    expect(screen.getByText('SQL / JDBC')).toBeInTheDocument()
    expect(screen.getByText('HTTP / JSON')).toBeInTheDocument()
    expect(screen.getByText('SQL / psycopg')).toBeInTheDocument()

    const orchestration = screen.getByLabelText('GEO_E2E orchestrates')
    expect(within(orchestration).getByText('GEO_Download')).toBeInTheDocument()
    expect(within(orchestration).getByText('GEO_ETL')).toBeInTheDocument()
    expect(within(orchestration).getByText('Supabase PostgreSQL')).toBeInTheDocument()
  })
})
