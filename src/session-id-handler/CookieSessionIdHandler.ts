import ISessionIdHandler from './ISessionIdHandler'
import psl from 'psl'

const GRAVITY_SESSION_ID_COOKIE_KEY = 'gravity_session_id'

export default class CookieSessionIdHandler implements ISessionIdHandler {
    get(): string {
        const match = document.cookie.match(new RegExp(`(^| )${GRAVITY_SESSION_ID_COOKIE_KEY}=([^;]+)`))
        if (match === null) throw new Error('Set session id before using it')
        return match[2]
    }

    isSet(): boolean {
        return document.cookie.includes(GRAVITY_SESSION_ID_COOKIE_KEY)
    }

    set(sessionId: string): void {
        let cookie = `${GRAVITY_SESSION_ID_COOKIE_KEY}=${sessionId}`
        const parsedDomain = psl.parse(document.location.hostname)
        if (isParsedDomain(parsedDomain) && parsedDomain.domain !== null) {
            const domain: string = parsedDomain.domain
            cookie += `; domain=${domain}`
        }

        document.cookie = cookie
    }
}

function isParsedDomain(toBeDetermined: any): toBeDetermined is psl.ParsedDomain {
    return (toBeDetermined as psl.ParsedDomain).error === undefined
}
