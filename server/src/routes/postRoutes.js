// src/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');  //! Dodato za upload

// === JAVNE RUTE (ne treba prijava) ===
// GET /api/posts - Vraća sve postove
router.get('/', postController.getAllPosts);
// GET /api/posts/:id - Vraća jedan post
router.get('/:id', postController.getPostById);

// === ZAŠTIĆENE RUTE (treba prijava) ===
// POST /api/posts - Kreira novi post
router.post('/', authMiddleware, upload.single('image'), postController.createPost); //! Dodat upload
// PUT /api/posts/:id - Menja postojeći post
router.put('/:id', authMiddleware, upload.single('image'), postController.updatePost); //! Dodat upload
// DELETE /api/posts/:id - Briše post
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;