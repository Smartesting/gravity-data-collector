import FFLateCompressor from './FFlateCompressor'
import ITextCompressor from './ITextCompressor'

export default function (): ITextCompressor {
  return new FFLateCompressor()
}
