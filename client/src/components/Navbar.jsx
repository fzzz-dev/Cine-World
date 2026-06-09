import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5"
      style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            {/* Blood drop icon */}
            <div className="relative w-7 h-7">
              <svg viewBox="0 0 28 28" className="w-full h-full animate-flicker">
                <defs>
                  <radialGradient id="bloodGrad" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#c0392b" />
                    <stop offset="100%" stopColor="#3d0000" />
                  </radialGradient>
                </defs>
                <path d="M14 3 C14 3 4 14 4 19 C4 24.5 8.5 28 14 28 C19.5 28 24 24.5 24 19 C24 14 14 3 14 3Z"
                  fill="url(#bloodGrad)" />
                <path d="M14 5 C14 5 6 15 6 19 C6 21 7.5 22 9 22"
                  fill="none" stroke="rgba(255,100,100,0.2)" strokeWidth="1" />
              </svg>
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-gradient-red glow-red">
              CineWorld
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-1">
            {user ? (
              <>
                <NavLink to="/" active={isActive('/')}>Feed</NavLink>
                <NavLink to="/create" active={isActive('/create')}>+ Post</NavLink>
                <NavLink to="/profile" active={isActive('/profile')}>Profile</NavLink>
                <button
                  onClick={handleLogout}
                  className="ml-4 text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]
                             hover:text-blood-400 transition-colors duration-200 px-3 py-2"
                >
                  Exit
                </button>
                <div className="ml-2 w-8 h-8 rounded-full bg-blood-950 border border-blood-800/50
                                flex items-center justify-center text-blood-300 font-display font-bold text-sm">
                  {user.username[0].toUpperCase()}
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login" active={isActive('/login')}>Login</NavLink>
                <Link to="/register" className="btn-primary ml-2">Join</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="sm:hidden text-[var(--text-secondary)] p-2"
            onClick={() => setMenuOpen(!menuOpen)}>
            <div className="space-y-1.5">
              <span className={`block h-px w-6 bg-current transition-transform ${menuOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
              <span className={`block h-px w-4 bg-current transition-opacity ml-auto ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-px w-6 bg-current transition-transform ${menuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="sm:hidden pb-4 border-t border-white/5 mt-1 pt-4 space-y-1 animate-fade-in">
            {user ? (
              <>
                <MobileLink to="/" onClick={() => setMenuOpen(false)}>Feed</MobileLink>
                <MobileLink to="/create" onClick={() => setMenuOpen(false)}>Create Post</MobileLink>
                <MobileLink to="/profile" onClick={() => setMenuOpen(false)}>My Profile</MobileLink>
                <button onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 text-sm text-[var(--text-muted)]
                             hover:text-blood-400 transition-colors font-mono tracking-widest uppercase text-xs">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <MobileLink to="/login" onClick={() => setMenuOpen(false)}>Login</MobileLink>
                <MobileLink to="/register" onClick={() => setMenuOpen(false)}>Register</MobileLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to}
      className={`px-3 py-2 text-sm font-body font-medium transition-colors duration-200 relative
        ${active
          ? 'text-blood-300'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}>
      {children}
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blood-700" />
      )}
    </Link>
  );
}

function MobileLink({ to, onClick, children }) {
  return (
    <Link to={to} onClick={onClick}
      className="block px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
      {children}
    </Link>
  );
}