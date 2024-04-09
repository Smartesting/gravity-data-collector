import { recordOptions } from 'rrweb'
import { eventWithTime } from '@rrweb/types'
import { snapshot } from 'rrweb-snapshot'

export type SnapshotOptions = Parameters<typeof snapshot>[1]
export type VideoOptions = recordOptions<eventWithTime>

const RECORDING_SETTINGS: VideoOptions = {
  sampling: {
    mousemove: false,
    scroll: 150,
    media: 800,
    mouseInteraction: {
      MouseUp: false,
      MouseDown: false,
      Click: true,
      ContextMenu: false,
      DblClick: false,
      Focus: false,
      Blur: false,
      TouchStart: false,
      TouchEnd: false,
    },
    input: 'last',
  },
}

export default RECORDING_SETTINGS

export const WITH_PARTIAL_ANONYMIZATION: SnapshotOptions & VideoOptions = {
  maskInputOptions: {
    color: false,
    date: false,
    'datetime-local': false,
    email: true,
    month: false,
    number: false,
    range: false,
    search: false,
    tel: true,
    text: true,
    time: false,
    url: true,
    week: false,
    textarea: true,
    select: true,
    password: true,
  },
  maskInputFn: maskInput,
  maskTextFn: maskText,
}

export const WITH_DEFAULT_ANONYMIZATION: SnapshotOptions & VideoOptions = {
  maskInputOptions: {
    color: true,
    date: true,
    'datetime-local': true,
    email: true,
    month: true,
    number: true,
    range: true,
    search: true,
    tel: true,
    text: true,
    time: true,
    url: true,
    week: true,
    textarea: true,
    select: true,
    password: true,
  },
  maskInputFn: maskInput,
  maskTextFn: maskText,
}

export const WITH_TOTAL_ANONYMIZATION: SnapshotOptions & VideoOptions = {
  maskAllInputs: true,
  maskInputFn: maskInput,
  maskTextSelector: '*',
  maskTextFn: maskText,
}

export function maskText(text: string) {
  return text.trim().replace(/[^-_/:,@.;?! ]/g, '#')
}

function maskInput(text: string) {
  return text.trim().replace(/[^@.]/g, '#')
}
