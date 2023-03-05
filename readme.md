# kotikDB
Простенькая библиотека для работы с json, её мощность зависит от доступных ресурсов на системе

# Конфиг
| Ключ    | Задача                                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| maxsize | В зависимости от средней скорости HDD/SSD установите оптимальный лимит разделения файлов в кб при котором диск легко загрузит   |

# Пример использования
- Используйте async для работы с бд

Добавляем ключ test,vyv в бд
```js
const { init, readJSON, writeJSON } = require("./kotikDB");

let data = {};
data.test = 1;
data.vyv = 1;

await init();

writeJSON(data);
console.log(await readJSON());
```

Допустим бд содержит `{ "123": { test: 1 }}`, иззменили test на 2 вложенным 123
```js
const { init, readJSON, writeJSON } = require("./kotikDB");

await init();

writeJSON({ "123": { test: 2 }});
console.log(await readJSON());
```

Нужно что-то удалить `{ test: 1, vyv: {kek:1}, "0": { "1": { bymba: 10 }}}`, тут важно использовать await иначе будет баг в бд
```js
const { init, readJSON, deleteElem } = require("./kotikDB");

await init();

await deleteElem([], "test");
await deleteElem(["vyv"], "kek");
await deleteElem(["0", "1"], "bymba");
console.log(await readJSON());
```