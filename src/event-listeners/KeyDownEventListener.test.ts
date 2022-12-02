import { beforeEach, describe, expect, it, SpyInstance, vitest } from 'vitest'
import UserActionHandler from '../user-action/UserActionHandler'
import { fireEvent, getAllByRole, getByRole, waitFor } from '@testing-library/dom'
import { nop } from '../utils/nop'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import UserActionsHistory from '../user-actions-history/UserActionsHistory'
import MemoryUserActionsHistory from '../user-actions-history/MemoryUserActionsHistory'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import KeyDownEventListener from './KeyDownEventListener'
import * as createTargetedUserActionModule from '../user-action/createTargetedUserAction'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import { MemorySessionSizeController } from '../session-size-controller/MemorySessionSizeController'

describe('KeyDownEventListener', () => {
  let userActionHistory: UserActionsHistory
  let userActionHandler: UserActionHandler
  let sessionIdHandler: ISessionIdHandler
  let handleSpy: SpyInstance
  let createTargetedUserActionSpy: SpyInstance

  beforeEach(() => {
    vitest.restoreAllMocks()
    userActionHistory = new MemoryUserActionsHistory()
    sessionIdHandler = new MemorySessionIdHandler(() => 'aaa-111', 500)
    userActionHandler = new UserActionHandler(
      sessionIdHandler,
      0,
      new MemorySessionSizeController(1),
      nop,
      nop,
      userActionHistory,
    )
    handleSpy = vitest.spyOn(userActionHandler, 'handle')
    createTargetedUserActionSpy = vitest.spyOn(createTargetedUserActionModule, 'createTargetedUserAction')
  })

  it('it calls createTargetedUserAction with the excludeRegex option', async () => {
    const { element, domWindow } = createElementInJSDOM(
      `
            <div>
                <input id="text-5" type="search" />
            </div>`,
      'div',
    )

    new KeyDownEventListener(userActionHandler, domWindow, userActionHistory, { excludeRegex: /.*/ }).init()
    const search = await waitFor(() => getByRole(element, 'searchbox'))

    fireEvent.keyDown(search)

    await waitFor(() => {
      expect(createTargetedUserActionSpy).toHaveBeenCalledWith(new KeyboardEvent('keydown'), 'keydown', /.*/, undefined)
    })
  })

  it('it calls createTargetedUserAction with the customSelector option', async () => {
    const { element, domWindow } = createElementInJSDOM(
      `
            <div>
                <input id="text-5" type="search" />
            </div>`,
      'div',
    )

    new KeyDownEventListener(userActionHandler, domWindow, userActionHistory, { customSelector: 'data-testid' }).init()
    const search = await waitFor(() => getByRole(element, 'searchbox'))

    fireEvent.keyDown(search)

    await waitFor(() => {
      expect(createTargetedUserActionSpy).toHaveBeenCalledWith(
        new KeyboardEvent('keydown'),
        'keydown',
        undefined,
        'data-testid',
      )
    })
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
