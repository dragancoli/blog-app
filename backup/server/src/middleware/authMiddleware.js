// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Uzmi token iz header-a
  const token = req.header('x-auth-token');

  // 2. Proveri da li token postoji
  if (!token) {
    return res.status(401).json({ message: 'Pristup odbijen. Nema tokena.' });
  }

  // 3. Verifikuj token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Dodajemo dekodirane podatke (npr. user id) u request objekat
    // kako bi bili dostupni u sledećoj funkciji (npr. u kontroleru)
    req.user = decoded;
    next(); // Pozivamo sledeću funkciju u nizu
  } catch (err) {
    res.status(401).json({ message: 'Token nije validan.' });
  }
};