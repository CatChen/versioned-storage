declare class Storage<T> {
  constructor(name: string, version?: number);
  read(): T | null;
  write(value: T): void;
  static reset(): void;
}

export default Storage;
