const RECORDING_SETTINGS = {
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

export const WITH_PARTIAL_ANONYMIZATION = {
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

export const WITH_TOTAL_ANONYMIZATION = {
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
