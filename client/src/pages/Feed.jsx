import { useState, useEffect, useCallback } from 'react';
import PostCard from '../components/PostCard';
import api from '../services/api';
import { Link } from 'react-router-dom';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/posts?sort=${sort}&page=${page}&limit=12`);
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Failed to load the feed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [sort, page]);

  useEffect(() => {
    fetchPosts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchPosts]);

  const handleSort = (newSort) => {
    if (newSort === sort) return;
    setSort(newSort);
    setPage(1);
  };

  const handleUpvote = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  const handleDelete = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero header */}
      <header className="mb-10 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)] mb-2">
              Community Feed
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
              <span className="text-[var(--text-primary)]">What the</span>{' '}
              <span className="text-gradient-red">Devoted</span>{' '}
              <span className="text-[var(--text-primary)]">Watch</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort tabs */}
            <div className="flex border border-white/10 overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
              <SortButton active={sort === 'latest'} onClick={() => handleSort('latest')}>
                Latest
              </SortButton>
              <SortButton active={sort === 'upvotes'} onClick={() => handleSort('upvotes')}>
                Top
              </SortButton>
            </div>

            <Link to="/create" className="btn-primary hidden sm:inline-flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Post
            </Link>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="mt-8 h-px bg-gradient-to-r from-blood-900/50 via-white/10 to-transparent" />
      </header>

      {/* Error */}
      {error && (
        <div className="border border-blood-800/60 bg-blood-950/40 px-4 py-3 text-sm text-blood-300 mb-8 animate-fade-in">
          <span className="text-blood-600 mr-2">✦</span> {error}
          <button onClick={fetchPosts} className="ml-4 underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}>
              <div className="aspect-video bg-white/5" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-white/5 rounded w-1/3" />
                <div className="h-3 bg-white/5 rounded w-full" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Posts grid */}
      {!loading && !error && (
        <>
          {posts.length === 0 ? (
            <div className="text-center py-24 animate-fade-in">
              <div className="text-5xl mb-4 opacity-20">🎬</div>
              <p className="font-display text-2xl text-[var(--text-secondary)] mb-2">The screen is dark</p>
              <p className="text-muted mb-8">Be the first to share something worth watching</p>
              <Link to="/create" className="btn-primary inline-block">Create First Post</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post, i) => (
                <div key={post._id} style={{ animationDelay: `${i * 60}ms` }}>
                  <PostCard post={post} onUpvote={handleUpvote} onDelete={handleDelete} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3 animate-fade-in">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost text-xs disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2"
              >
                ← Prev
              </button>

              <span className="text-xs font-mono text-[var(--text-muted)]">
                {page} / {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-ghost text-xs disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SortButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs font-mono tracking-widest uppercase transition-all duration-200
        ${active
          ? 'bg-blood-900/50 text-blood-300'
          : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5'
        }`}
    >
      {children}
    </button>
  );
}