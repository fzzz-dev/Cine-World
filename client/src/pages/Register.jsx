import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', bio: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #8b0000, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-blood-800" />
            <span className="tag">New member</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-blood-800" />
          </div>
          <h1 className="font-display text-4xl font-bold text-gradient-red mb-2">
            Join the Cult
          </h1>
          <p className="text-muted">Create your CineWorld account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="border border-blood-800/60 bg-blood-950/40 px-4 py-3 text-sm text-blood-300 font-body animate-fade-in">
              <span className="text-blood-600 mr-2">✦</span> {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="letters, numbers, underscores"
              required
              minLength={3}
              maxLength={30}
              autoComplete="username"
              className="input-field"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="input-field"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="min 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
              className="input-field"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]">
              Bio <span className="normal-case font-body font-normal text-xs">(optional)</span>
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell the cinephiles about yourself..."
              rows={3}
              maxLength={200}
              className="input-field resize-none"
            />
            <div className="text-right text-xs font-mono text-[var(--text-muted)]">
              {form.bio.length}/200
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-6 text-center">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-blood-300/30 border-t-blood-300 rounded-full animate-spin" />
                Creating account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-[var(--text-muted)]">
          Already a member?{' '}
          <Link to="/login" className="text-blood-400 hover:text-blood-300 transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}