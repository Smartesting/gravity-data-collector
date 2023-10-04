import { IGravityClient } from '../gravity-client/IGravityClient'
import IScreenRecordHandler from './IScreenRecordHandler'

export default class ScreenRecordHandler implements IScreenRecordHandler {
  constructor(private readonly gravityClient: IGravityClient) {}

  handle(screenRecord: unknown) {
    this.gravityClient
      .addScreenRecord(screenRecord)
      .then(() => {})
      .catch(() => {})
  }

  flush(): void {
    this.gravityClient.flush()
  }
}
