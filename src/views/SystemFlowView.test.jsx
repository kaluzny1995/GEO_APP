import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SystemFlowView from './SystemFlowView.jsx'
import { ROUTER_FUTURE_FLAGS } from '../config.js'
import { DATA_SOURCES, REPOSITORY_STACKS, SYSTEM_FLOW_REPOS } from '../data/systemFlow.js'

const renderView = () =>
  render(
    <MemoryRouter future={ROUTER_FUTURE_FLAGS}>
      <SystemFlowView />
    </MemoryRouter>
  )

describe('SystemFlowView', () => {
  it('renders the title, subtitle and back link', () => {
    renderView()

    expect(screen.getByRole('heading', { name: 'System Flow' })).toBeInTheDocument()
    expect(screen.getByText(/6 repositories, 9 public data sources/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to overview/i })).toHaveAttribute(
      'href',
      '/overview'
    )
  })

  it('renders the interactive system flow diagram', () => {
    renderView()

    const diagram = screen.getByRole('group', { name: 'System flow diagram' })
    expect(diagram).toBeInTheDocument()
    Object.values(SYSTEM_FLOW_REPOS).forEach((repo) => {
      expect(within(diagram).getByTestId(`system-flow-node-${repo.id}`)).toHaveTextContent(
        repo.name
      )
    })
    DATA_SOURCES.forEach((source) => {
      expect(within(diagram).getByTestId(`system-flow-source-${source.id}`)).toBeInTheDocument()
    })
  })

  it('renders the flow legend for every transfer format', () => {
    renderView()

    const legend = screen.getByTestId('system-flow-legend')
    const labels = [...legend.querySelectorAll('.system-flow-legend-item strong')].map(
      (element) => element.textContent
    )
    expect(labels).toEqual(['CSV', 'JSON', 'SQL', 'HTTP', 'CLI'])
  })

  it('renders the complete technology inventory for all six repositories', () => {
    renderView()

    const table = screen.getByRole('table')
    REPOSITORY_STACKS.forEach((stack) => {
      expect(within(table).getByRole('cell', { name: stack.repo })).toBeInTheDocument()
      expect(within(table).getByText(stack.technologies.join(' · '))).toBeInTheDocument()
    })
    expect(within(table).getByText(/Streamlit · pandas · Plotly/i)).toBeInTheDocument()
  })

  it('explains how to read the diagram and the responsive labels', () => {
    renderView()

    const card = screen.getByRole('heading', { name: 'How to read this view' }).closest('.card')
    expect(card).toHaveTextContent(/start at the public data sources at the top/i)
    expect(card).toHaveTextContent(/GEO_API serves JSON over HTTP to GEO_APP/i)
    expect(card).toHaveTextContent(/GEO_E2E card above the pipeline/i)
    expect(card).toHaveTextContent(/every source and technology image has its name underneath/i)
  })
})
