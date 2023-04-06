const config = require("./config.json");
const fs = require("fs/promises");
const LRU = require("lru-cache");
const path = require("path");

const cache = new LRU({
    sizeCalculation: (item) => JSON.stringify(item).length,
    maxSize: config.maxSize, // Размер кэша в элементах
    ttl: config.ttl // Время жизни кэш элемента
});
const FILE_SIZE = 30 * 1024 * 1024; // 30 МБ
const DB_DIR = `${__dirname}/db`; // Директория с файлами БД

function isPlainObject(obj) {
    if (typeof obj !== "object" || obj === null) return false;
    return Object.getPrototypeOf(obj) === Object.prototype;
}

class db {
    async readDB() {
        // Проверяем, есть ли ключ в кэше
        if (cache.peek("db")) {
            return cache.get("db");
        };

        const dbDir = path.resolve(DB_DIR);
        const dbFileNames = await fs.readdir(dbDir);

        let db = {};

        // Если файлы уже есть, читаем их и склеиваем
        if (dbFileNames.length) {
            for (let i = 0; i < dbFileNames.length; i++) {
                const filePath = path.join(dbDir, dbFileNames[i]);
                const fileContent = await fs.readFile(filePath, "utf8");
                const data = JSON.parse(fileContent);
                db = Object.assign(db, data);
            }
        };

        // Сохраняем в кэш и возвращаем
        cache.set("db", db);
        return db;
    }

    async writeDB(obj) {
        const db = await this.readDB();

        if (isPlainObject(obj)) return;

        Object.assign(db, obj);
        cache.set("db", db);

        const dbDir = path.resolve(DB_DIR);
        const dbFileNames = await fs.readdir(dbDir);

        let i = 0;
        let dbPart = {};

        for (const key in db) {
            dbPart[key] = db[key];
            if (++i % FILE_SIZE === 0) {
                // Размер файла превышен, сохраняем в новый файл
                const fileName = `db-${i / FILE_SIZE}.json`;
                const filePath = path.join(dbDir, fileName);
                const fileContent = JSON.stringify(dbPart);
                await fs.writeFile(filePath, fileContent, "utf8");

                // Обнуляем объект и начинаем запись в новый файл
                dbPart = {};
            };
        }

        // Записываем остаток в последний файл
        if (Object.keys(dbPart).length) {
            const fileName = `db-${Math.ceil(i / FILE_SIZE)}.json`;
            const filePath = path.join(dbDir, fileName);
            const fileContent = JSON.stringify(dbPart);
            await fs.writeFile(filePath, fileContent, "utf8");
        };
    }
}

const DB = new db();

module.exports = {
    writeDB: async (obj) => DB.writeDB(obj),
    readDB: DB.readDB
}