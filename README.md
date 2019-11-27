# versioned-storage [![Build Status](https://travis-ci.org/CatChen/versioned-storage.svg?branch=master)](https://travis-ci.org/CatChen/versioned-storage) [![codecov](https://codecov.io/gh/CatChen/versioned-storage/branch/master/graph/badge.svg)](https://codecov.io/gh/CatChen/versioned-storage)

Use named, versioned and typed JSON storage through `localStorage`! ([TypeScript](https://www.typescriptlang.org/) or [Flow](https://flow.org/).)

## Examples

Create a named and versioned storage by creating a `Storage` object. Use `Storage.prototype.write` and `Storage.prototype.read` to operate.

```
import Storage from 'versioned-storage';

const userStorage = new Storage('user', 1);
userStorage.write({
  id: 42,
  name: 'Cat',
});
console.log(userStorage.read()); // { id: 42, name: 'Cat' }
```

Add typing information with Flow to make each storage type safe.

```
import Storage from 'versioned-storage';

type User = {
  id: number,
  name: string,
}

const userStorage = new Storage<User>('user', 1);

userStorage.write({ id: 42 });
// Flow error because userStorage.write is typed as (value: User) => void.

const user = userStorage.read();
// Flow infers user being User because userStorage.read is typed as () => User.
```

## Features

1. Unlike `localStorage`, our API never throws error. No need to wrap everything in try-catch.
2. Read and write values as JSON instead of string.
3. Flow typing support for JSON structure being read and written.

## API

The API is very simple. There are only 4 functions you need to know.

### `Storage` class

Create a storage by calling `Storage` class constructor with a name and a version.

```
const settingsStorage = new Storage('settings', 1);
```

When a storage's schema is changed and no longer compatible, bump the version number and old data will be purged automatically.

```
const settingsStorage = new Storage('settings', 2); // Erase all data from version 1
```

### `Storage.prototype.write` method

Write data to a named storage by calling `write` method on its instance.

```
settingsStorage.write({
  brightness: 80,
  volume: 100,
});
```

### `Storage.prototype.read` method

Read data from a named storage by calling `read` method on its instance.

```
const {
  brightness,
  volume,
} = settingsStorage.read();
```

### `Storage.reset` static method

Clear all data across all named storages by calling the static method `reset`.

```
Storage.reset();
```
