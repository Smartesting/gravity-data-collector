import TLogHandler from './TLogHandler'

export default class GravityLogHandler implements TLogHandler {
  readonly DEFAULTSERVERBASEURL = "https://gravity.smartesting.com"
  readonly LOGBATCHLIMIT = 10

  serverUrl: string
  private authKey: string
  private sessionId: string
  private allowBatch: boolean

  private logQueue: Log[]
  private isRequestIdleCallbackScheduled: boolean

  constructor(authKey: string, sessionId: string, baseServerUrl?: string | null, batch?: boolean | null) {
    this.serverUrl = `${baseServerUrl || this.DEFAULTSERVERBASEURL}/gravitylogger/savelog`
    this.authKey = authKey
    this.sessionId = sessionId
    this.allowBatch = batch || false
    this.logQueue = []
    this.isRequestIdleCallbackScheduled = false
  }

  run(log: Log) {
    this.logQueue.push(log)
    this.schedulePendingEvents()
  }

  private schedulePendingEvents() {
    if (this.isRequestIdleCallbackScheduled)
    return;

    this.isRequestIdleCallbackScheduled = true

    if ('requestIdleCallback' in window) {
      requestIdleCallback(this.pushLogToServer.bind(this))
    } else {
      this.pushLogToServer()
    }
  }

  // requestIdCallback for sending analytics data
  // https://developer.chrome.com/blog/using-requestidlecallback/#using-requestidlecallback-for-sending-analytics-data
  private pushLogToServer(deadline?: { timeRemaining: any } | undefined) {
    this.isRequestIdleCallbackScheduled = false

    if (typeof deadline === 'undefined')
    deadline = { timeRemaining: function () { return Number.MAX_VALUE } }

    while (deadline.timeRemaining() > 0 && this.logQueue.length > 0) {
      let logBatch = null

      if (this.allowBatch) {
        logBatch = []
        while (logBatch.length < this.LOGBATCHLIMIT && this.logQueue.length > 0) {
          if (this.logQueue.length > 0)
          logBatch.push(this.logQueue.shift())
        }
      } else {
        logBatch = this.logQueue.shift()
      }

      fetch(this.serverUrl, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'x-gravity-auth-key': this.authKey,
            'x-gravity-session': this.sessionId
        },
        body: JSON.stringify(logBatch)
      })
    }

    if (this.logQueue.length > 0)
    this.schedulePendingEvents();
  }
}
