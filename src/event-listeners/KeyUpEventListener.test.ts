import { beforeEach, describe, expect, it, vitest } from 'vitest'
import UserActionHandler from '../user-action/UserActionHandler'
import { fireEvent, getAllByRole, getByRole, waitFor } from '@testing-library/dom'
import { nop } from '../utils/nop'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import KeyUpEventListener from '../event-listeners/KeyUpEventListener'

describe('KeyUpEventListener', () => {
  describe('listener', () => {
    const userActionHandler = new UserActionHandler('aaa-111', 0, nop)
    const runSpy = vitest.spyOn(userActionHandler, 'handle')

    beforeEach(() => {
      vitest.restoreAllMocks()
    })

    it('calls handler when space key up event been fired', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
                <div>
                    <input type="checkbox" id="checkbox1" name="checkbox1"/>
                </div>`,
        'div',
      )

      new KeyUpEventListener(userActionHandler, domWindow).init()
      const button = await waitFor(() => getByRole(element, 'checkbox'))

      fireEvent.keyUp(button, { code: 'Space' })

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledOnce()
      })
    })

    it('calls handler when key up event been fired on a div', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
                <div>
                    <div role="cell"/>
                </div>`,
        'div',
      )

      new KeyUpEventListener(userActionHandler, domWindow).init()
      const div = await waitFor(() => getByRole(element, 'cell'))

      fireEvent.keyUp(div)

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledOnce()
      })
    })

    it('does not call listener when key up event is fired on text inputs', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
            <div>
                <input id="text-1" type="text"/>
                <textarea id="text-2"></textarea>
                <input id="text-5" type="search" />
            </div>`,
        'div',
      )

      new KeyUpEventListener(userActionHandler, domWindow).init()

      const inputs: HTMLElement[] = await waitFor(() => getAllByRole(element, 'textbox'))
      const search = await waitFor(() => getByRole(element, 'searchbox'))

      for (const input of inputs) {
        fireEvent.keyUp(input)
      }
      fireEvent.keyUp(search)

      await waitFor(() => {}, { timeout: 500 })

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledTimes(0)
      })
    })

    describe('When press on allowed key', () => {
      it('calls handler when the key is Tab', async () => {
        await assertHandleUserActionIsCalled('Tab')
      })

      it('calls handler when the key is Enter', async () => {
        await assertHandleUserActionIsCalled('Enter')
      })

      it('calls handler when the key is NumpadEnter', async () => {
        await assertHandleUserActionIsCalled('NumpadEnter')
      })

      async function assertHandleUserActionIsCalled(code: string) {
        const { element, domWindow } = createElementInJSDOM(
          `
            <div>
                <input id="text-1" type="text"/>
                <textarea id="text-2"></textarea>
                <input id="text-5" type="search" />
            </div>`,
          'div',
        )

        new KeyUpEventListener(userActionHandler, domWindow).init()

        const inputs: HTMLElement[] = await waitFor(() => getAllByRole(element, 'textbox'))
        const search = await waitFor(() => getByRole(element, 'searchbox'))

        for (const input of inputs) {
          fireEvent.keyUp(input, { code })
        }
        fireEvent.keyUp(search, { code })

        await waitFor(() => {
          expect(runSpy).toHaveBeenCalledTimes(3)
        })
      }
    })
  })
})
