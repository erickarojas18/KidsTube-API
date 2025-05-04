const express = require('express');
const { register, login, verifyUser,  verifySMSCode } = require('../controllers/authController');
const router = express.Router();
const User = require("../models/User");

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verifyUser); 
router.post('/verify-sms', verifySMSCode);



module.exports = router;
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Ruta para login con Google
router.post("/google-login", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Token de Google no proporcionado" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, given_name, family_name } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no registrado" });
    }
    res.status(200).json({
      message: "Inicio de sesión con Google exitoso",
      userId: user._id, 
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      }
    });
  } catch (error) {
    console.error("Error en login con Google:", error);
    res.status(500).json({ message: "Error en login con Google", error: error.message });
  }
});
