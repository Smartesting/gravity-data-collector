import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockClick, mockWindowDocument, mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import viewport from '../utils/viewport'
import location from '../utils/location'
import { GravityDocument, UserActionType } from '../types'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import { createClickUserAction, createKeyDownUserAction, createKeyUpUserAction } from '../test-utils/userActions'
import { createTargetedUserAction } from './createTargetedUserAction'
import { JSDOM } from 'jsdom'

describe('createTargetedUserAction', () => {
  let document: GravityDocument
  let jsDomInstance: JSDOM

  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
    document = mockWindowDocument()
    jsDomInstance = new JSDOM()
    global.HTMLElement = jsDomInstance.window.HTMLElement
  })

  it('returns the specified "type"', () => {
    const { element, domWindow } = createElementInJSDOM('<button>Click Me</button>', 'button', jsDomInstance)

    const action = createClickUserAction(element, 0, 0, domWindow.document)

    expect(action.type).toEqual(UserActionType.Click)
  })

  it('returns location data', () => {
    const { element, domWindow } = createElementInJSDOM('<div>Click Me</div>', 'div', jsDomInstance)

    const action = createClickUserAction(element, 0, 0, domWindow.document)

    expect(action?.location).toEqual(location())
  })

  it('returns document data', () => {
    const { element, domWindow } = createElementInJSDOM(
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

    const action = createClickUserAction(element, 0, 0, domWindow.document)

    expect(action?.document.title).toEqual(document.title)
  })

  it('returns viewport data', () => {
    const { element, domWindow } = createElementInJSDOM('<div>Click Me</div>', 'div', jsDomInstance)

    const action = createClickUserAction(element, 0, 0, domWindow.document)

    expect(action?.viewportData).toEqual(viewport())
  })

  it('returns recordedAt', () => {
    const now = new Date('2022-05-12').toISOString()
    vi.useFakeTimers()
    vi.setSystemTime(Date.parse('2022-05-12'))

    const { element, domWindow } = createElementInJSDOM('<div>Click Me</div>', 'div', jsDomInstance)

    const action = createClickUserAction(element, 0, 0, domWindow.document)

    expect(action?.recordedAt).toEqual(now)
  })

  describe('target data embeds...', () => {
    it('tag name', () => {
      const { element, domWindow } = createElementInJSDOM('<div>Click Me</div>', 'div', jsDomInstance)

      const action = createClickUserAction(element, 0, 0, domWindow.document)

      expect(action.target.element).toEqual('div')
    })

    it('type is recorded if element has the type attributes', () => {
      const { element, domWindow } = createElementInJSDOM(
        '<input type="text" data-testid="userName" class="size-lg"/>',
        'input',
      )

      const action = createClickUserAction(element, 0, 0, domWindow.document)

      expect(action?.target.type).toEqual('text')
    })

    it('returns ID selector if ID is available', () => {
      const { element, domWindow } = createElementInJSDOM(
        '<input type="text" id="id-input-8" data-testid="userName" class="size-lg"/>',
        'input',
        jsDomInstance,
      )

      const action = createClickUserAction(element, 0, 0, domWindow.document)

      expect(action.target?.selector).toEqual('#id-input-8')
    })

    it('returns class selector if ID is excluded by regex', () => {
      const { element, domWindow } = createElementInJSDOM(
        '<input type="text" id="id-input-8" data-testid="userName" class="size-lg"/>',
        'input',
        jsDomInstance,
      )

      const action = createTargetedUserAction(
        mockClick(element, 0, 0),
        UserActionType.Click,
        /^#id-input-.*$/,
        undefined,
        domWindow.document,
      )

      expect(action?.target?.selector).toEqual('.size-lg')
    })

    it('returns custom selector if it is defined', () => {
      const { element, domWindow } = createElementInJSDOM(
        '<input type="text" id="id-input-8" data-testid="userName" class="size-lg"/>',
        'input',
        jsDomInstance,
      )

      const action = createTargetedUserAction(
        mockClick(element, 0, 0),
        UserActionType.Click,
        null,
        'data-testid',
        domWindow.document,
      )

      expect(action?.target?.selector).toEqual('[data-testid=userName]')
    })

    it('falls back to classic matching if the custom selector is not available', () => {
      const { element, domWindow } = createElementInJSDOM(
        '<input type="text" class="size-lg"/>',
        'input',
        jsDomInstance,
      )

      const action = createTargetedUserAction(
        mockClick(element, 0, 0),
        UserActionType.Click,
        null,
        'data-testid',
        domWindow.document,
      )

      expect(action?.target?.selector).toEqual('.size-lg')
    })

    it('returns class selector if ID is unavailable', () => {
      const { element, domWindow } = createElementInJSDOM(
        '<input type="text" data-testid="userName" class="size-lg"/>',
        'input',
        jsDomInstance,
      )

      const action = createClickUserAction(element, 0, 0, domWindow.document)

      expect(action.target?.selector).toEqual('.size-lg')
    })

    it.only('returns tag selector if ID and class are unavailable', () => {
      const { element, domWindow } = createElementInJSDOM(
        '<input type="text" data-testid="userName"/>',
        'input',
        jsDomInstance,
      )

      const action = createClickUserAction(element, 0, 0, domWindow.document)

      expect(action.target?.selector).toEqual('input')
    })

    it('value not recorded if input is a text box', () => {
      const { element, domWindow } = createElementInJSDOM(
        '<input type="text" data-testid="userName" class="size-lg"/>',
        'input',
        jsDomInstance,
      )

      const action = createClickUserAction(element, 0, 0, domWindow.document)

      expect(action.target?.value).toBeUndefined()
    })

    it('"true" is recorded if input is a checked checkbox', () => {
      const { element, domWindow } = createElementInJSDOM(
        '<input type="checkbox" class="size-lg" checked/>',
        'input',
        jsDomInstance,
      )

      const action = createClickUserAction(element, 0, 0, domWindow.document)

      expect(action.target?.value).equals('true')
    })

    it('"false" is recorded if input is a checked checkbox', () => {
      const { element, domWindow } = createElementInJSDOM(
        '<input type="checkbox" class="size-lg"/>',
        'input',
        jsDomInstance,
      )

      const action = createClickUserAction(element, 0, 0, domWindow.document)

      expect(action.target?.value).equals('false')
    })
  })

  it('pointer coordinates data when the event is a click', () => {
    const { element, domWindow } = createElementInJSDOM(
      '<input type="text" data-testid="userName" class="size-lg"/>',
      'input',
      jsDomInstance,
    )

    const action = createClickUserAction(element, 12, 34, domWindow.document)

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
    const { element, domWindow } = createElementInJSDOM('<div/>', 'div', jsDomInstance)
    const action = createKeyUpUserAction(element, 'Shift', 'ShiftLeft', domWindow.document)
    expect(action.userActionData).toEqual({
      key: 'Shift',
      code: 'ShiftLeft',
    })
  })

  it('key data when the event is a keydown', () => {
    const { element, domWindow } = createElementInJSDOM('<div/>', 'div', jsDomInstance)
    const action = createKeyDownUserAction(element, 'Shift', 'ShiftLeft', domWindow.document)
    expect(action.userActionData).toEqual({
      key: 'Shift',
      code: 'ShiftLeft',
    })
  })
})
