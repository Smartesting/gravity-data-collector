import { beforeEach, describe, expect, it, vitest } from 'vitest'
import EventHandler from '../handler/EventHandler'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import { nop } from '../../utils/nop'
import createElementInJSDOM from '../../test-utils/createElementInJSDOM'
import KeyDownEventListener from './KeyDownEventListener'

describe('KeyDownEventListener', () => {
  describe('listener', () => {
    const eventHandler = new EventHandler('aaa-111', 0, nop)
    const runSpy = vitest.spyOn(eventHandler, 'run')

    beforeEach(() => {
      vitest.restoreAllMocks()
    })

    it('calls listener when key down event been fired', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
                <div>
                    <input type="checkbox" id="checkbox1" name="checkbox1"/>
                </div>`,
        'div',
      )

      new KeyDownEventListener(eventHandler, domWindow).init()
      const button = await waitFor(() => getByRole(element, 'checkbox'))

      fireEvent.keyDown(button)

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledOnce()
      })
    })
  })
})
