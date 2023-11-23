export function retrieveUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input
  }
  if (isRequest(input)) {
    return input.url
  }
  if (isURL(input)) {
    return input.toString()
  }
  throw new Error(`Unknown type for ${JSON.stringify(input)}`)
}

export function isRequest(toBeDetermined: unknown): toBeDetermined is Request {
  const request = toBeDetermined as Request
  return request.url !== undefined
}

export function isURL(toBeDetermined: unknown): toBeDetermined is URL {
  const request = toBeDetermined as URL
  return request.protocol !== undefined && request.pathname !== undefined && request.toString() !== undefined
}
