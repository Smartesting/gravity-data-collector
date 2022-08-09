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

    it('calls listener when click event been fired by a pointer', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
                <div>
                    <button class="size-lg"/>
                </div>`,
        'div',
      )

      new ClickEventListener(eventHandler, domWindow).init()
      const button = await waitFor(() => getByRole(element, 'button'))

      const event = new MouseEvent('click')
      // @ts-expect-error
      event.pointerType = 'mouse' // force the event to contain pointerType -> find a better way
      fireEvent(button, event)

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledOnce()
      })
    })

    it('does not calls listener when click event been not fired by a pointer', async () => {
      const { element, domWindow } = createElementInJSDOM(
        `
                <div>
                    <button class="size-lg"/>
                </div>`,
        'div',
      )

      new ClickEventListener(eventHandler, domWindow).init()
      const button = await waitFor(() => getByRole(element, 'button'))

      fireEvent.click(button)

      await waitFor(() => {}, { timeout: 500 }) // to ensure runSpy has not been called

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledTimes(0)
      })
    })
  })
})
