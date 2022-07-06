import sinon from 'sinon'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { JSDOM } from 'jsdom'
import IEventHandler from '../handler/IEventHandler'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import ClickEventListener from './ClickEventListener'

describe('ClickEventListener', () => {
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

    it('calls listener when click event been fired', async () => {
      const dom = new JSDOM(`
                <div>
                    <button class="size-lg"/>
                </div>`)

      new ClickEventListener(eventHandler, dom.window as unknown as Window).init()

      const container = dom.window.document.querySelector('div')
      const button = await waitFor(() => getByRole(container as HTMLElement, 'button'))

      fireEvent.click(button)

      await waitFor(() => {
        expect(runSpy.calledOnce).toBeTruthy()
      })
    })
  })
})
