function get(key: string): string | null {
  try {
    return globalThis.localStorage.getItem(key);
  } catch {
    throw new Error('localStorage not accessible');
  }
}

function set(key: string, value: string): void {
  try {
    globalThis.localStorage.setItem(key, value);
  } catch {
    throw new Error('localStorage not accessible');
  }
}

function remove(key: string): void {
  try {
    globalThis.localStorage.removeItem(key);
  } catch {
    throw new Error('localStorage not accessible');
  }
}

function clear(): void {
  try {
    globalThis.localStorage.clear();
  } catch {
    throw new Error('localStorage not accessible');
  }
}

class Storage<T> {
  name: string;
  version: number;

  constructor(name: string, version?: number) {
    if (version !== undefined) {
      const parsedVersion = parseInt(`${version}`, 10);
      if (!parsedVersion || parsedVersion <= 0) {
        throw new Error('version has to be a positive integer');
      }
      this.name = name;
      this.version = parsedVersion;

      const previousVersion = parseInt(`${get(name)}`, 10) || 0;
      if (parsedVersion > previousVersion) {
        remove(`${name}:${previousVersion}`);
        set(name, version.toString(10));
      }
    } else {
      const existingVersion = parseInt(`${get(name)}`, 10) || 0;
      if (!existingVersion) {
        throw new Error(`There is no existing storage named ${name}`);
      }
      this.name = name;
      this.version = existingVersion;
    }
  }

  read(): T | null {
    const key = `${this.name}:${this.version}`;
    const jsonString = get(key);

    let value: T | null = null;
    if (jsonString) {
      try {
        value = JSON.parse(jsonString) as T;
      } catch {
        // Remove corrupted item
        remove(key);
      }
    }

    return value;
  }

  write(value: T): void {
    const key = `${this.name}:${this.version}`;
    const jsonString = JSON.stringify(value);
    if (jsonString === undefined) {
      remove(key);
    } else {
      set(key, jsonString);
    }
  }

  static reset(): void {
    clear();
  }
}

export default Storage;
