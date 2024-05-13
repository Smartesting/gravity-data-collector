import { IBenchmark } from './IBenchmark'

export class AtatusBenchmark implements IBenchmark {
  private flag = performance.now()

  newRecord(): number {
    return this.timestamp()
  }

  timestamp(): number {
    this.flag = performance.now()
    return this.flag
  }

  record(property: string, info: any): number {
    // @ts-expect-error
    if (window.atatus && typeof info === 'number') {
      // @ts-expect-error
      window.atatus.recordTransaction(`@smartesting/gravity-data-collector[${property}]`, info, true)
    }
    return this.timestamp()
  }

  recordTime(property: string, fromTimestamp?: number): number {
    return this.record(toTimeProperty(property), Math.round(performance.now() - (fromTimestamp ?? this.flag)))
  }

  recordSize(property: string, size: number): number {
    return this.record(toSizeProperty(property), size)
  }

  summarize() {}
}

function toSizeProperty(property: string) {
  return 's_' + property
}

function toTimeProperty(property: string) {
  return 't_' + property
}
