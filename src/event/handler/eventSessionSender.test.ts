import { beforeEach, describe, expect, it, vi } from 'vitest'
import { debugEventSessionSender, defaultEventSessionSender } from '../../event/handler/eventSessionSender'
import { SessionEvent } from '../../types'
import { DUMMY_AUTH_KEY_CAUSING_NETWORK_ERROR, VALID_AUTH_KEY } from '../../mocks/handlers'
import { waitFor } from '@testing-library/dom'

describe('eventSessionSender', () => {
  const sessionEvents: SessionEvent[] = [{} as SessionEvent, {} as SessionEvent]

  describe('defaultEventSessionSender', () => {

    beforeEach(() => {
      vi.restoreAllMocks()
    })

    const spySuccess = vi.fn().mockImplementation(payload => {
      console.log('BLA', payload)
    })
    const spyError = vi.fn()

    it('sends session events if valid auth key', async () => {
      await defaultEventSessionSender(VALID_AUTH_KEY, spySuccess)(sessionEvents)
      await waitFor(() => {
        expect(spySuccess).toHaveBeenCalledWith({ error: null })
      })
    })

    it('catches error if invalid auth key', async () => {
      await defaultEventSessionSender('DUMMY_AUTH_KEY', spySuccess, spyError)(sessionEvents)
      await waitFor(() => {
        expect(spyError).toHaveBeenCalledWith('error 404, Not Found')
      })
    })

    it('catches any error', async () => {
      await defaultEventSessionSender(DUMMY_AUTH_KEY_CAUSING_NETWORK_ERROR, spySuccess, spyError)(sessionEvents)
      await waitFor(() => {
        expect(spyError).toHaveBeenCalledOnce()
        expect((spyError.mock.lastCall as Array<any>)[0]).toMatch(/request to (.+?) failed, reason: Network Error/)
      })
    })
  })

  describe('debugEventSessionSender', () => {

    beforeEach(() => {
      vi.useFakeTimers()
      vi.clearAllTimers()
      vi.restoreAllMocks()
    })
    const spyOutput = vi.fn()

    it('outputs session events immediately if no maxDelay', () => {
      debugEventSessionSender(0, spyOutput)(sessionEvents)
      expect(spyOutput).toHaveBeenCalledTimes(3)
    })

    it('outputs session events immediately if maxDelay', () => {
      debugEventSessionSender(5000, spyOutput)(sessionEvents)
      expect(spyOutput).toHaveBeenCalledTimes(0)
      vi.advanceTimersByTime(5000)
      expect(spyOutput).toHaveBeenCalledTimes(3)
    })
  })

})
