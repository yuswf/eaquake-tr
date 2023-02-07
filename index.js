const app = require('express')();
const {get} = require('axios');

function clean(arr) {
    return arr.slice(0, arr.length - 1).filter((item) => item !== '-.-');
}

app.get('/all', (req, res) => {
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
                        date: earthquake[0],
                        time: earthquake[1],
                        latitude: earthquake[2],
                        longitude: earthquake[3],
                        depth: earthquake[4],
                        magnitude: earthquake[5],
                    }

                    if (earthquake.length > 8) {
                        obj['moment'] = earthquake[6];
                        obj['location'] = earthquake[7] + ' ' + earthquake[8];
                    } else {
                        obj['location'] = earthquake[6] + ' ' + earthquake[7];
                    }

                    arr.push(obj);
                }

                if (req.query.limit && req.query.limit > 0 && !isNaN(req.query.limit)) {
                    return res.status(200).json({
                        status: 200,
                        result: arr.slice(0, req.query.limit)
                    });
                }

                return res.status(200).json({
                    status: 200,
                    result: arr
                });
            }
        });
});

app.get('/latest', (req, res) => {
    get('http://www.koeri.boun.edu.tr/scripts/lst7.asp')
        .then((response) => {
            const regex = /--------------([\s\S]*?)<\/pre>/;
            const match = regex.exec(response.data);

            if (match) {
                const earthquakes = match[1].split('').slice(48, match[1].split('').length).join('').trim().split(/\n/g);
                const earthquake = clean(earthquakes[0].split(/\s+/g).filter((item) => item !== '' && item !== '.'));

                const arr = [];

                const obj = {
                    date: earthquake[0],
                    time: earthquake[1],
                    latitude: earthquake[2],
                    longitude: earthquake[3],
                    depth: earthquake[4],
                    magnitude: earthquake[5],
                }

                if (earthquake.length > 8) {
                    obj['moment'] = earthquake[6];
                    obj['location'] = earthquake[7] + ' ' + earthquake[8];
                } else {
                    obj['location'] = earthquake[6] + ' ' + earthquake[7];
                }

                arr.push(obj);

                return res.status(200).json({
                    status: 200,
                    result: arr
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
        message: 'Welcome to the Turkey Earthquake API!',
        endpoints: [
            {
                endpoint: '/all',
                description: 'Returns the last 500 earthquakes.',
                query: {
                    limit: 'Returns the last n earthquakes. (n is a number)'
                }
            },
            {
                endpoint: '/latest',
                description: 'Returns the latest earthquake.'
            }
        ]
    });
});

