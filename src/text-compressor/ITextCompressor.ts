export default interface ITextCompressor {
  compress: (text: string) => string

  decompress: (text: string) => string
}
