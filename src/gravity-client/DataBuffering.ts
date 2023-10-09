export interface DataBufferingOptions<Data, Response> {
  handleData: (data: ReadonlyArray<Data>) => Promise<Response>
  handleInterval: number
  onFlush?: (buffer: ReadonlyArray<Data>, response: Response) => void
  isFlushingAllowed?: boolean
}

export class DataBuffering<Data, Response> {
  private readonly buffer: Data[] = []
  private readonly interval: NodeJS.Timer | null = null
  private isFlushingAllowed: boolean = true

  constructor(private readonly options: DataBufferingOptions<Data, Response>) {
    if (options.handleInterval > 0) {
      this.interval = setInterval(() => {
        void this.flush()
      }, options.handleInterval)
    }
    if (options.isFlushingAllowed !== undefined) {
      this.isFlushingAllowed = options.isFlushingAllowed
    }
  }

  public setIsFlushingAllowed(isFlushingAllowed: boolean) {
    this.isFlushingAllowed = isFlushingAllowed
  }

  public getIsFlushingAllowed() {
    return this.isFlushingAllowed
  }

  async addData(data: Data): Promise<void> {
    this.buffer.push(data)
    if (this.interval === null) await this.flush()
  }

  async flush() {
    if (this.buffer.length === 0 || !this.isFlushingAllowed) return
    const data = this.buffer.splice(0, this.buffer.length)
    const handleResponse = await this.options.handleData(data)
    this.options.onFlush?.(data, handleResponse)
  }
}
