import { describe, expect, it } from 'vitest'
import MemoryMovementsHistory from './MemoryMovementsHistory'
import { createClickUserAction, createKeyUpUserAction } from '../test-utils/userActions'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import { UserActionType } from '../types'

describe('MemoryUserActionsHistory', () => {
  const { element, domWindow } = createElementInJSDOM('<div/>', 'div')
  const keyUpUserAction = createKeyUpUserAction(element, 'a', 'a', domWindow.document)

  describe('getLast', () => {
    it('returns undefined while there is no element in history', async () => {
      const history = new MemoryMovementsHistory()
      expect(history.getLast()).toBeUndefined()
    })

    it('returns the last user action added in the history', async () => {
      const history = new MemoryMovementsHistory()

      history.push(createClickUserAction(element, 0, 0, domWindow.document))
      history.push(keyUpUserAction)

      expect(history.getLast()).equals(keyUpUserAction)
    })
  })

  describe('push', () => {
    it('removes first user action from the history if the max size is reached', async () => {
      const history = new MemoryMovementsHistory(1)
      history.push(createClickUserAction(element, 0, 0, domWindow.document))

      expect(history.getUserActionsHistory().length).equals(1)
      expect(
        history.getUserActionsHistory().find((userAction) => userAction.type === UserActionType.Click),
      ).toBeDefined()

      history.push(createKeyUpUserAction(element, '0', '0', domWindow.document))
      expect(
        history.getUserActionsHistory().find((userAction) => userAction.type === UserActionType.Click),
      ).toBeUndefined()
    })

    it('never exceeds the max history size', async () => {
      const historySize = 5
      const history = new MemoryMovementsHistory(historySize)

      for (let i = 0; i < historySize * 2; i++) {
        history.push(createClickUserAction(element, 0, 0, domWindow.document))
        expect(history.getUserActionsHistory().length).lessThanOrEqual(historySize)
      }
    })
  })
})
