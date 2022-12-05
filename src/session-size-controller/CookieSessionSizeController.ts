import { BaseSessionSizeController } from './ISessionSizeController'
import { readCookie, setCookie } from '../utils/documentCookie'
import { UserAction } from '../types'

const GRAVITY_COOKIE_KEY_SESSION_THRESHOLD_REACHED = 'gravity_session_threshold_reached'
const GRAVITY_COOKIE_KEY_PENDING_USER_ACTIONS = 'gravity_session_pending_user_actions'

export class CookieSessionSizeController extends BaseSessionSizeController {
  protected isThresholdReached(): boolean {
    return readCookie(GRAVITY_COOKIE_KEY_SESSION_THRESHOLD_REACHED) === '1'
  }

  protected setThresholdReached(): void {
    setCookie(GRAVITY_COOKIE_KEY_SESSION_THRESHOLD_REACHED, '1')
  }

  protected getPendingUserActions(): readonly UserAction[] {
    const cookie = readCookie(GRAVITY_COOKIE_KEY_PENDING_USER_ACTIONS)
    return cookie === undefined ? [] : JSON.parse(cookie)
  }

  protected setPendingUserActions(pendingUserActions: readonly UserAction[]): void {
    setCookie(GRAVITY_COOKIE_KEY_PENDING_USER_ACTIONS, JSON.stringify(pendingUserActions))
  }
}
