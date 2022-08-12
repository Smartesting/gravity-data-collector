import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockWindowDocument, mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import viewport from '../utils/viewport'
import location from '../utils/location'
import { GravityDocument, UserActionType } from '../types'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import { createClickUserAction, createKeyDownUserAction, createKeyUpUserAction } from '../test-utils/userActions'

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

      const action = createClickUserAction(element)

      expect(action.type).toEqual(UserActionType.Click)
    })

    it('returns location data', () => {
      const { element } = createElementInJSDOM('<div>Click Me</div>', 'div')

      const action = createClickUserAction(element)

      expect(action?.location).toEqual(location())
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

      const action = createClickUserAction(element)

      expect(action?.document.title).toEqual(document.title)
    })

    it('returns viewport data', () => {
      const { element } = createElementInJSDOM('<div>Click Me</div>', 'div')

      const action = createClickUserAction(element)

      expect(action?.viewportData).toEqual(viewport())
    })

    it('returns recordedAt', () => {
      const now = new Date('2022-05-12').toISOString()
      vi.useFakeTimers()
      vi.setSystemTime(Date.parse('2022-05-12'))

      const { element } = createElementInJSDOM('<div>Click Me</div>', 'div')

      const action = createClickUserAction(element)

      expect(action?.recordedAt).toEqual(now)
    })

    describe('target data embeds...', () => {
      it('tag name', () => {
        const { element } = createElementInJSDOM('<div>Click Me</div>', 'div')

        const action = createClickUserAction(element)

        expect(action.target.element).toEqual('div')
      })

      it('type is recorded if element has the type attributes', () => {
        const { element } = createElementInJSDOM('<input type="text" data-testid="userName" class="size-lg"/>', 'input')

        const action = createClickUserAction(element)

        expect(action?.target.type).toEqual('text')
      })

      it('selector', () => {
        const { element } = createElementInJSDOM('<input type="text" data-testid="userName" class="size-lg"/>', 'input')

        const action = createClickUserAction(element)

        expect(action.target?.selector).toEqual('.size-lg')
      })

      it('value not recorded if input is a text box', () => {
        const { element } = createElementInJSDOM('<input type="text" data-testid="userName" class="size-lg"/>', 'input')

        const action = createClickUserAction(element)

        expect(action.target?.value).toBeUndefined()
      })

      it('"true" is recorded if input is a checked checkbox', () => {
        const { element } = createElementInJSDOM('<input type="checkbox" class="size-lg" checked/>', 'input')

        const action = createClickUserAction(element)

        expect(action.target?.value).equals('true')
      })

      it('"false" is recorded if input is a checked checkbox', () => {
        const { element } = createElementInJSDOM('<input type="checkbox" class="size-lg"/>', 'input')

        const action = createClickUserAction(element)

        expect(action.target?.value).equals('false')
      })
    })

    it('pointer coordinates data when the event is a click', () => {
      const { element } = createElementInJSDOM('<input type="text" data-testid="userName" class="size-lg"/>', 'input')

      const action = createClickUserAction(element, 12, 34)

      const eltBounds = element?.getBoundingClientRect()

      expect(action.userActionData).toEqual({
        clickOffsetX: 12,
        clickOffsetY: 34,
        elementOffsetX: eltBounds?.left,
        elementOffsetY: eltBounds?.top,
        elementRelOffsetX: Math.trunc(12 - (eltBounds?.left ?? 0)),
        elementRelOffsetY: Math.trunc(34 - (eltBounds?.top ?? 0)),
      })
    })

    it('key data when the event is a keyup', () => {
      const { element } = createElementInJSDOM('<div/>', 'div')
      const action = createKeyUpUserAction(element, 'Shift', 'ShiftLeft')
      expect(action.userActionData).toEqual({
        key: 'Shift',
        code: 'ShiftLeft',
      })
    })

    it('key data when the event is a keydown', () => {
      const { element } = createElementInJSDOM('<div/>', 'div')
      const action = createKeyDownUserAction(element, 'Shift', 'ShiftLeft')
      expect(action.userActionData).toEqual({
        key: 'Shift',
        code: 'ShiftLeft',
      })
    })
  })
})
