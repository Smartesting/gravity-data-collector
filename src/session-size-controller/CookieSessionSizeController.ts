import { BaseSessionSizeController } from './ISessionSizeController'
import { readCookie, setCookie } from '../utils/documentCookie'

const GRAVITY_COOKIE_KEY_SESSION_THRESHOLD_REACHED = 'gravity_session_threshold_reached'

export class CookieSessionSizeController extends BaseSessionSizeController {
  protected isThresholdReached(): boolean {
    return readCookie(GRAVITY_COOKIE_KEY_SESSION_THRESHOLD_REACHED) === '1'
  }

  protected setThresholdReached(): void {
    setCookie(GRAVITY_COOKIE_KEY_SESSION_THRESHOLD_REACHED, '1')
  }
}
