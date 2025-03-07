import { Storage } from '../Storage';

const STORAGE_NAME = 'test_storage';
const STORAGE_VERSION = 42;
const TEST_OBJECT = {
  x: 1,
  y: ['hello', 'world'],
  z: false,
};

let localStorageBackup: typeof globalThis.localStorage | null = null;
let getItem = jest.fn(undefined as typeof globalThis.localStorage.getItem);
let setItem = jest.fn(undefined as typeof globalThis.localStorage.setItem);
let removeItem = jest.fn(
  undefined as typeof globalThis.localStorage.removeItem,
);
let clear = jest.fn(undefined as typeof globalThis.localStorage.clear);

beforeEach(() => {
  getItem = jest.fn(undefined as typeof globalThis.localStorage.getItem);
  setItem = jest.fn(undefined as typeof globalThis.localStorage.setItem);
  removeItem = jest.fn(undefined as typeof globalThis.localStorage.removeItem);
  clear = jest.fn(undefined as typeof globalThis.localStorage.clear);
  const localStorageMock = {
    getItem,
    setItem,
    removeItem,
    clear,
    key: jest.fn(),
    length: 0,
  };
  localStorageBackup = globalThis.localStorage;
  Object.defineProperty(globalThis, 'localStorage', {
    writable: true,
  });
  globalThis.localStorage = localStorageMock;
});

afterEach(() => {
  globalThis.localStorage = localStorageBackup;
});

it('accepts name and version in constructor', () => {
  const storage = new Storage(STORAGE_NAME, STORAGE_VERSION);
  expect(storage.name).toBe(STORAGE_NAME);
  expect(storage.version).toBe(STORAGE_VERSION);
});

it('stores version number', () => {
  new Storage(STORAGE_NAME, STORAGE_VERSION);
  expect(setItem.mock.calls.length).toBe(1);
  expect(setItem.mock.calls[0].length).toBe(2);
  expect(setItem.mock.calls[0][0]).toBe(STORAGE_NAME);
  expect(setItem.mock.calls[0][1]).toBe(STORAGE_VERSION.toString());
});

it('can write object to storage', () => {
  const storage = new Storage(STORAGE_NAME, STORAGE_VERSION);
  storage.write(TEST_OBJECT);
  expect(setItem.mock.calls.length).toBe(2);
  expect(setItem.mock.calls[1].length).toBe(2);
  expect(setItem.mock.calls[1][0]).toBe(`${STORAGE_NAME}:${STORAGE_VERSION}`);
  expect(setItem.mock.calls[1][1]).toBe(JSON.stringify(TEST_OBJECT));
});

it('can read object from storage', () => {
  const storage = new Storage(STORAGE_NAME, STORAGE_VERSION);
  getItem.mockImplementationOnce((key) => {
    expect(key).toBe(`${STORAGE_NAME}:${STORAGE_VERSION}`);
    return JSON.stringify(TEST_OBJECT);
  });
  const json = storage.read();
  expect(json).toEqual(TEST_OBJECT);
});

it('clears storage after version bumping', () => {
  getItem.mockImplementationOnce((key) => {
    expect(key).toBe(STORAGE_NAME);
    return JSON.stringify(STORAGE_VERSION);
  });
  new Storage(STORAGE_NAME, STORAGE_VERSION + 1);
  expect(removeItem.mock.calls.length).toBe(1);
  expect(removeItem.mock.calls[0].length).toBe(1);
  expect(removeItem.mock.calls[0][0]).toBe(
    `${STORAGE_NAME}:${STORAGE_VERSION}`,
  );
});

it('clears storage if data is corrupted', () => {
  const storage = new Storage(STORAGE_NAME, STORAGE_VERSION);
  getItem.mockImplementationOnce((key) => {
    expect(key).toBe(`${STORAGE_NAME}:${STORAGE_VERSION}`);
    return '**' + JSON.stringify(STORAGE_VERSION) + '**';
  });
  removeItem.mockClear();
  const object = storage.read();
  expect(object).toBeNull();
  expect(removeItem.mock.calls.length).toBe(1);
  expect(removeItem.mock.calls[0].length).toBe(1);
  expect(removeItem.mock.calls[0][0]).toBe(
    `${STORAGE_NAME}:${STORAGE_VERSION}`,
  );
});

it('can can reset everything', () => {
  Storage.reset();
  expect(clear.mock.calls.length).toBe(1);
});

it('will throw if localStorage throws', () => {
  const storage = new Storage(STORAGE_NAME, STORAGE_VERSION);

  setItem.mockImplementation(() => {
    throw new Error();
  });
  expect(() => {
    storage.write(TEST_OBJECT);
  }).toThrow();

  removeItem.mockImplementation(() => {
    throw new Error();
  });
  expect(() => {
    new Storage(STORAGE_NAME, STORAGE_VERSION + 1);
  }).toThrow();

  getItem.mockImplementation(() => {
    throw new Error();
  });
  expect(() => {
    storage.read();
  }).toThrow();
  expect(() => {
    new Storage(STORAGE_NAME, STORAGE_VERSION);
  }).toThrow();

  clear.mockImplementation(() => {
    throw new Error();
  });
  expect(() => {
    Storage.reset();
  }).toThrow();
});

it('uses existing version when version is omitted', () => {
  getItem.mockImplementationOnce((key) => {
    expect(key).toBe(STORAGE_NAME);
    return `${STORAGE_VERSION}`;
  });
  const storage = new Storage(STORAGE_NAME);
  expect(storage.version).toBe(STORAGE_VERSION);
  getItem.mockImplementationOnce((key) => {
    expect(key).toBe(`${STORAGE_NAME}:${STORAGE_VERSION}`);
    return JSON.stringify(TEST_OBJECT);
  });
  const json = storage.read();
  expect(json).toEqual(TEST_OBJECT);
});

it('will throw if there is no existing version when version is omitted', () => {
  getItem.mockImplementationOnce((key) => {
    expect(key).toBe(STORAGE_NAME);
    return undefined;
  });
  expect(() => {
    new Storage(STORAGE_NAME);
  }).toThrow();
});

it('will throw if version is a negative number', () => {
  expect(() => {
    new Storage(STORAGE_NAME, -STORAGE_VERSION);
  }).toThrow();
});

it('will throw if existing version is corrupted', () => {
  getItem.mockImplementationOnce((key) => {
    expect(key).toBe(STORAGE_NAME);
    return '**' + STORAGE_VERSION + '**';
  });
  expect(() => {
    new Storage(STORAGE_NAME, -STORAGE_VERSION);
  }).toThrow();
});
