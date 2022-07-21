import { beforeEach, describe, expect, it, vitest } from 'vitest'
import { JSDOM } from 'jsdom'
import EventHandler from '../handler/EventHandler'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import ClickEventListener from './ClickEventListener'
import { nop } from '../../utils/nop'

describe('ClickEventListener', () => {
  describe('listener', () => {
    const eventHandler = new EventHandler('aaa-111', 0, nop)
    const runSpy = vitest.spyOn(eventHandler, 'run')

    beforeEach(() => {
      vitest.restoreAllMocks()
    })

    it('calls listener when click event been fired', async () => {
      const dom = new JSDOM(`
                <div>
                    <button class='size-lg'/>
                </div>`)

      new ClickEventListener(eventHandler, dom.window as unknown as Window).init()

      const container = dom.window.document.querySelector('div')
      const button = await waitFor(() => getByRole(container as unknown as HTMLElement, 'button'))

      fireEvent.click(button)

      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledOnce()
      })
    })
  })
})
