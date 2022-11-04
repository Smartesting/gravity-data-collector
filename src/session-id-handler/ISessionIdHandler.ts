export default interface ISessionIdHandler {
  isSet: () => boolean

  get: () => string

  set: (sessionId: string) => void
}
