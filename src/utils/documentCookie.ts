import psl from 'psl'

export function setCookie(key: string, value: string, win = window) {
  let cookie = `${key}=${encodeURIComponent(value)}; Path=/`
  const { location } = win.document

  if (location !== null && location !== undefined) {
    const parsedDomain = psl.parse(location.hostname)
    if (isParsedDomain(parsedDomain) && parsedDomain.domain !== null) {
      const domain = psl.isValid(parsedDomain.domain) ? parsedDomain.domain : parsedDomain.input
      cookie += `; Domain=${domain}`
    }
  }
  win.document.cookie = cookie
}

export function readCookie(key: string, win = window): string | undefined {
  const match = win.document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`))
  return match !== null ? decodeURIComponent(match[2]) : undefined
}

function isParsedDomain(toBeDetermined: any): toBeDetermined is psl.ParsedDomain {
  return (toBeDetermined as psl.ParsedDomain).error === undefined
}
