import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  upvotePost,
  deletePost,
  getMyPosts,
} from '../controllers/postController.js';
import protect from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/my', protect, getMyPosts);
router.get('/:id', getPostById);
router.post('/', protect, upload.single('image'), createPost);
router.put('/:id/upvote', protect, upvotePost);
router.delete('/:id', protect, deletePost);

export default router;