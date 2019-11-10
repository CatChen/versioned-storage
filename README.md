# versioned-storage [![Build Status](https://travis-ci.org/CatChen/versioned-storage.svg?branch=master)](https://travis-ci.org/CatChen/versioned-storage) [![codecov](https://codecov.io/gh/CatChen/versioned-storage/branch/master/graph/badge.svg)](https://codecov.io/gh/CatChen/versioned-storage)

Use named, versioned and typed JSON storage through `localStorage`! (Typing support is only available for [Flow](https://flow.org/).)

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
