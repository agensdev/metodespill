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

const animateCSS = function (element, animation, duration = 1, prefix = 'animate__') {

    return new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;

        element.style.setProperty('--animate-duration', `${duration}s`);
        element.classList.add(`${prefix}animated`, animationName);

        function handleAnimationEnd() {
            element.classList.remove(`${prefix}animated`, animationName);
            resolve('Animation ended');
        }

        element.addEventListener('animationend', handleAnimationEnd, { once: true });
    });
}


class Storage {

    // In the future these opperations will probably be run against a server so I am wraping them in this helper class.

    static save(key, value) {
        localStorage.setItem(key, value);
    }

    static retrive(key) {
        return localStorage.getItem(key);
    }

    static delete(key) {
        localStorage.removeItem(key);
    }

    static clear() {
        localStorage.clear();
    }
}



export { copy, merge, pickRandom, rnd, validateConditions, animateCSS, Storage };