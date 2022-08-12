import { beforeEach, describe, expect, it, vitest } from 'vitest'
import UserActionHandler from '../user-action/UserActionHandler'
import { fireEvent, getAllByRole, getByRole, waitFor } from '@testing-library/dom'
import { nop } from '../utils/nop'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import KeyDownEventListener from '../event-listeners/KeyDownEventListener'

describe('KeyDownEventListener', () => {
  describe('listener', () => {
    const userActionHandler = new UserActionHandler('aaa-111', 0, nop)
    const runSpy = vitest.spyOn(userActionHandler, 'handle')

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

      new KeyDownEventListener(userActionHandler, domWindow).init()
      const button = await waitFor(() => getByRole(element, 'checkbox'))

      fireEvent.keyDown(button)

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledOnce()
      })
    })

    it('calls listener when key down event been fired on a div', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
                <div>
                    <div role="cell"/>
                </div>`,
        'div',
      )

      new KeyDownEventListener(userActionHandler, domWindow).init()
      const div = await waitFor(() => getByRole(element, 'cell'))

      fireEvent.keyDown(div)

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledOnce()
      })
    })

    it('does not call listener when key down event is fired on text inputs', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
            <div>
                <input id="text-1" type="text"/>
                <textarea id="text-2"></textarea>
                <input id="text-5" type="search" />
            </div>`,
        'div',
      )

      new KeyDownEventListener(userActionHandler, domWindow).init()

      const inputs: HTMLElement[] = await waitFor(() => getAllByRole(element, 'textbox'))
      const search = await waitFor(() => getByRole(element, 'searchbox'))

      for (const input of inputs) {
        fireEvent.keyDown(input)
      }
      fireEvent.keyDown(search)

      await waitFor(() => {}, { timeout: 500 })

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledTimes(0)
      })
    })

    it('calls listener when Tab key down even on text inputs', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
            <div>
                <input id="text-1" type="text"/>
                <textarea id="text-2"></textarea>
                <input id="text-5" type="search" />
            </div>`,
        'div',
      )

      new KeyDownEventListener(userActionHandler, domWindow).init()

      const inputs: HTMLElement[] = await waitFor(() => getAllByRole(element, 'textbox'))
      const search = await waitFor(() => getByRole(element, 'searchbox'))

      for (const input of inputs) {
        fireEvent.keyDown(input, { code: 'Tab' })
      }
      fireEvent.keyDown(search, { code: 'Tab' })

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledTimes(3)
      })
    })
  })
})
