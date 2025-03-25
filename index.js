require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const User = require("./models/User"); // Importa el modelo de usuario
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());

connectDB();


const playlistsRouter = require('./routes/playlists');

app.use('/api/playlists', playlistsRouter);


app.use("/api/videos", require("./routes/videos"));
app.use("/api/auth", require("./routes/auth"));

const restrictedUserRoutes = require("./routes/restrictedUsers");
app.use("/api/restricted-users", restrictedUserRoutes);

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

const playlistRoutes = require("./routes/playlists");
app.use("/api/playlists", playlistRoutes);

const historyRoutes = require("./routes/history");
app.use("/api/history", historyRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    console.log(`📁 API endpoints disponibles:`);
    console.log(`   - /api/auth`);
    console.log(`   - /api/videos`);
    console.log(`   - /api/restricted-users`);
    console.log(`   - /api/users`);
    console.log(`   - /api/playlists`);
});


app.post("/api/validate-admin-pin", async (req, res) => {
    try {
      const { userId, pin } = req.body;
  
      if (!userId || !pin) {
        return res.status(400).json({ message: "Faltan datos" });
      }
  
      // Validar si userId es un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "ID de usuario no válido" });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      if (user.pin !== pin) {
        return res.status(401).json({ message: "PIN incorrecto" });
      }
  
      res.json({ message: "PIN válido" });
    } catch (error) {
      console.error(" Error al validar PIN:", error);
      res.status(500).json({ message: "Error al validar PIN", error: error.message });
    }
  });

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "¡Algo salió mal!", error: err.message });
});