import { describe, expect, it } from 'vitest'
import { CollectorOptions } from '../types'
import completeOptions from './completeOptions'

describe('completeOptions', () => {
  it('throws an error when not provided a CollectorOptions', () => {
    expect(() => completeOptions()).toThrow('No AuthKey provided')
  })

  it('throws an error when provided an empty CollectorOptions', () => {
    expect(() => completeOptions({})).toThrow('No AuthKey provided')
  })

  describe('when debug is set to true', () => {
    it('completes simulation to false and maxDelay to zero', () => {
      const completed = completeOptions({ debug: true })
      const expected: CollectorOptions = {
        debug: true,
        simulation: false,
        maxDelay: 0,
      }
      expect(completed).toStrictEqual(expected)
    })

    it('keeps values provided by the user', () => {
      const completed = completeOptions({ debug: true, simulation: true, maxDelay: 15 })
      const expected: CollectorOptions = {
        debug: true,
        simulation: true,
        maxDelay: 15,
      }
      expect(completed).toStrictEqual(expected)
    })
  })

  describe('when  debug is set to true', () => {
    it('throws an error if authkey is not provided', () => {
      expect(() => completeOptions({ debug: false })).toThrow('No AuthKey provided')
    })

    it('returns the authKey and debug mode', () => {
      const completed = completeOptions({ debug: false, authKey: '123-456-789' })
      const expected: CollectorOptions = {
        debug: false,
        authKey: '123-456-789',
      }
      expect(completed).toStrictEqual(expected)
    })
  })
})
