import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  mockClick,
  mockKeyDown,
  mockKeyUp,
  mockWindowDocument,
  mockWindowLocation,
  mockWindowScreen,
} from '../test-utils/mocks'
import { createGravityEvent } from './createGravityEvent'
import viewport from '../utils/viewport'
import location from '../utils/location'
import { EventType, GravityDocument } from '../types'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'

describe('event', () => {
  let document: GravityDocument

  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
    document = mockWindowDocument()
  })

  describe('createGravityEvent', () => {
    it('returns the specified "type"', () => {
      const { element } = createElementInJSDOM('<button>Click Me</button>', 'button')

      const event = createGravityEvent(mockClick(element), EventType.Click)

      expect(event.type).toEqual(EventType.Click)
    })

    it('returns location data', () => {
      const { element } = createElementInJSDOM('<div>Click Me</div>', 'div')

      const event = createGravityEvent(mockClick(element), EventType.Click)

      expect(event.location).toEqual(location())
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

      const event = createGravityEvent(mockClick(element), EventType.Click)

      expect(event.document.title).toEqual(document.title)
    })

    it('returns viewport data', () => {
      const { element } = createElementInJSDOM('<div>Click Me</div>', 'div')

      const event = createGravityEvent(mockClick(element), EventType.Click)

      expect(event.viewportData).toEqual(viewport())
    })

    it('returns recordedAt', () => {
      const now = new Date('2022-05-12').toISOString()
      vi.useFakeTimers()
      vi.setSystemTime(Date.parse('2022-05-12'))

      const { element } = createElementInJSDOM('<div>Click Me</div>', 'div')

      const event = createGravityEvent(mockClick(element), EventType.Click)

      expect(event.recordedAt).toEqual(now)
    })

    describe('target data embeds...', () => {
      it('tag name', () => {
        const { element } = createElementInJSDOM('<div>Click Me</div>', 'div')

        const event = createGravityEvent(mockClick(element), EventType.Click)

        expect(event.target?.element).toEqual('div')
      })

      it('type is recorded if element has the type attributes', () => {
        const { element } = createElementInJSDOM('<input type="text" data-testid="userName" class="size-lg"/>', 'input')

        const event = createGravityEvent(mockClick(element), EventType.Click)

        expect(event.target?.attributes?.type).toEqual('text')
      })

      it('selector', () => {
        const { element } = createElementInJSDOM('<input type="text" data-testid="userName" class="size-lg"/>', 'input')

        const event = createGravityEvent(mockClick(element), EventType.Click)

        expect(event.target?.selector).toEqual('.size-lg')
      })

      it('value not recorded if input is a text box', () => {
        const { element } = createElementInJSDOM('<input type="text" data-testid="userName" class="size-lg"/>', 'input')

        const event = createGravityEvent(mockClick(element), EventType.Click)

        expect(event.target?.value).toBeUndefined()
      })

      it('"true" is recorded if input is a checked checkbox', () => {
        const { element } = createElementInJSDOM('<input type="checkbox" class="size-lg" checked/>', 'input')

        const event = createGravityEvent(mockClick(element), EventType.Click)

        expect(event.target?.value).equals('true')
      })

      it('"false" is recorded if input is a checked checkbox', () => {
        const { element } = createElementInJSDOM('<input type="checkbox" class="size-lg"/>', 'input')

        const event = createGravityEvent(mockClick(element), EventType.Click)

        expect(event.target?.value).equals('false')
      })
    })

    it('pointer coordinates data when the event is a click', () => {
      const { element } = createElementInJSDOM('<input type="text" data-testid="userName" class="size-lg"/>', 'input')

      const clickEvent = mockClick(element)
      const event = createGravityEvent(clickEvent, EventType.Click)

      const eltBounds = element?.getBoundingClientRect()

      expect(event.eventData).toEqual({
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
      const event = createGravityEvent(keyEvent, EventType.KeyUp)

      expect(event.eventData).toEqual({
        key: '',
        code: '',
      })
    })

    it('key data when the event is a keydown', () => {
      const keyEvent = mockKeyDown()
      const event = createGravityEvent(keyEvent, EventType.KeyDown)

      expect(event.eventData).toEqual({
        key: '',
        code: '',
      })
    })
  })
})
