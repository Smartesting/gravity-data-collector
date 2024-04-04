import { computePathname } from './computePathname'

export default function getLocationPathname(window: Window, options: { useHashInUrlAsPathname: boolean }): string {
  if (options.useHashInUrlAsPathname) {
    return computePathname(window.location.href)
  }
  return window.location.pathname
}
