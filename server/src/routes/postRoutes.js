// src/routes/postRoutes.js
const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); //! Dodato za upload

router.get("/", postController.getAllPosts);
router.get("/:id", postController.getPostById);
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  postController.createPost
);
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  postController.updatePost
);
router.delete("/:id", authMiddleware, postController.deletePost);

module.exports = router;
