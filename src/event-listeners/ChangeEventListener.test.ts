import { beforeEach, describe, expect, it, SpyInstance, vitest } from 'vitest'
import MovementHandler from '../movement/MovementHandler'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import ChangeEventListener from '../event-listeners/ChangeEventListener'
import { nop } from '../utils/nop'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import * as createTargetedUserActionModule from '../movement/createTargetedUserAction'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'

describe('ChangeEventListener', () => {
  let sessionIdHandler: ISessionIdHandler
  let userActionHandler: MovementHandler
  let handleSpy: SpyInstance
  let createTargetedUserActionSpy: SpyInstance

  beforeEach(() => {
    vitest.restoreAllMocks()
    sessionIdHandler = new MemorySessionIdHandler(() => 'aaa-111', 600)
    userActionHandler = new MovementHandler(sessionIdHandler, 0, nop)
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
      expect(createTargetedUserActionSpy).toHaveBeenCalledWith(new Event('change'), 'change', /.*/, undefined)
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
      expect(createTargetedUserActionSpy).toHaveBeenCalledWith(new Event('change'), 'change', undefined, 'data-testid')
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
