import EventListener from '../event-listeners/EventListener'
import { UserActionType } from '../types'
import IUserActionHandler from '../user-action/IUserActionHandler'

class BeforeUnloadEventListener extends EventListener {
  constructor(userActionHandler: IUserActionHandler, window: Window, private readonly onDispose: Function) {
    super(userActionHandler, 'beforeunload' as UserActionType, window)
  }

  async listener(event: Event) {
    this.onDispose()
  }
}

export default BeforeUnloadEventListener
