import { beforeEach, describe, expect, it, SpyInstance, vitest } from 'vitest'
import UserActionHandler from '../user-action/UserActionHandler'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import ClickEventListener from '../event-listeners/ClickEventListener'
import { nop } from '../utils/nop'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import * as createTargetedUserActionModule from '../user-action/createTargetedUserAction'

describe('ClickEventListener', () => {
  const sessionIdHandler = new MemorySessionIdHandler(() => 'aaa-111', 500)
  const userActionHandler = new UserActionHandler(sessionIdHandler, 0, nop)
  let handleSpy: SpyInstance
  let createTargetedUserActionSpy: SpyInstance

  beforeEach(() => {
    vitest.restoreAllMocks()
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

    new ClickEventListener(userActionHandler, domWindow, { excludeRegex: /.*/ }).init()

    const search = await waitFor(() => getByRole(element, 'searchbox'))

    fireEvent.click(search)

    await waitFor(() => {}, { timeout: 500 })

    await waitFor(() => {
      expect(createTargetedUserActionSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(), /.*/)
    })
  })

  it('calls handler when click event been fired', async () => {
    const { element, domWindow } = createElementInJSDOM(
      `
                <div>
                    <button class="size-lg"/>
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
