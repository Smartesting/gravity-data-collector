import { CookieOptions, CookieStrategy } from '../types'
import { describe, expect, it } from 'vitest'
import { clearCookies } from '../test-utils/clearCookies'
import DocumentCookie, { MinimalWindow } from './DocumentCookie'

describe('DocumentCookie', () => {
  let documentCookie: DocumentCookie
  const fakeWindow: MinimalWindow = {
    document: {
      cookie: '',
      location: {
        hostname: 'app.example.com',
      },
    },
  }

  beforeEach(() => {
    clearCookies()
    documentCookie = new DocumentCookie({
      cookieWriter: null,
      cookieStrategy: CookieStrategy.default,
    })
  })

  it('writes and read cookie', () => {
    documentCookie.write('myKey', 'someValue')
    const readValue = documentCookie.read('myKey')
    expect(readValue).toEqual('someValue')
  })

  it('properly encodes and decode the cookie value', () => {
    documentCookie.write('toEncode', '/whatever/')
    const readValue = documentCookie.read('toEncode')
    expect(readValue).toEqual('/whatever/')
    expect(document.cookie).toContain('toEncode=%2Fwhatever%2F')
  })

  describe('when strategy is CookieStrategy.default', () => {
    it('sets the Path to /', () => {
      documentCookie = new DocumentCookie(
        {
          cookieWriter: null,
          cookieStrategy: CookieStrategy.default,
        },
        fakeWindow,
      )

      documentCookie.write('someKey', 'someOtherValue')
      expect(fakeWindow.document.cookie).toEqual('someKey=someOtherValue; Path=/')
    })
  })

  describe('when the strategy is CookieStrategy.subDomains', () => {
    const cookieSettings = {
      cookieWriter: null,
      cookieStrategy: CookieStrategy.subDomains,
    }

    it('only sets the Path to / when the hostname is not available', () => {
      const fakeWindow = { document: { cookie: '' } }
      documentCookie = new DocumentCookie(cookieSettings, fakeWindow)

      documentCookie.write('someKey', 'someOtherValue')
      expect(fakeWindow.document.cookie).toEqual('someKey=someOtherValue; Path=/')
    })

    it('sets the Path to / and the Domain to the root domain if available', () => {
      documentCookie = new DocumentCookie(cookieSettings, fakeWindow)

      documentCookie.write('someKey', 'someOtherValue')
      expect(fakeWindow.document.cookie).toEqual('someKey=someOtherValue; Path=/; Domain=example.com')
    })
  })

  describe('when the strategy is CookieStrategy.iframeEmbedding', () => {
    const cookieSettings = {
      cookieWriter: null,
      cookieStrategy: CookieStrategy.iframeEmbedding,
    }

    it('sets the Path to /, SameSite as none and Secure', () => {
      documentCookie = new DocumentCookie(cookieSettings, fakeWindow)

      documentCookie.write('someKey', 'someOtherValue')
      expect(fakeWindow.document.cookie).toEqual('someKey=someOtherValue; Path=/; SameSite=None; Secure')
    })
  })

  describe('when cookieWriter is specified', () => {
    it('sets the cookie as specified by the function', () => {
      documentCookie = new DocumentCookie(
        {
          cookieStrategy: CookieStrategy.default,
          cookieWriter: (key, value) => `${key}=---${value}---;`,
        },
        fakeWindow,
      )

      documentCookie.write('someKey', 'someOtherValue')
      expect(fakeWindow.document.cookie).toEqual('someKey=---someOtherValue---;')
    })

    it('provides the default options to cookieWriter', () => {
      let calledWith: Partial<{
        key: string
        value: string
        options: Partial<CookieOptions>
      }> = {}

      function cookieWriter(key: string, value: string, options: Partial<CookieOptions>) {
        calledWith = { key, value, options }
        return `${key}=${value}`
      }

      new DocumentCookie(
        {
          cookieStrategy: CookieStrategy.default,
          cookieWriter,
        },
        fakeWindow,
      ).write('someKey', '/whatever/')
      expect(calledWith).toEqual({ key: 'someKey', value: '%2Fwhatever%2F', options: { Path: '/' } })

      new DocumentCookie(
        {
          cookieStrategy: CookieStrategy.subDomains,
          cookieWriter,
        },
        fakeWindow,
      ).write('someKey', 'someValue')
      expect(calledWith).toEqual({ key: 'someKey', value: 'someValue', options: { Path: '/', Domain: 'example.com' } })

      new DocumentCookie(
        {
          cookieStrategy: CookieStrategy.iframeEmbedding,
          cookieWriter,
        },
        fakeWindow,
      ).write('someKey', 'someValue')
      expect(calledWith).toEqual({
        key: 'someKey',
        value: 'someValue',
        options: { Path: '/', Secure: true, SameSite: 'None' },
      })
    })
  })
})
