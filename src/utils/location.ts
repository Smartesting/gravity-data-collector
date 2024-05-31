import { GravityLocation } from '../types'

function location(windowInstance: Window): GravityLocation {
  const { href, pathname } = windowInstance.location
  const search = windowInstance.location.search.slice(1)

  return {
    href,
    pathname,
    search,
  }
}

export default location
