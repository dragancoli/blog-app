// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); 
const postRoutes = require('./routes/postRoutes'); 
const commentRoutes = require('./routes/commentRoutes'); 
const userRoutes = require('./routes/userRoutes');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Omogućava komunikaciju sa frontendom
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
//! app.use(express.json()); // Omogućava čitanje JSON podataka iz tela zahteva

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api', commentRoutes); 
app.use('/api/users', userRoutes); 

app.listen(PORT, () => {
  console.log(`Server sluša na portu ${PORT}`);
});