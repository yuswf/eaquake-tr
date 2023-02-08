const {Schema, model} = require('mongoose');

const EarthquakeSchema = new Schema({
    timestamp: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    fullDate: {
        type: String,
        required: true
    },
    longDate: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    coordinates: {
        type: Array,
        required: true
    },
    depth: {
        type: Number,
        required: true
    },
    magnitude: {
        type: Number,
        required: true
    },
    moment: {
        type: Number,
        required: false,
    },
    location: {
        type: String,
        required: true
    },
    base: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        value: new Date(),
        required: true,
    }
});
const Earthquake = model('Earthquake', EarthquakeSchema);

module.exports = Earthquake;
