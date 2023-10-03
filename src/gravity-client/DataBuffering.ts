export interface DataBufferingOptions<Data, Response> {
  handleData: (data: ReadonlyArray<Data>) => Promise<Response>
  handleInterval?: number
}

export class DataBuffering<Data, Response> {
  constructor(private readonly options: DataBufferingOptions<Data, Response>) {}

  async addData(data: Data): Promise<void> {
    throw new Error('NYI')
  }
}
