import { beforeEach, describe, expect, it, vitest } from 'vitest'
import EventHandler from '../handler/EventHandler'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import ClickEventListener from './ClickEventListener'
import { nop } from '../../utils/nop'
import createElementInJSDOM from '../../test-utils/createElementInJSDOM'

describe('ClickEventListener', () => {
  describe('listener', () => {
    const eventHandler = new EventHandler('aaa-111', 0, nop)
    const runSpy = vitest.spyOn(eventHandler, 'run')

    beforeEach(() => {
      vitest.restoreAllMocks()
    })

    it('calls listener when click event been fired', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
                <div>
                    <button class='size-lg'/>
                </div>`,
        'div',
      )

      new ClickEventListener(eventHandler, domWindow).init()
      const button = await waitFor(() => getByRole(element, 'button'))

      fireEvent.click(button)

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledOnce()
      })
    })
  })
})
