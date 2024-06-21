export type Message =
  | {
      action: 'startNewSession'
    }
  | {
      action: 'updateDebugMode'
      value: boolean
    }
  | {
      action: 'updateGravityServerUrl'
      url: string
    }
  | {
      action: 'updateAuthKey'
      authKey: string
    }
  | {
      action: 'updateAuthorisedSites'
      sites: Array<string>
    }
  | {
      action: 'updateRequestInterval'
      interval: number
    }
  | {
      action: 'updateUseHashInUrlAsPathname'
      value: boolean
    }
  | {
      action: 'updateInlineResources'
      value: boolean
    }
