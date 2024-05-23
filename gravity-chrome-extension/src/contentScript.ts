import GravityCollector from '../../src'
import { CollectorOptions } from '../../src/types'

const authorizedSites = [
    '*********.com',
]

const options: Partial<CollectorOptions> = {
    // authKey: '********-****-****-****-************',
    // gravityServerUrl: '****',
}

if (authorizedSites.some(authorized => window.location.href.includes(authorized))) {
    GravityCollector.init(options)
}
