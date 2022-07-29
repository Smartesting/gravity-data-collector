import { describe, expect, it } from 'vitest'
import pJson from '../package.json'
import { config } from './config'

describe('version', () => {
  it('config version number is equals to package version number', () => {
    expect(pJson.version).equals(config.COLLECTOR_VERSION)
  })
})
