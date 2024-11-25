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

/**
 * A class that can be instantiated into a storage with a specific name and version.
 * Type T stands for the type of the value that is stored in the storage. It has to be serializable to JSON.
 */
export class Storage<T> {
  /**
   * Name of the storage.
   */
  name: string;

  /**
   * Version of the storage with this particular name.
   */
  version: number;

  /**
   * Create or retrieve the storage with the given name and version.
   * If the version is omitted, it will use the existing version of the storage with the given name.
   * If there is no existing storage with the given name, it will throw an error.
   * @param name Name of the storage.
   * @param version Version of the storage. It has to be a positive integer.
   */
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

  /**
   * Read the value from the storage.
   * @returns The value that is stored in the storage. If there is no value, it returns null.
   */
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

  /**
   * Write the value to the storage.
   * @param value The value to be stored in the storage.
   */
  write(value: T): void {
    const key = `${this.name}:${this.version}`;
    const jsonString = JSON.stringify(value);
    if (jsonString === undefined) {
      remove(key);
    } else {
      set(key, jsonString);
    }
  }

  /**
   * Reset all storages. (It even wipes out other localStorage content that are not written by this class.)
   */
  static reset(): void {
    clear();
  }
}
