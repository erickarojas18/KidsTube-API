const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const History = require("../models/History");
const Video = require("../models/Video");

// Obtener historial de un usuario
router.get('/user/:userId', async (req, res) => {
    try {
        console.log('🔍 Buscando historial de reproducción para userId:', req.params.userId);
        
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ message: 'ID de usuario inválido' });
        }

        const history = await History.find({ userId: req.params.userId })
            .sort({ watchedAt: -1 })
            .populate('videoId', 'name url description')
            .limit(50);

        console.log('✅ Historial encontrado:', history.length, 'registros');
        res.json(history);
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

        // Verificar que el video existe
        const video = await Video.findById(videoId);
        if (!video) {
            console.error('❌ Video no encontrado:', videoId);
            return res.status(404).json({ message: 'Video no encontrado' });
        }

        const history = new History({
            userId,
            videoId
        });
        
        await history.save();
        console.log('✅ Historial guardado:', history);
        
        // Poblar el video para la respuesta
        await history.populate('videoId', 'name url description');
        
        res.status(201).json(history);
    } catch (error) {
        console.error('❌ Error al registrar video en el historial:', error);
        res.status(500).json({ message: 'Error al registrar en el historial' });
    }
});

// Limpiar historial de un usuario
router.delete('/user/:userId', async (req, res) => {
    try {
        console.log('🗑️ Limpiando historial para usuario:', req.params.userId);
        
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ message: 'ID de usuario inválido' });
        }

        await History.deleteMany({ userId: req.params.userId });
        console.log('✅ Historial limpiado exitosamente');
        
        res.json({ message: 'Historial limpiado exitosamente' });
    } catch (error) {
        console.error('❌ Error al limpiar historial:', error);
        res.status(500).json({ message: 'Error al limpiar el historial' });
    }
});

module.exports = router;
