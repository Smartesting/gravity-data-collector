import { expect, SpyInstanceFn, vitest, vi } from 'vitest'
import { DataBuffering } from './DataBuffering'

describe('DataBuffering', () => {
  let dataBuffer: DataBuffering<number, void>
  let handleData: SpyInstanceFn

  beforeEach(() => {
    handleData = vitest.fn(async (data: ReadonlyArray<number>) => {
      console.log({ data })
    })
  })

  describe('when handleInterval is set to zero', () => {
    const handleInterval = 0

    beforeEach(() => {
      dataBuffer = new DataBuffering({
        handleInterval,
        handleData,
      })
    })

    it('calls handleData directly after adding data', async () => {
      await dataBuffer.addData(3.14)

      expect(handleData).to.toHaveBeenNthCalledWith(1, [3.14])
    })
  })

  describe('when handleInterval is defined', () => {
    const handleInterval = 100

    beforeEach(() => {
      vi.useFakeTimers()
      dataBuffer = new DataBuffering({
        handleInterval,
        handleData,
      })
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('does not calls handleData directly after adding data', async () => {
      await dataBuffer.addData(3.14)

      expect(handleData).not.to.toHaveBeenCalled()
    })

    it('calls handleData with all the data that have been added', async () => {
      await dataBuffer.addData(3.14)
      await dataBuffer.addData(2.71)
      await dataBuffer.addData(1.618)

      vi.advanceTimersByTime(handleInterval)

      expect(handleData).to.toHaveBeenNthCalledWith(1, [3.14, 2.71, 1.618])
    })

    it('does not send multiple times the same data', async () => {
      await dataBuffer.addData(3.14)
      await dataBuffer.addData(2.71)
      await dataBuffer.addData(1.618)

      vi.advanceTimersByTime(handleInterval)
      expect(handleData).to.toHaveBeenNthCalledWith(1, [3.14, 2.71, 1.618])

      await dataBuffer.addData(42)
      vi.advanceTimersByTime(handleInterval)
      expect(handleData).to.toHaveBeenNthCalledWith(1, [42])
    })
  })
})
