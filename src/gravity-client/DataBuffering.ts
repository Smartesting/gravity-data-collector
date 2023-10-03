export interface DataBufferingOptions<Data, Response> {
  handleData: (data: ReadonlyArray<Data>) => Promise<Response>
  handleInterval?: number
}

export class DataBuffering<Data, Response> {
  private readonly buffer: Data[] = []
  constructor(private readonly options: DataBufferingOptions<Data, Response>) {}

  async addData(data: Data): Promise<void> {
    if (this.options.handleInterval === 0) await this.options.handleData([data])

    this.buffer.push(data)
    setInterval(() => {
      if (this.buffer.length === 0) return

      this.options
        .handleData(this.buffer)
        .then(() => {
          this.buffer.splice(0, this.buffer.length)
        })
        .catch(() => {})
    }, this.options.handleInterval)
  }
}
