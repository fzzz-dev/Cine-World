import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [upvoting, setUpvoting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get(`/comments/${id}`),
        ]);
        setPost(postRes.data.post);
        setComments(commentsRes.data.comments);
      } catch {
        setError('Post not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleUpvote = async () => {
    if (!user || upvoting) return;
    setUpvoting(true);
    try {
      const { data } = await api.put(`/posts/${id}/upvote`);
      setPost(data.post);
    } catch {
      // silent
    } finally {
      setUpvoting(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || commentLoading) return;
    setCommentLoading(true);
    try {
      const { data } = await api.post(`/comments/${id}`, { text: commentText.trim() });
      setComments((prev) => [data.comment, ...prev]);
      setCommentText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {
      // silent
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate('/');
    } catch {
      setError('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blood-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-fade-in">
        <p className="font-display text-3xl text-[var(--text-secondary)] mb-4">Scene not found</p>
        <Link to="/" className="btn-ghost inline-block">← Back to Feed</Link>
      </div>
    );
  }

  if (!post) return null;

  const hasUpvoted = user && post.upvotes?.includes(user._id);
  const upvoteCount = post.upvotes?.length ?? 0;
  const isOwner = user && post.user?._id === user._id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">

      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase
        text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-8 group">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="group-hover:-translate-x-1 transition-transform">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back to Feed
      </Link>

      {/* Post Image — full width cinematic */}
      <div className="relative mb-8">
        <img src={post.image} alt={post.movieTitle}
          className="w-full aspect-video object-cover" />
        {/* Cinematic frame corners */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-blood-700" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-blood-700" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-blood-700" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-blood-700" />
        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 to-transparent" />
      </div>

      {/* Post Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="tag mb-3 inline-block">{post.movieTitle}</span>
            <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-muted)]">
              <span className="text-[var(--text-secondary)]">{post.user?.username}</span>
              <span>·</span>
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>

          {isOwner && (
            <button onClick={handleDeletePost}
              className="text-xs font-mono text-[var(--text-muted)] hover:text-red-500 transition-colors">
              Delete Post
            </button>
          )}
        </div>

        {/* Description */}
        <p className="mt-5 text-[var(--text-primary)] leading-relaxed font-body text-[15px] max-w-3xl">
          {post.description}
        </p>

        {/* Upvote */}
        <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-4">
          <button
            onClick={handleUpvote}
            disabled={!user || upvoting}
            className={`flex items-center gap-2 px-5 py-2.5 border transition-all duration-200 text-sm font-body
              ${hasUpvoted
                ? 'border-blood-700 bg-blood-950/50 text-blood-300'
                : 'border-white/10 text-[var(--text-muted)] hover:border-blood-800 hover:text-blood-400'
              } disabled:cursor-not-allowed`}
            style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={hasUpvoted ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 9h3v13h14V9h3L12 2z" />
            </svg>
            <span>{upvoteCount} {upvoteCount === 1 ? 'upvote' : 'upvotes'}</span>
          </button>

          <span className="text-xs font-mono text-[var(--text-muted)]">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </span>
        </div>
      </div>

      {/* Divider */}
      <hr className="divider" />

      {/* Comments Section */}
      <section>
        <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-6">
          Discussion
        </h2>

        {/* Comment form */}
        {user ? (
          <form onSubmit={handleComment} className="mb-8">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blood-950 border border-blood-900/50 shrink-0
                              flex items-center justify-center text-blood-300 font-display text-xs font-bold">
                {user.username[0].toUpperCase()}
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts on this film..."
                  rows={3}
                  maxLength={500}
                  className="input-field resize-none text-sm"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    {commentText.length}/500
                  </span>
                  <button type="submit" disabled={!commentText.trim() || commentLoading}
                    className="btn-primary text-xs px-4 py-2 disabled:opacity-40">
                    {commentLoading ? '...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-8 border border-white/5 p-4 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              <Link to="/login" className="text-blood-400 hover:text-blood-300">Sign in</Link> to join the discussion
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="border border-blood-800/60 bg-blood-950/40 px-4 py-3 text-sm text-blood-300 mb-6">
            {error}
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-5">
          {comments.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)] text-sm font-body">
              No comments yet. Be the first.
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="flex gap-3 animate-fade-in group">
                <div className="w-8 h-8 rounded-full bg-blood-950 border border-blood-900/40 shrink-0
                                flex items-center justify-center text-blood-300 font-display text-xs font-bold">
                  {comment.user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-body font-medium text-[var(--text-secondary)]">
                      {comment.user?.username}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      {timeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{comment.text}</p>
                  {user && comment.user?._id === user._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-xs font-mono text-[var(--text-muted)] hover:text-red-500
                                 transition-colors mt-1 opacity-0 group-hover:opacity-100"
                    >
                      delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}