import TLogHandler from './TLogHandler'

export class DebuggerLogHandler implements TLogHandler {
  private authKey: string
  private sessionId: string

  constructor(authKey: string, sessionId: string) {
    this.authKey = authKey
    this.sessionId = sessionId
  }

  run(log: Log) {
    console.debug('[GL DEBUG]')
    console.debug('Session: ', this.sessionId)
    console.debug('authKey: ', this.authKey)
    console.debug(log)
  }
}