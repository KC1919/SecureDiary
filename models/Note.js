const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const noteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    text: [{
        title: String,
        data: String
    }],
    image: [{
        title: String,
        data: String
    }],
    date: {
        type: Date,
        default: Date.now
    },
});

const Note = mongoose.model('notes', noteSchema);

module.exports = Note;