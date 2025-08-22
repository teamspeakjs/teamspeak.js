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
