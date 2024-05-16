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
