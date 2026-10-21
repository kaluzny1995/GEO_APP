import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DataQuantityDiagram from './DataQuantityDiagram.jsx'
import { buildQuantityFlow } from '../utils/dataQuantity.js'
import { TABLE_NAMES } from '../config.js'

const countsFor = () => Object.fromEntries(TABLE_NAMES.map((table) => [table, 100]))

describe('DataQuantityDiagram', () => {
  it('renders every plain and ETL table plus the union total', () => {
    const counts = countsFor()
    counts.union_etl = 796
    render(
      <DataQuantityDiagram
        flows={buildQuantityFlow(counts)}
        unionCount={counts.union_etl}
        fileDate="2026-10-09"
      />
    )

    expect(screen.getByText('Plain tables')).toBeInTheDocument()
    expect(screen.getByText('ETL tables')).toBeInTheDocument()
    expect(screen.getByText('Union table')).toBeInTheDocument()
    expect(screen.getAllByText('9 tables · 900 rows')).toHaveLength(2)
    expect(screen.getByText('union_etl')).toBeInTheDocument()
    expect(screen.getByText('796')).toBeInTheDocument()
    expect(screen.getByText('rows from 9 ETL tables')).toBeInTheDocument()
  })

  it('labels filtered, added and even rows on the plain-to-ETL links', () => {
    const counts = countsFor()
    counts.eonet_event = 120
    counts.eonet_event_etl = 100
    counts.ibtracs_cyclone = 100
    counts.ibtracs_cyclone_etl = 105

    render(
      <DataQuantityDiagram flows={buildQuantityFlow(counts)} unionCount={50} fileDate="overall" />
    )

    expect(screen.getByText('20 filtered out')).toBeInTheDocument()
    expect(screen.getByText('5 more in ETL')).toBeInTheDocument()
    expect(screen.getAllByText('No rows filtered').length).toBeGreaterThan(0)
    expect(screen.getByText('20 filtered out').closest('.quantity-link-filter'))
      .toHaveClass('quantity-tone-filtered')
    expect(screen.getByText('5 more in ETL').closest('.quantity-link-filter'))
      .toHaveClass('quantity-tone-added')
  })

  it('draws one curved union connector per ETL table', () => {
    const { container } = render(
      <DataQuantityDiagram flows={buildQuantityFlow(countsFor())} unionCount={900} fileDate="overall" />
    )

    const paths = container.querySelectorAll('[data-testid^="quantity-union-link-"]')
    expect(paths).toHaveLength(9)
    expect(paths[0].getAttribute('d')).toMatch(/^M 0 29 C /)
    expect(paths[0].getAttribute('marker-end')).toContain('url(#quantity-arrow-')
    expect(container.querySelector('linearGradient'))
      .toHaveAttribute('gradientUnits', 'userSpaceOnUse')
  })

  it('shows missing values when counts are unavailable', () => {
    const { container } = render(
      <DataQuantityDiagram flows={buildQuantityFlow({})} unionCount={null} fileDate="overall" />
    )

    const missing = screen.getAllByText('no data')
    expect(missing).toHaveLength(22)
    expect(missing.every((element) => element.tagName === 'EM')).toBe(true)
    expect(missing[0]).toHaveClass('quantity-no-data')
    expect(screen.queryByText('—')).not.toBeInTheDocument()
    expect(screen.getAllByText('No count')).toHaveLength(9)
    expect(screen.getByText('Union table').closest('.quantity-column-heading'))
      .toHaveTextContent('1 table · no data')
    expect(container.querySelectorAll('[data-testid^="quantity-union-link-"]')).toHaveLength(9)
  })
})
