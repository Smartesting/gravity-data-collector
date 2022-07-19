import { beforeEach, describe, expect, it, vi, vitest } from 'vitest'
import { GravityEventHandler } from '../../event/handler/GravityEventHandler'
import { VALID_AUTH_KEY } from '../../mocks/handlers'
import { createSessionEvent } from '../../event/createSessionEvent'
import { createGravityEvent } from '../../event/createGravityEvent'
import { mockClick } from '../../test-utils/mocks'
import { EventType } from '../../types'
import { JSDOM } from 'jsdom'

describe('GravityEventHandler', () => {
  describe('run', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.restoreAllMocks()
    })

    it('send events to Gravity server with valid auth key', async () => {
      const successCallback = vi.fn()
      const errorCallback = vi.fn()
      const eventHandler = new GravityEventHandler('aaa-111',
        {
          authKey: VALID_AUTH_KEY,
          delay: 0,
        }, successCallback, errorCallback)
      await eventHandler.run(createSessionEvent())
      expect(successCallback).toHaveBeenCalled()
      expect(errorCallback).toHaveBeenCalledTimes(0)
    })

    it('send events to Gravity server with invalid auth key', async () => {
      const successCallback = vi.fn()
      const errorCallback = vi.fn()
      const eventHandler = new GravityEventHandler('aaa-111',
        {
          authKey: 'DUMMY-AUTH-KEY',
          delay: 0,
        },
        successCallback, errorCallback)
      await eventHandler.run(createSessionEvent())
      expect(errorCallback).toHaveBeenCalledWith('error 404, Not Found')
      expect(successCallback).toHaveBeenCalledTimes(0)
    })

    it('catch errors', async () => {
      const successCallback = vi.fn().mockImplementation(() => {
        throw new Error('dummy')
      })
      const errorCallback = vi.fn()
      const eventHandler = new GravityEventHandler('aaa-111',
        {
          authKey: VALID_AUTH_KEY,
          delay: 0,
        },
        successCallback, errorCallback)
      await eventHandler.run(createSessionEvent())
      expect(successCallback).toHaveBeenCalled()
      expect(errorCallback).toHaveBeenCalledWith('dummy')
    })

    it('sends to Gravity server grouped and delayed events', async () => {
      const successCallback = vi.fn()
      const delay = 5000
      const eventHandler = new GravityEventHandler('aaa-111',
        {
          authKey: VALID_AUTH_KEY,
          delay,
        }, successCallback)
      const flush = vitest.spyOn(eventHandler, 'flush')
      const send = vitest.spyOn(eventHandler, 'send')

      await eventHandler.run(createSessionEvent())
      expect(flush).toHaveBeenCalledTimes(0)
      expect(send).toHaveBeenCalledTimes(0)
      await eventHandler.run(await mockGravityClickEvent())
      expect(flush).toHaveBeenCalledTimes(0)
      expect(send).toHaveBeenCalledTimes(0)
      await eventHandler.run(await mockGravityClickEvent())
      vi.advanceTimersByTime(delay)
      expect(flush).toHaveBeenCalledTimes(1)
      expect((send.mock.lastCall as any[])[0]).toHaveLength(3)

      // continue sending
      await eventHandler.run(await mockGravityClickEvent())
      await eventHandler.run(await mockGravityClickEvent())
      vi.advanceTimersByTime(delay)
      expect(flush).toHaveBeenCalledTimes(2)
      expect(send).toHaveBeenCalledTimes(2)
      expect((send.mock.lastCall as any[])[0]).toHaveLength(2)

      // no sending if no buffer
      vi.advanceTimersByTime(delay)
      expect(flush).toHaveBeenCalledTimes(3)
      expect(send).toHaveBeenCalledTimes(2)
    })

    it('sends to Gravity server delayed events after "unload" event', async () => {
      const successCallback = vi.fn()
      const delay = 5000
      const eventHandler = new GravityEventHandler('aaa-111',
        {
          authKey: VALID_AUTH_KEY,
          delay,
        }, successCallback)
      const flush = vitest.spyOn(eventHandler, 'flush')
      const send = vitest.spyOn(eventHandler, 'send')

      await eventHandler.run(createSessionEvent())
      await eventHandler.run(await mockGravityClickEvent())
      await eventHandler.run(await createGravityEvent(new Event('unload'), EventType.Unload))
      expect(flush).toHaveBeenCalledTimes(1)
      expect((send.mock.lastCall as any[])[0]).toHaveLength(3)
    })
  })
})

async function mockGravityClickEvent() {
  const dom = new JSDOM('<div>Click Me</div>')
  const element = dom.window.document.querySelector('div')
  return await createGravityEvent(mockClick(element as HTMLElement) as unknown as Event, EventType.Click)
}
