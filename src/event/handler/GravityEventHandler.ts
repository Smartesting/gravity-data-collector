import IEventHandler from '../../event/handler/IEventHandler'
import { TEvent } from '../../types'
import { buildGravityTrackingApiUrl } from '../../event/handler/configuration'
import fetch from 'cross-fetch'

export class GravityEventHandler implements IEventHandler {
  constructor(
    private readonly authKey: string,
    private readonly sessionId: string,
    private readonly successCallback: (payload: any) => void = (_payload) => {
    },
    private readonly errorCallback: (reason: string) => void = (_reason) => {
    },
  ) {
  }

  async run(event: TEvent) {
    try {
      const response = await fetch(buildGravityTrackingApiUrl(this.authKey), {
        method: 'POST',
        body: JSON.stringify([event]), // TODO buffering
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 200) {
        this.successCallback(await response.json())
      } else {
        this.errorCallback(`error ${response.status}, ${response.statusText}`)
      }
    } catch (err: any) {
      this.errorCallback(err.message)
    }
  }
}
