export default function windowExists() {
  try {
    return window !== null && window !== undefined
  } catch (err) {
    // We can safely assume that, if we get here, there's no Window reference.
    return false
  }
}
