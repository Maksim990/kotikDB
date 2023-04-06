# kotikDB
Простенькая библиотека для работы с json, её мощность зависит от доступных ресурсов на системе

# config.json
| Ключ    | Описание                                               |
| ------- | ------------------------------------------------------ |
| maxsize | указать кол-во хранящихся элементов кэшированных в озу |
| ttl     | указать время жизни элемента кэшированного в озу       |

# Пример использования
- Используйте async для работы с бд

Что-то надо добавить
```js
const { readDB, writeDB } = require("./kotikDB");

const data = await readDB();

data.test = 1;

await writeDB(data);
```

Что-то надо прочитать
```js
console.log(await readDB().test);
```

Что-то надо удалить
```js
const { readDB, writeDB } = require("./kotikDB");

const data = await readDB();

delete data.test;

await writeDB(data);
```