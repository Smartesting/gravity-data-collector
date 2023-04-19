import { Movement } from '../types'

export default interface MovementsHistory {
  push: (movement: Movement) => void

  getLast: () => Movement

  getUserActionsHistory: () => Movement[]
}
