const date = (timestamp, lang="en-US") => {
    const x = timestamp.toString() + '000';
    const y = Number(x) + 3 * 60 * 60 * 1000;

    return new Date(y).toLocaleTimeString(lang, {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

const dateToTimestamp = (date, time) => {
    const [year, month, day] = date.split('.');
    const [hour, minute, second] = time.split(':');

    const d = new Date(`${year}-${month}-${day}`);

    return (d.getTime() + ((hour - 3) * 60 * 60 * 1000) + (minute * 60 * 1000) + (second * 1000)) / 1000;
}

module.exports = {date, dateToTimestamp};
