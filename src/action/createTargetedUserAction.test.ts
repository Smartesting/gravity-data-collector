import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  mockClick,
  mockKeyDown,
  mockKeyUp,
  mockWindowDocument,
  mockWindowLocation,
  mockWindowScreen,
} from '../test-utils/mocks'
import { createTargetedUserAction } from './createTargetedUserAction'
import viewport from '../utils/viewport'
import location from '../utils/location'
import { GravityDocument, UserActionType } from '../types'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'

describe('action', () => {
  let document: GravityDocument

  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
    document = mockWindowDocument()
  })

  describe('createTargetedUserAction', () => {
    it('returns the specified "type"', () => {
      const { element } = createElementInJSDOM('<button>Click Me</button>', 'button')

      const action = createTargetedUserAction(mockClick(element), UserActionType.Click)

      expect(action.type).toEqual(UserActionType.Click)
    })

    it('returns location data', () => {
      const { element } = createElementInJSDOM('<div>Click Me</div>', 'div')

      const action = createTargetedUserAction(mockClick(element), UserActionType.Click)

      expect(action.location).toEqual(location())
    })

    it('returns document data', () => {
      const { element } = createElementInJSDOM(
        '<html lang="en">' +
          ' <head>' +
          '   <title></title>' +
          ' </head>' +
          ' <body>' +
          '   <div>Click Me</div>' +
          ' </body>' +
          '</html>',
        'html',
      )

      const action = createTargetedUserAction(mockClick(element), UserActionType.Click)

      expect(action.document.title).toEqual(document.title)
    })

    it('returns viewport data', () => {
      const { element } = createElementInJSDOM('<div>Click Me</div>', 'div')

      const action = createTargetedUserAction(mockClick(element), UserActionType.Click)

      expect(action.viewportData).toEqual(viewport())
    })

    it('returns recordedAt', () => {
      const now = new Date('2022-05-12').toISOString()
      vi.useFakeTimers()
      vi.setSystemTime(Date.parse('2022-05-12'))

      const { element } = createElementInJSDOM('<div>Click Me</div>', 'div')

      const action = createTargetedUserAction(mockClick(element), UserActionType.Click)

      expect(action.recordedAt).toEqual(now)
    })

    describe('target data embeds...', () => {
      it('tag name', () => {
        const { element } = createElementInJSDOM('<div>Click Me</div>', 'div')

        const action = createTargetedUserAction(mockClick(element), UserActionType.Click)

        expect(action.target?.element).toEqual('div')
      })

      it('type is recorded if element has the type attributes', () => {
        const { element } = createElementInJSDOM('<input type="text" data-testid="userName" class="size-lg"/>', 'input')

        const action = createTargetedUserAction(mockClick(element), UserActionType.Click)

        expect(action.target?.type).toEqual('text')
      })

      it('selector', () => {
        const { element } = createElementInJSDOM('<input type="text" data-testid="userName" class="size-lg"/>', 'input')

        const action = createTargetedUserAction(mockClick(element), UserActionType.Click)

        expect(action.target?.selector).toEqual('.size-lg')
      })

      it('value not recorded if input is a text box', () => {
        const { element } = createElementInJSDOM('<input type="text" data-testid="userName" class="size-lg"/>', 'input')

        const action = createTargetedUserAction(mockClick(element), UserActionType.Click)

        expect(action.target?.value).toBeUndefined()
      })

      it('"true" is recorded if input is a checked checkbox', () => {
        const { element } = createElementInJSDOM('<input type="checkbox" class="size-lg" checked/>', 'input')

        const action = createTargetedUserAction(mockClick(element), UserActionType.Click)

        expect(action.target?.value).equals('true')
      })

      it('"false" is recorded if input is a checked checkbox', () => {
        const { element } = createElementInJSDOM('<input type="checkbox" class="size-lg"/>', 'input')

        const action = createTargetedUserAction(mockClick(element), UserActionType.Click)

        expect(action.target?.value).equals('false')
      })
    })

    it('pointer coordinates data when the event is a click', () => {
      const { element } = createElementInJSDOM('<input type="text" data-testid="userName" class="size-lg"/>', 'input')

      const clickEvent = mockClick(element)
      const action = createTargetedUserAction(clickEvent, UserActionType.Click)

      const eltBounds = element?.getBoundingClientRect()

      expect(action.userActionData).toEqual({
        clickOffsetX: clickEvent.clientX,
        clickOffsetY: clickEvent.clientY,
        elementOffsetX: eltBounds?.left,
        elementOffsetY: eltBounds?.top,
        elementRelOffsetX: Math.trunc(clickEvent.clientX - (eltBounds?.left ?? 0)),
        elementRelOffsetY: Math.trunc(clickEvent.clientY - (eltBounds?.top ?? 0)),
      })
    })

    it('key data when the event is a keyup', () => {
      const keyEvent = mockKeyUp()
      const action = createTargetedUserAction(keyEvent, UserActionType.KeyUp)

      expect(action.userActionData).toEqual({
        key: '',
        code: '',
      })
    })

    it('key data when the event is a keydown', () => {
      const keyEvent = mockKeyDown()
      const action = createTargetedUserAction(keyEvent, UserActionType.KeyDown)

      expect(action.userActionData).toEqual({
        key: '',
        code: '',
      })
    })
  })
})
