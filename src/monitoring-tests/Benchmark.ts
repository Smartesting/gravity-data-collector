type BenchmarkRecord = Record<string, any>

export class Benchmark {
  private flag = performance.now()
  private currentRecord: BenchmarkRecord = {}
  private readonly records: BenchmarkRecord[] = []

  newRecord(name: string): number {
    this.flush()
    this.currentRecord.name = name
    return this.timestamp()
  }

  timestamp(): number {
    this.flag = performance.now()
    return this.flag
  }

  record(property: string, info: any): number {
    this.currentRecord[property] = info
    return this.timestamp()
  }

  recordDuration(property: string, fromTimestamp?: number): number {
    return this.recordTime(property, fromTimestamp)
  }

  recordTime(property: string, fromTimestamp?: number): number {
    return this.record(toTimeProperty(property), Math.round(performance.now() - (fromTimestamp ?? this.flag)))
  }

  recordSize(property: string, size: number): number {
    return this.record(toSizeProperty(property), size)
  }

  summarize(withStats = true, logger: (data: any) => void = console.table) {
    this.flush()

    const min: Record<string, number> = {}
    const max: Record<string, number> = {}
    const totals: Record<string, number> = {}
    const size = this.records.length
    for (const record of this.records) {
      Object.entries(record).forEach(([property, value]) => {
        if (typeof value !== 'number') return
        min[property] = min[property] !== undefined ? Math.min(min[property], value) : value
        max[property] = max[property] !== undefined ? Math.max(max[property], value) : value
        totals[property] = totals[property] !== undefined ? totals[property] + value : value
        record[property] = humanizeValue(property, value)
      })
    }
    if (withStats) {
      this.newRecord('-- MIN --')
      for (const [property, value] of Object.entries(min)) {
        this.record(property, humanizeValue(property, value))
      }
      this.newRecord('-- MAX --')
      for (const [property, value] of Object.entries(max)) {
        this.record(property, humanizeValue(property, value))
      }
      this.newRecord('-- AVG --')
      for (const [property, value] of Object.entries(totals)) {
        this.record(property, humanizeValue(property, Math.round((10 * value) / size) / 10))
      }
    }
    this.flush()

    return logger(this.records)
  }

  private flush() {
    if (Object.keys(this.currentRecord).length > 0) {
      this.records.push(this.currentRecord)
      this.currentRecord = {}
    }
  }
}

export function humanizeDuration(ms: number): string {
  ms = Math.round(ms)
  const seconds = Math.trunc(ms / 1000)
  if (seconds === 0) return `${ms} ms`
  const minutes = Math.trunc(seconds / 60)
  if (minutes === 0) return `${seconds} s ${ms - 1000 * seconds} ms`
  const hours = Math.trunc(minutes / 60)
  if (hours === 0) return `${minutes} min ${seconds - 60 * minutes} s`
  return `${minutes} hr ${minutes - 60 * hours} min`
}

export function humanizeLength(length: number): string {
  const kilos = Math.trunc(length / 1024)
  if (kilos === 0) return `${length}`
  const megas = Math.trunc(kilos / 1024)
  if (megas === 0) {
    return `${kilos}.${Math.round((length - 1024 * kilos) / 10)}k`
  }
  return `${megas}.${Math.round((kilos - 1024 * megas) / 10)}M`
}

function isSizeProperty(property: string) {
  return property.startsWith('s_')
}

function isTimeProperty(property: string) {
  return property.startsWith('t_')
}

function toSizeProperty(property: string) {
  return 's_' + property
}

function toTimeProperty(property: string) {
  return 't_' + property
}

function humanizeValue(property: string, value: number) {
  if (isTimeProperty(property)) return humanizeDuration(value)
  if (isSizeProperty(property)) return humanizeLength(value)
  return value
}
