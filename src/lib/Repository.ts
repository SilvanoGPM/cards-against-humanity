export default class Repository {
  static async save<T>(
    key: string,
    value: Record<string, unknown> | T
  ): Promise<void> {
    const valueString = JSON.stringify(value);

    try {
      localStorage.setItem(key, valueString);
    } catch (err) {
      console.error(err);
    }
  }

  static async get<T>(key: string): Promise<T | null | undefined> {
    try {
      const value = localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (err) {
      console.error(err);
    }

    return null;
  }
}
