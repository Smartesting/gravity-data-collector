import { beforeEach, describe, expect, it, vitest } from 'vitest'
import EventHandler from '../handler/EventHandler'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import ChangeEventListener from './ChangeEventListener'
import { nop } from '../../utils/nop'
import createElementInJSDOM from '../../test-utils/createElementInJSDOM'

describe('ChangeEventListener', () => {
  describe('listener', () => {
    const eventHandler = new EventHandler('aaa-111', 0, nop)
    const runSpy = vitest.spyOn(eventHandler, 'run')

    beforeEach(() => {
      vitest.restoreAllMocks()
    })

    it('calls listener when change event been fired', async () => {
      const { element, domWindow } = createElementInJSDOM(`
        <div>
          <input type='checkbox' id='checkbox1' name='checkbox1'>
        </div>`,
        'div')

      new ChangeEventListener(eventHandler, domWindow).init()

      const checkBox = await waitFor(() => getByRole(element, 'checkbox'))

      fireEvent.change(checkBox)

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledOnce()
      })
    })

    it('does not call listener if target is not a checkbox', async () => {
      const { element, domWindow } = createElementInJSDOM(`
        <div>
            <input type='text' class='size-lg'/>
        </div>`,
        'div')

      const listener = new ChangeEventListener(eventHandler, domWindow)
      const listenerSpy = vitest.spyOn(listener, 'listener')

      listener.init()

      const input = await waitFor(() => getByRole(element, 'textbox'))

      fireEvent.change(input)

      await waitFor(() => {
        expect(listenerSpy).toHaveBeenCalledOnce()
        expect(runSpy).toHaveBeenCalledTimes(0)
      })
    })
  })
})
