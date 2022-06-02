const Storage = require('../Storage');

const STORAGE_NAME = 'test_storage';
const STORAGE_VERSION = 42;
const TEST_OBJECT = {
  x: 1,
  y: ['hello', 'world'],
  z: false,
};

let localStorageBackup = null;
let getItem = jest.fn();
let setItem = jest.fn();
let removeItem = jest.fn();
let clear = jest.fn();

beforeEach(() => {
  getItem = jest.fn();
  setItem = jest.fn();
  removeItem = jest.fn();
  clear = jest.fn();
  const localStorageMock = {
    getItem,
    setItem,
    removeItem,
    clear,
  };
  localStorageBackup = global.localStorage;
  Object.defineProperty(global, 'localStorage', {
    writable: true,
  });
  global.localStorage = localStorageMock;
});

afterEach(() => {
  global.localStorage = localStorageBackup;
});

it('accepts name and version in constructor', () => {
  const storage = new Storage(STORAGE_NAME, STORAGE_VERSION);
  expect(storage.name).toBe(STORAGE_NAME);
  expect(storage.version).toBe(STORAGE_VERSION);
});

it('stores version number', () => {
  const storage = new Storage(STORAGE_NAME, STORAGE_VERSION);
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
  const storage = new Storage(STORAGE_NAME, STORAGE_VERSION + 1);
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
    return STORAGE_VERSION;
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
