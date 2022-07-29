import { GravityDocument } from '../types'
import windowExists from './windowExists'

function gravityDocument(): GravityDocument {
  if (!windowExists()) {
    return {
      title: '',
    }
  }

  const { title } = window.document

  return { title }
}

export default gravityDocument
