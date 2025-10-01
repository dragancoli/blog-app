const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/me', authMiddleware, userController.getMe);
router.put('/me', authMiddleware, userController.updateMe);
router.get('/:id', userController.getUserById);
router.get('/:id/posts', userController.getPostsForUser);
 
module.exports = router;