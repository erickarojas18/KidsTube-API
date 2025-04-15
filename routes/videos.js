const express = require('express');
const router = express.Router();
const Video = require('../models/Video');

// Crear un nuevo video
router.post('/', async (req, res) => {
    try {
        const video = new Video(req.body);
        await video.save();
        res.status(201).json(video);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Obtener todos los videos
router.get('/', async (req, res) => {
    try {
        const videos = await Video.find();
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Editar un video
router.put('/:id', async (req, res) => {
    try {
        const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(video);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Eliminar un video
router.delete('/:id', async (req, res) => {
    try {
        await Video.findByIdAndDelete(req.params.id);
        res.json({ message: '204 delete' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
