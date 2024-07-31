import { beforeEach, describe, expect, it, MockInstance, vitest } from 'vitest'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import KeyDownEventListener from './KeyDownEventListener'
import * as createTargetedUserActionModule from '../user-action/createTargetedUserAction'
import { QueryType, UserAction, UserActionType } from '../types'
import UserActionHandler from '../user-action/UserActionHandler'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import IUserActionHandler from '../user-action/IUserActionHandler'
import NopGravityClient from '../gravity-client/NopGravityClient'
import MemoryTimeoutHandler from '../timeout-handler/MemoryTimeoutHandler'

describe('KeyDownEventListener', () => {
  let userActionHandler: IUserActionHandler
  let sessionIdHandler: ISessionIdHandler
  let handleSpy: MockInstance
  let createTargetedUserActionSpy: MockInstance

  beforeEach(() => {
    vitest.restoreAllMocks()
    sessionIdHandler = new MemorySessionIdHandler(() => 'aaa-111')
    const timeoutHandler = new MemoryTimeoutHandler(1000)
    const client = new NopGravityClient({ requestInterval: 0 })
    userActionHandler = new UserActionHandler(sessionIdHandler, timeoutHandler, client, false)
    handleSpy = vitest.spyOn(userActionHandler, 'handle')
    createTargetedUserActionSpy = vitest.spyOn(createTargetedUserActionModule, 'createTargetedUserAction')
  })

  function listHandledUserActions(): UserAction[] {
    return handleSpy.mock.calls.map((args) => args[0])
  }

  it('calls createTargetedUserAction with the "selectorOptions" option', async () => {
    const { element, domWindow } = createElementInJSDOM(
      `
            <div>
                <input id='text-5' type='search' />
            </div>`,
      'div',
    )
    const getAnonymizationSettings = () => undefined
    new KeyDownEventListener(userActionHandler, domWindow, {
      selectorsOptions: { queries: [QueryType.id], excludedQueries: [QueryType.tag], attributes: ['myAttribute'] },
      getAnonymizationSettings,
    }).init()
    const search = await waitFor(() => getByRole(element, 'searchbox'))

    fireEvent.keyDown(search)

    await waitFor(() => {
      expect(createTargetedUserActionSpy).toHaveBeenCalledWith(domWindow, new KeyboardEvent('keydown'), 'keydown', {
        selectorsOptions: { queries: [QueryType.id], excludedQueries: [QueryType.tag], attributes: ['myAttribute'] },
        anonymizationSettings: undefined,
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
            <div role='cell'/>
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
            <div role='cell'/>
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
})
