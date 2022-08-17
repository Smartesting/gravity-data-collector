export default interface SessionIdHandler {
  isSet: () => boolean

  get: () => string

  set: (sessionId: string) => void
}
