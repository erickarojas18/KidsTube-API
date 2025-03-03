require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.use('/api/videos', require('./routes/videos'));
app.use('/api/auth', require('./routes/auth')); 


const userRoutes = require("./routes/users"); // Importa la ruta
app.use("/api/users", userRoutes); // Asigna la ruta

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
