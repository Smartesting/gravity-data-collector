export function computePathname(href: string): string {
  const { pathname, hash } = new URL(href)
  if (!hash) return pathname
  const cleanedHash = hash.split('?')[0].replace(/^#\/?/, '/')
  const cleanedPathname = pathname.replace(/\/$/, '')

  return `${cleanedPathname}${cleanedHash}`
}
