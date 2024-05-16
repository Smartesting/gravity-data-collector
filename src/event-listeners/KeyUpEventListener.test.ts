import { beforeEach, describe, expect, it, SpyInstance, vitest } from 'vitest'
import { fireEvent, getAllByRole, getByRole, waitFor } from '@testing-library/dom'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import KeyUpEventListener from '../event-listeners/KeyUpEventListener'
import * as createTargetedUserActionModule from '../user-action/createTargetedUserAction'
import IUserActionHandler, { NopUserActionHandler } from '../user-action/IUserActionHandler'
import { QueryType } from '../types'

describe('KeyUpEventListener', () => {
  let userActionHandler: IUserActionHandler
  let handleSpy: SpyInstance
  let createTargetedUserActionSpy: SpyInstance

  describe('listener', () => {
    beforeEach(() => {
      vitest.restoreAllMocks()
      userActionHandler = new NopUserActionHandler()
      handleSpy = vitest.spyOn(userActionHandler, 'handle')
      createTargetedUserActionSpy = vitest.spyOn(createTargetedUserActionModule, 'createTargetedUserAction')
    })

    it('calls createTargetedUserAction with the "selectorOptions" option', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
            <div>
                <input id="text-5" type="search" />
            </div>`,
        'div',
      )

      new KeyUpEventListener(userActionHandler, domWindow, {
        selectorsOptions: { queries: [QueryType.id], excludedQueries: [QueryType.tag], attributes: ['myAttribute'] },
      }).init()
      const search = await waitFor(() => getByRole(element, 'searchbox'))

      fireEvent.keyUp(search)

      await waitFor(() => {
        expect(createTargetedUserActionSpy).toHaveBeenCalledWith(new KeyboardEvent('keyup'), 'keyup', {
          selectorsOptions: {
            queries: [QueryType.id],
            excludedQueries: [QueryType.tag],
            attributes: ['myAttribute'],
          },
        })
      })
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
      const checkbox = await waitFor(() => getByRole(element, 'checkbox'))

      fireEvent.keyUp(checkbox, { code: 'Space' })

      await waitFor(() => {
        expect(handleSpy).toHaveBeenCalledOnce()
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
        expect(handleSpy).toHaveBeenCalledOnce()
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

        new KeyUpEventListener(userActionHandler, domWindow).init()

        const inputs: HTMLElement[] = await waitFor(() => getAllByRole(element, 'textbox'))
        const search = await waitFor(() => getByRole(element, 'searchbox'))

        for (const input of inputs) {
          fireEvent.keyUp(input, { code })
        }
        fireEvent.keyUp(search, { code })

        await waitFor(() => {
          expect(handleSpy).toHaveBeenCalledTimes(3)
        })
      }
    })
  })
})
