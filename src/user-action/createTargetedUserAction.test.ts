import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockClick, mockWindowDocument, mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import viewport from '../utils/viewport'
import location from '../utils/location'
import { GravityDocument, QueryType, UserActionType } from '../types'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import {
  createClickUserAction,
  createHashChangeUserAction,
  createKeyDownUserAction,
  createKeyUpUserAction,
} from '../test-utils/userActions'
import { createTargetedUserAction } from './createTargetedUserAction'

describe('createTargetedUserAction', () => {
  let document: GravityDocument

  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
    document = mockWindowDocument()
  })

  it('returns the specified "type"', () => {
    const { element, domWindow } = createElementInJSDOM('<button>Click Me</button>', 'button')

    const action = createClickUserAction(element, 0, 0, domWindow.document)

    expect(action.type).toEqual(UserActionType.Click)
  })

  it('returns location data', () => {
    const { element, domWindow } = createElementInJSDOM('<div>Click Me</div>', 'div')

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
    const { element, domWindow } = createElementInJSDOM('<div>Click Me</div>', 'div')

    const action = createClickUserAction(element, 0, 0, domWindow.document)

    expect(action?.viewportData).toEqual(viewport())
  })

  it('returns recordedAt', () => {
    const now = new Date('2022-05-12').toISOString()
    vi.useFakeTimers()
    vi.setSystemTime(Date.parse('2022-05-12'))

    const { element, domWindow } = createElementInJSDOM('<div>Click Me</div>', 'div')

    const action = createClickUserAction(element, 0, 0, domWindow.document)

    expect(action?.recordedAt).toEqual(now)
  })

  describe('target data embeds...', () => {
    it('tag name', () => {
      const { element, domWindow } = createElementInJSDOM('<div>Click Me</div>', 'div')

      const action = createClickUserAction(element, 0, 0, domWindow.document)

      expect(action.target.element).toEqual('div')
    })

    it('handles Window as a target too', () => {
      const { domWindow } = createElementInJSDOM('<div>Click Me</div>', 'div')
      const action = createHashChangeUserAction(domWindow)

      expect(action.target.element).toEqual('window')
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
      )

      const action = createClickUserAction(element, 0, 0, domWindow.document)

      expect(action.target?.selector).toEqual('#id-input-8')
    })

    it('returns class selector if ID is excluded by regex', () => {
      const { element, domWindow } = createElementInJSDOM(
        '<input type="text" id="id-input-8" data-testid="userName" class="size-lg"/>',
        'input',
      )

      const action = createTargetedUserAction(mockClick(element, 0, 0), UserActionType.Click, {
        excludeRegex: /^#id-input-.*$/,
        document: domWindow.document,
      })

      expect(action?.target?.selector).toEqual('.size-lg')
    })

    it('returns custom selector if it is defined', () => {
      const { element, domWindow } = createElementInJSDOM(
        '<input type="text" id="id-input-8" data-testid="userName" class="size-lg"/>',
        'input',
      )

      const action = createTargetedUserAction(mockClick(element, 0, 0), UserActionType.Click, {
        customSelector: 'data-testid',
        document: domWindow.document,
      })

      expect(action?.target?.selector).toEqual('[data-testid=userName]')
    })

    it('falls back to classic matching if the custom selector is not available', () => {
      const { element, domWindow } = createElementInJSDOM('<input type="text" class="size-lg"/>', 'input')

      const action = createTargetedUserAction(mockClick(element, 0, 0), UserActionType.Click, {
        customSelector: 'data-testid',
        document: domWindow.document,
      })

      expect(action?.target?.selector).toEqual('.size-lg')
    })

    it('returns class selector if ID is unavailable', () => {
      const { element, domWindow } = createElementInJSDOM(
        '<input type="text" data-testid="userName" class="size-lg"/>',
        'input',
      )

      const action = createClickUserAction(element, 0, 0, domWindow.document)

      expect(action.target?.selector).toEqual('.size-lg')
    })

    it('returns tag selector if ID and class are unavailable', () => {
      const { element, domWindow } = createElementInJSDOM('<input type="text" data-testid="userName"/>', 'input')

      const action = createClickUserAction(element, 0, 0, domWindow.document)

      expect(action.target?.selector).toEqual('input')
    })

    it('computes selectors', () => {
      const { element, domWindow } = createElementInJSDOM(
        '<input type="text" class="inline-form__input" data-testid="userName"/>',
        'input',
      )
      const action = createTargetedUserAction(mockClick(element, 0, 0), UserActionType.Click, {
        document: domWindow.document,
      })
      expect(action?.target.selectors).toEqual({
        attributes: { 'data-testid': 'userName' },
        query: {
          class: '.inline-form__input',
          id: '* > * > *',
          nthChild: ':nth-child(2) > :nth-child(1)',
          tag: 'input',
        },
        xpath: '/html/body/input',
      })
    })

    it('computes selectors based on user configuration', () => {
      const { element, domWindow } = createElementInJSDOM(
        '<input type="text" class="inline-form__input" data-testid="userName"/>',
        'input',
      )
      const action = createTargetedUserAction(mockClick(element, 0, 0), UserActionType.Click, {
        document: domWindow.document,
        selectorsOptions: {
          excludedQueries: [QueryType.id],
          attributes: ['data-testid'],
        },
      })
      expect(action?.target.selectors).toEqual({
        attributes: {
          'data-testid': 'userName',
        },
        query: {
          class: '.inline-form__input',
          nthChild: ':nth-child(2) > :nth-child(1)',
          tag: 'input',
        },
        xpath: '/html/body/input',
      })
    })

    it('value not recorded if input is a text box', () => {
      const { element, domWindow } = createElementInJSDOM(
        '<input type="text" data-testid="userName" class="size-lg"/>',
        'input',
      )

      const action = createClickUserAction(element, 0, 0, domWindow.document)

      expect(action.target?.value).toBeUndefined()
    })

    it('"true" is recorded if input is a checked checkbox', () => {
      const { element, domWindow } = createElementInJSDOM('<input type="checkbox" class="size-lg" checked/>', 'input')

      const action = createClickUserAction(element, 0, 0, domWindow.document)

      expect(action.target?.value).equals('true')
    })

    it('"false" is recorded if input is a checked checkbox', () => {
      const { element, domWindow } = createElementInJSDOM('<input type="checkbox" class="size-lg"/>', 'input')

      const action = createClickUserAction(element, 0, 0, domWindow.document)

      expect(action.target?.value).equals('false')
    })
  })

  it('pointer coordinates data when the event is a mouse event', () => {
    const { element, domWindow } = createElementInJSDOM(
      '<input type="text" data-testid="userName" class="size-lg"/>',
      'input',
    )

    const action = createClickUserAction(element, 12, 34, domWindow.document)

    const eltBounds = element?.getBoundingClientRect()

    expect(action.userActionData).toEqual({
      clientX: 12,
      clientY: 34,
      elementRelOffsetX: Math.trunc(12 - (eltBounds?.left ?? 0)),
      elementRelOffsetY: Math.trunc(34 - (eltBounds?.top ?? 0)),
      elementHeight: eltBounds?.height,
      elementWidth: eltBounds?.width,
      elementOffsetX: eltBounds?.left,
      elementOffsetY: eltBounds?.top,
      scrollableAncestors: [],
    })
  })

  it('key data when the event is a keyup', () => {
    const { element, domWindow } = createElementInJSDOM('<div/>', 'div')
    const action = createKeyUpUserAction(element, 'Shift', 'ShiftLeft', domWindow.document)

    const eltBounds = element?.getBoundingClientRect()

    expect(action.userActionData).toEqual({
      key: 'Shift',
      code: 'ShiftLeft',
      elementHeight: eltBounds?.height,
      elementWidth: eltBounds?.width,
      elementOffsetX: eltBounds?.left,
      elementOffsetY: eltBounds?.top,
      scrollableAncestors: [],
    })
  })

  it('key data when the event is a keydown', () => {
    const { element, domWindow } = createElementInJSDOM('<div/>', 'div')
    const action = createKeyDownUserAction(element, 'Shift', 'ShiftLeft', domWindow.document)

    const eltBounds = element?.getBoundingClientRect()
    expect(action.userActionData).toEqual({
      key: 'Shift',
      code: 'ShiftLeft',
      elementHeight: eltBounds?.height,
      elementWidth: eltBounds?.width,
      elementOffsetX: eltBounds?.left,
      elementOffsetY: eltBounds?.top,
      scrollableAncestors: [],
    })
  })
})
