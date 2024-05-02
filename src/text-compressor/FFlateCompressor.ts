import ITextCompressor from './ITextCompressor'

import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate'
import { Compressor } from '../types'

const FFLateCompressor: ITextCompressor = {
  compress(text: string): { compressed: string, compressor: Compressor } {
    return {
      compressed: strFromU8(zlibSync(strToU8(text)), true),
      compressor: Compressor.fflate,
    }
  },

  decompress(text: string): string {
    return strFromU8(unzlibSync(strToU8(text, true)))
  },
}
export default FFLateCompressor
