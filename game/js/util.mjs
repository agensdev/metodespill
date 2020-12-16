const copy = function (source) {
    return JSON.parse(JSON.stringify(source));
}

const merge = function (a, b) {
    return { ...a, ...b };
}

const validateConditions = function (conditions, state) {
    if (!conditions) {
        return true;
    }
    if (!state) {
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

const animateCSS = function (element, animation, prefix = 'animate__') {
    // We create a Promise and return it
    return new Promise((resolve, reject) => {

        const animationName = `${prefix}${animation}`;
        const node = document.querySelector(element);
        node.classList.add(`${prefix}animated`, animationName);

        function handleAnimationEnd() {
            node.classList.remove(`${prefix}animated`, animationName);
            resolve('Animation ended');
        }

        node.addEventListener('animationend', handleAnimationEnd, { once: true });
    });
}



export { copy, merge, pickRandom, rnd, validateConditions, animateCSS };