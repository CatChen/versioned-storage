export default class Storage<T> {
  constructor(name: string, version: number) {}
  read(): T | null {
    return null;
  }
  write(value: T): void {}
  static reset(): void {}
}
