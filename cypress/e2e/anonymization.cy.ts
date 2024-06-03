import ITextCompressor from '../../src/text-compressor/ITextCompressor'
import FFLateCompressor from '../../src/text-compressor/FFlateCompressor'
import { AnonymizationSettings, TargetDisplayInfo, TargetedUserAction } from '../../src/types'
import isTargetedUserAction from '../../src/utils/isTargetedUserAction'

interface ExpectedSnapshotContent {
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

interface UserActionAnonymizedFields {
  displayInfo?: TargetDisplayInfo
  value?: string
}
interface ExpectedUserActionsContent {
  '#textField': UserActionAnonymizedFields
  '#passwordField': UserActionAnonymizedFields
  '#textAreaField': UserActionAnonymizedFields
  '#fieldset1 input[type=submit]': UserActionAnonymizedFields
  '#textField1': UserActionAnonymizedFields
  '#passwordField1': UserActionAnonymizedFields
  '#textAreaField1': UserActionAnonymizedFields
  '#fieldset2 input[type=submit]': UserActionAnonymizedFields
}

describe('Anonymizing context', () => {
  let snapshotContent: string
  let publishedUserActions: TargetedUserAction[]

  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    publishedUserActions = []
  })

  const firstFormClear: Partial<ExpectedSnapshotContent> = {
    '#fieldset1 p': 'This is some text shown here',
    'label[for=textField]': 'An input field',
    '#textField': 'Some stuff here',
    'label[for=passwordField]': 'A password field',
    '#passwordField': '***************',
    'label[for=textAreaField]': 'A textarea',
    '#textAreaField': 'Some stuff here',
    '#fieldset1 input[type=submit]': 'Submit the form',
  }

  const firstFormUserActionsClear: Partial<ExpectedUserActionsContent> = {
    '#textField': {
      value: 'Some stuff here',
      displayInfo: {
        placeholder: 'type some text here',
        label: 'An input field',
      },
    },
    '#passwordField': {
      value: '{{hidden}}',
      displayInfo: {
        placeholder: 'this is a password',
        label: 'A password field',
      },
    },
    '#textAreaField': {
      value: 'Some stuff here',
      displayInfo: {
        label: 'A textarea',
      },
    },
  }

  const firstFormUserActionsAnonymized: Partial<ExpectedUserActionsContent> = {
    '#textField': {
      value: '{{hidden}}',
      displayInfo: {
        placeholder: '#### #### #### ####',
        label: '## ##### #####',
      },
    },
    '#passwordField': {
      value: '{{hidden}}',
      displayInfo: {
        placeholder: '#### ## # ########',
        label: '# ######## #####',
      },
    },
    '#textAreaField': {
      value: '{{hidden}}',
      displayInfo: {
        label: '# ########',
      },
    },
  }

  const firstFormAnonymized: Partial<ExpectedSnapshotContent> = {
    '#fieldset1 p': '#### ## #### #### ##### ####',
    'label[for=textField]': '## ##### #####',
    '#textField': '***************',
    'label[for=passwordField]': '# ######## #####',
    '#passwordField': '***************',
    'label[for=textAreaField]': '# ########',
    '#textAreaField': '***************',
    '#fieldset1 input[type=submit]': '##### ### ####',
  }

  const secondFormClear: Partial<ExpectedSnapshotContent> = {
    '#fieldset2 p': 'This is some text shown here',
    'label[for=textField1]': 'An input field',
    '#textField1': 'Some other stuff there',
    'label[for=passwordField1]': 'A password field',
    '#passwordField1': '**********************',
    'label[for=textAreaField1]': 'A textarea',
    '#textAreaField1': 'Some other stuff there',
    '#fieldset2 input[type=submit]': 'Submit the form',
  }

  const secondFormUserActionsClear: Partial<ExpectedUserActionsContent> = {
    '#textField1': {
      value: 'Some other stuff there',
      displayInfo: {
        placeholder: 'type some text here',
        label: 'An input field',
      },
    },
    '#passwordField1': {
      value: '{{hidden}}',
      displayInfo: {
        placeholder: 'this is a password',
        label: 'A password field',
      },
    },
    '#textAreaField1': {
      value: 'Some other stuff there',
      displayInfo: {
        label: 'A textarea',
      },
    },
  }

  const secondFormUserActionsAnonymized: Partial<ExpectedUserActionsContent> = {
    '#textField1': {
      value: '{{hidden}}',
      displayInfo: {
        placeholder: '#### #### #### ####',
        label: '## ##### #####',
      },
    },
    '#passwordField1': {
      value: '{{hidden}}',
      displayInfo: {
        placeholder: '#### ## # ########',
        label: '# ######## #####',
      },
    },
    '#textAreaField1': {
      value: '{{hidden}}',
      displayInfo: {
        label: '# ########',
      },
    },
  }

