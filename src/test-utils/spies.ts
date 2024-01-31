import { expect, SpyInstance } from 'vitest'

export function getLastCallFirstArgument<ARRAY extends Array<any>>(spy: SpyInstance<ARRAY, unknown>): ARRAY[0] {
  expect(spy).toHaveBeenCalled()
  assert(spy.mock.lastCall)
  return spy.mock.lastCall?.[0]
}
