import { GravityDocument } from '../types'

export default function gravityDocument(windowInstance: Window): GravityDocument {
  return { title: windowInstance.document.title }
}
