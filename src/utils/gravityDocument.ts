import { GravityDocument } from '../types'
import maskText from './maskText'

export default function gravityDocument(document: Document): GravityDocument {
  return { title: maskText(document.title) }
}
