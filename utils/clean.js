const clean = (arr) => {
    return arr.slice(0, arr.length - 1).filter((item) => item !== '-.-');
}

const cleanLocation = (text) => {
    return text.replace(/undefined/g, '').trim();
}

const mode = (arr) => {
    arr.sort((a, b) => arr.filter(v => v === a).length - arr.filter(v => v === b).length);

    return arr.slice(arr.length - 2, arr.length - 1)[0];
}

module.exports = {clean, cleanLocation, mode};
