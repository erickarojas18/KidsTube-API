const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { email, password, phone, pin, firstName, lastName, country, birthDate } = req.body;

        // Verificar que el usuario sea mayor de 18 años
        const birthDateObj = new Date(birthDate);
        const age = new Date().getFullYear() - birthDateObj.getFullYear();
        if (age < 18) return res.status(400).json({ message: 'Debes ser mayor de 18 años.' });

        // Crear usuario
        const user = new User({ email, password, phone, pin, firstName, lastName, country, birthDate });
        await user.save();

        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: 'Usuario o contraseña inválida' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
