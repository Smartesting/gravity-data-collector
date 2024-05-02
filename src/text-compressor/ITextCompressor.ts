import { Compressor } from '../types'

export default interface ITextCompressor {
  compress: (text: string) => { compressed: string, compressor: Compressor }

  decompress: (text: string) => string
}
