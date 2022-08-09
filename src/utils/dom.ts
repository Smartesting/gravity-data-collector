export function isCheckableElement(element: HTMLElement) {
  switch ((element as HTMLInputElement).type) {
    case 'checkbox':
    case 'radio':
      return true
    default:
      return false
  }
}
