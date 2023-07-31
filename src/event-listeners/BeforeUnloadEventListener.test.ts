import { beforeEach, describe, expect, it, vitest } from 'vitest'
import { waitFor } from '@testing-library/dom'
import BeforeUnloadEventListener from '../event-listeners/BeforeUnloadEventListener'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import { NopUserActionHandler } from '../user-action/IUserActionHandler'

describe('BeforeUnloadEventListener', () => {
  describe('listener', () => {
    const userActionHandler = new NopUserActionHandler()
    const flushSpy = vitest.spyOn(userActionHandler, 'flush')

    beforeEach(() => {
      vitest.restoreAllMocks()
    })

    it('calls handler when beforeunload event been fired', async () => {
      const { domWindow } = createElementInJSDOM('<div/>', 'div')
      new BeforeUnloadEventListener(userActionHandler, domWindow).init()
      domWindow.dispatchEvent(new Event('beforeunload'))

      await waitFor(() => {
        expect(flushSpy).toHaveBeenCalledOnce()
      })
    })
  })
})
