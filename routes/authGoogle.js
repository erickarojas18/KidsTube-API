const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Ruta para validar token de Google
router.post("/auth/google-login", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token no proporcionado" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub } = payload;

    // Buscar usuario por email
    let user = await User.findOne({ email });

    if (!user) {
      // Si no existe, crear uno nuevo
      user = new User({
        email,
        name,
        password: sub, // usar el 'sub' de Google como algo único
        isVerified: true,
      });
      await user.save();
    }

    res.json({
      message: "Login con Google exitoso",
      userId: user._id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Error al verificar token de Google:", error);
    res.status(401).json({ message: "Token inválido", error: error.message });
  }
});

module.exports = router;
