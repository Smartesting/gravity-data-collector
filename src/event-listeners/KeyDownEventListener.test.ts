import { beforeEach, describe, expect, it, SpyInstance, vitest } from 'vitest'
import UserActionHandler from '../user-action/UserActionHandler'
import { fireEvent, getAllByRole, getByRole, waitFor } from '@testing-library/dom'
import { nop } from '../utils/nop'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import KeyDownEventListener from '../event-listeners/KeyDownEventListener'
import UserActionsHistory from '../user-actions-history/UserActionsHistory'
import MemoryUserActionsHistory from '../user-actions-history/MemoryUserActionsHistory'

describe('KeyDownEventListener', () => {
  describe('listener', () => {
    let userActionHistory: UserActionsHistory
    let userActionHandler: UserActionHandler
    let handleSpy: SpyInstance

    beforeEach(() => {
      vitest.restoreAllMocks()
      userActionHistory = new MemoryUserActionsHistory()
      userActionHandler = new UserActionHandler('aaa-111', 0, nop, nop, userActionHistory)
      handleSpy = vitest.spyOn(userActionHandler, 'handle')
    })

    it('calls handler when key down event been fired', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
                <div>
                    <input type="checkbox" id="checkbox1" name="checkbox1"/>
                </div>`,
        'div',
      )

      new KeyDownEventListener(userActionHandler, domWindow, userActionHistory).init()
      const button = await waitFor(() => getByRole(element, 'checkbox'))

      fireEvent.keyDown(button)

      await waitFor(() => {
        expect(handleSpy).toHaveBeenCalledOnce()
      })
    })

    it('calls handler when key down event been fired on a div', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
                <div>
                    <div role="cell"/>
                </div>`,
        'div',
      )

      new KeyDownEventListener(userActionHandler, domWindow, userActionHistory).init()
      const div = await waitFor(() => getByRole(element, 'cell'))

      fireEvent.keyDown(div)

      await waitFor(() => {
        expect(handleSpy).toHaveBeenCalledOnce()
      })
    })

    it('does not call listener multiple time when key down event is fired consecutively', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
                <div>
                    <div role="cell"/>
                </div>`,
        'div',
      )

      new KeyDownEventListener(userActionHandler, domWindow, userActionHistory).init()
      const div = await waitFor(() => getByRole(element, 'cell'))

      for (let i = 0; i < 10; i++) fireEvent.keyDown(div)

      await waitFor(() => {}, { timeout: 200 })

      await waitFor(() => {
        expect(handleSpy).toHaveBeenCalledOnce()
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

      new KeyDownEventListener(userActionHandler, domWindow, userActionHistory).init()

      const inputs: HTMLElement[] = await waitFor(() => getAllByRole(element, 'textbox'))
      const search = await waitFor(() => getByRole(element, 'searchbox'))

      for (const input of inputs) {
        fireEvent.keyDown(input)
      }
      fireEvent.keyDown(search)

      await waitFor(() => {}, { timeout: 500 })

      await waitFor(() => {
        expect(handleSpy).toHaveBeenCalledTimes(0)
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

        new KeyDownEventListener(userActionHandler, domWindow, userActionHistory).init()

        const inputs: HTMLElement[] = await waitFor(() => getAllByRole(element, 'textbox'))
        const search = await waitFor(() => getByRole(element, 'searchbox'))

        for (const input of inputs) {
          fireEvent.keyDown(input, { code })
        }
        fireEvent.keyDown(search, { code })

        await waitFor(() => {
          expect(handleSpy).toHaveBeenCalledTimes(3)
        })
      }
    })
  })
})
