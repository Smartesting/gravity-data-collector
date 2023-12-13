export default interface ITimeoutHandler {
  isExpired: () => boolean

  reset: () => void
}
