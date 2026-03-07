import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    movieTitle: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      maxlength: [150, 'Movie title cannot exceed 150 characters'],
    },
    image: {
      type: String,
      required: [true, 'Screenshot is required'],
    },
    imagePublicId: {
      type: String,
    },
    description: {
      type: String,
      required: [true, 'Description/review is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

postSchema.virtual('upvoteCount').get(function () {
  return this.upvotes.length;
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

const Post = mongoose.model('Post', postSchema);
export default Post;
