import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import NavBar from '../components/NavBar';

export default function ApiKeys() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [keys, setKeys] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    apiFetch('/keys', { token })
      .then((d) => setKeys(d.keys))
      .catch((err) => showToast(err.message, 'error'));
  }

  useEffect(load, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function createKey(e) {
    e.preventDefault();
    if (!label.trim()) return;
    setSaving(true);
    try {
      await apiFetch('/keys', { method: 'POST', body: { label }, token });
      showToast('API key created', 'success');
      setLabel('');
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function revokeKey(id) {
    if (!confirm('Revoke this API key? Requests using it will stop working immediately.')) return;
    try {
      await apiFetch(`/keys/${id}`, { method: 'DELETE', token });
      showToast('API key revoked', 'success');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function copy(value) {
    navigator.clipboard.writeText(value);
    showToast('API key copied', 'success');
  }

  const activeKeys = keys?.filter((k) => !k.revoked) ?? [];

  return (
    <div className="min-h-screen grid-overlay px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <NavBar />

        <div className="panel p-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-bold">🔑 API Keys</h1>
            <button onClick={() => setModalOpen(true)} className="btn-primary px-4 py-2 text-sm">
              + Add New Key
            </button>
          </div>
          <p className="text-xs text-dim mb-5">
            Create one key per app or server you integrate from, so you can see usage and revoke access
            independently for each.
          </p>

          {activeKeys.length === 0 && keys !== null && (
            <p className="text-dim text-sm">No API keys yet — add one to start making requests.</p>
          )}

          <div className="space-y-2">
            {activeKeys.map((k) => (
              <div key={k.id} className="border border-white/5 rounded-lg px-4 py-3 bg-white/[0.02]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-sm font-medium">{k.label}</p>
                    <p className="text-xs text-dim">
                      Created {formatDate(k.createdAt)} · Last used {k.lastUsedAt ? formatDate(k.lastUsedAt) : 'never'}
                      {' · '}Used today: {k.usage?.count || 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="input-field px-3 py-1.5 text-xs text-purple-100">{k.key}</code>
                    <button onClick={() => copy(k.key)} className="btn-ghost px-3 py-1.5 text-xs">
                      Copy
                    </button>
                    <button
                      onClick={() => revokeKey(k.id)}
                      className="btn-ghost px-3 py-1.5 text-xs text-red-300 border-red-400/30"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
          <div className="panel p-7 w-full max-w-sm">
            <h2 className="text-base font-bold mb-5 flex items-center gap-2">＋ Add New API Key</h2>
            <form onSubmit={createKey} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-dim">Key label *</label>
                <input
                  autoFocus
                  required
                  placeholder="e.g. Production server"
                  className="input-field w-full px-4 py-2.5 mt-1.5"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full py-2.5">
                {saving ? 'Saving...' : '✓ Save'}
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn-ghost w-full py-2.5"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
