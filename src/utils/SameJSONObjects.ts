export function sameJSONObjects<T>(o1: T, o2: T): boolean {
  return JSON.stringify(o1) === JSON.stringify(o2)
}
