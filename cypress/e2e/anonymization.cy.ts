import { AnonymizationSettings, TargetDisplayInfo, TargetedUserAction } from '../../src/types'
import isTargetedUserAction from '../../src/utils/isTargetedUserAction'

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
  let publishedUserActions: TargetedUserAction[]

  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    publishedUserActions = []
  })

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

  function fillAllInputs() {
    const inputIds = ['#textField', '#passwordField', '#textAreaField']

    for (const inputId of inputIds) {
      cy.get(inputId).clear().type('Some stuff here')
      cy.get(`${inputId}1`).clear().type('Some other stuff there')
    }
    cy.get('#fieldset1 input[type=submit]').click()
    cy.get('#fieldset2 input[type=submit]').click()

    return cy.wait(500)
  }

  function runTest(
    anonymizationSettings: AnonymizationSettings,
    expectedUserActions: Partial<ExpectedUserActionsContent>,
  ) {
    cy.interceptGravityCollectionSettings({
      settings: {
        sessionRecording: true,
        videoRecording: true,
        anonymizationSettings,
      },
    })
    cy.interceptGravityPublish((req) => {
      const { body } = req
      if (!Array.isArray(body)) return
      publishedUserActions.push(...body.filter(isTargetedUserAction))
    })

    cy.openBaseSite('anonymization.html')
    fillAllInputs().then(() => {
      cy.wait('@sendGravityRequest').then(() => {
        expectValuesInSessionUserActions(publishedUserActions, expectedUserActions)
      })
    })
  }

  it('does not anonymize anything when anonymizationSettings.anonymize is false', () => {
    runTest(
      { anonymize: false },
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
        ...firstFormUserActionsClear,
        ...secondFormUserActionsAnonymized,
      },
    )
  })
})

function expectValuesInSessionUserActions(
  publishedUserActions: TargetedUserAction[],
  expected: Partial<ExpectedUserActionsContent>,
) {
  const targets = Object.keys(expected)
  const actual = findUserActionAnonymizedFields(targets, publishedUserActions)

  console.log({
    expected,
    actual,
  })

  expectDeepStrictEqual(expected, actual, makeComparableExpectedUserActionsContent)
}

function makeComparableExpectedUserActionsContent(
  expectedUserActionsContent: Partial<ExpectedUserActionsContent>,
): Partial<ExpectedUserActionsContent> {
  return Object.entries(expectedUserActionsContent).reduce<Partial<ExpectedUserActionsContent>>(
    (acc, [key, { displayInfo, value }]) => {
      acc[key as keyof Partial<ExpectedUserActionsContent>] = {
        displayInfo: displayInfo ? trimRecordValues(displayInfo as Record<string, unknown>) : displayInfo,
        value: value ? value.trim() : value,
      }

      return acc
    },
    {},
  )
}

function trimRecordValues<T extends Record<string, string | unknown>>(record: T): T {
  return Object.entries(record).reduce((acc, [k, v]) => {
    // @ts-expect-error
    acc[k] = respondToTrim(v) ? v.trim() : v
    return acc
  }, {}) as T
}

function respondToTrim(tbd: unknown): tbd is { trim: () => string } {
  return tbd !== null && (tbd as string).trim !== undefined
}

function findUserActionAnonymizedFields(
  targets: string[],
  publishedUserActions: TargetedUserAction[],
): Partial<ExpectedUserActionsContent> {
  return publishedUserActions.reduce<Partial<ExpectedUserActionsContent>>((acc, userAction) => {
    const { target } = userAction
    if (!target.selectors) return acc

    const matchingTarget = Object.values(target.selectors.query).find((value) => targets.includes(value))
    if (matchingTarget) {
      acc[matchingTarget as keyof ExpectedUserActionsContent] = {
        displayInfo: target.displayInfo,
        value: target.value,
      }
    }

    return acc
  }, {})
}

function expectDeepStrictEqual<T extends {}>(expected: T, actual: T, clean: (x: T) => T = (x) => x, key?: string) {
  try {
    expect(clean(actual)).to.deep.equal(clean(expected))
  } catch (e) {
    console.log(compareRecords(clean(expected), clean(actual)))
    throw e
  }
}

function compareRecords<T extends Record<string, unknown>>(expected: T, actual: T, path?: string): string[] {
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
      errors.push(
        ...compareRecords(
          expectedValue as Record<string, unknown>,
          actualValue as Record<string, unknown>,
          path ? `${path}/${key}` : key,
        ),
      )
    } else if (actualValue !== expectedValue) {
      errors.push(`[${path ?? ''}] Expected ${String(expectedValue)} to equal ${String(actualValue)}`)
    }
  }

  return errors
}
