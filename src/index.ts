import 'regenerator-runtime/runtime'
import GravityCollector from './collector/GravityCollector'
import windowExists from './utils/windowExists'

if (windowExists()) {
  ;(window as any).GravityCollector = GravityCollector
}

export default GravityCollector
