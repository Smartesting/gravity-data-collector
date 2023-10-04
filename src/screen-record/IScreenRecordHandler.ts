export default interface IScreenRecordHandler {
  handle: (screenRecord: unknown) => void

  flush: () => void
}

export class NopScreenRecordHandler implements IScreenRecordHandler {
  handle(): void {}

  flush(): void {}
}
