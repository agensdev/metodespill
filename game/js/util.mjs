const copy = function (source) {
    return JSON.parse(JSON.stringify(source));
}

const merge = function (a, b) {
    return { ...a, ...b };
}

const validateConditions = function (conditions, state) {
    if (!conditions || !state) {
        return false;
    }
    return conditions.every((condition) => state[condition.target] == condition.value);
}

const rnd = function (max) {
    max |= Number.MAX_SAFE_INTEGER;
    return Math.floor(Math.random() * max);
}

const pickRandom = function (items) {
    if (!items || items.length == 0) {
        return null;
    }
    return items[rnd(items.length)];
}

export { copy, merge, pickRandom, rnd, validateConditions };