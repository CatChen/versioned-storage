// @flow strict

function get(key: string): ?string {
  let value = null;
  try {
    value = global.localStorage.getItem(key);
  } catch (error) {
    throw new Error('localStorage not accessible');
  }
  return value;
}

function set(key: string, value: string): void {
  try {
    global.localStorage.setItem(key, value);
  } catch (error) {
    throw new Error('localStorage not accessible');
  }
}

function remove(key: string): void {
  try {
    global.localStorage.removeItem(key);
  } catch (error) {
    throw new Error('localStorage not accessible');
  }
}

function clear(): void {
  try {
    global.localStorage.clear();
  } catch (error) {
    throw new Error('localStorage not accessible');
  }
}

class Storage<T> {
  name: string;
  version: number;

  constructor(name: string, version: number) {
    this.name = name;
    this.version = version;

    const previousVersion = parseInt(get(name), 10) || 0;
    if (version > previousVersion) {
      remove(`${name}:${previousVersion}`);
      set(name, version.toString(10));
    }
  }

  read(): ?T {
    const key = `${this.name}:${this.version}`;
    const jsonString = get(key);

    let value: ?T = null;
    if (jsonString) {
      try {
        value = JSON.parse(jsonString);
      } catch (error) {
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
