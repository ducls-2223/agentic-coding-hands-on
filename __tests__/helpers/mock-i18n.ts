/**
 * Pass-through `t()` mock. Returns the key itself so tests can assert via key
 * without coupling to the dictionary content.
 */
export function fakeT(_lang: string, key: string) {
  return key;
}

export const FAKE_LANG = "en" as const;
