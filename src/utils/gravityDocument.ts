import { GravityDocument } from '../types'
import windowExists from './windowExists'

export default function gravityDocument(): GravityDocument {
  return { title: windowExists() ? window.document.title : '' }
}
