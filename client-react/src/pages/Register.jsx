import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, ref: refCode });
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
            <span className="brand-gradient">Nexa</span> <span className="text-white">Affiliate</span>
          </h1>
          <p className="text-sm text-dim mt-2">Create your account</p>
        </div>

        <div className="panel p-8">
          {refCode && (
            <div className="mb-4 text-xs px-3 py-2 rounded-lg border border-purple-400/30 bg-purple-500/10 text-purple-200">
              You were invited with referral code {refCode.toUpperCase()}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-dim">Full name</label>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                className="input-field w-full px-4 py-2.5 mt-1.5"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-dim">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="input-field w-full px-4 py-2.5 mt-1.5"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-dim">Password</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="input-field w-full px-4 py-2.5 mt-1.5"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-dim mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-300 hover:text-purple-200 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
