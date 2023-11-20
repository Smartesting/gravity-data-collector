import { expect, Mock, vi, vitest } from 'vitest'
import { DataBuffering } from './DataBuffering'

describe('DataBuffering', () => {
  let dataBuffer: DataBuffering<number, void>
  let handleData: Mock

  beforeEach(() => {
    handleData = vitest.fn(async () => {})
  })

  describe('when handleInterval is set to zero', () => {
    const handleInterval = 0

    beforeEach(() => {
      dataBuffer = new DataBuffering({
        handleInterval,
        handleData,
      })
    })

    it('the dataBuffer is initially inactive', async () => {
      await dataBuffer.addData(3.14)
      expect(handleData).not.to.toHaveBeenCalled()
    })

    describe('once the dataBuffer is active', () => {
      beforeEach(() => {
        dataBuffer.activate()
      })

      it('calls handleData directly after adding data', async () => {
        await dataBuffer.addData(3.14)
        expect(handleData).to.toHaveBeenCalledWith([3.14])
      })
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
      dataBuffer.activate()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('does not call handleData directly after adding data', async () => {
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
      expect(handleData).to.toHaveBeenCalledOnce()
      expect(handleData).to.toHaveBeenNthCalledWith(1, [3.14, 2.71, 1.618])

      await dataBuffer.addData(42)
      vi.advanceTimersByTime(handleInterval)
      expect(handleData).to.toHaveBeenCalledTimes(2)
      expect(handleData).to.toHaveBeenNthCalledWith(2, [42])
    })
  })
})
