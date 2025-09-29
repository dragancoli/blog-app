// src/controllers/postController.js
const db = require('../config/db');

// Kreiranje posta
exports.createPost = async (req, res) => {
  const { title, content } = req.body;
  // req.user.id dolazi iz authMiddleware-a!
  const authorId = req.user.id;

  try {
    const newPost = await db.query(
      'INSERT INTO posts (title, content, author_id) VALUES ($1, $2, $3) RETURNING *',
      [title, content, authorId]
    );
    res.status(201).json(newPost.rows[0]);
  } catch (err) {
    res.status(500).send('Greška na serveru');
  }
};

// Dobavljanje svih postova
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await db.query('SELECT p.id, p.title, p.created_at, u.username as author FROM posts p JOIN users u ON p.author_id = u.id ORDER BY p.created_at DESC');
        res.json(posts.rows);
    } catch (err) {
        res.status(500).send('Greška na serveru');
    }
};

// Dobavljanje jednog posta
exports.getPostById = async (req, res) => {
    try {
        const post = await db.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);
        if (post.rows.length === 0) {
            return res.status(404).json({ message: 'Post nije pronađen.' });
        }
        res.json(post.rows[0]);
    } catch (err) {
        res.status(500).send('Greška na serveru');
    }
};


// Brisanje posta
exports.deletePost = async (req, res) => {
  try {
    const post = await db.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);

    if (post.rows.length === 0) {
      return res.status(404).json({ msg: 'Post nije pronađen' });
    }

    // Provera da li je korisnik koji briše post zaista i autor posta
    if (post.rows[0].author_id !== req.user.id) {
      return res.status(403).json({ msg: 'Nemate dozvolu za ovu akciju.' });
    }

    await db.query('DELETE FROM posts WHERE id = $1', [req.params.id]);

    res.json({ msg: 'Post obrisan.' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Implementacija za updatePost je slična kao za delete (sa proverom vlasništva)
exports.updatePost = async (req, res) => {
    try {
        const post = await db.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);

        if(post.rows.length === 0) {
            return res.status(404).json({ msg: 'Post nije pronađen' });
        }

        if(post.rows[0].author_id !== req.user.id) {
            return res.status(403).json({ msg: 'Nemate dozvolu za ovu akciju.' });
        }

        const updatedPost = await db.query('UPDATE posts SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [req.body.title, req.body.content, req.params.id]);

        //res.json({ msg: 'Post ažuriran.' }); -- MOZE I JEDNO I DRUGO
        res.json(updatedPost.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};