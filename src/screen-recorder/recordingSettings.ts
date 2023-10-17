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
  maskInputFn: (text: string) => {
    return text.replace(/[^@.]/g, '#')
  },
}

export default RECORDING_SETTINGS
