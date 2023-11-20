import { beforeEach, describe, expect, it, vi } from 'vitest'
import SessionStorageTestNameHandler from './SessionStorageTestNameHandler'

describe('SessionStorageTestNameHandler', () => {
  const cypressObject = {
    currentTest: {
      title: '',
      titlePath: ['test'],
    },
  }

  beforeEach(() => {
    window.sessionStorage.clear()
  })

  describe('getCurrent', () => {
    it('returns the current cypress test name', async () => {
      const testNameHandler = new SessionStorageTestNameHandler()
      expect(testNameHandler.getCurrentTestName()).toBeNull()
      expect(testNameHandler.getCurrentTestName(cypressObject)).equals('test')
    })
  })

  describe('mock getCurrent', () => {
    beforeEach(() => {
      vi.spyOn(SessionStorageTestNameHandler.prototype, 'getCurrentTestName').mockImplementation(() => {
        return 'test1'
      })
    })

    describe('refresh', () => {
      it('updates the previous cypress test name with the current one', async () => {
        const testNameHandler = new SessionStorageTestNameHandler()
        expect(testNameHandler.getPreviousTestName()).not.equals(testNameHandler.getCurrentTestName())

        testNameHandler.refresh()

        expect(testNameHandler.getPreviousTestName()).equals(testNameHandler.getCurrentTestName())
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
        vi.spyOn(SessionStorageTestNameHandler.prototype, 'getCurrentTestName').mockImplementation(() => {
          return null
        })
        const testNameHandler = new SessionStorageTestNameHandler()
        expect(testNameHandler.isNewTest()).toBeFalsy()
      })
    })
  })
})
