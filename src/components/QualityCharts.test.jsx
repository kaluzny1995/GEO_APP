import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import QualityCharts from './QualityCharts.jsx'

const mockDataset = {
  name: 'GEO Places',
  trend: [
    { month: 'Jun', score: 78 },
    { month: 'Jul', score: 81 },
    { month: 'Aug', score: 84 },
    { month: 'Sep', score: 86 },
    { month: 'Oct', score: 89 },
  ],
  rules: [
    { id: 'R-101', passRate: 99.2, status: 'pass' },
    { id: 'R-102', passRate: 99.6, status: 'pass' },
    { id: 'R-103', passRate: 92.4, status: 'warn' },
    { id: 'R-104', passRate: 88.1, status: 'warn' },
    { id: 'R-105', passRate: 97.3, status: 'pass' },
    { id: 'R-106', passRate: 71.5, status: 'fail' },
  ],
}

describe('QualityCharts', () => {
  it('renders three chart sections', () => {
    render(<QualityCharts dataset={mockDataset} />)
    expect(screen.getByText('Quality trend')).toBeInTheDocument()
    expect(screen.getByText('Rule pass %')).toBeInTheDocument()
    expect(screen.getByText('Rule status')).toBeInTheDocument()
  })

  it('renders line chart', () => {
    render(<QualityCharts dataset={mockDataset} />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('renders bar chart', () => {
    render(<QualityCharts dataset={mockDataset} />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('renders doughnut chart', () => {
    render(<QualityCharts dataset={mockDataset} />)
    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument()
  })

  it('passes correct data to line chart', () => {
    render(<QualityCharts dataset={mockDataset} />)
    const lineChart = screen.getByTestId('line-chart')
    const data = JSON.parse(lineChart.dataset.data)
    expect(data.labels).toEqual(['Jun', 'Jul', 'Aug', 'Sep', 'Oct'])
    expect(data.datasets[0].data).toEqual([78, 81, 84, 86, 89])
  })

  it('passes correct data to bar chart', () => {
    render(<QualityCharts dataset={mockDataset} />)
    const barChart = screen.getByTestId('bar-chart')
    const data = JSON.parse(barChart.dataset.data)
    expect(data.labels).toEqual(['R-101', 'R-102', 'R-103', 'R-104', 'R-105', 'R-106'])
    expect(data.datasets[0].data).toEqual([99.2, 99.6, 92.4, 88.1, 97.3, 71.5])
  })

  it('passes correct data to doughnut chart', () => {
    render(<QualityCharts dataset={mockDataset} />)
    const doughnutChart = screen.getByTestId('doughnut-chart')
    const data = JSON.parse(doughnutChart.dataset.data)
    expect(data.labels).toEqual(['Pass', 'Warn', 'Fail'])
    expect(data.datasets[0].data).toEqual([3, 2, 1])
  })
})