// src/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

// === JAVNE RUTE (ne treba prijava) ===
// GET /api/posts - Vraća sve postove
router.get('/', postController.getAllPosts);
// GET /api/posts/:id - Vraća jedan post
router.get('/:id', postController.getPostById);

// === ZAŠTIĆENE RUTE (treba prijava) ===
// POST /api/posts - Kreira novi post
router.post('/', authMiddleware, postController.createPost);
// PUT /api/posts/:id - Menja postojeći post
router.put('/:id', authMiddleware, postController.updatePost);
// DELETE /api/posts/:id - Briše post
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;