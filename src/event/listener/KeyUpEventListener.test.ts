import { beforeEach, describe, expect, it, vitest } from 'vitest'
import EventHandler from '../handler/EventHandler'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import { nop } from '../../utils/nop'
import createElementInJSDOM from '../../test-utils/createElementInJSDOM'
import KeyUpEventListener from './KeyUpEventListener'

describe('KeyUpEventListener', () => {
  describe('listener', () => {
    const eventHandler = new EventHandler('aaa-111', 0, nop)
    const runSpy = vitest.spyOn(eventHandler, 'run')

    beforeEach(() => {
      vitest.restoreAllMocks()
    })

    it('calls listener when space key up event been fired', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
                <div>
                    <input type="checkbox" id="checkbox1" name="checkbox1"/>
                </div>`,
        'div',
      )

      new KeyUpEventListener(eventHandler, domWindow).init()
      const button = await waitFor(() => getByRole(element, 'checkbox'))

      fireEvent.keyUp(button, { code: 'Space' })

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledOnce()
      })
    })

    it('does not call listener if up key is not space', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
                <div>
                    <input type="checkbox" id="checkbox1" name="checkbox1"/>
                </div>`,
        'div',
      )

      new KeyUpEventListener(eventHandler, domWindow).init()
      const button = await waitFor(() => getByRole(element, 'checkbox'))

      fireEvent.keyUp(button, { code: 'enter' })

      await waitFor(() => {}, { timeout: 500 })

      await waitFor(() => {
        expect(runSpy).toBeCalledTimes(0)
      })
    })
  })
})
