import { beforeEach, describe, expect, it, vitest } from 'vitest'
import EventHandler from '../handler/EventHandler'
import { waitFor } from '@testing-library/dom'
import { nop } from '../../utils/nop'
import UnloadEventListener from '../../event/listener/UnloadEventListener'
import createElementInJSDOM from '../../test-utils/createElementInJSDOM'

describe('UnloadEventListener', () => {
  describe('listener', () => {
    const eventHandler = new EventHandler('aaa-111', 0, nop)
    const runSpy = vitest.spyOn(eventHandler, 'run')

    beforeEach(() => {
      vitest.restoreAllMocks()
    })

    it('calls listener when unload event been fired', async () => {
      const { domWindow } = createElementInJSDOM('<div/>', 'div')
      new UnloadEventListener(eventHandler, domWindow).init()
      domWindow.dispatchEvent(new Event('unload'))

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledOnce()
      })
    })
  })
})
