import sinon from 'sinon'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { JSDOM } from 'jsdom'
import IEventHandler from '../handler/IEventHandler'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import ChangeEventListener from './ChangeEventListener'

describe('ChangeEventListener', () => {
  describe('listener', () => {
    let eventHandler: IEventHandler
    let runSpy: sinon.SinonSpy

    beforeEach(() => {
      eventHandler = {
        run: () => {
        }
      }
      runSpy = sinon.spy(eventHandler, 'run')
    }
    )

    afterEach(() => {
      runSpy.restore()
    })

    it('calls listener when change event been fired', async () => {
      const dom = new JSDOM(`
                <div>
                    <input type="checkbox" id="checkbox1" name="checkbox1">
                </div>`)

      new ChangeEventListener(eventHandler, dom.window as unknown as Window).init()

      const container = dom.window.document.querySelector('div')
      const checkBox = await waitFor(() => getByRole(container as HTMLElement, 'checkbox'))

      fireEvent.change(checkBox)

      await waitFor(() => {
        expect(runSpy.calledOnce).toBeTruthy()
      })
    })

    it('does not call listener if target is not a checkbox', async () => {
      const dom = new JSDOM(`
                <div>
                    <input type="text" class="size-lg"/>
                </div>`)

      const listener = new ChangeEventListener(eventHandler, dom.window as unknown as Window)
      const listenerSpy = sinon.spy(listener, 'listener')

      listener.init()

      const container = dom.window.document.querySelector('div')
      const input = await waitFor(() => getByRole(container as HTMLElement, 'textbox'))

      fireEvent.change(input)

      await waitFor(() => {
        expect(listenerSpy.calledOnce).toBeTruthy()
        expect(runSpy.notCalled).toBeTruthy()
      })
    })
  })
})
