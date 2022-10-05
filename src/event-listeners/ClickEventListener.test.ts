import { beforeEach, describe, expect, it, vitest } from 'vitest'
import UserActionHandler from '../user-action/UserActionHandler'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import ClickEventListener from '../event-listeners/ClickEventListener'
import { nop } from '../utils/nop'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'

describe('ClickEventListener', () => {
  describe('listener', () => {
    const userActionHandler = new UserActionHandler('aaa-111', 0, nop)
    const runSpy = vitest.spyOn(userActionHandler, 'handle')

    beforeEach(() => {
      vitest.restoreAllMocks()
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
        expect(runSpy).toHaveBeenCalledOnce()
      })
    })
  })
})
