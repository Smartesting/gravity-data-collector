import { describe, expect, it } from 'vitest'
import { GRAVITY_SERVER_ADDRESS } from '../event/handler/eventSessionSender'
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
    it('sets maxDelay to 500', () => {
      const completed = completeOptions({ debug: true })
      const expected: CollectorOptions = {
        authKey: '',
        requestInterval: 5000,
        debug: true,
        maxDelay: 500,
        gravityServerUrl: GRAVITY_SERVER_ADDRESS,
      }
      expect(completed).toStrictEqual(expected)
    })

    it('keeps values provided by the user', () => {
      const completed = completeOptions({
        debug: true,
        maxDelay: 15,
      })
      const expected: CollectorOptions = {
        authKey: '',
        requestInterval: 5000,
        debug: true,
        maxDelay: 15,
        gravityServerUrl: GRAVITY_SERVER_ADDRESS,
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
        }
        expect(completed).toStrictEqual(expected)
      })
    })
  })
})
