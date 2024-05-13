export interface IBenchmark {
  newRecord: (name: string) => number

  timestamp: () => number

  record: (property: string, info: any) => number

  recordTime: (property: string, fromTimestamp?: number) => number

  recordSize: (property: string, size: number) => number

  summarize: () => void
}
