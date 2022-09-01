export default function getDocument() {
  try {
    return global.document
  } catch (_err) {
    return document
  }
}
