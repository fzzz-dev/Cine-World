import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import cloudinary, { uploadToCloudinary } from '../config/cloudinary.js';

// @desc    Get all posts
// @route   GET /api/posts?sort=latest|upvotes
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const { sort = 'latest', page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let posts;
    if (sort === 'upvotes') {
      posts = await Post.aggregate([
        { $addFields: { upvoteCount: { $size: '$upvotes' } } },
        { $sort: { upvoteCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: Number(limit) },
        { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { 'user.password': 0 } },
      ]);
    } else {
      posts = await Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('user', 'username bio');
    }

    const total = await Post.countDocuments();
    res.json({ posts, totalPages: Math.ceil(total / Number(limit)), currentPage: Number(page), total });
  } catch (error) {
    console.error('getPosts error:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'username bio');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch post' });
  }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    // ── Debug logging — remove after fixing ───────────────────────────────
    console.log('\n── createPost hit ───────────────────────────────');
    console.log('req.headers["content-type"]:', req.headers['content-type']);
    console.log('req.file:', req.file ? `[${req.file.mimetype} ${req.file.size}b]` : 'MISSING');
    console.log('req.body:', req.body);
    console.log('─────────────────────────────────────────────────\n');
    // ─────────────────────────────────────────────────────────────────────

    const { movieTitle, description } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: 'Movie screenshot is required — req.file was undefined. ' +
          'Check Content-Type header: ' + (req.headers['content-type'] || 'MISSING'),
      });
    }

    if (!movieTitle?.trim()) {
      return res.status(400).json({ message: 'Movie title is required' });
    }

    if (!description?.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const { secure_url, public_id } = await uploadToCloudinary(req.file.buffer);

    const post = await Post.create({
      user: req.user._id,
      movieTitle: movieTitle.trim(),
      image: secure_url,
      imagePublicId: public_id,
      description: description.trim(),
    });

    const populated = await post.populate('user', 'username bio');
    res.status(201).json({ post: populated });
  } catch (error) {
    console.error('createPost error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: error.message || 'Failed to create post' });
  }
};

// @desc    Upvote / remove upvote on a post
// @route   PUT /api/posts/:id/upvote
// @access  Private
export const upvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id;
    const alreadyUpvoted = post.upvotes.some((id) => id.toString() === userId.toString());

    if (alreadyUpvoted) {
      post.upvotes = post.upvotes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.upvotes.push(userId);
    }

    await post.save();
    await post.populate('user', 'username bio');
    res.json({ post, upvoted: !alreadyUpvoted });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update upvote' });
  }
};

// @desc    Delete a post (owner only)
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    if (post.imagePublicId) {
      await cloudinary.uploader.destroy(post.imagePublicId);
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete post' });
  }
};

// @desc    Get posts by current user
// @route   GET /api/posts/my
// @access  Private
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'username bio');
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your posts' });
  }
};