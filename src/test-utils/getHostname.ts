export function getHostname(source: string) {
  try {
    return new URL(source).hostname
  } catch (_) {}
}
