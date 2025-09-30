// src/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/posts/:postId/comments', authMiddleware, commentController.createComment);
router.get('/posts/:postId/comments', commentController.getCommentsForPost); // public
router.put('/comments/:id', authMiddleware, commentController.updateComment);
router.delete('/comments/:id', authMiddleware, commentController.deleteComment);

module.exports = router;