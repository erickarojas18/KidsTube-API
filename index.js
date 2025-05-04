require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const User = require("./models/User");
const mongoose = require("mongoose");
const session = require("express-session");


const app = express();
app.use(express.json());
app.use(cors());

connectDB();

//  Rutas
const playlistsRouter = require('./routes/playlists');
const restrictedUserRoutes = require("./routes/restrictedUsers");
const userRoutes = require("./routes/users");
const playlistRoutes = require("./routes/playlists");
const historyRoutes = require("./routes/history");
const authRoutes = require("./routes/auth");

//  Ruta para login con Google
const googleAuthRoutes = require("./routes/authGoogle");

app.use("/api/playlists", playlistsRouter);
app.use("/api/videos", require("./routes/videos"));
app.use("/api/auth", authRoutes);
app.use("/api/restricted-users", restrictedUserRoutes);
app.use("/api/users", userRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/history", historyRoutes);
app.use("/api", googleAuthRoutes);

// Validar PIN admin
app.post("/api/validate-admin-pin", async (req, res) => {
  try {
    const { userId, pin } = req.body;

    if (!userId || !pin) {
      return res.status(400).json({ message: "Faltan datos" });
    }

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`📁 API endpoints disponibles:`);
  console.log(`   - /api/auth`);
  console.log(`   - /api/videos`);
  console.log(`   - /api/restricted-users`);
  console.log(`   - /api/users`);
  console.log(`   - /api/playlists`);
  console.log(`   - /api/google (login con Google)`);
});
