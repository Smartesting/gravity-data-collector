import { beforeEach, describe, expect, it, SpyInstance, vitest } from 'vitest'
import { fireEvent, getByRole, getByTestId, waitFor } from '@testing-library/dom'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import KeyDownEventListener from './KeyDownEventListener'
import * as createTargetedUserActionModule from '../user-action/createTargetedUserAction'
import { NO_ANONYMIZATION_SETTINGS, QueryType, TargetedUserAction, UserAction, UserActionType } from '../types'
import UserActionHandler from '../user-action/UserActionHandler'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import IUserActionHandler from '../user-action/IUserActionHandler'
import NopGravityClient from '../gravity-client/NopGravityClient'
import MemoryTimeoutHandler from '../timeout-handler/MemoryTimeoutHandler'

describe('KeyDownEventListener', () => {
  let userActionHandler: IUserActionHandler
  let sessionIdHandler: ISessionIdHandler
  let handleSpy: SpyInstance
  let createTargetedUserActionSpy: SpyInstance

  beforeEach(() => {
    vitest.restoreAllMocks()
    sessionIdHandler = new MemorySessionIdHandler(() => 'aaa-111')
    userActionHandler = new UserActionHandler(
      sessionIdHandler,
      new MemoryTimeoutHandler(1000),
      new NopGravityClient(0),
      false,
    )
    handleSpy = vitest.spyOn(userActionHandler, 'handle')
    createTargetedUserActionSpy = vitest.spyOn(createTargetedUserActionModule, 'createTargetedUserAction')
  })

  function listHandledUserActions(): UserAction[] {
    return handleSpy.mock.calls.map((args) => args[0])
  }

  function listHandledUserActionsByType(expectedType: UserActionType): UserAction[] {
    return listHandledUserActions().filter((userAction) => userAction.type === expectedType)
  }

  it('calls createTargetedUserAction with the "selectorOptions" option', async () => {
    const { element, domWindow } = createElementInJSDOM(
      `
            <div>
                <input id="text-5" type="search" />
            </div>`,
      'div',
    )

    new KeyDownEventListener(userActionHandler, domWindow, {
      selectorsOptions: { queries: [QueryType.id], excludedQueries: [QueryType.tag], attributes: ['myAttribute'] },
    }).init()
    const search = await waitFor(() => getByRole(element, 'searchbox'))

    fireEvent.keyDown(search)

    await waitFor(() => {
      expect(createTargetedUserActionSpy).toHaveBeenCalledWith(
        new KeyboardEvent('keydown'),
        'keydown',
        NO_ANONYMIZATION_SETTINGS,
        {
          selectorsOptions: { queries: [QueryType.id], excludedQueries: [QueryType.tag], attributes: ['myAttribute'] },
        },
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

    new KeyDownEventListener(userActionHandler, domWindow).init()
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

    new KeyDownEventListener(userActionHandler, domWindow).init()
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

    new KeyDownEventListener(userActionHandler, domWindow).init()
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

      new KeyDownEventListener(userActionHandler, domWindow).init()

      const input = await waitFor(() => query(element))
      fireEvent.keyDown(input, { code })

      await waitFor(() => {
        expect(handleSpy).toHaveBeenCalledOnce()
        const handledUserAction = listHandledUserActions()[0]
        expect(handledUserAction.type).to.eq(expectedUserActionType)
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

          new KeyDownEventListener(userActionHandler, domWindow).init()
          const input = await waitFor(() => getByTestId(element, inputTestId))
          fireEvent.keyDown(input, { code: 'KeyA' })

          await waitFor(() => {}, { timeout: 200 })
          await waitFor(() => {
            const handledUserActionTypes = listHandledUserActionsByType(UserActionType.Change)
            expect(handledUserActionTypes).not.to.contain(UserActionType.Change)
          })
        })
      }
    })

    describe('when input is a text field', () => {
      const fields = [
        { type: 'text', html: `<input type="text" data-testid="${inputTestId}" />` },
        { type: 'search', html: `<input type="search" data-testid="${inputTestId}" />` },
        { type: 'email', html: `<input type="email" data-testid="${inputTestId}" />` },
        { type: 'password', html: `<input type="password" data-testid="${inputTestId}" />` },
        { type: 'textarea', html: `<textarea data-testid="${inputTestId}"></textarea>` },
      ]

      for (const { type, html } of fields) {
        it(`does triggers a Change event when typing in ${type}`, async () => {
          const { element, domWindow } = createElementInJSDOM(
            `
              <div>${html}</div>`,
            'div',
          )

          new KeyDownEventListener(userActionHandler, domWindow).init()
          const input = await waitFor(() => getByTestId(element, inputTestId))
          fireEvent.keyDown(input, { code: 'KeyA' })

          await waitFor(() => {}, { timeout: 200 })
          await waitFor(() => {
            const changeEvents = listHandledUserActionsByType(UserActionType.Change)
            expect(changeEvents.length).to.eq(1)
          })
        })

        it(`does not trigger multiple Change events when typing in ${type}`, async () => {
          const { element, domWindow } = createElementInJSDOM(
            `
              <div>${html}</div>`,
            'div',
          )

          new KeyDownEventListener(userActionHandler, domWindow).init()
          const input = await waitFor(() => getByTestId(element, inputTestId))
          fireEvent.keyDown(input, { code: 'KeyA' })
          fireEvent.keyDown(input, { code: 'KeyB' })
          fireEvent.keyDown(input, { code: 'KeyC' })
          fireEvent.keyDown(input, { code: 'KeyD' })

          await waitFor(() => {}, { timeout: 200 })
          await waitFor(() => {
            const changeEvents = listHandledUserActionsByType(UserActionType.Change)
            expect(changeEvents.length).to.eq(1)
          })
        })

        it('generates a value for the target', async () => {
          const { element, domWindow } = createElementInJSDOM(
            `
              <div>${html}</div>`,
            'div',
          )

          new KeyDownEventListener(userActionHandler, domWindow).init()
          const input = await waitFor(() => getByTestId(element, inputTestId))
          fireEvent.keyDown(input, { code: 'KeyA' })

          await waitFor(() => {}, { timeout: 200 })
          await waitFor(() => {
            const changeEvents = listHandledUserActionsByType(UserActionType.Change)
            const targetedUserAction = changeEvents[0] as TargetedUserAction
            expect(targetedUserAction.target.value).to.eq(`{{${type}}}`)
          })
        })
      }
    })
  })
})
