import { describe, expect, it } from 'vitest'
import { CollectorOptions } from '../types'
import completeOptions from './completeOptions'
import { GRAVITY_SERVER_ADDRESS } from '../gravityEndPoints'

describe('completeOptions', () => {
  it('throws an error when not provided a CollectorOptions', () => {
    expect(() => completeOptions()).toThrow('No AuthKey provided')
  })

  it('throws an error when provided an empty CollectorOptions', () => {
    expect(() => completeOptions({})).toThrow('No AuthKey provided')
  })

  it('throws an error when provided an invalid "sessionsPercentageKept"', () => {
    expect(() => completeOptions({ authKey: '123', sessionsPercentageKept: NaN })).toThrow(
      'option "sessionsPercentageKept": NaN is not a valid percentage (should be in range 0..100)',
    )
    expect(() => completeOptions({ authKey: '123', sessionsPercentageKept: -1 })).toThrow(
      'option "sessionsPercentageKept": -1 is not a valid percentage (should be in range 0..100)',
    )
    expect(() => completeOptions({ authKey: '123', sessionsPercentageKept: 101 })).toThrow(
      'option "sessionsPercentageKept": 101 is not a valid percentage (should be in range 0..100)',
    )
  })

  describe('when debug is set to true', () => {
    it('sets maxDelay to 500', () => {
      const completed = completeOptions({ debug: true })
      const expected: CollectorOptions = {
        authKey: '',
        requestInterval: 5000,
        debug: true,
        maxDelay: 500,
        gravityServerUrl: GRAVITY_SERVER_ADDRESS,
        excludeRegex: null,
        sessionsPercentageKept: 100,
      }
      expect(completed).toStrictEqual(expected)
    })

    it('keeps values provided by the user', () => {
      const completed = completeOptions({
        debug: true,
        maxDelay: 15,
        sessionsPercentageKept: 33.3,
      })
      const expected: CollectorOptions = {
        authKey: '',
        requestInterval: 5000,
        debug: true,
        maxDelay: 15,
        gravityServerUrl: GRAVITY_SERVER_ADDRESS,
        excludeRegex: null,
        sessionsPercentageKept: 33.3,
      }
      expect(completed).toStrictEqual(expected)
    })
  })

  describe('when  debug is set to false', () => {
    it('throws an error if authKey is not provided', () => {
      expect(() => completeOptions({ debug: false })).toThrow('No AuthKey provided')
    })

    describe('when authKey is set', () => {
      it('sets default value for requestInterval, maxDelay and gravityServerUrl', () => {
        const completed = completeOptions({
          debug: false,
          authKey: '123-456-789',
        })
        const expected: CollectorOptions = {
          authKey: '123-456-789',
          requestInterval: 5000,
          debug: false,
          maxDelay: 0,
          gravityServerUrl: GRAVITY_SERVER_ADDRESS,
          excludeRegex: null,
          sessionsPercentageKept: 100,
        }
        expect(completed).toStrictEqual(expected)
      })

      it('does not override user input for requestInterval', () => {
        const completed = completeOptions({
          debug: false,
          authKey: '123-456-789',
          requestInterval: 1234,
        })
        const expected: CollectorOptions = {
          authKey: '123-456-789',
          requestInterval: 1234,
          debug: false,
          maxDelay: 0,
          gravityServerUrl: GRAVITY_SERVER_ADDRESS,
          excludeRegex: null,
          sessionsPercentageKept: 100,
        }
        expect(completed).toStrictEqual(expected)
      })

      it('does not override user input for gravityServerUrl', () => {
        const completed = completeOptions({
          debug: false,
          authKey: '123-456-789',
          gravityServerUrl: 'http://localhost:3000',
        })
        const expected: CollectorOptions = {
          authKey: '123-456-789',
          requestInterval: 5000,
          debug: false,
          maxDelay: 0,
          gravityServerUrl: 'http://localhost:3000',
          excludeRegex: null,
          sessionsPercentageKept: 100,
        }
        expect(completed).toStrictEqual(expected)
      })

      it('does not override user input for excludeRegex', () => {
        const completed = completeOptions({
          debug: false,
          authKey: '123-456-789',
          excludeRegex: /^#my-id-.*$/,
        })
        const expected: CollectorOptions = {
          authKey: '123-456-789',
          requestInterval: 5000,
          debug: false,
          maxDelay: 0,
          gravityServerUrl: GRAVITY_SERVER_ADDRESS,
          excludeRegex: /^#my-id-.*$/,
          sessionsPercentageKept: 100,
        }
        expect(completed).toStrictEqual(expected)
      })

      it('strips trailing slash for gravityServerUrl if needed', () => {
        const completed = completeOptions({
          debug: false,
          authKey: '123-456-789',
          gravityServerUrl: 'http://localhost:3000/',
        })
        const expected: CollectorOptions = {
          authKey: '123-456-789',
          requestInterval: 5000,
          debug: false,
          maxDelay: 0,
          gravityServerUrl: 'http://localhost:3000',
          excludeRegex: null,
          sessionsPercentageKept: 100,
        }
        expect(completed).toStrictEqual(expected)
      })
    })
  })
})
