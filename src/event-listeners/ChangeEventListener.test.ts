import { beforeEach, describe, expect, it, SpyInstance, vitest } from 'vitest'
import UserActionHandler from '../user-action/UserActionHandler'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import ChangeEventListener from '../event-listeners/ChangeEventListener'
import { nop } from '../utils/nop'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import * as createTargetedUserActionModule from '../user-action/createTargetedUserAction'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'

describe('ChangeEventListener', () => {
  let sessionIdHandler: ISessionIdHandler
  let userActionHandler: UserActionHandler
  let handleSpy: SpyInstance
  let createTargetedUserActionSpy: SpyInstance

  beforeEach(() => {
    vitest.restoreAllMocks()
    sessionIdHandler = new MemorySessionIdHandler(() => 'aaa-111', 600)
    userActionHandler = new UserActionHandler(sessionIdHandler, 0, nop)
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

    new ChangeEventListener(userActionHandler, domWindow, { excludeRegex: /.*/ }).init()

    const search = await waitFor(() => getByRole(element, 'searchbox'))
    fireEvent.change(search)

    await waitFor(() => {
      expect(createTargetedUserActionSpy).toHaveBeenCalledWith(
        new Event('change'),
        'change',
        { excludeRegex: /.*/ },
      )
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

    new ChangeEventListener(userActionHandler, domWindow, { customSelector: 'data-testid' }).init()

    const search = await waitFor(() => getByRole(element, 'searchbox'))
    fireEvent.change(search)

    await waitFor(() => {
      expect(createTargetedUserActionSpy).toHaveBeenCalledWith(
        new Event('change'),
        'change', { customSelector: 'data-testid' })
    })
  })

  it('calls handler when change event been fired', async () => {
    const { element, domWindow } = createElementInJSDOM(
      `
        <div>
          <input type='checkbox' id='checkbox1' name='checkbox1'>
        </div>`,
      'div',
    )

    new ChangeEventListener(userActionHandler, domWindow).init()

    const checkBox = await waitFor(() => getByRole(element, 'checkbox'))

    fireEvent.change(checkBox)

    await waitFor(() => {
      expect(handleSpy).toHaveBeenCalledOnce()
    })
  })
})
