const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    profiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RestrictedUser' }],
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }]
});

module.exports = mongoose.model('Playlist', PlaylistSchema);
