import { useState } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import NavBar from '../components/NavBar';

export default function Profile() {
  const { token, user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);

  async function saveName(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingName(true);
    try {
      const { user: updated } = await apiFetch('/auth/me', { method: 'PATCH', body: { name }, token });
      updateUser(updated);
      showToast('Profile updated', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingName(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setSavingPw(true);
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: { currentPassword: pw.currentPassword, newPassword: pw.newPassword },
        token
      });
      showToast('Password changed', 'success');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div className="min-h-screen grid-overlay px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <NavBar />

        <div className="panel p-6 mb-4">
          <h1 className="text-lg font-bold mb-5 flex items-center gap-2">👤 Profile</h1>

          <form onSubmit={saveName} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-dim">Full name</label>
              <input
                required
                className="input-field w-full px-4 py-2.5 mt-1.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-dim">Email</label>
              <input
                disabled
                className="input-field w-full px-4 py-2.5 mt-1.5 opacity-60 cursor-not-allowed"
                value={user?.email || ''}
              />
            </div>
            <button type="submit" disabled={savingName} className="btn-primary px-5 py-2.5">
              {savingName ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="panel p-6">
          <h2 className="text-sm font-semibold mb-5">🔒 Change Password</h2>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-dim">Current password</label>
              <input
                type="password"
                required
                className="input-field w-full px-4 py-2.5 mt-1.5"
                value={pw.currentPassword}
                onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-dim">New password</label>
              <input
                type="password"
                required
                minLength={6}
                className="input-field w-full px-4 py-2.5 mt-1.5"
                value={pw.newPassword}
                onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-dim">Confirm new password</label>
              <input
                type="password"
                required
                minLength={6}
                className="input-field w-full px-4 py-2.5 mt-1.5"
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              />
            </div>
            <button type="submit" disabled={savingPw} className="btn-primary px-5 py-2.5">
              {savingPw ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
