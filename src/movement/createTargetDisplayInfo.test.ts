import { beforeEach, describe, expect, it } from 'vitest'
import { mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import { createTargetDisplayInfo } from './createTargetDisplayInfo'

describe('user action', () => {
  const text = 'Click me'
  const placeholder = 'Type something'
  const label = 'A label'

  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
  })

  describe('createTargetDisplayInfo', () => {
    it('returns display infos of a button', () => {
      const { element } = createElementInJSDOM(`<button>${text}</button>`, 'button')

      const displayInfo = createTargetDisplayInfo(element)

      expect(displayInfo).toBeDefined()
      expect(displayInfo?.label).toBeUndefined()
      expect(displayInfo?.placeholder).toBeUndefined()
      expect(displayInfo?.text).toEqual(text)
    })

    it('returns display infos of an input button', () => {
      const { element } = createElementInJSDOM(`<input type="button" value="${text}"/>`, 'input')

      const displayInfo = createTargetDisplayInfo(element)

      expect(displayInfo).toBeDefined()
      expect(displayInfo?.label).toBeUndefined()
      expect(displayInfo?.placeholder).toBeUndefined()
      expect(displayInfo?.text).toEqual(text)
    })

    it('returns display infos of a text area', () => {
      const { element, domWindow } = createElementInJSDOM(
        `
          <label for="ta">${label}</label>
          <textarea id="ta" placeholder="${placeholder}"/>`,
        'textarea',
      )

      const displayInfo = createTargetDisplayInfo(element, domWindow.document)

      expect(displayInfo).toBeDefined()
      expect(displayInfo?.text).toBeUndefined()
      expect(displayInfo?.label).toEqual(label)
      expect(displayInfo?.placeholder).toEqual(placeholder)
    })

    it('returns display infos of a text box', () => {
      const { element, domWindow } = createElementInJSDOM(
        `<label for="id">${label}</label>` + `<input id="id" type="text" placeholder="${placeholder}"/>`,
        'input',
      )

      const displayInfo = createTargetDisplayInfo(element, domWindow.document)

      expect(displayInfo).toBeDefined()
      expect(displayInfo?.text).toBeUndefined()
      expect(displayInfo?.label).toEqual(label)
      expect(displayInfo?.placeholder).toEqual(placeholder)
    })

    it('returns display infos of a check box', () => {
      const { element, domWindow } = createElementInJSDOM(
        `<label for="id">${label}</label>` + `<input id="id" placeholder="${placeholder}" type="checkbox"/>`,
        'input',
      )

      const displayInfo = createTargetDisplayInfo(element, domWindow.document)

      expect(displayInfo).toBeDefined()
      expect(displayInfo?.text).toBeUndefined()
      expect(displayInfo?.label).toEqual(label)
      expect(displayInfo?.placeholder).toEqual(placeholder)
    })

    it('returns display infos of a link', () => {
      const { element } = createElementInJSDOM(`<a>${text}</a>`, 'a')

      const displayInfo = createTargetDisplayInfo(element)

      expect(displayInfo).toBeDefined()
      expect(displayInfo?.text).toEqual(text)
      expect(displayInfo?.label).toBeUndefined()
      expect(displayInfo?.placeholder).toBeUndefined()
    })

    it('returns display infos of a radio button', () => {
      const { element, domWindow } = createElementInJSDOM(
        `<label for="id">${label}</label>` + '<input type="radio" id="id"/>',
        'input',
      )

      const displayInfo = createTargetDisplayInfo(element, domWindow.document)

      expect(displayInfo).toBeDefined()
      expect(displayInfo?.label).toEqual(label)
      expect(displayInfo?.text).toBeUndefined()
      expect(displayInfo?.placeholder).toBeUndefined()
    })

    it('returns display infos of a select', () => {
      const { element, domWindow } = createElementInJSDOM(
        `<label for="id">${label}</label>` +
          '<select id="id">' +
          '    <option value="1">Value 1</option>' +
          '    <option value="2">Value 2</option>' +
          '</select>',
        'select',
      )

      const displayInfo = createTargetDisplayInfo(element, domWindow.document)

      expect(displayInfo).toBeDefined()
      expect(displayInfo?.label).toEqual(label)
      expect(displayInfo?.text).toBeUndefined()
      expect(displayInfo?.placeholder).toBeUndefined()
    })

    it('returns display infos of a div', () => {
      const { element } = createElementInJSDOM('<div>Click Me</div>', 'div')

      const displayInfo = createTargetDisplayInfo(element)

      expect(displayInfo).toBeUndefined()
    })

    it('returns display infos of the body', () => {
      const { element } = createElementInJSDOM('<body>Click Me</body>', 'body')

      const displayInfo = createTargetDisplayInfo(element)

      expect(displayInfo).toBeUndefined()
    })

    it('returns display infos of the html element', () => {
      const { element } = createElementInJSDOM('<html lang="fr">Click Me</html>', 'html')

      const displayInfo = createTargetDisplayInfo(element)

      expect(displayInfo).toBeUndefined()
    })

    it('does not return label if not exists', () => {
      const { element, domWindow } = createElementInJSDOM(`<input type="text" placeholder="${placeholder}"/>`, 'input')

      const displayInfo = createTargetDisplayInfo(element, domWindow.document)

      expect(displayInfo).toBeDefined()
      expect(displayInfo?.text).toBeUndefined()
      expect(displayInfo?.label).toBeUndefined()
      expect(displayInfo?.placeholder).toEqual(placeholder)
    })

    it('does not return empty label', () => {
      const { element, domWindow } = createElementInJSDOM('<label for="id"/><input id="id" type="text"/>', 'input')

      const displayInfo = createTargetDisplayInfo(element, domWindow.document)

      expect(displayInfo).toBeDefined()
      expect(displayInfo?.label).toBeUndefined()
    })

    it('does not return a label if `for` attribute does not match an input ID', () => {
      const { element, domWindow } = createElementInJSDOM(`<label>${label}</label><input type="text"/>`, 'input')

      const displayInfo = createTargetDisplayInfo(element, domWindow.document)

      expect(displayInfo).toBeDefined()
      expect(displayInfo?.label).toBeUndefined()
    })
  })
})
