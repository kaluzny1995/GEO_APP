import { describe, expect, it } from 'vitest'
import routes from './routes.js'

describe('routes', () => {
  it('places Data Source Files between Overview and Data Quality', () => {
    expect(routes.slice(0, 3).map((route) => route.name)).toEqual([
      'Overview',
      'Data Source Files',
      'Data Quality',
    ])
  })

  it('uses the configured data-source-files path', () => {
    const route = routes.find((item) => item.name === 'Data Source Files')
    expect(route?.path).toBe('/data-source-files')
  })
})
