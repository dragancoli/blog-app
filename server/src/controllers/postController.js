// src/controllers/postController.js
const db = require('../config/db');
const cloudinary = require('../config/cloudinary');

// Funkcija za upload na Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Kreiranje posta
exports.createPost = async (req, res) => {
  const { title, content } = req.body;
  const authorId = req.user.id;
  let imageUrl = null;

  try {
    // Provera da li je fajl poslat
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const newPost = await db.query(
      'INSERT INTO posts (title, content, author_id, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, authorId, imageUrl]
    );
    res.status(201).json(newPost.rows[0]);
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).send('Greška na serveru');
  }
};

// Dobavljanje svih postova
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await db.query('SELECT p.id, p.title, p.created_at, p.image_url, u.username as author FROM posts p JOIN users u ON p.author_id = u.id ORDER BY p.created_at DESC');
        res.json(posts.rows);
    } catch (err) {
        res.status(500).send('Greška na serveru');
    }
};

// Dobavljanje jednog posta
exports.getPostById = async (req, res) => {
    try {
        const post = await db.query(
          `SELECT p.id, p.title, p.content, p.created_at, p.updated_at, p.image_url,
            p.author_id, u.username AS author
            FROM posts p
            JOIN users u ON u.id = p.author_id
            WHERE p.id = $1`,
        [req.params.id]);
        if (post.rows.length === 0) {
            return res.status(404).json({ message: 'Post nije pronađen.' });
        }
        res.json(post.rows[0]);
    } catch (err) {
        res.status(500).send('Greška na serveru');
    }
};


// Ažuriranje posta
exports.updatePost = async (req, res) => {
    try {
        const post = await db.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);
        if(post.rows.length === 0) return res.status(404).json({ msg: 'Post nije pronađen' });
        if(post.rows[0].author_id !== req.user.id) return res.status(403).json({ msg: 'Nemate dozvolu.' });

        const { title, content } = req.body;
        let imageUrl = post.rows[0].image_url;

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
        }

        const updatedPost = await db.query(
            'UPDATE posts SET title = $1, content = $2, image_url = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
            [title, content, imageUrl, req.params.id]
        );
        
        res.json(updatedPost.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};