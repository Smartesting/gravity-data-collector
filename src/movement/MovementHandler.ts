import { Movement, SessionMovement } from '../types'
import MovementsHistory from '../movement-history/MovementsHistory'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'

export default class MovementHandler {
  private readonly buffer: SessionMovement[] = []
  private readonly timer?: NodeJS.Timer

  constructor(
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly requestInterval: number,
    private readonly output: (sessionActions: SessionMovement[]) => void,
    private readonly onPublish?: (sessionActions: SessionMovement[]) => void,
    private readonly movementsHistory?: MovementsHistory,
  ) {
    if (requestInterval > 0) {
      this.timer = setInterval(() => {
        void this.flush()
      }, requestInterval)
    }
  }

  handle(movement: Movement) {
    this.buffer.push(this.toSessionMovement(movement))
    if (this.movementsHistory !== undefined) this.movementsHistory.push(this.toSessionMovement(movement))
    if (this.timer == null) {
      this.flush()
    }
  }

  flush() {
    if (this.buffer.length === 0) return
    const sessionUserActions = this.buffer.splice(0)
    this.output(sessionUserActions)
    if (this.onPublish !== undefined) {
      this.onPublish(sessionUserActions)
      console.log('useraction published')
    }
  }

  private toSessionMovement(movement: Movement): SessionMovement {
    return {
      sessionId: this.sessionIdHandler.get(),
      ...movement,
    }
  }
}
