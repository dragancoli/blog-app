// src/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  // 1. Preuzimanje podataka iz tela zahteva
  const { username, email, password } = req.body;

  // Jednostavna validacija
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Sva polja su obavezna.' });
  }

  try {
    // 2. Provera da li korisnik već postoji
    const userExists = await db.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Korisnik sa tim email-om ili username-om već postoji.' });
    }

    // 3. Heširanje lozinke
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 4. Upis novog korisnika u bazu
    const newUser = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username',
      [username, email, password_hash]
    );

    // 5. Kreiranje JWT tokena
    const token = jwt.sign(
        { id: newUser.rows[0].id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    // 6. Slanje odgovora nazad klijentu
    res.status(201).json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Greška na serveru');
  }
};

exports.login = async (req, res) => {
  // 1. Preuzimanje podataka iz tela zahteva
  const { email, password } = req.body;

  try {
    // 2. Provera da li korisnik sa datim email-om postoji
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      // Iz bezbednosnih razloga, ne govorimo da li je email ili lozinka pogrešna
      return res.status(400).json({ message: 'Pogrešan email ili lozinka.' });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );

    if (!validPassword) {
      return res.status(400).json({ message: 'Pogrešan email ili lozinka.' });
    }

    // 4. Ako je sve u redu, kreiramo novi token
    const token = jwt.sign(
        { id: user.rows[0].id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    // 5. Šaljemo token nazad klijentu
    res.status(200).json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Greška na serveru');
  }
};