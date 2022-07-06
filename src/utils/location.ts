import { GravityLocation } from '../types'
import windowExists from './windowExists'

function location(): GravityLocation {
  if (!windowExists()) {
    return {
      href: '',
      pathname: '',
      search: ''
    }
  }

  const { href, pathname } = window.location
  const search = window.location.search.slice(1)

  return {
    href,
    pathname,
    search
  }
}

export default location
