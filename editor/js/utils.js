async function saveToLocalCache(key, item, binary) {
    binary = binary || false;
    let content = binary ? item : JSON.stringify(item);
    await localforage.setItem(key, content);
}

async function getFromLocalCache(key, binary) {
    binary = binary || false;
    let item = await localforage.getItem(key);
    item = binary ? item : JSON.parse(item);
    return item;
}

async function clearCache() {
    await localforage.clear()
}

async function readLocalTextFile(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => {
            resolve(JSON.parse(reader.result));
        };
        reader.onerror = reject;
        reader.readAsText(file);
    })
}

async function readLocalBinaryFile(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file)
    })
}

export { saveToLocalCache, getFromLocalCache, readLocalTextFile, readLocalBinaryFile, clearCache }