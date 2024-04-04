export default function isDefined<T>(element: T | null | undefined): element is T {
  return element !== null && element !== undefined
}
