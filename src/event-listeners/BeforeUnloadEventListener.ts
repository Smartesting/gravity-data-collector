import UserActionHandler from '../user-action/UserActionHandler'
import EventListener from '../event-listeners/EventListener'
import { UserActionType } from '../types'

class BeforeUnloadEventListener extends EventListener {
  constructor(userActionHandler: UserActionHandler, window: Window) {
    super(userActionHandler, 'beforeunload' as UserActionType, window)
  }

  async listener(event: Event) {
    this.userActionHandler.flush()
  }
}

export default BeforeUnloadEventListener
