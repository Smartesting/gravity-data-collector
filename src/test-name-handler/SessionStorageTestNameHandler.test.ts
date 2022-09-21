import { beforeEach, describe, expect, it, vi } from 'vitest'
import SessionStorageTestNameHandler from './SessionStorageTestNameHandler'

describe('SessionStorageTestNameHandler', () => {
  const attributes1: any = {
    value: {
      currentTest: {
        titlePath: ['test'],
      },
    },
  }

  beforeEach(() => {
    window.sessionStorage.clear()
  })

  describe('getCurrent', () => {
    it('returns the current cypress test name', async () => {
      const testNameHandler = new SessionStorageTestNameHandler()
      expect(testNameHandler.getCurrent()).toBeNull()

      Object.defineProperty(window, 'Cypress', { ...attributes1 })

      expect(testNameHandler.getCurrent()).equals('test')
    })
  })

  describe('mock getCurrent', () => {
    beforeEach(() => {
      vi.spyOn(SessionStorageTestNameHandler.prototype, 'getCurrent').mockImplementation(() => {
        return 'test1'
      })
    })

    describe('refresh', () => {
      it('updates the previous cypress test name with the current one', async () => {
        const testNameHandler = new SessionStorageTestNameHandler()
        expect(testNameHandler.getPrevious()).not.equals(testNameHandler.getCurrent())

        testNameHandler.refresh()

        expect(testNameHandler.getPrevious()).equals(testNameHandler.getCurrent())
      })
    })

    describe('isNewTest', () => {
      it('return true if getPrevious and getCurrent return different results', async () => {
        const testNameHandler = new SessionStorageTestNameHandler()
        expect(testNameHandler.isNewTest()).toBeTruthy()
      })

      it('return false if getPrevious and getCurrent return same result', async () => {
        const testNameHandler = new SessionStorageTestNameHandler()
        testNameHandler.refresh()

        expect(testNameHandler.isNewTest()).toBeFalsy()
      })

      it('return false if getPrevious returns null', async () => {
        vi.spyOn(SessionStorageTestNameHandler.prototype, 'getCurrent').mockImplementation(() => {
          return null
        })
        const testNameHandler = new SessionStorageTestNameHandler()
        expect(testNameHandler.isNewTest()).toBeFalsy()
      })
    })
  })
})
