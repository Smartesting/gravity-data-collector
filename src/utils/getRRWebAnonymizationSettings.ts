import { AnonymizationSettings } from '../types'
import { recordOptions } from 'rrweb'
import { eventWithTime } from '@rrweb/types'
import maskText from './maskText'

const HTML_IMAGE_VIDEO_TAGS = [
  'img',
  'map',
  'area',
  'canvas',
  'figure',
  'picture',
  'svg',
  'audio',
  'video',
]

type RRWebAnonymizationSettings = Pick<recordOptions<eventWithTime>, 'allowList' | 'maskTextSelector' | 'maskTextFn' | 'maskInputOptions' | 'blockSelector' | 'blockExtraStyle'>

export function getRRWebAnonymizationSettings(anonymizationSettings: AnonymizationSettings, location: Location): RRWebAnonymizationSettings {
  const recordingSettings: RRWebAnonymizationSettings = {}
  if (anonymizationSettings.anonymize) {
    const allowedList = anonymizationSettings.allowList.reduce<string[]>((acc, {
      pageMatcher,
      allowedSelectors,
    }) => {
      if (location.href.match(pageMatcher)) {
        acc.push(...allowedSelectors)
      }
      return acc
    }, [])
    recordingSettings.maskTextSelector = '*'
    recordingSettings.allowList = allowedList.join(', ')
    recordingSettings.maskTextFn = maskText
    recordingSettings.maskInputOptions = {
      color: true,
      date: true,
      email: true,
      month: true,
      number: true,
      tel: true,
      url: true,
      text: true,
      password: true,
      range: true,
      search: true,
      select: true,
      time: true,
      week: true,
      textarea: true,
      'datetime-local': true,
    }
    recordingSettings.blockSelector = HTML_IMAGE_VIDEO_TAGS.join(', ')
    recordingSettings.blockExtraStyle = 'background-color: #6732d0;'
  }

  return recordingSettings
}
