import { beforeEach, describe, expect, it, SpyInstance, vitest } from 'vitest'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import * as createTargetedUserActionModule from '../user-action/createTargetedUserAction'
import IUserActionHandler, { NopUserActionHandler } from '../user-action/IUserActionHandler'
import RepeatedEventListener from './RepeatedEventListener'
import { UserActionType } from '../types'

class FakeListener extends RepeatedEventListener {
  userActionType = UserActionType.Click
}

describe('RepeatedEventListener', () => {
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

    it('calls createTargetedUserAction', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
            <div>
                <input id='text-5' type='search' />
            </div>`,
        'div',
      )

      new FakeListener(userActionHandler, domWindow).init()

      const search = await waitFor(() => getByRole(element, 'searchbox'))
      fireEvent.click(search)

      await waitFor(() => {
        expect(handleSpy).toHaveBeenCalledOnce()
      }).then(() => {
        expect(createTargetedUserActionSpy).toHaveBeenCalledWith(domWindow, new MouseEvent('click'), 'click', {
          anonymizationSettings: undefined,
        })
      })
    })

    it('does not repeat the same event multiple times', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
            <div>
                <input id='text-5' type='search' />
            </div>`,
        'div',
      )

      new FakeListener(userActionHandler, domWindow).init()

      const search = await waitFor(() => getByRole(element, 'searchbox'))
      fireEvent.click(search)
      fireEvent.click(search)
      fireEvent.click(search)
      fireEvent.click(search)

      await waitFor(() => {
        expect(handleSpy).toHaveBeenCalledOnce()
      }).then(() => {
        expect(createTargetedUserActionSpy).toHaveBeenCalledWith(domWindow, new MouseEvent('click'), 'click', {
          anonymizationSettings: undefined,
        })
      })
    })

    it('repeats the event if another one was triggered with another target', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
            <div>
                <input id='text-5' type='search' />
                <button />
            </div>`,
        'div',
      )

      new FakeListener(userActionHandler, domWindow).init()

      const search = await waitFor(() => getByRole(element, 'searchbox'))
      const button = await waitFor(() => getByRole(element, 'button'))
      fireEvent.click(search)
      fireEvent.click(search)
      fireEvent.click(button)
      fireEvent.click(search)
      fireEvent.click(search)

      await waitFor(() => {
        expect(handleSpy).toHaveBeenCalledTimes(3)
      }).then(() => {
        expect(createTargetedUserActionSpy).toHaveBeenCalledWith(domWindow, new MouseEvent('click'), 'click', {
          anonymizationSettings: undefined,
        })
      })
    })
  })
})
