import { expect, SpyInstance } from 'vitest'

export function getLastCallArgument<T>(spy: SpyInstance<[T], unknown>): T {
  expect(spy).toHaveBeenCalled()
  assert(spy.mock.lastCall)
  return spy.mock.lastCall[0]
}
