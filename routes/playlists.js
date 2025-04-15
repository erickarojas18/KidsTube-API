const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const mongoose = require('mongoose');

// ✅ Obtener TODAS las playlists (administración general o debugging)
router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find()
      .populate('videos', 'name url description')
      .populate('profiles', 'name email avatar');
      
    res.json(playlists);
  } catch (error) {
    console.error('❌ Error al obtener playlists:', error);
    res.status(500).json({ message: 'Error al obtener las playlists', error: error.message });
  }
});

// ✅ Obtener playlists de un usuario (perfil restringido)
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'ID de usuario inválido' });
  }

  try {
    const playlists = await Playlist.find({ profiles: userId })
      .populate('videos', 'name url description')
      .populate('profiles', 'name email avatar');
      
    res.json(playlists);
  } catch (error) {
    console.error('❌ Error al obtener playlists del usuario:', error);
    res.status(500).json({ message: 'Error al obtener las playlists', error: error.message });
  }
});

// ✅ Crear una nueva playlist
router.post('/', async (req, res) => {
  try {
    const playlist = new Playlist(req.body);
    await playlist.save();

    const populated = await Playlist.findById(playlist._id)
      .populate('videos')
      .populate('profiles', 'name email avatar');

    res.status(201).json(populated);
  } catch (error) {
    console.error('❌ Error al crear playlist:', error);
    res.status(500).json({ message: 'Error al crear la playlist' });
  }
});

// ✅ Eliminar una playlist
router.delete('/:id', async (req, res) => {
  try {
    await Playlist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Playlist eliminada exitosamente' });
  } catch (error) {
    console.error('❌ Error al eliminar playlist:', error);
    res.status(500).json({ message: 'Error al eliminar la playlist' });
  }
});

// ✅ Obtener miembros de una playlist
router.get('/:playlistId/members', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId)
      .populate('profiles', 'name email avatar');

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist no encontrada' });
    }

    res.json(playlist.profiles);
  } catch (error) {
    console.error('❌ Error al obtener miembros:', error);
    res.status(500).json({ message: 'Error al obtener los miembros' });
  }
});

// ✅ Agregar video a una playlist
router.post('/:playlistId/videos', async (req, res) => {
  try {
    const { videoId } = req.body;
    const playlist = await Playlist.findById(req.params.playlistId);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist no encontrada' });
    }

    if (playlist.videos.includes(videoId)) {
      return res.status(400).json({ message: 'El video ya está en la playlist' });
    }

    playlist.videos.push(videoId);
    await playlist.save();

    const updated = await Playlist.findById(playlist._id)
      .populate('videos')
      .populate('profiles', 'name email avatar');

    res.json(updated);
  } catch (error) {
    console.error('❌ Error al agregar video:', error);
    res.status(500).json({ message: 'Error al agregar el video a la playlist' });
  }
});

// ✅ Eliminar video de una playlist
router.delete('/:playlistId/videos/:videoId', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist no encontrada' });
    }

    playlist.videos = playlist.videos.filter(
      (v) => v.toString() !== req.params.videoId
    );
    await playlist.save();

    res.json({ message: 'Video eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error al eliminar video:', error);
    res.status(500).json({ message: 'Error al eliminar el video de la playlist' });
  }
});

// ✅ Obtener historial de reproducción del usuario (videos vistos en playlists)
router.get('/history/user/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'ID de usuario inválido' });
  }

  try {
    const playlists = await Playlist.find({ profiles: userId })
      .populate('videos', 'name url description');

    const history = playlists.flatMap((playlist) => playlist.videos);

    res.json({ history });
  } catch (error) {
    console.error('❌ Error al obtener historial:', error);
    res.status(500).json({ message: 'Error al obtener el historial' });
  }
});

// ✅ Editar una playlist
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, profiles } = req.body;

    // Validar que el ID sea válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de playlist inválido' });
    }

    // Verificar si la playlist existe
    const existingPlaylist = await Playlist.findById(id);
    if (!existingPlaylist) {
      return res.status(404).json({ message: 'Playlist no encontrada' });
    }

    // Preparar los datos de actualización
    const updates = {};
    if (name) updates.name = name;
    if (profiles) updates.profiles = profiles;

    // Actualizar la playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    )
      .populate('videos', 'name url description')
      .populate('profiles', 'name email avatar');

    res.json({
      message: 'Playlist actualizada exitosamente',
      playlist: updatedPlaylist
    });
  } catch (error) {
    console.error('❌ Error al editar playlist:', error);
    res.status(500).json({ 
      message: 'Error al editar la playlist', 
      error: error.message 
    });
  }
});

module.exports = router;
