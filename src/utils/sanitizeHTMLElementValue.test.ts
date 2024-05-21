import { describe, expect, it } from 'vitest'
import { sanitizeHTMLElementValue } from './sanitizeHTMLElementValue'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import { HTMLInputWithValue } from '../types'

function expectedSanitizedValue(
  title: string,
  elementHtml: string,
  selectElementInDom: (html: string) => HTMLInputWithValue,
  expected: {
    withAnonymization: string
    withoutAnonymization: string
  },
) {
  describe(title, () => {
    describe('when anonymization is deactivated', () => {
      it(`it returns ${expected.withoutAnonymization}`, () => {
        expect(
          sanitizeHTMLElementValue(selectElementInDom(`<div class='allow-list'>${elementHtml}</div>`), {
            anonymize: false,
          }),
        ).toEqual(expected.withoutAnonymization)
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

        it(`it returns ${expected.withoutAnonymization}`, () => {
          expect(
            sanitizeHTMLElementValue(
              selectElementInDom(`<div class='allow-list'>${elementHtml}</div>`),
              anonymizationSettings,
            ),
          ).toEqual(expected.withoutAnonymization)
        })
      })

      describe('when the element does not belongs to the allowList', () => {
        const anonymizationSettings = {
          anonymize: true,
          allowList: [],
        }

        it(`it returns ${JSON.stringify(expected.withAnonymization)}`, () => {
          expect(
            sanitizeHTMLElementValue(
              selectElementInDom(`<div class='allow-list'>${elementHtml}</div>`),
              anonymizationSettings,
            ),
          ).toEqual(expected.withAnonymization)
        })
      })
    })
  })
}

describe('sanitizeHTMLElementValue', () => {
  expectedSanitizedValue(
    'sanitizes textarea',
    '<textarea/>secret text to be kept confidential</textarea>',
    selectTextAreaInDom,
    {
      withoutAnonymization: 'secret text to be kept confidential',
      withAnonymization: '{{hidden}}',
    },
  )

  expectedSanitizedValue('sanitizes text input', '<input value="s3cr3t"/>', selectInputInDom, {
    withoutAnonymization: 's3cr3t',
    withAnonymization: '{{hidden}}',
  })

  expectedSanitizedValue('sanitizes email input', '<input value="s3.cr3t@mail.com"/>', selectInputInDom, {
    withoutAnonymization: 's3.cr3t@mail.com',
    withAnonymization: '{{hidden}}',
  })

  expectedSanitizedValue('sanitizes any file input', '<input type="file" value="s3cr3t.txt"/>', selectInputInDom, {
    withoutAnonymization: '', // Note: Javascript does not allow reading the value of file inputs.
    withAnonymization: '{{hidden}}',
  })

  expectedSanitizedValue('sanitizes any password input', '<input type="password" value="s3cr3t"/>', selectInputInDom, {
    withoutAnonymization: '{{hidden}}',
    withAnonymization: '{{hidden}}',
  })

  expectedSanitizedValue('sanitizes any tel input', '<input type="tel" value="0123456789"/>', selectInputInDom, {
    withoutAnonymization: '0123456789',
    withAnonymization: '{{hidden}}',
  })

  expectedSanitizedValue('sanitizes any url input', '<input type="url" value="www.s3cr3t.com"/>', selectInputInDom, {
    withoutAnonymization: 'www.s3cr3t.com',
    withAnonymization: '{{hidden}}',
  })

  expectedSanitizedValue('sanitizes any number input', '<input type="number" value="42"/>', selectInputInDom, {
    withoutAnonymization: '42',
    withAnonymization: '{{hidden}}',
  })

  expectedSanitizedValue(
    'sanitizes any checkbox input',
    '<input type="checkbox" value="accept all" checked/>',
    selectInputInDom,
    {
      withoutAnonymization: 'accept all',
      withAnonymization: '{{hidden}}',
    },
  )

  expectedSanitizedValue('sanitizes any radio input', '<input type="radio" value="red" checked/>', selectInputInDom, {
    withoutAnonymization: 'red',
    withAnonymization: '{{hidden}}',
  })

  expectedSanitizedValue(
    'sanitizes any search input',
    '<input type="search" value="the best test automation solution"/>',
    selectInputInDom,
    {
      withoutAnonymization: 'the best test automation solution',
      withAnonymization: '{{hidden}}',
    },
  )

  expectedSanitizedValue('sanitizes any date input', '<input type="date" value="2022-07-12"/>', selectInputInDom, {
    withoutAnonymization: '2022-07-12',
    withAnonymization: '{{hidden}}',
  })

  expectedSanitizedValue(
    'sanitizes any date-time input',
    '<input type="datetime-local" value="2022-07-12T15:30"/>',
    selectInputInDom,
    {
      withoutAnonymization: '2022-07-12T15:30',
      withAnonymization: '{{hidden}}',
    },
  )

  expectedSanitizedValue('sanitizes any time input', '<input type="time" value="13:30"/>', selectInputInDom, {
    withoutAnonymization: '13:30',
    withAnonymization: '{{hidden}}',
  })

  expectedSanitizedValue('sanitizes any month input', '<input type="month" value="2022-07"/>', selectInputInDom, {
    withoutAnonymization: '2022-07',
    withAnonymization: '{{hidden}}',
  })

  expectedSanitizedValue('sanitizes any week input', '<input type="week" value="2017-W01"/>', selectInputInDom, {
    withoutAnonymization: '2017-W01',
    withAnonymization: '{{hidden}}',
  })

  expectedSanitizedValue('sanitizes any color input', '<input type="color" value="#f6b73c"/>', selectInputInDom, {
    withoutAnonymization: '#f6b73c',
    withAnonymization: '{{hidden}}',
  })

  expectedSanitizedValue('sanitizes any button input', '<input type="button" value="Click here"/>', selectInputInDom, {
    withoutAnonymization: 'Click here',
    withAnonymization: '{{hidden}}',
  })

  expectedSanitizedValue(
    'sanitizes any submit input',
    '<input type="submit" value="Click to submit"/>',
    selectInputInDom,
    {
      withoutAnonymization: 'Click to submit',
      withAnonymization: '{{hidden}}',
    },
  )

  expectedSanitizedValue(
    'sanitizes any reset input',
    '<input type="reset" value="Click to reset"/>',
    selectInputInDom,
    {
      withoutAnonymization: 'Click to reset',
      withAnonymization: '{{hidden}}',
    },
  )

  expectedSanitizedValue('sanitizes any range inputs', '<input type="range" value="90"/>', selectInputInDom, {
    withoutAnonymization: '90',
    withAnonymization: '{{hidden}}',
  })
})

function selectInputInDom(domHTML: string): HTMLInputElement {
  const { element } = createElementInJSDOM(domHTML, 'input')
  return element as HTMLInputElement
}

function selectTextAreaInDom(domHTML: string): HTMLTextAreaElement {
  const { element } = createElementInJSDOM(domHTML, 'textarea')
  return element as HTMLTextAreaElement
}
