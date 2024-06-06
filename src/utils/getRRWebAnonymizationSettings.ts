import { AnonymizationSettings } from '../types'
import { recordOptions } from '@smartesting/rrweb'
import { eventWithTime } from '@smartesting/rrweb-types'
import maskText from './maskText'

const HTML_IMAGE_VIDEO_TAGS = ['img', 'map', 'area', 'canvas', 'figure', 'picture', 'svg', 'audio', 'video']

type RRWebAnonymizationSettings = Pick<
  recordOptions<eventWithTime>,
  'allowList' | 'maskTextSelector' | 'maskTextFn' | 'blockSelector' | 'blockExtraStyle' | 'maskAllInputs'
>

export function getRRWebAnonymizationSettings(
  anonymizationSettings: AnonymizationSettings,
  location: Location,
): RRWebAnonymizationSettings {
  const recordingSettings: RRWebAnonymizationSettings = {}
  if (anonymizationSettings.anonymize) {
    const allowedList = anonymizationSettings.allowList.reduce<string[]>((acc, { pageMatcher, allowedSelectors }) => {
      if (location.href.match(pageMatcher)) {
        acc.push(...allowedSelectors)
      }
      return acc
    }, [])
    recordingSettings.maskTextSelector = '*'
    recordingSettings.allowList = allowedList.length > 0 ? allowedList.join(', ') : null
    recordingSettings.maskTextFn = maskText
    recordingSettings.maskAllInputs = true
    recordingSettings.blockSelector = HTML_IMAGE_VIDEO_TAGS.join(', ')
    recordingSettings.blockExtraStyle = 'background-color: #6732d0;'
  }

  return recordingSettings
}
