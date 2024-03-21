import { CookieOptions, CookieSettings, CookieStrategy } from '../types'
import psl from 'psl'

export interface MinimalWindow {
  document: {
    cookie: string
    location?: { hostname: string } | null
  }
}

export default class DocumentCookie {
  constructor(private readonly cookieSettings: CookieSettings, private readonly win: MinimalWindow = window) {}

  write(key: string, value: string) {
    const cookieOptions: Partial<CookieOptions> = {}

    cookieOptions.Path = '/'
    if (this.cookieSettings.cookieStrategy === CookieStrategy.subDomains) {
      cookieOptions.Domain = this.getDomain()
    }

    if (this.cookieSettings.cookieStrategy === CookieStrategy.iframeEmbedding) {
      cookieOptions.SameSite = 'None'
      cookieOptions.Secure = true
    }

    const cookieWriterFn = this.cookieSettings.cookieWriter ?? cookieWriter
    this.win.document.cookie = cookieWriterFn(key, encodeURIComponent(value), cookieOptions)
  }

  read(key: string): string | undefined {
    const match = this.win.document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`))
    return match !== null ? decodeURIComponent(match[2]) : undefined
  }

  private getDomain(): string | undefined {
    const { location } = this.win.document

    if (location !== null && location !== undefined) {
      const parsedDomain = psl.parse(location.hostname)
      if (isParsedDomain(parsedDomain) && parsedDomain.domain !== null) {
        return psl.isValid(parsedDomain.domain) ? parsedDomain.domain : parsedDomain.input
      }
    }

    return undefined
  }
}

function cookieWriter(key: string, value: string, options: Partial<CookieOptions>): string {
  const parts: string[] = Object.entries(options).reduce(
    (cookie, [key, value]) => {
      if (typeof value === 'string') {
        cookie.push(`${key}=${value}`)
      } else if (value) {
        cookie.push(`${key}`)
      }
      return cookie
    },
    [`${key}=${value}`],
  )

  return parts.join('; ')
}

function isParsedDomain(toBeDetermined: any): toBeDetermined is psl.ParsedDomain {
  return (toBeDetermined as psl.ParsedDomain).error === undefined
}
