import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockClick, mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import viewport from '../utils/viewport'
import gravityLocation from '../utils/gravityLocation'
import { QueryType, UserActionType } from '../types'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import {
  createClickUserAction,
  createHashChangeUserAction,
  createKeyDownUserAction,
  createKeyUpUserAction,
} from '../test-utils/userActions'
import { createTargetedUserAction } from './createTargetedUserAction'

describe('createTargetedUserAction', () => {
  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
  })

  it('returns the specified "type"', () => {
    const { element, domWindow } = createElementInJSDOM('<button>Click Me</button>', 'button')

    const action = createClickUserAction(element, 0, 0, domWindow)

    expect(action?.type).toEqual(UserActionType.Click)
  })

  it('returns location data', () => {
    const { element, domWindow } = createElementInJSDOM('<div>Click Me</div>', 'div')

    const action = createClickUserAction(element, 0, 0, domWindow)

    expect(action?.location).toEqual(gravityLocation(domWindow.location))
  })

  it('returns document data', () => {
    const documentTitle = 'Hello world!'
    const { element, domWindow } = createElementInJSDOM(
      '<html lang="en">' +
        ' <head>' +
        '   <title>' +
        documentTitle +
        '</title>' +
        ' </head>' +
        ' <body>' +
        '   <div>Click Me</div>' +
        ' </body>' +
        '</html>',
      'html',
    )

    const action = createClickUserAction(element, 0, 0, domWindow)

    expect(action?.document.title).toEqual(documentTitle)
  })

  it('returns viewport data', () => {
    const { element, domWindow } = createElementInJSDOM('<div>Click Me</div>', 'div')

    const action = createClickUserAction(element, 0, 0, domWindow)

    expect(action?.viewportData).toEqual(viewport(domWindow))
  })

  it('returns recordedAt', () => {
    const now = new Date('2022-05-12').toISOString()
    vi.useFakeTimers()
    vi.setSystemTime(Date.parse('2022-05-12'))

    const { element, domWindow } = createElementInJSDOM('<div>Click Me</div>', 'div')

    const action = createClickUserAction(element, 0, 0, domWindow)

    expect(action?.recordedAt).toEqual(now)
  })

  describe('target data embeds...', () => {
    it('tag name', () => {
      const { element, domWindow } = createElementInJSDOM('<div>Click Me</div>', 'div')

      const action = createClickUserAction(element, 0, 0, domWindow)

      expect(action?.target.element).toEqual('div')
    })

    it('interactiveTarget if event is click on a nested element', () => {
      const { element, domWindow } = createElementInJSDOM('<button><span>Click Me</span></button>', 'span')

      const action = createClickUserAction(element, 0, 0, domWindow)
      expect(action?.interactiveTarget?.element).toEqual('button')
    })

    it('undefined interactiveTarget if event is click on an interactive element', () => {
      const { element, domWindow } = createElementInJSDOM('<button><span>Click Me</span></button>', 'button')

      const action = createClickUserAction(element, 0, 0, domWindow)
      expect(action?.interactiveTarget).toBeUndefined()
      expect(action?.target.element).toEqual('button')
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

      const action = createClickUserAction(element, 0, 0, domWindow)

      expect(action?.target.type).toEqual('text')
    })

    it('computes selectors', () => {
      const { element, domWindow } = createElementInJSDOM(
        '<input type="text" class="inline-form__input" data-testid="userName"/>',
        'input',
      )
      const action = createTargetedUserAction(domWindow, mockClick(element, 0, 0), UserActionType.Click, {})

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
      const action = createTargetedUserAction(domWindow, mockClick(element, 0, 0), UserActionType.Click, {
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

      const action = createClickUserAction(element, 0, 0, domWindow)

      expect(action?.target?.value).toBeUndefined()
    })

    it('"true" is recorded if input is a checked checkbox', () => {
      const { element, domWindow } = createElementInJSDOM('<input type="checkbox" class="size-lg" checked/>', 'input')

      const action = createClickUserAction(element, 0, 0, domWindow)

      expect(action?.target?.value).equals('true')
    })

    it('"false" is recorded if input is a checked checkbox', () => {
      const { element, domWindow } = createElementInJSDOM('<input type="checkbox" class="size-lg"/>', 'input')

      const action = createClickUserAction(element, 0, 0, domWindow)

      expect(action?.target?.value).equals('false')
    })
  })

  it('pointer coordinates data when the event is a mouse event', () => {
    const { element, domWindow } = createElementInJSDOM(
      '<input type="text" data-testid="userName" class="size-lg"/>',
      'input',
    )

    const action = createClickUserAction(element, 12, 34, domWindow)

    const eltBounds = element?.getBoundingClientRect()

    expect(action?.userActionData).toEqual({
      clientX: 12,
      clientY: 34,
      elementRelOffsetX: Math.trunc(12 - (eltBounds?.left ?? 0)),
      elementRelOffsetY: Math.trunc(34 - (eltBounds?.top ?? 0)),
      elementPosition: {
        boundingOffsetLeft: eltBounds?.left,
        boundingOffsetTop: eltBounds?.top,
        height: eltBounds?.height,
        offsetLeft: element.offsetLeft,
        offsetTop: element.offsetTop,
        width: eltBounds?.width,
      },
      scrollableAncestors: [],
    })
  })

  it('key data when the event is a keyup', () => {
    const { element, domWindow } = createElementInJSDOM('<div/>', 'div')
    const action = createKeyUpUserAction(element, 'Shift', 'ShiftLeft', domWindow)

    const eltBounds = element?.getBoundingClientRect()

    expect(action?.userActionData).toEqual({
      key: 'Shift',
      code: 'ShiftLeft',
      elementPosition: {
        boundingOffsetLeft: eltBounds?.left,
        boundingOffsetTop: eltBounds?.top,
        height: eltBounds?.height,
        offsetLeft: element.offsetLeft,
        offsetTop: element.offsetTop,
        width: eltBounds?.width,
      },
      scrollableAncestors: [],
    })
  })

  it('key data when the event is a keydown', () => {
    const { element, domWindow } = createElementInJSDOM('<div/>', 'div')
    const action = createKeyDownUserAction(element, 'Shift', 'ShiftLeft', domWindow)

    const eltBounds = element?.getBoundingClientRect()
    expect(action.userActionData).toEqual({
      key: 'Shift',
      code: 'ShiftLeft',
      elementPosition: {
        boundingOffsetLeft: eltBounds?.left,
        boundingOffsetTop: eltBounds?.top,
        height: eltBounds?.height,
        offsetLeft: element.offsetLeft,
        offsetTop: element.offsetTop,
        width: eltBounds?.width,
      },
      scrollableAncestors: [],
    })
  })
})
