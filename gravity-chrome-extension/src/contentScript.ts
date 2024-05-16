import GravityCollector from '../../src'
import { CollectorOptions } from '../../src/types'

const authorizedSites = [
    'neolink.link',
]

const options: Partial<CollectorOptions> = {
    // authKey: '********-****-****-****-************',
    // gravityServerUrl: '****',
}

if (authorizedSites.some(authorized => window.location.href.includes(authorized))) {
    GravityCollector.init(options)
}
