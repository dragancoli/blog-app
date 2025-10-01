// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // Uvozimo rute
const postRoutes = require('./routes/postRoutes'); // Uvozimo rute
const commentRoutes = require('./routes/commentRoutes'); // Uvozimo rute
const userRoutes = require('./routes/userRoutes');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Omogućava komunikaciju sa frontendom
app.use(express.json()); // Omogućava čitanje JSON podataka iz tela zahteva
// Definisanje osnovne rute za autentifikaciju
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api', commentRoutes); // Dodajemo rute za komentare
app.use('/api/users', userRoutes); // Dodajemo rute za korisnike

app.listen(PORT, () => {
  console.log(`Server sluša na portu ${PORT}`);
});