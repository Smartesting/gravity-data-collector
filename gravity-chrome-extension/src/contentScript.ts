import GravityCollector from '../../src'
import { CollectorOptions } from '../../src/types'
import { uuid } from '../../src/utils/uuid'

export type MESSAGE_TYPE = {
    action: string,
    authKey: string,
    authorizedSites: string[]
}

let authorizedSites: string[] = []

const options: Partial<CollectorOptions> = {
    requestInterval: 0
}

chrome.storage.local.get(
    ["authenticationKey", "authorizedSites"],
    function (settings) {
        if (settings.authenticationKey) {
            options.authKey = settings.authenticationKey;
            if (!options.authKey || options.authKey.length === 0) {
                options.debug = true
            } else {
                options.debug = false
            }
        }
        if (settings.authorizedSites) {
            authorizedSites = settings.authorizedSites;
        }
        if (options.authKey && options.authKey.length > 0 && authorizedSites.some(authorized => window.location.href.includes(authorized))) {
            GravityCollector.init(options)
        }
    }
);

chrome.runtime.onMessage.addListener((message: MESSAGE_TYPE) => {
    switch (message.action) {
        case 'newSession':
            if (authorizedSites.some(authorized => window.location.href.includes(authorized))) {
                GravityCollector.initWithOverride(options, uuid())
            }
            break
        case 'newAuthenticationKey':
            if (message.authKey !== undefined) {
                options.authKey = message.authKey
                if (!options.authKey || options.authKey.length === 0) {
                    options.debug = true
                } else {
                    options.debug = false
                }
            }
            break;
        case 'newAuthorizedSites':
            if (message.authorizedSites !== undefined) {
                authorizedSites = message.authorizedSites
            }
            break;
        default:
            console.log('Unknown gravity chrome extension action: ' + message.action)
    }
})
