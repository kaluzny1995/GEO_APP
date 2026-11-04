import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import DataSourceFilesChart from './DataSourceFilesChart.jsx'

const TIMELINE = {
  labels: ['2026-09-01', '2026-09-02', '2026-09-03'],
  records: [10, null, 5],
  sizes: [1.2, null, 0.8],
  missing: [null, 0, null],
  missingDates: ['2026-09-02'],
  undated: 0,
}

describe('DataSourceFilesChart', () => {
  it('renders a line chart', () => {
    render(<DataSourceFilesChart timeline={TIMELINE} />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('plots records, size and the missing-date marker', () => {
    render(<DataSourceFilesChart timeline={TIMELINE} />)
    const data = JSON.parse(screen.getByTestId('line-chart').dataset.data)

    expect(data.labels).toEqual(TIMELINE.labels)
    expect(data.datasets.map((dataset) => dataset.label)).toEqual([
      'Records',
      'Size (kB)',
      'Missing date',
    ])
    expect(data.datasets[0].data).toEqual([10, null, 5])
    expect(data.datasets[1].data).toEqual([1.2, null, 0.8])
    expect(data.datasets[2].data).toEqual([null, 0, null])
    expect(data.datasets[2].pointStyle).toBe('crossRot')
    expect(data.datasets[0].spanGaps).toBe(false)
    expect(data.datasets[1].spanGaps).toBe(false)
  })

  it('uses two linear y-axes', () => {
    render(<DataSourceFilesChart timeline={TIMELINE} />)
    const options = JSON.parse(screen.getByTestId('line-chart').dataset.options)

    expect(options.scales.records).toMatchObject({ type: 'linear', position: 'left' })
    expect(options.scales.size).toMatchObject({ type: 'linear', position: 'right' })
    expect(options.scales.records.beginAtZero).toBe(true)
    expect(options.scales.size.beginAtZero).toBe(true)
  })
})
