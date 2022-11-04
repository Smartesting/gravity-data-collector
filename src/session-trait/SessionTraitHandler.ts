import { SessionTraits, SessionTraitValue } from '../types'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'

export default class SessionTraitHandler {
  private buffer: SessionTraits = {}
  private readonly timer?: NodeJS.Timer

  constructor(
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly requestInterval: number,
    private readonly output: (sessionId: string, traits: SessionTraits) => void,
  ) {
    if (requestInterval > 0) {
      this.timer = setInterval(() => {
        void this.flush()
      }, requestInterval)
    }
  }

  handle(traitName: string, traitValue: SessionTraitValue) {
    this.buffer[traitName] = traitValue
    if (this.timer == null) {
      this.flush()
    }
  }

  flush() {
    if (Object.keys(this.buffer).length === 0) {
      return
    }
    this.output(this.sessionIdHandler.get(), this.buffer)
    this.buffer = {}
  }
}
