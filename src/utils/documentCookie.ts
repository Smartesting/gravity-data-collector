import psl from 'psl'

export function setCookie(key: string, value: string) {
  let cookie = `${key}=${value}; path=/`
  const parsedDomain = psl.parse(document.location.hostname)
  if (isParsedDomain(parsedDomain) && parsedDomain.domain !== null) {
    const domain: string = parsedDomain.domain
    cookie += `; domain=${domain}`
  }

  document.cookie = cookie
}

export function readCookie(key: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`))

  return match !== null ? match[2] : undefined
}

function isParsedDomain(toBeDetermined: any): toBeDetermined is psl.ParsedDomain {
  return (toBeDetermined as psl.ParsedDomain).error === undefined
}
