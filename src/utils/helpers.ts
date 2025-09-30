export function stringifyValues<
  T extends Record<string, string | number | boolean | null | undefined>,
>(object: T): Record<keyof T, string> {
  const result = {} as Record<keyof T, string>;

  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const value = object[key];
      result[key] = value !== null && value !== undefined ? String(value) : '';
    }
  }

  return result;
}

export function fnv1aHash32(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash *= 16777619;
  }
  return hash >>> 0;
}
