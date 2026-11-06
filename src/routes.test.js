import { describe, expect, it } from 'vitest'
import routes from './routes.js'

describe('routes', () => {
  it('places System Flow after Overview and before Data Source Files and Data Quality', () => {
    expect(routes.slice(0, 4).map((route) => route.name)).toEqual([
      'Overview',
      'System Flow',
      'Data Source Files',
      'Data Quality',
    ])
  })

  it('uses the configured system-flow path', () => {
    const route = routes.find((item) => item.name === 'System Flow')
    expect(route?.path).toBe('/system-flow')
  })

  it('uses the configured data-source-files path', () => {
    const route = routes.find((item) => item.name === 'Data Source Files')
    expect(route?.path).toBe('/data-source-files')
  })
})
