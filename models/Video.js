const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String }
});

module.exports = mongoose.model('Video', VideoSchema);