  const secondFormAnonymized: Partial<ExpectedSnapshotContent> = {
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

  function runTest(
    anonymizationSettings: AnonymizationSettings,
    expectedScreenshotContent: Partial<ExpectedSnapshotContent>,
    expectedUserActions: Partial<ExpectedUserActionsContent>,
  ) {
    cy.interceptGravityCollectionSettings({
      settings: {
        sessionRecording: true,
        videoRecording: true,
        snapshotRecording: true,
        anonymizationSettings,
      },
    })
    cy.interceptGravityPublish((req) => {
      const { body } = req
      if (!Array.isArray(body)) return
      publishedUserActions.push(...body.filter(isTargetedUserAction))
    })

    cy.interceptGravityRecord()
    cy.interceptGravitySnapshot((req) => {
      const compressedSnapshotContent = req.body.content
      const textCompressor: ITextCompressor = FFLateCompressor
      snapshotContent = textCompressor.decompress(compressedSnapshotContent)
    })

    cy.openBaseSite('anonymization.html')
    fillAllInputs()

    cy.wait('@sendGravitySnapshot').then(() => {
      expectValuesInScreenshot(snapshotContent, expectedScreenshotContent)
      expectValuesInSessionUserActions(publishedUserActions, expectedUserActions)
    })
  }

  it('does not anonymize anything when anonymizationSettings.anonymize is false', () => {
    runTest(
      { anonymize: false },
      {
        ...firstFormClear,
        ...secondFormClear,
      },
      {
        ...firstFormUserActionsClear,
        ...secondFormUserActionsClear,
      },
    )
  })

  it('does anonymizes everything when anonymizationSettings.anonymize is true and no allowList is defined', () => {
    runTest(
      {
        anonymize: true,
        allowList: [],
      },
      {
        ...firstFormAnonymized,
        ...secondFormAnonymized,
        // Note: apparently, rrweb does not anonymize input[type=submit] - should it be fixed?
        '#fieldset1 input[type=submit]': 'Submit the form',
        '#fieldset2 input[type=submit]': 'Submit the form',
      },
      {
        ...firstFormUserActionsAnonymized,
        ...secondFormUserActionsAnonymized,
      },
    )
  })

  it('does anonymizes partially when an allow list is defined and matching the page', () => {
    runTest(
      {
        anonymize: true,
        allowList: [
          {
            pageMatcher: '.*',
            allowedSelectors: ['.allow-list'],
          },
        ],
      },
      {
        ...firstFormClear,
        ...secondFormAnonymized,
        // Note: apparently, rrweb does not anonymize input[type=submit] - should it be fixed?
        '#fieldset1 input[type=submit]': 'Submit the form',
        '#fieldset2 input[type=submit]': 'Submit the form',
      },
      {
        ...firstFormUserActionsClear,
        ...secondFormUserActionsAnonymized,
      },
    )
  })
})

function expectValuesInScreenshot(html: string, expected: Partial<ExpectedSnapshotContent>) {
  const iframe = window.document.createElement('iframe')
  window.document.body.appendChild(iframe)
  iframe.contentDocument.write(html)

  const actual: Partial<ExpectedSnapshotContent> = {}

  for (const selector of Object.keys(expected)) {
    const element = iframe.contentDocument.querySelector(selector)

    if (isValuedElement(element)) {
      actual[selector] = element.value
    } else if (isTextElement(element)) {
      actual[selector] = element.textContent
    } else {
      throw new Error(`Unable to compare value for ${String(element)}`)
    }
  }

  expectDeepStrictEqual(expected, actual, trimRecordValues)
}

function isValuedElement(tbd: any): tbd is { value: string } {
  return tbd !== null && (tbd as { value: string }).value !== undefined
}

function isTextElement(tbd: any): tbd is { textContent: string } {
  return tbd !== null && (tbd as { textContent: string }).textContent !== undefined
}

function expectValuesInSessionUserActions(
  publishedUserActions: TargetedUserAction[],
  expected: Partial<ExpectedUserActionsContent>,
) {
  const targets = Object.keys(expected)
  const actual = findUserActionAnonymizedFields(targets, publishedUserActions)

  console.log({ expected, actual })

  expectDeepStrictEqual(expected, actual, makeComparableExpectedUserActionsContent)
}

function makeComparableExpectedUserActionsContent(
  expectedUserActionsContent: Partial<ExpectedUserActionsContent>,
): Partial<ExpectedUserActionsContent> {
  return Object.entries(expectedUserActionsContent).reduce((acc, [key, { displayInfo, value }]) => {
    acc[key] = {
      displayInfo: trimRecordValues(displayInfo),
      value: value ? value.trim() : value,
    }

    return acc
  }, {})
}

function trimRecordValues<T extends Object | undefined>(record: T | undefined): T | undefined {
  if (!record) return

  return Object.entries(record).reduce((acc, [k, v]) => {
    acc[k] = v.trim()
    return acc
  }, {}) as T
}

function findUserActionAnonymizedFields(
  targets: string[],
  publishedUserActions: TargetedUserAction[],
): Record<string, UserActionAnonymizedFields> {
  return publishedUserActions.reduce((acc, userAction) => {
    const { target } = userAction
    if (!target.selectors) return acc

    const matchingTarget = Object.values(target.selectors.query).find((value) => targets.includes(value))
    if (matchingTarget) {
      acc[matchingTarget] = {
        displayInfo: target.displayInfo,
        value: target.value,
      }
    }

    return acc
  }, {})
}

function expectDeepStrictEqual<T>(expected: T, actual: T, clean: (x: T) => T = (x) => x, key?: string) {
  try {
    expect(clean(actual)).to.deep.equal(clean(expected))
  } catch (e) {
    console.log(compareRecords(clean(expected), clean(actual)))
    throw e
  }
}

function compareRecords<T>(expected: T, actual: T, path?: string): string[] {
  const errors: string[] = []
  const allKeys = new Set([...Object.keys(expected), ...Object.keys(actual)])

  for (const key of Array.from(allKeys)) {
    const actualValue = actual[key]
    const expectedValue = expected[key]

    if (actualValue === undefined) {
      errors.push(`[${path ?? ''}] Expected key ${key} in ${String(actual)}`)
    }

    if (expectedValue === undefined) {
      errors.push(`[${path ?? ''}] Expected key ${key} in ${String(expected)}`)
    }

    if (typeof actualValue === 'object') {
      errors.push(...compareRecords(expectedValue, actualValue, path ? `${path}/${key}` : key))
    } else if (actualValue !== expectedValue) {
      errors.push(`[${path ?? ''}] Expected ${String(expectedValue)} to equal ${String(actualValue)}`)
    }
  }

  return errors
}
