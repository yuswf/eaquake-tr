const app = require('express')();
const {get} = require('axios');
const cors = require('cors');

// Helpers
const {clean, cleanLocation, mode} = require('./utils/clean');
const {date, dateToTimestamp} = require('./utils/date');

// Middlewares
app.use(cors());
app.options('*', cors());

app.get('/all', (req, res) => {
    let t = new Date().getTime();

    setTimeout(() => {
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
                        longDate: date(dateToTimestamp(earthquake[0], earthquake[1]), 'tr-TR') + '^' + date(dateToTimestamp(earthquake[0], earthquake[1])),
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
        }, 200)
});

app.get('/latest', (req, res) => {
    let t = new Date().getTime();

    setTimeout(() => {
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
                    longDate: date(dateToTimestamp(earthquake[0], earthquake[1]), 'tr-TR') + '^' + date(dateToTimestamp(earthquake[0], earthquake[1])),
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
    }, 200);
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
                        longDate: date(dateToTimestamp(earthquake[0], earthquake[1]), 'tr-TR') + '^' + date(dateToTimestamp(earthquake[0], earthquake[1])),
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

    setTimeout(() => {
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
    }, 200);
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

app.listen(3000, () => {
    console.log('Listening on port 3000.');
});
