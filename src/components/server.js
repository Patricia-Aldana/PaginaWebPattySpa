const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost/pattyspa', { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

UserSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model('User', UserSchema);

app.use(express.json());

// Ruta para registro de usuario
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = new User({ username, password });
    await user.save();
    console.log('Usuario registrado:', username);
    res.status(200).send('Usuario registrado correctamente.');
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).send('Hubo un error al registrar el usuario.');
  }
});

// Ruta para inicio de sesión
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('Usuario no encontrado.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Contraseña incorrecta.');
    }

    res.status(200).send('Inicio de sesión exitoso.');
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).send('Hubo un error al iniciar sesión.');
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
