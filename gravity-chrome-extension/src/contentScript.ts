import GravityCollector from '../../src'
import { CollectorOptions } from '../../src/types'

const authorizedSites = [
    'localhost',
]

const options: Partial<CollectorOptions> = {
    // authKey: '********-****-****-****-************',
    // gravityServerUrl: '****',
}

if (authorizedSites.some(authorized => window.location.href.includes(authorized))) {
    GravityCollector.initWithOverride(options)
}
