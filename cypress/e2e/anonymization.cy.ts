import ITextCompressor from '../../src/text-compressor/ITextCompressor'
import FFLateCompressor from '../../src/text-compressor/FFlateCompressor'

interface ExpectedValues {
  '#fieldset1 p': string
  'label[for=textField]': string
  '#textField': string
  'label[for=passwordField]': string
  '#passwordField': string
  'label[for=textAreaField]': string
  '#textAreaField': string
  '#fieldset1 input[type=submit]': string
  '#fieldset2 p': string
  'label[for=textField1]': string
  '#textField1': string
  'label[for=passwordField1]': string
  '#passwordField1': string
  'label[for=textAreaField1]': string
  '#textAreaField1': string
  '#fieldset2 input[type=submit]': string
}

function expectValuesInScreenshot(html: string, expected: Partial<ExpectedValues>) {
  const iframe = window.document.createElement('iframe')
  window.document.body.appendChild(iframe)
  iframe.contentDocument.write(html)

  const actual: Partial<ExpectedValues> = {}

  for (const selector of Object.keys(expected)) {
    const element = iframe.contentDocument.querySelector(selector)

    if (isValuedElement(element)) {
      actual[selector] = element.value.trim()
    } else if (isTextElement(element)) {
      actual[selector] = element.textContent.trim()
    } else {
      throw new Error(`Unable to compare value for ${String(element)}`)
    }
  }

  expect(actual).to.deep.equal(expected)
}

function isValuedElement(tbd: any): tbd is { value: string } {
  return tbd !== null && (tbd as { value: string }).value !== undefined
}

function isTextElement(tbd: any): tbd is { textContent: string } {
  return tbd !== null && (tbd as { textContent: string }).textContent !== undefined
}

describe('Anonymizing context', () => {
  let snapshotContent: string

  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  const firstFormClear: Partial<ExpectedValues> = {
    '#fieldset1 p': 'This is some text shown here',
    'label[for=textField]': 'An input field',
    '#textField': 'Some stuff here',
    'label[for=passwordField]': 'A password field',
    '#passwordField': '***************',
    'label[for=textAreaField]': 'A textarea',
    '#textAreaField': 'Some stuff here',
    '#fieldset1 input[type=submit]': 'Submit the form',
  }
  const firstFormAnonymized: Partial<ExpectedValues> = {
    '#fieldset1 p': '#### ## #### #### ##### ####',
    'label[for=textField]': '## ##### #####',
    '#textField': '***************',
    'label[for=passwordField]': '# ######## #####',
    '#passwordField': '***************',
    'label[for=textAreaField]': '# ########',
    '#textAreaField': '***************',
    '#fieldset1 input[type=submit]': '##### ### ####',
  }
  const secondFormClear: Partial<ExpectedValues> = {
    '#fieldset2 p': 'This is some text shown here',
    'label[for=textField1]': 'An input field',
    '#textField1': 'Some other stuff there',
    'label[for=passwordField1]': 'A password field',
    '#passwordField1': '**********************',
    'label[for=textAreaField1]': 'A textarea',
    '#textAreaField1': 'Some other stuff there',
    '#fieldset2 input[type=submit]': 'Submit the form',
  }

  const secondFormAnonymized: Partial<ExpectedValues> = {
    '#fieldset2 p': '#### ## #### #### ##### ####',
    'label[for=textField1]': '## ##### #####',
    '#textField1': '**********************',
    'label[for=passwordField1]': '# ######## #####',
    '#passwordField1': '**********************',
    'label[for=textAreaField1]': '# ########',
    '#textAreaField1': '**********************',
    '#fieldset2 input[type=submit]': '###### ### #####',
  }

  function fillAllInputs() {
    for (const inputId of ['#textField', '#passwordField', '#textAreaField']) {
      cy.get(inputId).clear().type('Some stuff here')
      cy.get(`${inputId}1`).clear().type('Some other stuff there')
    }
    cy.get('#fieldset1 input[type=submit]').click()
    cy.get('#fieldset2 input[type=submit]').click()
  }

  it('does not anonymize anything when anonymizationSettings.anonymize is false', () => {
    cy.interceptGravityCollectionSettings({
      settings: {
        sessionRecording: true,
        videoRecording: true,
        snapshotRecording: true,
        anonymizationSettings: {
          anonymize: false,
        },
      },
    })
    cy.interceptGravityPublish()
    cy.interceptGravityRecord()
    cy.interceptGravitySnapshot((req) => {
      const compressedSnapshotContent = req.body.content
      const textCompressor: ITextCompressor = FFLateCompressor
      snapshotContent = textCompressor.decompress(compressedSnapshotContent)
    })

    cy.openBaseSite('anonymization.html')
    fillAllInputs()

    cy.wait('@sendGravitySnapshot').then(() => {
      expectValuesInScreenshot(snapshotContent, {
        ...firstFormClear,
        ...secondFormClear,
      })
    })
  })

  it('does anonymizes everything when anonymizationSettings.anonymize is true and no allowList is defined', () => {
    cy.interceptGravityCollectionSettings({
      settings: {
        sessionRecording: true,
        videoRecording: true,
        snapshotRecording: true,
        anonymizationSettings: {
          anonymize: true,
          allowList: [],
        },
      },
    })
    cy.interceptGravityPublish()
    cy.interceptGravityRecord()
    cy.interceptGravitySnapshot((req) => {
      const compressedSnapshotContent = req.body.content
      const textCompressor: ITextCompressor = FFLateCompressor
      snapshotContent = textCompressor.decompress(compressedSnapshotContent)
    })

    cy.openBaseSite('anonymization.html')
    fillAllInputs()

    cy.wait('@sendGravitySnapshot').then(() => {
      expectValuesInScreenshot(snapshotContent, {
        ...firstFormAnonymized,
        ...secondFormAnonymized,
        // Note: apparently, rrweb does not anonymize input[type=submit] - should it be fixed?
        '#fieldset1 input[type=submit]': 'Submit the form',
        '#fieldset2 input[type=submit]': 'Submit the form',
      })
    })
  })

  it('does anonymizes partially when an allow list is defined and matching the page', () => {
    cy.interceptGravityCollectionSettings({
      settings: {
        sessionRecording: true,
        videoRecording: true,
        snapshotRecording: true,
        anonymizationSettings: {
          anonymize: true,
          allowList: [
            {
              pageMatcher: '.*',
              allowedSelectors: ['.allow-list'],
            },
          ],
        },
      },
    })
    cy.interceptGravityPublish()
    cy.interceptGravityRecord()
    cy.interceptGravitySnapshot((req) => {
      const compressedSnapshotContent = req.body.content
      const textCompressor: ITextCompressor = FFLateCompressor
      snapshotContent = textCompressor.decompress(compressedSnapshotContent)
    })

    cy.openBaseSite('anonymization.html')
    fillAllInputs()

    cy.wait('@sendGravitySnapshot').then(() => {
      expectValuesInScreenshot(snapshotContent, {
        ...firstFormClear,
        ...secondFormAnonymized,
        // Note: apparently, rrweb does not anonymize input[type=submit] - should it be fixed?
        '#fieldset1 input[type=submit]': 'Submit the form',
        '#fieldset2 input[type=submit]': 'Submit the form',
      })
    })
  })
})
