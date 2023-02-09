const app = require('express')();
const {get} = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://eq:31@eq.5mzvjz2.mongodb.net/?retryWrites=true&w=majority';

mongoose.set('strictQuery', false);
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected.'))
    .catch((err) => console.log(err));

app.use(cors());
app.options('*', cors());

function mode(arr) {
    arr.sort((a, b) => arr.filter(v => v === a).length - arr.filter(v => v === b).length);

    return arr.slice(arr.length - 2, arr.length - 1)[0];
}

function date(timestamp) {
    const x = timestamp.toString() + '000';
    const y = Number(x) + 3 * 60 * 60 * 1000;

    return new Date(y).toLocaleTimeString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

function dateEn(timestamp) {
    const x = timestamp.toString() + '000';
    const y = Number(x) + 3 * 60 * 60 * 1000;

    return new Date(y).toLocaleTimeString('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

function cleanLocation(text) {
    return text.replace(/undefined/g, '').trim();
}

function dateToTimestamp(date, time) {
    const [year, month, day] = date.split('.');
    const [hour, minute, second] = time.split(':');

    const d = new Date(`${year}-${month}-${day}`);

    return (d.getTime() + ((hour - 3) * 60 * 60 * 1000) + (minute * 60 * 1000) + (second * 1000)) / 1000;
}

function clean(arr) {
    return arr.slice(0, arr.length - 1).filter((item) => item !== '-.-');
}

app.get('/all', (req, res) => {
    let t = new Date().getTime();

    get('http://www.koeri.boun.edu.tr/scripts/lst7.asp')
        .then((response) => {
            const regex = /--------------([\s\S]*?)<\/pre>/;
            const match = regex.exec(response.data);

            if (match) {
                const earthquakes = match[1].split('').slice(48, match[1].split('').length).join('').trim().split(/\n/g);

                const arr = [];

                for (let i = 0; i < earthquakes.length; i++) {
                    const earthquake = clean(earthquakes[i].split(/\s+/g).filter((item) => item !== '' && item !== '.'));

                    const obj = {
                        id: i + 1,
                        timestamp: dateToTimestamp(earthquake[0], earthquake[1]),
                        date: earthquake[0],
                        time: earthquake[1],
                        fullDate: `${earthquake[0]} ${earthquake[1]}`,
                        longDate: date(dateToTimestamp(earthquake[0], earthquake[1])) + '^' + dateEn(dateToTimestamp(earthquake[0], earthquake[1])),
                        latitude: Number(earthquake[2]),
                        longitude: Number(earthquake[3]),
                        coordinates: [
                            Number(earthquake[2]),
                            Number(earthquake[3])
                        ],
                        depth: Number(earthquake[4]),
                        magnitude: Number(earthquake[5]),
                    }

                    if (earthquake.length >= 8 && !isNaN(earthquake[6])) {
                        obj['moment'] = Number(earthquake[6]);

                        const loc = cleanLocation(earthquake.slice(7, earthquake.length).join(' '));
                        const regex = /([\s\S]*?)REVIZE01/;

                        if (regex.test(loc)) {
                            obj['location'] = cleanLocation(regex.exec(loc)[1].trim());
                        } else {
                            obj['location'] = cleanLocation(earthquake.slice(7, earthquake.length).join(' '));
                        }

                        if (loc.includes('(')) {
                            obj['base'] = loc.split('(')[1].split(')')[0];
                        } else {
                            obj['base'] = loc;
                        }
                    } else {
                        const loc = cleanLocation(earthquake.slice(6, earthquake.length).join(' '));
                        const regex = /([\s\S]*?)REVIZE01/;

                        if (regex.test(loc)) {
                            obj['location'] = cleanLocation(regex.exec(loc)[1].trim());
                        } else {
                            obj['location'] = cleanLocation(earthquake.slice(6, earthquake.length).join(' '));
                        }

                        if (loc.includes('(')) {
                            obj['base'] = loc.split('(')[1].split(')')[0];
                        } else {
                            obj['base'] = loc;
                        }
                    }

                    arr.push(obj);
                }

                if (req.query.limit && req.query.limit > 0 && !isNaN(req.query.limit)) {
                    let r = new Date().getTime() - t;

                    return res.status(200).json({
                        status: 200,
                        ping: r,
                        result: arr.slice(0, req.query.limit)
                    });
                } else if (req.query.get && req.query.get > 0 && !isNaN(req.query.get)) {
                    let r = new Date().getTime() - t;

                    return res.status(200).json({
                        status: 200,
                        ping: r,
                        result: arr[req.query.get - 1]
                    });
                }

                let r = new Date().getTime() - t;

                return res.status(200).json({
                    status: 200,
                    ping: r,
                    result: arr
                });
            }
        });
});

app.get('/latest', (req, res) => {
    let t = new Date().getTime();

    get('http://www.koeri.boun.edu.tr/scripts/lst7.asp')
        .then((response) => {
            const regex = /--------------([\s\S]*?)<\/pre>/;
            const match = regex.exec(response.data);

            if (match) {
                const earthquakes = match[1].split('').slice(48, match[1].split('').length).join('').trim().split(/\n/g);
                const earthquake = clean(earthquakes[0].split(/\s+/g).filter((item) => item !== '' && item !== '.'));

                const arr = [];

                const obj = {
                    timestamp: dateToTimestamp(earthquake[0], earthquake[1]),
                    date: earthquake[0],
                    time: earthquake[1],
                    fullDate: `${earthquake[0]} ${earthquake[1]}`,
                    longDate: date(dateToTimestamp(earthquake[0], earthquake[1])) + '^' + dateEn(dateToTimestamp(earthquake[0], earthquake[1])),
                    latitude: Number(earthquake[2]),
                    longitude: Number(earthquake[3]),
                    coordinates: [
                        Number(earthquake[2]),
                        Number(earthquake[3])
                    ],
                    depth: Number(earthquake[4]),
                    magnitude: Number(earthquake[5]),
                }

                if (earthquake.length >= 8 && !isNaN(earthquake[6])) {
                    obj['moment'] = Number(earthquake[6]);

                    const loc = cleanLocation(earthquake.slice(7, earthquake.length).join(' '));
                    const regex = /([\s\S]*?)REVIZE01/;

                    if (regex.test(loc)) {
                        obj['location'] = cleanLocation(regex.exec(loc)[1].trim());
                    } else {
                        obj['location'] = cleanLocation(earthquake.slice(7, earthquake.length).join(' '));
                    }

                    if (loc.includes('(')) {
                        obj['base'] = loc.split('(')[1].split(')')[0];
                    } else {
                        obj['base'] = loc;
                    }
                } else {
                    const loc = cleanLocation(earthquake.slice(6, earthquake.length).join(' '));
                    const regex = /([\s\S]*?)REVIZE01/;

                    if (regex.test(loc)) {
                        obj['location'] = cleanLocation(regex.exec(loc)[1].trim());
                    } else {
                        obj['location'] = cleanLocation(earthquake.slice(6, earthquake.length).join(' '));
                    }

                    if (loc.includes('(')) {
                        obj['base'] = loc.split('(')[1].split(')')[0];
                    } else {
                        obj['base'] = loc;
                    }
                }

                arr.push(obj);

                let r = new Date().getTime() - t;

                return res.status(200).json({
                    status: 200,
                    ping: r,
                    result: arr
                });
            }
        });
});

app.get('/search', (req, res) => {
    let t = new Date().getTime();

    get('http://www.koeri.boun.edu.tr/scripts/lst7.asp')
        .then((response) => {
            const regex = /--------------([\s\S]*?)<\/pre>/;
            const match = regex.exec(response.data);

            if (match) {
                const earthquakes = match[1].split('').slice(48, match[1].split('').length).join('').trim().split(/\n/g);
                let cleanedEarthquakes = [];
                let arr = [];

                for (let i = 0; i < earthquakes.length; i++) {
                    const earthquake = clean(earthquakes[i].split(/\s+/g).filter((item) => item !== '' && item !== '.'));

                    const obj = {
                        id: i + 1,
                        timestamp: dateToTimestamp(earthquake[0], earthquake[1]),
                        date: earthquake[0],
                        time: earthquake[1],
                        fullDate: `${earthquake[0]} ${earthquake[1]}`,
                        longDate: date(dateToTimestamp(earthquake[0], earthquake[1])) + '^' + dateEn(dateToTimestamp(earthquake[0], earthquake[1])),
                        latitude: Number(earthquake[2]),
                        longitude: Number(earthquake[3]),
                        coordinates: [
                            Number(earthquake[2]),
                            Number(earthquake[3])
                        ],
                        depth: Number(earthquake[4]),
                        magnitude: Number(earthquake[5]),
                    }

                    if (earthquake.length >= 8 && !isNaN(earthquake[6])) {
                        obj['moment'] = Number(earthquake[6]);

                        const loc = cleanLocation(earthquake.slice(7, earthquake.length).join(' '));
                        const regex = /([\s\S]*?)REVIZE01/;

                        if (regex.test(loc)) {
                            obj['location'] = cleanLocation(regex.exec(loc)[1].trim());
                        } else {
                            obj['location'] = cleanLocation(earthquake.slice(7, earthquake.length).join(' '));
                        }

                        if (loc.includes('(')) {
                            obj['base'] = loc.split('(')[1].split(')')[0];
                        } else {
                            obj['base'] = loc;
                        }
                    } else {
                        const loc = cleanLocation(earthquake.slice(6, earthquake.length).join(' '));
                        const regex = /([\s\S]*?)REVIZE01/;

                        if (regex.test(loc)) {
                            obj['location'] = cleanLocation(regex.exec(loc)[1].trim());
                        } else {
                            obj['location'] = cleanLocation(earthquake.slice(6, earthquake.length).join(' '));
                        }

                        if (loc.includes('(')) {
                            obj['base'] = loc.split('(')[1].split(')')[0];
                        } else {
                            obj['base'] = loc;
                        }
                    }

                    cleanedEarthquakes.push(obj);
                }

                if (req.query.base && req.query.base !== '' && req.query.base.trim().length > 0) {
                    arr.push(...cleanedEarthquakes.filter((item) => item.base.toLowerCase() === req.query.base.toLowerCase()));
                } else if (req.query.magnitude && req.query.magnitude !== '' && req.query.magnitude.trim().length > 0 && !isNaN(req.query.magnitude)) {
                    arr.push(...cleanedEarthquakes.filter((item) => item.magnitude === Number(req.query.magnitude)));
                } else if (req.query.day && req.query.day !== '' && req.query.day.trim().length > 0 && !isNaN(req.query.day)) {
                    const d = req.query.day.length > 1 ? req.query.day : '0' + req.query.day;

                    arr.push(...cleanedEarthquakes.filter((item) => item.date.split('.')[2] === d));
                } else if (req.query.month && req.query.month !== '' && req.query.month.trim().length > 0 && !isNaN(req.query.month)) {
                    const m = req.query.month.length > 1 ? req.query.month : '0' + req.query.month;

                    arr.push(...cleanedEarthquakes.filter((item) => item.date.split('.')[1] === m));
                } else if (req.query.hour && req.query.hour !== '' && req.query.hour.trim().length > 0 && !isNaN(req.query.hour)) {
                    const h = req.query.hour.length > 1 ? req.query.hour : '0' + req.query.hour;

                    arr.push(...cleanedEarthquakes.filter((item) => item.time.split(':')[0] === h));
                } else {
                    return res.status(200).json({
                        status: 200,
                        ping: 0,
                        query: {
                            base: 'Returns earthquakes in the specified base.',
                            magnitude: 'Returns earthquakes with the specified magnitude.',
                            day: 'Returns earthquakes in the specified day.',
                            month: 'Returns earthquakes in the specified month.',
                            hour: 'Returns earthquakes in the specified hour.'
                        }
                    })
                }

                if (arr.length === 0) {
                    return res.status(404).json({
                        status: 404,
                        ping: 0,
                        message: 'No earthquakes found.'
                    });
                }

                let r = new Date().getTime() - t;

                return res.status(200).json({
                    status: 200,
                    ping: r,
                    length: arr.length,
                    result: arr
                });
            }
        });
});

app.get('/average', (req, res) => {
    const t = new Date().getTime();

    get('http://www.koeri.boun.edu.tr/scripts/lst7.asp')
        .then((response) => {
            const regex = /--------------([\s\S]*?)<\/pre>/;
            const match = regex.exec(response.data);

            if (match) {
                const earthquakes = match[1].split('').slice(48, match[1].split('').length).join('').trim().split(/\n/g);

                const arr = [];
                let depths = 0;
                let magnitudes = 0;

                for (let i = 0; i < earthquakes.length; i++) {
                    const earthquake = clean(earthquakes[i].split(/\s+/g).filter((item) => item !== '' && item !== '.'));

                    depths += Number(earthquake[4]);
                    magnitudes += Number(earthquake[5]);

                    if (earthquake.length >= 8 && !isNaN(earthquake[6])) {
                        const loc = cleanLocation(earthquake.slice(7, earthquake.length).join(' '));

                        if (loc.includes('(')) {
                            arr.push(loc.split('(')[1].split(')')[0]);
                        } else {
                            arr.push(loc);
                        }
                    } else {
                        const loc = cleanLocation(earthquake.slice(6, earthquake.length).join(' '));

                        if (loc.includes('(')) {
                            arr.push(loc.split('(')[1].split(')')[0]);
                        } else {
                            arr.push(loc);
                        }
                    }
                }

                const eq = mode(arr);
                const l = arr.filter((item) => item === eq).length;

                const json = {
                    average_depth: (depths / earthquakes.length).toFixed(4),
                    average_magnitude: (magnitudes / earthquakes.length).toFixed(4),
                    base: eq,
                    length: l,
                }

                let r = new Date().getTime() - t;

                return res.status(200).json({
                    status: 200,
                    ping: r,
                    alert: 'The values may change because Kandilli observatory can update the data.',
                    message: 'Average depth, magnitude and base of the last 500 earthquakes.',
                    result: json,
                });
            }
        });
});

app.listen(3000, () => {
    console.log('Listening on port 3000.');
});

app.get('/', (req, res) => {
    res.status(200).json({
        status: 200,
        ping: 0,
        message: 'Welcome to the Turkey Earthquake API!',
        endpoints: [
            {
                endpoint: '/all',
                description: 'Returns the last 500 earthquakes.',
                query: {
                    limit: 'Returns the last n earthquakes. (n is a number)',
                    get: 'Returns the nth earthquake. (n is a number)',
                }
            },
            {
                endpoint: '/search',
                description: 'Searches earthquakes by day, month, hour, base and magnitude.',
                query: {
                    day: 'Returns earthquakes on the given day. (day is a number)',
                    month: 'Returns earthquakes on the given month. (month is a number)',
                    hour: 'Returns earthquakes on the given hour. (hour is a number)',
                    base: 'Returns earthquakes on the given base. (base is a string)',
                    magnitude: 'Returns earthquakes on the given magnitude. (magnitude is a number)',
                }
            },
            {
                endpoint: '/latest',
                description: 'Returns the latest earthquake.'
            },
            {
                endpoint: '/average',
                description: 'Returns the average depth, magnitude and base of the last 500 earthquakes.'
            }
        ]
    });
});

const Earthquake = require('./models/Earthquake');
const axios = require("axios");

app.post('/save', (req, res) => {
    if (req.headers['key'] !== 'aminisikim') return;

    get('http://www.koeri.boun.edu.tr/scripts/lst7.asp')
        .then((response) => {
            const regex = /--------------([\s\S]*?)<\/pre>/;
            const match = regex.exec(response.data);

            if (match) {
                const earthquakes = match[1].split('').slice(48, match[1].split('').length).join('').trim().split(/\n/g);

                const arr = [];

                for (let i = 0; i < earthquakes.length; i++) {
                    const earthquake = clean(earthquakes[i].split(/\s+/g).filter((item) => item !== '' && item !== '.'));

                    const obj = {
                        id: i + 1,
                        timestamp: dateToTimestamp(earthquake[0], earthquake[1]),
                        date: earthquake[0],
                        time: earthquake[1],
                        fullDate: `${earthquake[0]} ${earthquake[1]}`,
                        longDate: date(dateToTimestamp(earthquake[0], earthquake[1])) + '^' + dateEn(dateToTimestamp(earthquake[0], earthquake[1])),
                        latitude: Number(earthquake[2]),
                        longitude: Number(earthquake[3]),
                        coordinates: [
                            Number(earthquake[2]),
                            Number(earthquake[3])
                        ],
                        depth: Number(earthquake[4]),
                        magnitude: Number(earthquake[5]),
                    }

                    if (earthquake.length >= 8 && !isNaN(earthquake[6])) {
                        obj['moment'] = Number(earthquake[6]);

                        const loc = cleanLocation(earthquake.slice(7, earthquake.length).join(' '));
                        const regex = /([\s\S]*?)REVIZE01/;

                        if (regex.test(loc)) {
                            obj['location'] = cleanLocation(regex.exec(loc)[1].trim());
                        } else {
                            obj['location'] = cleanLocation(earthquake.slice(7, earthquake.length).join(' '));
                        }

                        if (loc.includes('(')) {
                            obj['base'] = loc.split('(')[1].split(')')[0];
                        } else {
                            obj['base'] = loc;
                        }
                    } else {
                        const loc = cleanLocation(earthquake.slice(6, earthquake.length).join(' '));
                        const regex = /([\s\S]*?)REVIZE01/;

                        if (regex.test(loc)) {
                            obj['location'] = cleanLocation(regex.exec(loc)[1].trim());
                        } else {
                            obj['location'] = cleanLocation(earthquake.slice(6, earthquake.length).join(' '));
                        }

                        if (loc.includes('(')) {
                            obj['base'] = loc.split('(')[1].split(')')[0];
                        } else {
                            obj['base'] = loc;
                        }
                    }

                    arr.push(obj);
                }

                Earthquake.find({})
                    .then((data) => {
                        const last = data[data.length - 1];
                        if (arr.filter((item) => item.longDate === last.longDate && item.latitude === last.latitude && item.longitude === last.longitude && item.timestamp === last.timestamp).length === 0) return res.send('yok')
                        const filtered = arr.slice(0, arr.filter((item) => item.longDate === last.longDate && item.latitude === last.latitude && item.longitude === last.longitude && item.timestamp === last.timestamp)[0].id - 1);

                        for (let i = filtered.length - 1; i >= 0; i--) {
                            const newEq = new Earthquake({
                                timestamp: filtered[i].timestamp,
                                date: filtered[i].date,
                                time: filtered[i].time,
                                fullDate: filtered[i].fullDate,
                                longDate: filtered[i].longDate,
                                latitude: filtered[i].latitude,
                                longitude: filtered[i].longitude,
                                coordinates: filtered[i].coordinates,
                                depth: filtered[i].depth,
                                magnitude: filtered[i].magnitude,
                                moment: filtered[i].moment,
                                location: filtered[i].location,
                                base: filtered[i].base,
                                createdAt: new Date(),
                            })

                            newEq.save();
                        }
                    });

                return res.send('tm bak')
            }
        });
});

setInterval(() => {
    axios.post('https://deprem-api-orhan-hasan-diff.vercel.app/save', null, {
        headers: {
            key: 'aminisikim'
        }
    })
}, 450000);
