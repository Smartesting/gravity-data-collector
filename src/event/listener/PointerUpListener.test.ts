import { beforeEach, describe, expect, it, vitest } from 'vitest'
import EventHandler from '../handler/EventHandler'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import PointerUpEventListener from './PointerUpEventListener'
import { nop } from '../../utils/nop'
import createElementInJSDOM from '../../test-utils/createElementInJSDOM'

describe('ClickEventListener', () => {
  describe('listener', () => {
    const eventHandler = new EventHandler('aaa-111', 0, nop)
    const runSpy = vitest.spyOn(eventHandler, 'run')

    beforeEach(() => {
      vitest.restoreAllMocks()
    })

    it('calls listener when click event been fired by mouse', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
                <div>
                    <button class="size-lg"/>
                </div>`,
        'div',
      )

      new PointerUpEventListener(eventHandler, domWindow).init()
      const button = await waitFor(() => getByRole(element, 'button'))

      fireEvent.pointerUp(button)

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledOnce()
      })
    })
  })
})
