import { beforeEach, describe, expect, it, vitest } from 'vitest'
import { JSDOM } from 'jsdom'
import EventHandler from '../handler/EventHandler'
import { waitFor } from '@testing-library/dom'
import { nop } from '../../utils/nop'
import UnloadEventListener from '../../event/listener/UnloadEventListener'

describe('UnloadEventListener', () => {
  describe('listener', () => {
    const eventHandler = new EventHandler('aaa-111', 0, nop)
    const runSpy = vitest.spyOn(eventHandler, 'run')

    beforeEach(() => {
      vitest.restoreAllMocks()
    })

    it('calls listener when unload event been fired', async () => {
      const dom = new JSDOM('<div/>')
      new UnloadEventListener(eventHandler, dom.window as unknown as Window).init()
      dom.window.dispatchEvent(new Event('unload'))

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledOnce()
      })
    })
  })
})
