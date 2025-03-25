// En tu carpeta de API: routes/playlists.js
const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const mongoose = require('mongoose');

// Obtener todas las playlists
router.get('/', async (req, res) => {
    try {
        console.log('🔍 Iniciando búsqueda de playlists...');
        
        const playlists = await Playlist.find()
            .populate({
                path: 'videos',
                select: 'name url description'
            })
            .populate({
                path: 'profiles',
                select: 'name email'
            });

        console.log('✅ Playlists encontradas:', playlists);
        res.json(playlists);
    } catch (error) {
        console.error('❌ Error al obtener playlists:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            message: 'Error al obtener las playlists',
            error: error.message 
        });
    }
});

// Obtener playlists de un usuario específico
router.get('/user/:userId', async (req, res) => {
    try {
        console.log('🔍 Buscando playlists para userId:', req.params.userId);
        
        // Verificar si el userId es válido
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            console.log('❌ ID de usuario inválido');
            return res.status(400).json({ message: 'ID de usuario inválido' });
        }

        // Buscar playlists donde el usuario es miembro
        const playlists = await Playlist.find({
            profiles: { $in: [req.params.userId] }
        })
        .populate('videos')
        .populate('profiles', 'name email avatar');

        console.log('📋 Playlists encontradas:', playlists);

        // Devolver las playlists encontradas (incluso si está vacío)
        res.json(playlists);
    } catch (error) {
        console.error('❌ Error al obtener playlists del usuario:', error);
        res.status(500).json({ 
            message: 'Error al obtener las playlists',
            error: error.message 
        });
    }
});

// Crear una nueva playlist
router.post('/', async (req, res) => {
    try {
        const playlist = new Playlist(req.body);
        await playlist.save();
        res.status(201).json(playlist);
    } catch (error) {
        console.error('Error al crear playlist:', error);
        res.status(500).json({ message: 'Error al crear la playlist' });
    }
});

// Eliminar una playlist
router.delete('/:id', async (req, res) => {
    try {
        await Playlist.findByIdAndDelete(req.params.id);
        res.json({ message: 'Playlist eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar playlist:', error);
        res.status(500).json({ message: 'Error al eliminar la playlist' });
    }
});

// Obtener miembros de una playlist
router.get('/:playlistId/members', async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.playlistId)
            .populate('profiles', 'name email avatar');
        
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist no encontrada' });
        }

        res.json(playlist.profiles);
    } catch (error) {
        console.error('Error al obtener miembros:', error);
        res.status(500).json({ message: 'Error al obtener los miembros' });
    }
});

// Agregar video a una playlist
router.post('/:playlistId/videos', async (req, res) => {
    try {
        const { videoId } = req.body;
        const playlist = await Playlist.findById(req.params.playlistId);

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist no encontrada' });
        }

        // Verificar si el video ya existe en la playlist
        if (playlist.videos.includes(videoId)) {
            return res.status(400).json({ message: 'El video ya está en la playlist' });
        }

        // Agregar el video a la playlist
        playlist.videos.push(videoId);
        await playlist.save();

        // Obtener la playlist actualizada con los videos poblados
        const updatedPlaylist = await Playlist.findById(playlist._id)
            .populate('videos')
            .populate('profiles', 'name email avatar');

        res.json(updatedPlaylist);
    } catch (error) {
        console.error('Error al agregar video:', error);
        res.status(500).json({ message: 'Error al agregar el video a la playlist' });
    }
});

// Eliminar video de una playlist
router.delete('/:playlistId/videos/:videoId', async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.playlistId);

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist no encontrada' });
        }

        playlist.videos = playlist.videos.filter(v => v._id.toString() !== req.params.videoId);
        await playlist.save();

        res.json({ message: 'Video eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar video de la playlist:', error);
        res.status(500).json({ message: 'Error al eliminar el video de la playlist' });
    }
});

module.exports = router;