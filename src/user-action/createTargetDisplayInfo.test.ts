import { beforeEach, describe, expect, it } from 'vitest'
import { mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import { createTargetDisplayInfo } from './createTargetDisplayInfo'
import { AnonymizationSettings, TargetDisplayInfo } from '../types'
import maskText from '../utils/maskText'

describe('user action', () => {
  const text = 'Click me'
  const anonymizedText = maskText(text)
  const placeholder = 'Type something'
  const anonymizedPlaceholder = maskText(placeholder)
  const label = 'A label'
  const anonymizedLabel = maskText(label)

  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
  })

  function expectedDisplayInfo(
    title: string,
    elementHtml: string,
    querySelector: string,
    expected: {
      withAnonymization: TargetDisplayInfo | undefined
      withoutAnonymization: TargetDisplayInfo | undefined
    },
  ) {
    const { element, domWindow } = createElementInJSDOM(`<div class='allow-list'>${elementHtml}</div>`, querySelector)
    function expectSameTargetDisplayInfo(
      actual: TargetDisplayInfo | undefined,
      expected: TargetDisplayInfo | undefined,
    ) {
      if (!expected) return expect(actual).toBeUndefined()
      const emptyTargetDisplayInfo: TargetDisplayInfo = {
        label: undefined,
        text: undefined,
        placeholder: undefined,
      }

      expect({ ...emptyTargetDisplayInfo, ...actual }).toStrictEqual({ ...emptyTargetDisplayInfo, ...expected })
    }

    describe(`${title} (target element is: ${elementHtml})`, () => {
      describe('when anonymization is deactivated', () => {
        it(`it returns ${JSON.stringify(expected.withoutAnonymization)}`, () => {
          expectSameTargetDisplayInfo(
            createTargetDisplayInfo(element, { anonymize: false }, domWindow.document),
            expected.withoutAnonymization,
          )
        })
      })

      describe('when anonymization is activated', () => {
        describe('when the element belongs to the allowList', () => {
          const anonymizationSettings = {
            anonymize: true,
            allowList: [
              {
                pageMatcher: '.*',
                allowedSelectors: ['.allow-list'],
              },
            ],
          }

          it(`it returns ${JSON.stringify(expected.withoutAnonymization)}`, () => {
            expectSameTargetDisplayInfo(
              createTargetDisplayInfo(element, anonymizationSettings, domWindow.document),
              expected.withoutAnonymization,
            )
          })
        })

        describe('when the element does not belongs to the allowList', () => {
          const anonymizationSettings = {
            anonymize: true,
            allowList: [],
          }

          it(`it returns ${JSON.stringify(expected.withAnonymization)}`, () => {
            expectSameTargetDisplayInfo(
              createTargetDisplayInfo(element, anonymizationSettings, domWindow.document),
              expected.withAnonymization,
            )
          })
        })
      })
    })
  }

  describe('createTargetDisplayInfo', () => {
    expectedDisplayInfo('returns display infos of a button', `<button>${text}</button>`, 'button', {
      withoutAnonymization: { text },
      withAnonymization: { text: anonymizedText },
    })

    expectedDisplayInfo('returns display infos of an input button', `<input type="button" value="${text}"/>`, 'input', {
      withoutAnonymization: { text },
      withAnonymization: { text: anonymizedText },
    })

    expectedDisplayInfo(
      'returns display infos of a text area',
      `
          <label for="ta">${label}</label>
          <textarea id="ta" placeholder="${placeholder}"/>`,
      'textarea',
      {
        withoutAnonymization: { label, placeholder },
        withAnonymization: { label: anonymizedLabel, placeholder: anonymizedPlaceholder },
      },
    )

    expectedDisplayInfo(
      'returns display infos of a text box',
      `<label for="id">${label}</label>` + `<input id="id" type="text" placeholder="${placeholder}"/>`,
      'input',
      {
        withoutAnonymization: { label, placeholder },
        withAnonymization: { label: anonymizedLabel, placeholder: anonymizedPlaceholder },
      },
    )

    expectedDisplayInfo(
      'returns display infos of a check box',
      `<label for="id">${label}</label>` + `<input id="id" placeholder="${placeholder}" type="checkbox"/>`,
      'input',
      {
        withoutAnonymization: { label, placeholder },
        withAnonymization: { label: anonymizedLabel, placeholder: anonymizedPlaceholder },
      },
    )

    expectedDisplayInfo('returns display infos of a link', `<a>${text}</a>`, 'a', {
      withoutAnonymization: { text },
      withAnonymization: { text: anonymizedText },
    })

    expectedDisplayInfo(
      'returns display infos of a radio button',
      `<label for="id">${label}</label>` + '<input type="radio" id="id"/>',
      'input',
      {
        withoutAnonymization: { label },
        withAnonymization: { label: anonymizedLabel },
      },
    )

    expectedDisplayInfo(
      'returns display infos of a select',
      `<label for="id">${label}</label>` +
        '<select id="id">' +
        '    <option value="1">Value 1</option>' +
        '    <option value="2">Value 2</option>' +
        '</select>',
      'select',
      {
        withoutAnonymization: { label },
        withAnonymization: { label: anonymizedLabel },
      },
    )

    expectedDisplayInfo('returns display infos of a div', '<div class="target">Click Me</div>', 'div.target', {
      withoutAnonymization: undefined,
      withAnonymization: undefined,
    })

    expectedDisplayInfo(
      'does not return label if it does not exists',
      `<input type="text" placeholder="${placeholder}"/>`,
      'input',
      {
        withoutAnonymization: { placeholder },
        withAnonymization: { placeholder: anonymizedPlaceholder },
      },
    )

    expectedDisplayInfo('does not return empty label', '<label for="id"/><input id="id" type="text"/>', 'input', {
      withoutAnonymization: {},
      withAnonymization: {},
    })

    expectedDisplayInfo(
      'does not return a label if `for` attribute does not match an input ID',
      `<label>${label}</label><input type="text"/>`,
      'input',
      {
        withoutAnonymization: {},
        withAnonymization: {},
      },
    )

    describe('without anonymization', () => {
      /*
       * Note: those tests won't be merged with the previous system as body and html elements should not be
       * included inside a div.
       * */
      const anonymizationSettings: AnonymizationSettings = { anonymize: false }

      it('returns display infos of the body', () => {
        const { element, domWindow } = createElementInJSDOM('<body>Click Me</body>', 'body')

        const displayInfo = createTargetDisplayInfo(element, anonymizationSettings, domWindow.document)

        expect(displayInfo).toBeUndefined()
      })

      it('returns display infos of the html element', () => {
        const { element, domWindow } = createElementInJSDOM('<html lang="fr">Click Me</html>', 'html')

        const displayInfo = createTargetDisplayInfo(element, anonymizationSettings, domWindow.document)

        expect(displayInfo).toBeUndefined()
      })
    })
  })
})
