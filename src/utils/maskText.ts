export default function maskText(text: string) {
  return text.trim().replace(/[^-_/:,@.;?! ]/g, '#')
}
