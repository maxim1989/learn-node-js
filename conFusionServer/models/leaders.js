const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leadersShema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    abbr: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false      
    }
}, {
    timestamps: true
});

var Leaders = mongoose.model('Leader', leadersShema);

module.exports = Leaders;
