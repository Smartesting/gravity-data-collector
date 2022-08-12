import { beforeEach, describe, expect, it, vitest } from 'vitest'
import UserActionHandler from '../user-action/UserActionHandler'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import ChangeEventListener from '../event-listeners/ChangeEventListener'
import { nop } from '../utils/nop'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'

describe('ChangeEventListener', () => {
  describe('listener', () => {
    const userActionHandler = new UserActionHandler('aaa-111', 0, nop)
    const runSpy = vitest.spyOn(userActionHandler, 'handle')

    beforeEach(() => {
      vitest.restoreAllMocks()
    })

    it('calls listener when change event been fired', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
        <div>
          <input type="checkbox" id="checkbox1" name="checkbox1">
        </div>`,
        'div',
      )

      new ChangeEventListener(userActionHandler, domWindow).init()

      const checkBox = await waitFor(() => getByRole(element, 'checkbox'))

      fireEvent.change(checkBox)

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledOnce()
      })
    })
  })
})
