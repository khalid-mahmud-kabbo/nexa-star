import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid-overlay flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="brand-gradient">Nexa</span> <span className="text-white">Star</span>
          </h1>
          <p className="text-sm text-dim mt-2">Sign in to your dashboard</p>
        </div>

        <div className="panel p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-dim">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="input-field w-full px-4 py-2.5 mt-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-dim">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="input-field w-full px-4 py-2.5 mt-1.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-dim mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-300 hover:text-purple-200 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
