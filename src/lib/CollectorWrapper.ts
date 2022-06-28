import { v4 as uuidv4 } from 'uuid';
import TLogHandler from './log-handlers/TLogHandler';
import GravityLogHandler from './log-handlers/toGravity';
import {DebuggerLogHandler} from './log-handlers/toDebug';
import ClickEventHandler from './event-handlers/ClickEventHandler';
import FocusOutEventHandler from './event-handlers/FocusOutEventHandler';
import {createSessionEvent} from '../utils/createSessionEvent';

class CollectorWrapper {
  options?: TCollectorOptions
  logHandler: TLogHandler

  constructor(authKey: string, options?: TCollectorOptions) {
      this.options = options

      const sessionId = uuidv4()

      if (this.options && this.options.debug) {
          this.logHandler = new DebuggerLogHandler(authKey, sessionId)
      } else {
          this.logHandler = new GravityLogHandler(authKey, sessionId, (options && options.baseUrl) || null, (options && options.authorizeBatch) || false)
      }

      this.initSession()
      this.initializeEventHandlers()
  }

  private initSession() {
    const log = createSessionEvent()
    return this.logHandler.run(log)
  }

  private initializeEventHandlers() {
    new ClickEventHandler(this.logHandler).init()
    new FocusOutEventHandler(this.logHandler).init()
  }
}

export default CollectorWrapper
