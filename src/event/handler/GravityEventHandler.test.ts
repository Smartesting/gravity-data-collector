import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSessionEvent } from '../event'
import { GravityEventHandler } from '../../event/handler/GravityEventHandler'
import { VALID_AUTH_KEY } from '../../mocks/handlers'

describe('GravityEventHandler', () => {
  describe('run', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.restoreAllMocks()
    })

    it('send event to Gravity server with valid auth key', async () => {
      const successCallback = vi.fn()
      const errorCallback = vi.fn()
      const eventHandler = new GravityEventHandler(VALID_AUTH_KEY, 'aaa-111', successCallback, errorCallback)
      await eventHandler.run(createSessionEvent())
      expect(successCallback).toHaveBeenCalledWith({ error: null })
      expect(errorCallback).toHaveBeenCalledTimes(0)
    })

    it('send event to Gravity server with invalid auth key', async () => {
      const successCallback = vi.fn()
      const errorCallback = vi.fn()
      const eventHandler = new GravityEventHandler('DUMMY-AUTH-KEY', 'aaa-111', successCallback, errorCallback)
      await eventHandler.run(createSessionEvent())
      expect(errorCallback).toHaveBeenCalledWith('error 404, Not Found')
      expect(successCallback).toHaveBeenCalledTimes(0)
    })

    //TODO buffering
    //TODO session ending event

  })
})
