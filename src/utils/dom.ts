export function isCheckableElement(element: HTMLElement) {
  switch ((element as HTMLInputElement).type) {
    case 'checkbox':
    case 'radio':
      return true
    default:
      return false
  }
}

export function isFormRelated(element: any) {
  return element.form !== undefined
}
