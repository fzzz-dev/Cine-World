import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      {/* Background cinematic effect */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #8b0000, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #8b0000, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-blood-800" />
            <span className="tag">Welcome back</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-blood-800" />
          </div>
          <h1 className="font-display text-4xl font-bold text-gradient-red mb-2">
            Enter the Reel
          </h1>
          <p className="text-muted">Sign in to your CineWorld account</p>
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
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="input-field"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-6 text-center">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-blood-300/30 border-t-blood-300 rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-[var(--text-muted)]">
          New to CineWorld?{' '}
          <Link to="/register" className="text-blood-400 hover:text-blood-300 transition-colors font-medium">
            Create an account
          </Link>
        </p>

        {/* Decorative line */}
        <div className="mt-12 flex items-center gap-4">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(139,0,0,0.3))' }} />
          <span className="text-xs font-mono text-[var(--text-muted)] tracking-widest">CINEBLOOD</span>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(139,0,0,0.3))' }} />
        </div>
      </div>
    </div>
  );
}