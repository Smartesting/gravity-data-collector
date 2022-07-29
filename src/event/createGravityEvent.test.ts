import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockClick, mockWindowDocument, mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
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

      it('text content', () => {
        const { element } = createElementInJSDOM('<li>I am a list item</li>', 'li')
        if (element == null) throw new Error('Element is null')

        const event = createGravityEvent(mockClick(element), EventType.Click)

        expect(event.target?.textContent).toBeUndefined()
      })

      it('html attributes', () => {
        const { element } = createElementInJSDOM('<input type="text" data-testid="userName" class="size-lg"/>', 'input')

        const event = createGravityEvent(mockClick(element), EventType.Click)

        expect((event.target?.attributes as Record<string, string>).type).toEqual('text')
        expect((event.target?.attributes as Record<string, string>)['data-testid']).toEqual('userName')
        expect((event.target?.attributes as Record<string, string>).class).toEqual('size-lg')
      })

      it('pointer coordinates data when the event is a click', () => {
        const { element } = createElementInJSDOM('<input type="text" data-testid="userName" class="size-lg"/>', 'input')

        const clickEvent = mockClick(element)
        const event = createGravityEvent(clickEvent, EventType.Click)

        expect(event.eventData?.clickOffsetX).toEqual(clickEvent.clientX)
        expect(event.eventData?.clickOffsetY).toEqual(clickEvent.clientY)

        const eltBounds = element?.getBoundingClientRect()
        expect(event.eventData?.elementOffsetX).toEqual(eltBounds?.left)
        expect(event.eventData?.elementOffsetY).toEqual(eltBounds?.top)
        expect(event.eventData?.elementRelOffsetX).toEqual(Math.trunc(clickEvent.clientX - (eltBounds?.left ?? 0)))
        expect(event.eventData?.elementRelOffsetY).toEqual(Math.trunc(clickEvent.clientY - (eltBounds?.top ?? 0)))
      })
    })
  })
})
