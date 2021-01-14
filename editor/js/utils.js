
async function saveToLocalCache(key, item) {
    await localforage.setItem(key, JSON.stringify(item));
}

async function getFromLocalCache(key) {
    let item = await localforage.getItem(key);
    return JSON.parse(item)
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

export { saveToLocalCache, getFromLocalCache, readLocalTextFile }