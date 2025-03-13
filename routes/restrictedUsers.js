const express = require("express");
const RestrictedUser = require("../models/RestrictedUser");

const router = express.Router();

// Obtener usuarios restringidos por ID de usuario principal
router.get("/:parentUserId", async (req, res) => {
  try {
    const { parentUserId } = req.params;
    const restrictedUsers = await RestrictedUser.find({ parentUser: parentUserId });
    res.json(restrictedUsers);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los usuarios restringidos", error });
  }
});

// Validar PIN para acceso
router.post("/validate-pin", async (req, res) => {
  try {
    const { userId, pin } = req.body;
    const user = await RestrictedUser.findById(userId);
    
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    if (user.pin !== pin) return res.status(401).json({ message: "PIN incorrecto" });

    res.json({ message: "PIN válido" });
  } catch (error) {
    res.status(500).json({ message: "Error al validar PIN", error });
  }
});

// Agregar usuario restringido
router.post("/add-restricted-user", async (req, res) => {
  try {
    const { name, pin, avatar, parentUser } = req.body;

    if (!name || !pin || !avatar || !parentUser) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    if (pin.length !== 6 || isNaN(pin)) {
      return res.status(400).json({ message: "El PIN debe tener exactamente 6 dígitos numéricos" });
    }

    const newUser = new RestrictedUser({ name, pin, avatar, parentUser });
    await newUser.save();
    res.status(201).json({ message: "Usuario restringido agregado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar usuario restringido", error });
  }
});

// Editar usuario restringido
router.put("/edit-restricted-user/:id", async (req, res) => {
  try {
    const { name, pin, avatar } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (pin) {
      if (pin.length !== 6 || isNaN(pin)) {
        return res.status(400).json({ message: "El PIN debe tener 6 dígitos numéricos" });
      }
      updateData.pin = pin;
    }
    if (avatar) updateData.avatar = avatar;

    const updatedUser = await RestrictedUser.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedUser) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Usuario actualizado correctamente", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar usuario restringido", error });
  }
});

// Eliminar usuario restringido
router.delete("/delete-restricted-user/:id", async (req, res) => {
  try {
    const deletedUser = await RestrictedUser.findByIdAndDelete(req.params.id);

    if (!deletedUser) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario restringido", error });
  }
});

module.exports = router;
