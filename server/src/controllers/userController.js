// src/controllers/userController.js
const db = require("../config/db");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: "avatars" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

exports.getMe = async (req, res) => {
  try {
    const user = await db.query(
      `SELECT id, username, email, bio, avatar_url, created_at, updated_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Korisnik nije pronađen." });
    }
    res.json(user.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Greška na serveru." });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await db.query(
      `SELECT id, username, bio, avatar_url, created_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Korisnik nije pronađen." });
    }

    const postsCount = await db.query("SELECT COUNT(*)::int as count FROM posts WHERE author_id = $1", [req.params.id]);

    res.json({ ...user.rows[0], posts_count: postsCount.rows[0].count });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Greška na serveru." });
  }
};

exports.updateMe = async (req, res) => {
  const { bio } = req.body;
  let newAvatarUrl = null;

  try {
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      newAvatarUrl = result.secure_url;
    }

    const updated = await db.query(
      `UPDATE users
       SET bio = COALESCE($1, bio),
           avatar_url = COALESCE($2, avatar_url),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, username, email, bio, avatar_url, created_at, updated_at`,
      [bio ?? null, newAvatarUrl, req.user.id]
    );

    res.json(updated.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Greška na serveru." });
  }
};

exports.getPostsForUser = async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT p.id, p.title, p.created_at, p.image_url
       FROM posts p
       WHERE p.author_id = $1
       ORDER BY p.created_at DESC`,
      [req.params.id]
    );
    res.json(rows.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Greška na serveru." });
  }
};
