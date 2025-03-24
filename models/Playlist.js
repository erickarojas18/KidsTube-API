const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    profiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }] // Relación con videos
});

module.exports = mongoose.model('Playlist', PlaylistSchema);
