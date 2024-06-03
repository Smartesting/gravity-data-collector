import { GravityDocument } from '../types'

export default function gravityDocument(document: Document): GravityDocument {
  return { title: document.title }
}
