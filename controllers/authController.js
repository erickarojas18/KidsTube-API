const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { sendVerificationEmail } = require("../Servicemail");
const { sendSMS } = require("../SmsService");  // Importa el servicio para enviar SMS

// REGISTRO
const register = async (req, res) => {
  try {
    const { email, password, phone, pin, name, lastname, country, birthdate } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "El correo ya está en uso." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString("hex");

    const user = new User({
      email,
      password: hashedPassword,
      phone,
      pin,
      name,
      lastname,
      country,
      birthdate,
      isVerified: false,
      verificationToken: token
    });

    await user.save();
    await sendVerificationEmail(user);

    res.status(201).json({ message: "Registro exitoso. Verificá tu correo para activar la cuenta." });
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ message: "Error al registrar el usuario." });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    if (!user.isVerified) return res.status(403).json({ message: "Verificá tu correo antes de iniciar sesión." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta." });

    // Generar un código único para el SMS
    const smsCode = crypto.randomBytes(3).toString("hex"); // Puedes modificar la longitud del código

    // Guardar el código en el usuario para la validación posterior
    user.smsCode = smsCode;
    await user.save();

    // Enviar el SMS con el código
    await sendSMS(user.phone, `Tu código de autenticación es: ${smsCode}`);

    res.status(200).json({ message: "Inicio de sesión exitoso. Te hemos enviado un código de verificación por SMS.", userId: user._id });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error al iniciar sesión." });
  }
};

// VERIFICAR CÓDIGO SMS
const verifySMSCode = async (req, res) => {
  const { userId, code } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    if (user.smsCode !== code) {
      return res.status(401).json({ message: "Código incorrecto." });
    }

    // Si el código es correcto, completamos la autenticación
    user.smsCode = undefined; // Limpiar el código después de la verificación
    await user.save();

    res.status(200).json({ message: "Autenticación completada. Bienvenido a la aplicación." });
  } catch (error) {
    console.error("Error al verificar código SMS:", error);
    res.status(500).json({ message: "Error al verificar el código." });
  }
};

// VERIFICAR CORREO (Registra la cuenta)
const verifyUser = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Tu cuenta ya esta verificada." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Tu cuenta ya está verificada. Puedes iniciar sesión." });
    }

    user.isVerified = true;
    user.verifiedAt = new Date();
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Cuenta verificada con éxito." });
  } catch (error) {
    console.error("Error al verificar cuenta:", error);
    res.status(500).json({ message: "Error al verificar la cuenta." });
  }
};

module.exports = {
  register,
  login,
  verifyUser,
  verifySMSCode 
};
