const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const router = express.Router();

// Registrar usuario
router.post("/register", async (req, res) => {
  try {
    const { email, password, phone, pin, name, lastname, country, birthdate } = req.body;

    // Validar que el usuario sea mayor de 18 años
    const birthDateObj = new Date(birthdate);
    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();
    if (age < 18) {
      return res.status(400).json({ message: "Debes ser mayor de 18 años" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      phone,
      pin,
      name,
      lastname,
      country,
      birthdate,
    });

    await newUser.save();
    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario", error });
  }
});
 // Login de usuario
router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Buscar usuario en la base de datos
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Usuario no encontrado ❌" });
      }
  
      // Comparar contraseña con bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Contraseña incorrecta ❌" });
      }
  
      res.status(200).json({ message: "Login exitoso 🎉", user });
    } catch (error) {
      res.status(500).json({ message: "Error en el login ❌", error });
    }
  });
  
module.exports = router;
