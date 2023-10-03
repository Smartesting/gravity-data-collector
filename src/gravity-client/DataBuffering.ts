export interface DataBufferingOptions<Data, Response> {
  handleData: (data: ReadonlyArray<Data>) => Promise<Response>
  handleInterval: number
}

export class DataBuffering<Data, Response> {
  private readonly buffer: Data[] = []
  private readonly interval: NodeJS.Timer | null = null

  constructor(private readonly options: DataBufferingOptions<Data, Response>) {
    if (options.handleInterval > 0) {
      this.interval = setInterval(() => {
        this.flush()
      }, options.handleInterval)
    }
  }

  async addData(data: Data): Promise<void> {
    this.buffer.push(data)
    if (this.interval === null) this.flush()
  }

  private flush() {
    if (this.buffer.length === 0) return
    const data = this.buffer.splice(0, this.buffer.length)
    this.options
      .handleData(data)
      .then(() => {
      })
      .catch(() => {})
  }
}
