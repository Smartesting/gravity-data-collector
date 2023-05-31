import psl from 'psl'

export function setCookie(key: string, value: string) {
  let cookie = `${key}=${encodeURIComponent(value)}; Path=/`
  const parsedDomain = psl.parse(document.location.hostname)
  if (isParsedDomain(parsedDomain) && parsedDomain.domain !== null) {
    const domain: string = parsedDomain.domain
    cookie += `; Domain=${domain}`
  }

  document.cookie = cookie
}

export function readCookie(key: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`))
  // TODO: remove this once the one-action sessions bug has been solved.
  console.log({ cookie: document.cookie, key, match })
  return match !== null ? decodeURIComponent(match[2]) : undefined
}

function isParsedDomain(toBeDetermined: any): toBeDetermined is psl.ParsedDomain {
  return (toBeDetermined as psl.ParsedDomain).error === undefined
}
