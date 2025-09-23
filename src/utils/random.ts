export function hexString(length: number): string {
  return Math.random()
    .toString(16)
    .substring(2, 2 + length);
}
