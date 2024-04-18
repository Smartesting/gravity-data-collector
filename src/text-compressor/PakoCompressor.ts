import pako from 'pako'
import ITextCompressor from './ITextCompressor'
import { strFromU8, strToU8 } from 'fflate'

export default class PakoCompressor implements ITextCompressor {
  compress(text: string): string {
    return strFromU8(pako.deflateRaw(text), true)
  }

  decompress(text: string): string {
    return pako.inflateRaw(strToU8(text, true), { to: 'string' })
  }
}
