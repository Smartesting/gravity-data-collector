import { beforeEach, describe, expect, it, vitest } from 'vitest'
import { JSDOM } from 'jsdom'
import EventHandler from '../handler/EventHandler'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import ChangeEventListener from './ChangeEventListener'
import { nop } from '../../utils/nop'

describe('ChangeEventListener', () => {
  describe('listener', () => {
    const eventHandler = new EventHandler('aaa-111', 0, nop)
    const runSpy = vitest.spyOn(eventHandler, 'run')

    beforeEach(() => {
      vitest.restoreAllMocks()
    })

    it('calls listener when change event been fired', async () => {
      const dom = new JSDOM(`
                <div>
                    <input type='checkbox' id='checkbox1' name='checkbox1'>
                </div>`)

      new ChangeEventListener(eventHandler, dom.window as unknown as Window).init()

      const container = dom.window.document.querySelector('div')!
      const checkBox = await waitFor(() => getByRole(container, 'checkbox'))

      fireEvent.change(checkBox)

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledOnce()
      })
    })

    it('does not call listener if target is not a checkbox', async () => {
      const dom = new JSDOM(`
                <div>
                    <input type='text' class='size-lg'/>
                </div>`)

      const listener = new ChangeEventListener(eventHandler, dom.window as unknown as Window)
      const listenerSpy = vitest.spyOn(listener, 'listener')

      listener.init()

      const container = dom.window.document.querySelector('div')!
      const input = await waitFor(() => getByRole(container, 'textbox'))

      fireEvent.change(input)

      await waitFor(() => {
        expect(listenerSpy).toHaveBeenCalledOnce()
        expect(runSpy).toHaveBeenCalledTimes(0)
      })
    })
  })
})
