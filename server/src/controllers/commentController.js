// src/controllers/commentController.js
const db = require('../config/db');

exports.createComment = async (req, res) => {
  const { postId } = req.params;
  const { content, parent_id } = req.body;
  const userId = req.user.id;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Sadržaj komentara je obavezan.' });
  }

  try {
    // (Opcionalno) validacija da post postoji
    const postExists = await db.query('SELECT 1 FROM posts WHERE id = $1', [postId]);
    if (postExists.rows.length === 0) {
      return res.status(404).json({ message: 'Post ne postoji.' });
    }

    // (Opcionalno) proveri parent_id pripada istom postu
    if (parent_id) {
      const parent = await db.query('SELECT post_id FROM comments WHERE id = $1', [parent_id]);
      if (parent.rows.length === 0 || parent.rows[0].post_id != postId) {
        return res.status(400).json({ message: 'Neispravan parent_id.' });
      }
    }

    const inserted = await db.query(
      `INSERT INTO comments (post_id, user_id, parent_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, post_id, user_id, parent_id, content, created_at, updated_at`,
      [postId, userId, parent_id || null, content.trim()]
    );

    // Vrati sa username
    const withAuthor = await db.query(
      `SELECT c.id, c.post_id, c.user_id, c.parent_id, c.content, c.created_at, c.updated_at, u.username AS author
       FROM comments c JOIN users u ON u.id = c.user_id
       WHERE c.id = $1`,
      [inserted.rows[0].id]
    );

    res.status(201).json(withAuthor.rows[0]);
  } catch (err) {
    console.error('createComment error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getCommentsForPost = async (req, res) => {
  const { postId } = req.params;
  const { mode } = req.query; // mode=tree ili flat
  try {
    if (mode === 'tree') {
      const result = await db.query(`
        WITH RECURSIVE comment_tree AS (
          SELECT 
            c.id, c.post_id, c.user_id, c.parent_id, c.content,
            c.created_at, c.updated_at, u.username AS author,
            ARRAY[c.id] AS path, 0 AS depth
          FROM comments c
          JOIN users u ON u.id = c.user_id
          WHERE c.post_id = $1 AND c.parent_id IS NULL
          UNION ALL
          SELECT
            ch.id, ch.post_id, ch.user_id, ch.parent_id, ch.content,
            ch.created_at, ch.updated_at, u.username AS author,
            ct.path || ch.id, ct.depth + 1
          FROM comments ch
          JOIN comment_tree ct ON ct.id = ch.parent_id
          JOIN users u ON u.id = ch.user_id
        )
        SELECT id, post_id, user_id, parent_id, content, created_at, updated_at, author, depth
        FROM comment_tree
        ORDER BY path;
      `, [postId]);
      return res.json(result.rows);
    } else {
      const result = await db.query(
        `SELECT c.id, c.post_id, c.user_id, c.parent_id, c.content,
                c.created_at, c.updated_at, u.username AS author
         FROM comments c
         JOIN users u ON u.id = c.user_id
         WHERE c.post_id = $1
         ORDER BY c.created_at ASC`,
        [postId]
      );
      return res.json(result.rows);
    }
  } catch (err) {
    console.error('getCommentsForPost error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Sadržaj je obavezan.' });
  }
  try {
    const existing = await db.query('SELECT * FROM comments WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Komentar ne postoji.' });
    }
    if (existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Nemate dozvolu.' });
    }
    const updated = await db.query(
      `UPDATE comments SET content = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, post_id, user_id, parent_id, content, created_at, updated_at`,
      [content.trim(), id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('updateComment error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteComment = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await db.query('SELECT * FROM comments WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Komentar ne postoji.' });
    }
    if (existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Nemate dozvolu.' });
    }
    await db.query('DELETE FROM comments WHERE id = $1', [id]);
    res.json({ message: 'Komentar obrisan.' });
  } catch (err) {
    console.error('deleteComment error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};