import { describe, it } from 'vitest'
import { createSnapshot } from '../snapshot-recorder/createSnapshot'
import { AssertionError } from 'assert'
import { JSDOM } from 'jsdom'
import wikipedia from './samples/wikipedia.sample'
import googleImage from './samples/googleImage.sample'
import googleNews from './samples/googleNews.sample'
import leMonde from './samples/leMonde.sample'
import FFlateCompressor from '../text-compressor/FFlateCompressor'
import { Benchmark } from '../monitoring/Benchmark'

const contents = {
  wikipedia,
  googleImage,
  googleNews,
  leMonde,
}

describe('snapshots', () => {
  it.each([
    {
      name: 'FFlate',
      compressor: FFlateCompressor,
    },
  ])('compress and decompress some samples with $name', ({ compressor, name }) => {
    const benchmark = new Benchmark()
    for (const [name, content] of Object.entries(contents)) {
      benchmark.newRecord(name)
      const { compressed } = compressor.compress(content)
      benchmark.recordTime('compressionTime')

      const decompressed = compressor.decompress(compressed)
      benchmark.recordTime('decompressionTime')
      benchmark.recordSize('original', content.length)
      benchmark.recordSize('compressed', compressed.length)
      benchmark.record('ratio', ratio(compressed.length, content.length))
      assert.equal(decompressed, content)
    }
    console.log(name)
    benchmark.summarize()
  })

  it('measure build of snapshot samples', () => {
    const benchmark = new Benchmark()
    for (const [name, content] of Object.entries(contents)) {
      const window = new JSDOM(content).window
      const snapshotWindow = new JSDOM().window
      try {
        const snapshotStartingTime = benchmark.newRecord(name)
        const snapshot = createSnapshot(window.document, snapshotWindow.document, {}, benchmark)
        benchmark.recordTime('snapshotTime', snapshotStartingTime)
        if (snapshot === null) throw new AssertionError({ message: 'snapshot html should be defined' })
        benchmark.recordSize('htmlSize', content.length)
        benchmark.recordSize('snapshotSize', snapshot.length)
      } finally {
        window.close()
        snapshotWindow.close()
      }
    }
    benchmark.summarize()
  })
})

function ratio(compressed: number, original: number) {
  return Math.round((100 * (original - compressed)) / original)
}
