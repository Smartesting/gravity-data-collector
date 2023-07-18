export function setCookie(key: string, value: string) {
  document.cookie = `${key}=${encodeURIComponent(value)}; Path=/`
}

export function readCookie(key: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`))
  return match !== null ? decodeURIComponent(match[2]) : undefined
}
