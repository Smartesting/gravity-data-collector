import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate'
import ITextCompressor from './ITextCompressor'

export default class FFLateCompressor implements ITextCompressor {
  compress(text: string): string {
    return strFromU8(zlibSync(strToU8(text)), true)
  }

  decompress(text: string): string {
    return strFromU8(unzlibSync(strToU8(text, true)))
  }
}
