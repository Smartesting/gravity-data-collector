import { beforeEach, describe, expect, it, SpyInstance, vitest } from 'vitest'
import UserActionHandler from '../user-action/UserActionHandler'
import { fireEvent, getByRole, getByTestId, waitFor } from '@testing-library/dom'
import { nop } from '../utils/nop'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import UserActionsHistory from '../user-actions-history/UserActionsHistory'
import MemoryUserActionsHistory from '../user-actions-history/MemoryUserActionsHistory'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import KeyDownEventListener from './KeyDownEventListener'
import * as createTargetedUserActionModule from '../user-action/createTargetedUserAction'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import { UserActionType } from '../types'

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
    userActionHandler = new UserActionHandler(sessionIdHandler, 0, nop, nop, userActionHistory)
    handleSpy = vitest.spyOn(userActionHandler, 'handle')
    createTargetedUserActionSpy = vitest.spyOn(createTargetedUserActionModule, 'createTargetedUserAction')
  })

  it('it calls createTargetedUserAction with the excludeRegex option', async () => {
    const { element, domWindow } = createElementInJSDOM(
      `
            <div>
                <input id='text-5' type='search' />
            </div>`,
      'div',
    )

    new KeyDownEventListener(userActionHandler, domWindow, userActionHistory, { excludeRegex: /.*/ }).init()
    const search = await waitFor(() => getByRole(element, 'searchbox'))

    fireEvent.keyDown(search)

    await waitFor(() => {
      expect(createTargetedUserActionSpy).toHaveBeenCalledWith(new KeyboardEvent('keydown'), 'keydown', {
        excludeRegex: /.*/,
      })
    })
  })

  it('it calls createTargetedUserAction with the customSelector option', async () => {
    const { element, domWindow } = createElementInJSDOM(
      `
            <div>
                <input id='text-5' type='search' />
            </div>`,
      'div',
    )

    new KeyDownEventListener(userActionHandler, domWindow, userActionHistory, { customSelector: 'data-testid' }).init()
    const search = await waitFor(() => getByRole(element, 'searchbox'))

    fireEvent.keyDown(search)

    await waitFor(() => {
      expect(createTargetedUserActionSpy).toHaveBeenCalledWith(new KeyboardEvent('keydown'), 'keydown', {
        customSelector: 'data-testid',
      })
    })
  })

  it('calls handler when key down event been fired', async () => {
    const { element, domWindow } = createElementInJSDOM(
      `
                <div>
                    <input type='checkbox' id='checkbox1' name='checkbox1'/>
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
            <div role='cell'/>
        </div>`,
      'div',
    )

    new KeyDownEventListener(userActionHandler, domWindow, userActionHistory).init()
    const div = await waitFor(() => getByRole(element, 'cell'))

    fireEvent.keyDown(div)

    await waitFor(() => {
      console.log()
      expect(handleSpy).toHaveBeenCalledOnce()
    })
  })

  it('does not call listener multiple time when key down event is fired consecutively', async () => {
    const { element, domWindow } = createElementInJSDOM(
      `
        <div>
            <div role='cell'/>
        </div>`,
      'div',
    )

    new KeyDownEventListener(userActionHandler, domWindow, userActionHistory).init()
    const div = await waitFor(() => getByRole(element, 'cell'))

    for (let i = 0; i < 10; i++) fireEvent.keyDown(div, { code: 'Enter' })

    await waitFor(() => {}, { timeout: 200 })

    await waitFor(() => {
      expect(handleSpy).toHaveBeenCalledOnce()
    })
  })

  describe('when a special key is typed', () => {
    const inputs = [
      {
        query: (element: HTMLElement) => getByRole(element, 'textbox'),
        inputType: 'text',
        html: "<input id='text-1' type='text'/>",
        expectedUserActionType: UserActionType.KeyDown,
      },
      {
        query: (element: HTMLElement) => getByRole(element, 'textbox'),
        inputType: 'textarea',
        html: "<textarea id='text-2'></textarea>",
        expectedUserActionType: UserActionType.KeyDown,
      },
      {
        query: (element: HTMLElement) => getByRole(element, 'searchbox'),
        inputType: 'search',
        html: "<input id='text-5' type='search' />",
        expectedUserActionType: UserActionType.KeyDown,
      },
    ]

    for (const { html, inputType, query, expectedUserActionType } of inputs) {
      it(`calls handler when the key is Tab on ${inputType}`, async () => {
        await assertHandleUserActionIsCalled('Tab', html, query, expectedUserActionType)
      })

      it(`calls handler when the key is Enter on ${inputType}`, async () => {
        await assertHandleUserActionIsCalled('Enter', html, query, expectedUserActionType)
      })

      it(`calls handler when the key is NumpadEnter on ${inputType}`, async () => {
        await assertHandleUserActionIsCalled('NumpadEnter', html, query, expectedUserActionType)
      })
    }

    async function assertHandleUserActionIsCalled(
      code: string,
      domContent: string,
      query: (element: HTMLElement) => HTMLElement,
      expectedUserActionType: UserActionType,
    ) {
      const { element, domWindow } = createElementInJSDOM(`<div>${domContent}</div>`, 'div')

      new KeyDownEventListener(userActionHandler, domWindow, userActionHistory).init()

      const input = await waitFor(() => query(element))
      fireEvent.keyDown(input, { code })

      await waitFor(() => {
        const userActions = userActionHistory.getUserActionsHistory()
        expect(handleSpy).toHaveBeenCalledOnce()
        expect(userActions[0].type).to.eq(expectedUserActionType)
      })
    }
  })

  describe('typing in an text field triggers a change event', () => {
    const inputTestId = 'input-testid'

    describe('when input is not a text field', () => {
      const nonTextInputTypes = ['radio', 'checkbox', 'button']
      for (const inputType of nonTextInputTypes) {
        it(`does not trigger a Change event when type is ${inputType}`, async () => {
          const { element, domWindow } = createElementInJSDOM(
            `
              <div>
                  <input data-testid="${inputTestId}" type="${inputType}" />
              </div>`,
            'div',
          )

          new KeyDownEventListener(userActionHandler, domWindow, userActionHistory).init()
          const input = await waitFor(() => getByTestId(element, inputTestId))
          fireEvent.keyDown(input, { code: 'KeyA' })

          await waitFor(() => {}, { timeout: 200 })
          await waitFor(() => {
            expect(userActionHistory.getUserActionsHistory().map((userAction) => userAction.type)).not.to.contain(
              UserActionType.Change,
            )
          })
        })
      }
    })

    describe('when input is a text field', () => {
      const fields = [
        { type: 'text', html: `<input type="text" data-testid="${inputTestId}" />` },
        { type: 'search', html: `<input type="search" data-testid="${inputTestId}" />` },
        { type: 'textarea', html: `<textarea data-testid="${inputTestId}"></textarea>` },
      ]

      for (const { type, html } of fields) {
        it(`does triggers a Change event when typing in ${type}`, async () => {
          const { element, domWindow } = createElementInJSDOM(
            `
              <div>${html}</div>`,
            'div',
          )

          new KeyDownEventListener(userActionHandler, domWindow, userActionHistory).init()
          const input = await waitFor(() => getByTestId(element, inputTestId))
          fireEvent.keyDown(input, { code: 'KeyA' })

          await waitFor(() => {}, { timeout: 200 })
          await waitFor(() => {
            const changeEvents = userActionHistory
              .getUserActionsHistory()
              .filter((userAction) => userAction.type === UserActionType.Change)
            expect(changeEvents.length).to.eq(1)
          })
        })

        it(`does not trigger multiple Change events when typing in ${type}`, async () => {
          const { element, domWindow } = createElementInJSDOM(
            `
              <div>${html}</div>`,
            'div',
          )

          new KeyDownEventListener(userActionHandler, domWindow, userActionHistory).init()
          const input = await waitFor(() => getByTestId(element, inputTestId))
          fireEvent.keyDown(input, { code: 'KeyA' })
          fireEvent.keyDown(input, { code: 'KeyB' })
          fireEvent.keyDown(input, { code: 'KeyC' })
          fireEvent.keyDown(input, { code: 'KeyD' })

          await waitFor(() => {}, { timeout: 200 })
          await waitFor(() => {
            const changeEvents = userActionHistory
              .getUserActionsHistory()
              .filter((userAction) => userAction.type === UserActionType.Change)

            expect(changeEvents.length).to.eq(1)
          })
        })
      }
    })
  })
})
