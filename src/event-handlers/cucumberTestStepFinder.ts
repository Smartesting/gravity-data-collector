import { CypressObject, TestStep, TestStepProvider, TestStepProviderKey } from '../types'
import { TestStepFinder } from './TestStepFinder'

export function buildCucumberTestStepFinder(cypress: CypressObject): TestStepFinder | undefined {
  const cucumberSpec = lookupDescendant(
    (cypress as any).mocha.getRunner(),
    'test._testConfig.testConfigList.overrides.env.__cypress_cucumber_preprocessor_dont_use_this_spec'.split('.'),
  )
  if (cucumberSpec === undefined) {
    console.log('[Gravity] No Cucumber spec found')
    return undefined
  }
  return buildTestStepFinder(cypress, cucumberSpec)
}

function buildTestStepFinder(cypress: Cypress.Cypress & CyEventEmitter, cucumberSpec: any) {
  const provider: TestStepProvider = {
    key: TestStepProviderKey.CUCUMBER,
    version: '',
  }
  return () => {
    const pickleStep = lookupDescendant(cucumberSpec, 'currentStep.pickleStep'.split('.'))
    if (pickleStep === undefined) {
      return undefined
    }
    const testStep: TestStep = {
      name: pickleStep.text,
      provider,
      extra: pickleStep,
    }
    return testStep
  }
}

function lookupDescendant(object: any, path: string[]): any | undefined {
  if (path.length === 0) {
    return object
  }
  if (object === undefined || object === null) return undefined
  const key = path.shift()
  if (key === undefined) return undefined
  if (typeof object !== 'object' || !Object.prototype.hasOwnProperty.call(object, key)) {
    // console.log(`[Gravity collector] property '${key}' does not exist`)
    return undefined
  }
  const child = object[key]
  if (child === undefined) return undefined
  if (!Array.isArray(child)) return lookupDescendant(child, path)
  for (const item of child) {
    const descendant = lookupDescendant(item, path.slice())
    if (descendant !== undefined) return descendant
  }
  return undefined
}
