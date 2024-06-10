import { GravityLocation } from '../types'

export default function gravityLocation(location: Location): GravityLocation {
  const { href, pathname, search } = location
  return {
    href,
    pathname,
    search: search.slice(1),
  }
}
