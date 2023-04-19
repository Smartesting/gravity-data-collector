import MovementsHistory from './MovementsHistory'
import { Movement } from '../types'

export default class MemoryMovementsHistory implements MovementsHistory {
  private readonly movementsHistory: Movement[] = []

  constructor(private readonly historySize = 5) {}

  getLast(): Movement {
    return this.movementsHistory.slice(-1)[0]
  }

  getUserActionsHistory(): Movement[] {
    return this.movementsHistory
  }

  push(movement: Movement): void {
    if (this.movementsHistory.length === this.historySize) this.movementsHistory.splice(0, 1)
    this.movementsHistory.push(movement)
  }
}
