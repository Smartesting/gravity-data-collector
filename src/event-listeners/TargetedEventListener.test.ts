import TargetedEventListener from './TargetedEventListener'
import { AnonymizationSettings, UserActionType } from '../types'
import IUserActionHandler from '../user-action/IUserActionHandler'

import * as createTargetedUserActionModule from '../user-action/createTargetedUserAction'
import { expect, vi, SpyInstance } from 'vitest'

class CustomEventListener extends TargetedEventListener {
  userActionType = UserActionType.Reset
}
describe('TargetedEventListener', () => {
  const userActionHandler: IUserActionHandler = {
    handle: () => {},
  }

  const event: Event = {
    bubbles: false,
    cancelBubble: false,
    cancelable: false,
    composed: false,
    currentTarget: null,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: false,
    returnValue: false,
    srcElement: null,
    target: null,
    timeStamp: 0,
    type: '',
    composedPath: () => {
      throw new Error('Function not implemented.')
    },
    initEvent: () => {
      throw new Error('Function not implemented.')
    },
    preventDefault: () => {
      throw new Error('Function not implemented.')
    },
    stopImmediatePropagation: () => {
      throw new Error('Function not implemented.')
    },
    stopPropagation: () => {
      throw new Error('Function not implemented.')
    },
    AT_TARGET: 0,
    BUBBLING_PHASE: 0,
    CAPTURING_PHASE: 0,
    NONE: 0,
  }
  let createTargetedUserActionSpy: SpyInstance

  beforeEach(() => {
    createTargetedUserActionSpy = vi
      .spyOn(createTargetedUserActionModule, 'createTargetedUserAction')
      .mockImplementation(() => null)
  })

  afterEach(() => {
    createTargetedUserActionSpy.mockRestore()
  })

  describe('when getAnonymizationSettings is not provided', () => {
    it('uses undefined as AnonymizationSettings', () => {
      const eventListener = new CustomEventListener(userActionHandler, window, {})
      eventListener.listener(event)

      expect(createTargetedUserActionSpy).toHaveBeenCalledOnce()
      expect(createTargetedUserActionSpy).toHaveBeenCalledWith(event, UserActionType.Reset, {
        anonymizationSettings: undefined,
        document: window.document,
      })
    })
  })

  it('builds the anonymizeSettings based on the function that was provided', () => {
    const anonymizationSettings: AnonymizationSettings = {
      anonymize: true,
      allowList: [{ pageMatcher: '.*', allowedSelectors: ['header', 'footer'] }],
    }
    const eventListener = new CustomEventListener(userActionHandler, window, {
      getAnonymizationSettings: () => anonymizationSettings,
    })
    eventListener.listener(event)
    expect(createTargetedUserActionSpy).toHaveBeenCalledOnce()
    expect(createTargetedUserActionSpy).toHaveBeenCalledWith(event, UserActionType.Reset, {
      anonymizationSettings,
      document: window.document,
    })
  })
})
