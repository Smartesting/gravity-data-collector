import { describe, it } from 'vitest'
import { createSnapshot } from '../snapshot-recorder/createSnapshot'
import { AssertionError } from 'assert'
import { JSDOM } from 'jsdom'
import wikipedia from './samples/wikipedia.sample'
import googleImage from './samples/googleImage.sample'
import googleNews from './samples/googleNews.sample'
import leMonde from './samples/leMonde.sample'
import FFlateCompressor from '../text-compressor/FFlateCompressor'
import { Benchmark } from './Benchmark'

const contents = {
  wikipedia,
  googleImage,
  googleNews,
  leMonde,
}

describe('snapshots', () => {
  it.each([
    // {
    //   name: 'Pako',
    //   compressor: new PakoCompressor(),
    // },
    {
      name: 'FFlate',
      compressor: new FFlateCompressor(),
    },
  ])('compress and decompress some samples with $name', ({ compressor, name }) => {
    const benchmark = new Benchmark()
    for (const [name, content] of Object.entries(contents)) {
      benchmark.newRecord(name)
      const compressed = compressor.compress(content)
      benchmark.recordDuration('compressionTime')

      const decompressed = compressor.decompress(compressed)
      benchmark.recordDuration('decompressionTime')
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
      benchmark.newRecord(name)
      const snapshotStartingTime = benchmark.timestamp()
      const snapshot = createSnapshot(window.document, {}, benchmark)
      benchmark.recordDuration('snapshotTime', snapshotStartingTime)
      if (snapshot === null) throw new AssertionError({ message: 'snapshot html should be defined' })
      benchmark.recordSize('htmlSize', content.length)
      benchmark.recordSize('snapshotSize', snapshot.length)
    }
    benchmark.summarize()
  })
})

function ratio(compressed: number, original: number) {
  return Math.round((100 * (original - compressed)) / original)
}
