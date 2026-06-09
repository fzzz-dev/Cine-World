import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import api from '../services/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [savingBio, setSavingBio] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/posts/my');
        setPosts(data.posts);
      } catch {
        setError('Failed to load your posts');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      const { data } = await api.put('/auth/bio', { bio });
      updateUser(data.user);
      setEditingBio(false);
    } catch {
      setError('Failed to update bio');
    } finally {
      setSavingBio(false);
    }
  };

  const handleDelete = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handleUpvote = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  const totalUpvotes = posts.reduce((sum, p) => sum + (p.upvotes?.length ?? 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">

      {/* Profile header */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-8">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-blood-950 border-2 border-blood-800/50
                            flex items-center justify-center text-blood-300 font-display font-bold text-2xl
                            shadow-blood">
              {user?.username?.[0]?.toUpperCase()}
            </div>

            <div>
              <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
                {user?.username}
              </h1>
              <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
                Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <StatBox label="Posts" value={posts.length} />
            <StatBox label="Upvotes" value={totalUpvotes} />
          </div>
        </div>

        {/* Bio section */}
        <div className="border border-white/5 p-4 bg-[var(--bg-card)]"
          style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
          {editingBio ? (
            <div className="space-y-3">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                rows={3}
                className="input-field text-sm resize-none w-full"
                placeholder="Tell the cinephiles about yourself..."
                autoFocus
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[var(--text-muted)]">{bio.length}/200</span>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingBio(false); setBio(user?.bio || ''); }}
                    className="btn-ghost text-xs px-3 py-1.5">Cancel</button>
                  <button onClick={handleSaveBio} disabled={savingBio}
                    className="btn-primary text-xs px-3 py-1.5">
                    {savingBio ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1">
                {user?.bio || <span className="text-[var(--text-muted)] italic">No bio yet.</span>}
              </p>
              <button onClick={() => setEditingBio(true)}
                className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]
                           hover:text-blood-400 transition-colors shrink-0">
                Edit
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 border border-blood-800/60 bg-blood-950/40 px-4 py-3 text-sm text-blood-300">
            {error}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1 bg-gradient-to-r from-blood-900/50 to-transparent" />
        <span className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]">
          My Posts ({posts.length})
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-blood-900/50 to-transparent" />
      </div>

      {/* Posts */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-video bg-white/5" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-white/5 rounded w-1/2" />
                <div className="h-3 bg-white/5 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="text-4xl mb-4 opacity-20">📽</div>
          <p className="font-display text-2xl text-[var(--text-secondary)] mb-2">Nothing posted yet</p>
          <p className="text-muted mb-8 text-sm">Your cinematic taste deserves to be shared</p>
          <Link to="/create" className="btn-primary inline-block">Create First Post</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post, i) => (
            <div key={post._id} style={{ animationDelay: `${i * 60}ms` }}>
              <PostCard post={post} onDelete={handleDelete} onUpvote={handleUpvote} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl font-bold text-gradient-red">{value}</div>
      <div className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]">{label}</div>
    </div>
  );
}