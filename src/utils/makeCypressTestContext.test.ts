import { beforeEach, describe, it } from 'vitest'
import { makeCypressTestContext } from './makeCypressTestContext'
import assert from 'assert'
import { TestContext, TestingTool } from '../types'

describe('makeCypressTestContext', () => {
  beforeEach(() => {
    delete (window as any).Cypress
  })

  it('builds TestContext from windowCypress object', () => {
    ;(window as any).Cypress = {
      currentTest: {
        title: 'The user actions are grouped by session',
        titlePath: [
          'Store usage sessions in a domain',
          'Session user actions are stored in the system',
          'The user actions are grouped by session',
        ],
      },
      mocha: {
        getRunner() {
          return {
            suite: {
              file: null,
              title: 'Session user actions are stored in the system',
              parent: {
                file: null,
                title: 'Store usage sessions in a domain',
                parent: {
                  file: 'features\\session-storage-in-domain.feature',
                  title: '',
                },
              },
            },
          }
        },
      },
    }

    const testContext = makeCypressTestContext()
    const expectedTestContext: TestContext = {
      title: 'The user actions are grouped by session',
      titlePath: [
        'Store usage sessions in a domain',
        'Session user actions are stored in the system',
        'The user actions are grouped by session',
      ],
      testingTool: TestingTool.CYPRESS,
      suite: {
        file: null,
        title: 'Session user actions are stored in the system',
        parent: {
          file: null,
          title: 'Store usage sessions in a domain',
          parent: {
            file: 'features\\session-storage-in-domain.feature',
            title: '',
          },
        },
      },
    }

    assert.deepStrictEqual(testContext, expectedTestContext)
  })
})
