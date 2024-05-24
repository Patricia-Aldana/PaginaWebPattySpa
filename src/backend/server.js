const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
connectDB();

app.use(express.json());

// Ruta para registro de usuario
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).send('Usuario registrado correctamente.');
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).send('Error al registrar usuario.');
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
