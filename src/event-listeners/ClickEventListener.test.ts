import { beforeEach, describe, expect, it, MockInstance, vitest } from 'vitest'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import ClickEventListener from '../event-listeners/ClickEventListener'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import * as createTargetedUserActionModule from '../user-action/createTargetedUserAction'
import IUserActionHandler, { NopUserActionHandler } from '../user-action/IUserActionHandler'
import { QueryType } from '../types'

describe('ClickEventListener', () => {
  let userActionHandler: IUserActionHandler
  let handleSpy: MockInstance
  let createTargetedUserActionSpy: MockInstance

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

    new ClickEventListener(userActionHandler, domWindow, {
      selectorsOptions: { queries: [QueryType.id], excludedQueries: [QueryType.tag], attributes: ['myAttribute'] },
    }).init()

    const search = await waitFor(() => getByRole(element, 'searchbox'))
    fireEvent.click(search)

    await waitFor(() => {
      expect(createTargetedUserActionSpy).toHaveBeenCalledWith(domWindow, new MouseEvent('click'), 'click', {
        selectorsOptions: { queries: [QueryType.id], excludedQueries: [QueryType.tag], attributes: ['myAttribute'] },
        anonymizationSettings: undefined,
      })
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
