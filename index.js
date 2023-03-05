const { maxsize } = require("./config");
const fs = require("fs/promises");
const path = require("path");

const dataDir = __dirname + "/data";
const dataFilePath = path.join(dataDir, 'data.json');
let init = false;
let data = {};

function initF(content) {
    if(!init) throw new Error(`Cannot access function "${content}" before initialization DB`);
}

module.exports = {
    init: async () => {
        try {
            const fileNames = await fs.readdir(dataDir);
            for (const fileName of fileNames) {
                if (fileName === 'data.json') continue;
                const filePath = path.join(dataDir, fileName);
                const fileData = await fs.readFile(filePath, 'utf-8');
                data[fileName] = JSON.parse(fileData);
            }

            init = true;
        } catch (err) {
            console.error(`Error initializing data: ${err.stack}`);
        }
    },
    writeJSON: async (obj) => {
        initF("writeFile");

        try {
            Object.assign(data, obj);
            const jsonData = JSON.stringify(data);
            if (jsonData.length > (maxsize * 1024)) {
                const fileNum = Object.keys(data).length;
                const filePath = path.join(dataDir, `file${fileNum}.json`);
                await fs.writeFile(filePath, jsonData, "utf-8");
                data = {};
                await fs.writeFile(dataFilePath, JSON.stringify(data), "utf-8");
            } else {
                await fs.writeFile(dataFilePath, jsonData, "utf-8");
            }
        } catch (err) {
            console.error(`Error writing data: ${err.stack}`);
        }
    },
    readJSON: async () => {
        initF("readJSON");

        try {
            const dataFile = await fs.readFile(dataFilePath, "utf-8");
            data = JSON.parse(dataFile);
            return data;
        } catch (err) {
            console.error(`Error reading data: ${err.stack}`);
        }
    },
    deleteElem: async (keys, prop) => {
        initF("deleteElem");

        try {
            let obj = await module.exports.readJSON();
            for (let i = 0; i < keys.length; i++) {
                if (obj.hasOwnProperty(keys[i])) {
                    obj = obj[keys[i]];
                } else {
                    console.log(`Object ${keys.join(".")} not found`);
                    return;
                }
            }
            if (obj.hasOwnProperty(prop)) {
                delete obj[prop];
                await module.exports.writeJSON(data);
            } else {
                console.log(`Property ${prop} not found in object ${keys.join(".")}`);
            }
        } catch (err) {
            console.error(`Error delete data: ${err.stack}`);
        }
    }
}