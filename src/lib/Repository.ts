export default class Repository {
  static save<T>(key: string, value: Record<string, unknown> | T): void {
    const valueString = JSON.stringify(value);

    try {
      localStorage.setItem(key, valueString);
    } catch (err) {
      console.error(err);
    }
  }

  static get<T>(key: string): T | null | undefined {
    try {
      const value = localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (err) {
      console.error(err);
    }

    return null;
  }
}
