import { beforeEach, describe, expect, it, SpyInstance, vitest } from 'vitest'
import MovementHandler from '../movement/MovementHandler'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import ClickEventListener from '../event-listeners/ClickEventListener'
import { nop } from '../utils/nop'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import * as createTargetedUserActionModule from '../movement/createTargetedUserAction'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'

describe('ClickEventListener', () => {
  let sessionIdHandler: ISessionIdHandler
  let userActionHandler: MovementHandler
  let handleSpy: SpyInstance
  let createTargetedUserActionSpy: SpyInstance

  beforeEach(() => {
    vitest.restoreAllMocks()
    sessionIdHandler = new MemorySessionIdHandler(() => 'aaa-111', 700)
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

    new ClickEventListener(userActionHandler, domWindow, { excludeRegex: /.*/ }).init()

    const search = await waitFor(() => getByRole(element, 'searchbox'))
    fireEvent.click(search)

    await waitFor(() => {
      expect(createTargetedUserActionSpy).toHaveBeenCalledWith(new MouseEvent('click'), 'click', /.*/, undefined)
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

    new ClickEventListener(userActionHandler, domWindow, { customSelector: 'data-testid' }).init()

    const search = await waitFor(() => getByRole(element, 'searchbox'))
    fireEvent.click(search)

    await waitFor(() => {
      expect(createTargetedUserActionSpy).toHaveBeenCalledWith(
        new MouseEvent('click'),
        'click',
        undefined,
        'data-testid',
      )
    })
  })

  it('calls handler when click event been fired', async () => {
    const { element, domWindow } = createElementInJSDOM(
      `
                <div>
                    <button class='size-lg'/>
                </div>`,
      'div',
    )

    new ClickEventListener(userActionHandler, domWindow).init()
    const button = await waitFor(() => getByRole(element, 'button'))

    const event = new MouseEvent('click')

    fireEvent(button, event)

    await waitFor(() => {
      expect(handleSpy).toHaveBeenCalledOnce()
    })
  })
})
