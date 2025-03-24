const express = require("express");
const Playlist = require("../models/Playlist");
const router = express.Router();

// Obtener todas las playlists
router.get("/", async (req, res) => {
    try {
        const playlists = await Playlist.find();
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener playlists" });
    }
});

// Obtener una playlist con sus videos
router.get('/:id', async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id).populate('videos');
        if (!playlist) {
            return res.status(404).json({ error: "Playlist no encontrada" });
        }
        res.json(playlist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener playlists asociadas a un usuario restringido
router.get("/user/:userId", async (req, res) => {
    try {
        const playlists = await Playlist.find({ profiles: req.params.userId });
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener playlists" });
    }
});

// Crear una nueva playlist
router.post("/", async (req, res) => {
    const { name, profiles } = req.body;

    if (!name || !profiles || profiles.length === 0) {
        return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    try {
        const newPlaylist = new Playlist({ name, profiles, videos: [] });
        await newPlaylist.save();
        res.json({ message: "Playlist creada", playlist: newPlaylist });
    } catch (error) {
        res.status(500).json({ error: "Error al crear playlist" });
    }
});

// Editar una playlist (nombre y perfiles)
router.put("/:id", async (req, res) => {
    const { name, profiles } = req.body;

    try {
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            req.params.id,
            { name, profiles },
            { new: true }
        );
        if (!updatedPlaylist) {
            return res.status(404).json({ error: "Playlist no encontrada" });
        }
        res.json({ message: "Playlist actualizada", playlist: updatedPlaylist });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar playlist" });
    }
});

// Agregar un video a una playlist
router.put("/:id/videos", async (req, res) => {
    const { videoId } = req.body;

    if (!videoId) {
        return res.status(400).json({ error: "El ID del video es requerido" });
    }

    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).json({ error: "Playlist no encontrada" });
        }

        playlist.videos.push(videoId);
        await playlist.save();

        res.json({ message: "Video agregado a la playlist", playlist });
    } catch (error) {
        res.status(500).json({ error: "Error al agregar video a la playlist" });
    }
});

// Eliminar una playlist
router.delete("/:id", async (req, res) => {
    try {
        const deletedPlaylist = await Playlist.findByIdAndDelete(req.params.id);
        if (!deletedPlaylist) {
            return res.status(404).json({ error: "Playlist no encontrada" });
        }
        res.json({ message: "Playlist eliminada" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar playlist" });
    }
});

module.exports = router;
