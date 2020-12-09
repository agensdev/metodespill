const copy = function(source){
    return JSON.parse(JSON.stringify(source));
}

export {copy}