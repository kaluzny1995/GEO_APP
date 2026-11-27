import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

const packageJson = JSON.parse(
  readFileSync(resolve(cwd(), 'package.json'), 'utf8')
)

const majorVersion = (range) => Number(String(range).match(/\d+/)?.[0])

describe('Dependency compatibility', () => {
  it('keeps @vitest/coverage-v8 on the same major as vitest', () => {
    // npm ci performs strict peer resolution. Coverage v5 with Vitest v2 made
    // the CI install fail with ERESOLVE before any test could run.
    expect(
      majorVersion(packageJson.devDependencies['@vitest/coverage-v8'])
    ).toBe(majorVersion(packageJson.devDependencies.vitest))
  })
})
