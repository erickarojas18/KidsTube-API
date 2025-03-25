const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Playlist = require("../models/Playlist");

// Obtener historial de un usuario
router.get('/user/:userId', async (req, res) => {
    try {
        console.log('🔍 Buscando historial de reproducción para userId:', req.params.userId);
        
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ message: 'ID de usuario inválido' });
        }

        const playlists = await Playlist.find({
            profiles: req.params.userId
        }).populate('videos', 'name url description');

        const history = playlists.flatMap(playlist => playlist.videos);

        res.json({ history });
    } catch (error) {
        console.error('❌ Error al obtener el historial de reproducción:', error);
        res.status(500).json({ message: 'Error al obtener el historial' });
    }
});

// Registrar un video en el historial
router.post('/', async (req, res) => {
    try {
        const { userId, videoId } = req.body;
        
        console.log(`📝 Registrando video ${videoId} en historial de usuario ${userId}`);

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ message: 'ID de usuario o video inválido' });
        }

        const playlist = await Playlist.findOne({ profiles: userId });

        if (!playlist) {
            return res.status(404).json({ message: 'No se encontró una playlist asociada al usuario' });
        }

        playlist.videos.push(videoId);
        await playlist.save();

        res.json({ message: 'Video agregado al historial exitosamente' });
    } catch (error) {
        console.error('❌ Error al registrar video en el historial:', error);
        res.status(500).json({ message: 'Error al registrar en el historial' });
    }
});

module.exports = router;
