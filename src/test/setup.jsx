import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Chart.js to avoid canvas issues in tests
const registerFn = vi.fn()
const Chart = Object.assign(vi.fn(), { register: registerFn })

vi.mock('chart.js', () => ({
  Chart,
  CategoryScale: { id: 'category' },
  LinearScale: { id: 'linear' },
  RadialLinearScale: { id: 'radialLinear' },
  PointElement: { id: 'point' },
  LineElement: { id: 'line' },
  BarElement: { id: 'bar' },
  ArcElement: { id: 'arc' },
  Tooltip: { id: 'tooltip' },
  Legend: { id: 'legend' },
  registerables: [],
}))

vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }) => <div data-testid="line-chart" data-data={JSON.stringify(data)} data-options={JSON.stringify(options)} />,
  Bar: ({ data, options }) => <div data-testid="bar-chart" data-data={JSON.stringify(data)} data-options={JSON.stringify(options)} />,
  Doughnut: ({ data, options }) => <div data-testid="doughnut-chart" data-data={JSON.stringify(data)} data-options={JSON.stringify(options)} />,
  Radar: ({ data, options }) => <div data-testid="radar-chart" data-data={JSON.stringify(data)} data-options={JSON.stringify(options)} />,
}))

// Mock bootstrap CSS
vi.mock('bootstrap/dist/css/bootstrap.min.css', () => ({}))

// Mock local CSS
vi.mock('./assets/css/bd-vite.css', () => ({}))
vi.mock('./index.css', () => ({}))