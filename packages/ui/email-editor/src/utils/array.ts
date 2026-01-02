export function insertAt<T>(array: T[], index: number, element: T): T[] {
  // clamp index between 0 and array.length
  const i = Math.max(0, Math.min(index, array.length));
  return [...array.slice(0, i), element, ...array.slice(i)];
}
