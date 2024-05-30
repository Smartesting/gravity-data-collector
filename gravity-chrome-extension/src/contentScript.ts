import GravityCollector from '../../src'
import { CollectorOptions } from '../../src/types'
import { uuid } from '../../src/utils/uuid'

const authorizedSites = [
    '*****',
]

const options: Partial<CollectorOptions> = {
    requestInterval: 0
}

chrome.storage.local.get(
    ["authenticationKey"],
    function (settings) {
        if (settings.authenticationKey) {
            options.authKey = settings.authenticationKey;
        }
        if (options.authKey && options.authKey.length > 0 && authorizedSites.some(authorized => window.location.href.includes(authorized))) {
            GravityCollector.init(options)
        }
    }
);

chrome.runtime.onMessage.addListener((message: { action: string, value?: string }) => {
    switch (message.action) {
        case 'newSession':
            if (authorizedSites.some(authorized => window.location.href.includes(authorized))) {
                GravityCollector.initWithOverride(options, uuid())
            }
            break
        case 'newAuthenticationKey':
            if (message.value !== undefined) {
                options.authKey = message.value
            }
            break;
        default:
            console.log('Unknown gravity chrome extension action: ' + message.action)
    }
})
