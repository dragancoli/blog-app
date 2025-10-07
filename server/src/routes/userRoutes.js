const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/me", authMiddleware, userController.getMe);
router.put("/me", authMiddleware, upload.single("avatar"), userController.updateMe);
router.get("/:id", userController.getUserById);
router.get("/:id/posts", userController.getPostsForUser);

module.exports = router;
