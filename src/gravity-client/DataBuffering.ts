export interface DataBufferingOptions<Data, Response> {
  handleData: (data: ReadonlyArray<Data>) => Promise<Response>
  handleInterval: number
  onFlush?: (buffer: ReadonlyArray<Data>, response: Response) => void
  locked?: boolean
}

export class DataBuffering<Data, Response> {
  private readonly buffer: Data[] = []
  private readonly interval: NodeJS.Timer | null = null
  private locked: boolean = false
  private active = false

  constructor(private readonly options: DataBufferingOptions<Data, Response>) {
    if (options.handleInterval > 0) {
      this.interval = setInterval(() => {
        void this.flush()
      }, options.handleInterval)
    }
    this.locked = options.locked ?? false
  }

  activate() {
    this.active = true
    if (this.interval === null) void this.flush()
  }

  unlock() {
    this.locked = false
    if (this.interval === null) void this.flush()
  }

  async addData(data: Data): Promise<void> {
    this.buffer.push(data)
    if (this.interval === null) await this.flush()
  }

  async flush() {
    if (!this.active || this.buffer.length === 0 || this.locked) return
    const data = this.buffer.splice(0, this.buffer.length)
    const handleResponse = await this.options.handleData(data)
    this.options.onFlush?.(data, handleResponse)
  }
}
