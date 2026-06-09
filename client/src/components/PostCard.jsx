import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function PostCard({ post, onDelete, onUpvote }) {
  const { user } = useAuth();
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const hasUpvoted = user && post.upvotes?.includes(user._id);
  const upvoteCount = post.upvotes?.length ?? 0;
  const isOwner = user && post.user?._id === user._id;

  const handleUpvote = async (e) => {
    e.preventDefault();
    if (!user || isUpvoting) return;
    setIsUpvoting(true);
    try {
      const { data } = await api.put(`/posts/${post._id}/upvote`);
      onUpvote?.(data.post);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!isOwner || isDeleting) return;
    if (!confirm('Delete this post? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await api.delete(`/posts/${post._id}`);
      onDelete?.(post._id);
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  return (
    <article className="card card-hover group relative overflow-hidden animate-slide-up">
      {/* Hover border glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(139,0,0,0.3)' }} />

      <Link to={`/post/${post._id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden aspect-video bg-[var(--bg-elevated)]">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-blood-950/30 to-black animate-pulse" />
          )}
          <img
            src={post.image}
            alt={post.movieTitle}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700
              group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Movie title badge */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-end justify-between">
              <span className="tag line-clamp-1 max-w-[70%]">{post.movieTitle}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Author + time */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blood-950 border border-blood-900/50
                              flex items-center justify-center text-blood-300 font-display text-xs font-bold">
                {post.user?.username?.[0]?.toUpperCase()}
              </div>
              <span className="text-xs font-body text-[var(--text-secondary)]">
                {post.user?.username}
              </span>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {timeAgo(post.createdAt)}
            </span>
          </div>

          {/* Description preview */}
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed font-body">
            {post.description}
          </p>
        </div>
      </Link>

      {/* Actions bar */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Upvote */}
          <button
            onClick={handleUpvote}
            disabled={isUpvoting || !user}
            className={`flex items-center gap-1.5 text-xs font-mono transition-all duration-200
              ${hasUpvoted
                ? 'text-blood-400'
                : 'text-[var(--text-muted)] hover:text-blood-400'
              } disabled:cursor-not-allowed`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={hasUpvoted ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 9h3v13h14V9h3L12 2z" />
            </svg>
            <span>{upvoteCount}</span>
          </button>

          {/* Comment count indicator */}
          <Link to={`/post/${post._id}`}
            className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>View</span>
          </Link>
        </div>

        {/* Delete */}
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs font-mono text-[var(--text-muted)] hover:text-red-500 transition-colors disabled:opacity-50"
          >
            {isDeleting ? '...' : 'Delete'}
          </button>
        )}
      </div>
    </article>
  );
}