import { expect, SpyInstance } from 'vitest'

export function getLastCallFirstArgument<ARRAY extends Array<any>>(spy: SpyInstance<ARRAY, unknown>): ARRAY[0] {
  expect(spy).toHaveBeenCalled()
  assert(spy.mock.lastCall)
  return spy.mock.lastCall[0]
}

export function getNthCallFirstArgument<ARRAY extends Array<any>>(
  spy: SpyInstance<ARRAY, unknown>,
  nth: number,
): ARRAY[0] {
  expect(spy).toHaveBeenCalled()
  assert(spy.mock.calls[nth])
  return spy.mock.calls[nth][0]
}

export function getLastCallSecondArgument<ARRAY extends Array<any>>(spy: SpyInstance<ARRAY, unknown>): ARRAY[1] {
  expect(spy).toHaveBeenCalled()
  assert(spy.mock.lastCall)
  return spy.mock.lastCall[1]
}
