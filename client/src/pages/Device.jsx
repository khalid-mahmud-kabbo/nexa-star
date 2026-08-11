import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import NavBar from '../components/NavBar';

export default function Device() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [devices, setDevices] = useState([]);
  const [testing, setTesting] = useState(false);
  const [proxyResult, setProxyResult] = useState(null);
  const [form, setForm] = useState({
    deviceName: '',
    gaid: '',
    proxyHost: '',
    proxyPort: '',
    proxyUsername: '',
    proxyPassword: '',
  })
  const [modalOpen, setModalOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
  try {
    const res = await apiFetch('/devices', { token });

    console.log(res);

    setDevices(res.data);
  } catch (err) {
    showToast(err.message, 'error');
  }
}



useEffect(() => {
  if (token) {
    load();
  }
}, [token]);


  async function createDevice(e) {
  e.preventDefault();

  setSaving(true);

  try {
    await apiFetch('/devices', {
      method: 'POST',
      token,
      body: {
        deviceName: form.deviceName.trim(),
        gaid: form.gaid.trim(),
        proxyHost: form.proxyHost.trim(),
        proxyPort: form.proxyPort
          ? Number(form.proxyPort)
          : null,
        proxyUsername: form.proxyUsername.trim(),
        proxyPassword: form.proxyPassword.trim(),
      },
    });

    showToast('Device created successfully.', 'success');

    setForm({
      deviceName: '',
      gaid: '',
      proxyHost: '',
      proxyPort: '',
      proxyUsername: '',
      proxyPassword: '',
    });

    setModalOpen(false);

    load();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setSaving(false);
  }
}

  async function revokeKey(id) {
    if (!confirm('Revoke this Device? Requests using it will stop working immediately.')) return;
    try {
      await apiFetch(`/devices/${id}`, { method: 'DELETE', token });
      showToast('Device revoked', 'success');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }


  const testProxy = async () => {
    setTesting(true);

    try {
        const res = await apiFetch('/devices/test-proxy', {
            method: 'POST',
            token,
            body: {
                proxyHost: form.proxyHost,
                proxyPort: Number(form.proxyPort),
                proxyUsername: form.proxyUsername,
                proxyPassword: form.proxyPassword,
            },
        });

        setProxyResult(res);

        showToast('Proxy is working.', 'success');

    } catch (err) {
        setProxyResult(null);
        showToast(err.message, 'error');
    } finally {
        setTesting(false);
    }
};

  function copy(value) {
    navigator.clipboard.writeText(value);
    showToast('API key copied', 'success');
  }
const activeDevices = devices.filter(device => !device.revoked);

  return (
    <div className="min-h-screen grid-overlay px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <NavBar />

        <div className="panel p-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-bold">📱 Devices</h1>
            <button onClick={() => setModalOpen(true)} className="btn-primary px-4 py-2 text-sm">
              + Add New Device
            </button>
          </div>
          <p className="text-xs text-dim mb-5">
            Create devices and manage.
          </p>

          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
  {activeDevices.length === 0 ? (
    <div className="col-span-full text-center py-12 text-dim">
      <div className="text-5xl mb-3">📱</div>
      <h3 className="text-lg font-semibold">No Devices Found</h3>
      <p className="text-sm mt-2">
        Add your first device to start using the platform.
      </p>
    </div>
  ) : (
    activeDevices.map((device) => (
      <div
        key={device.id}
        className="panel p-5 rounded-xl border border-white/10 hover:border-purple-500/40 transition-all"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg truncate">
            {device.deviceName}
          </h3>

          <span
            className={`px-2 py-1 rounded-full text-xs ${
              device.revoked
                ? "bg-red-500/20 text-red-300"
                : "bg-green-500/20 text-green-300"
            }`}
          >
            {device.revoked ? "Revoked" : "Active"}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-sm">

          <div className="flex justify-between">
            <span className="text-dim">GAID</span>
            <span className="truncate max-w-[180px]">
              {device.gaid}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-dim">Proxy</span>
            <span>
              {device.proxyHost
                ? `${device.proxyHost}:${device.proxyPort}`
                : "Not Configured"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-dim">Username</span>
            <span>
              {device.proxyUsername || "-"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-dim">Created</span>
            <span>{formatDate(device.createdAt)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-dim">Last Used</span>
            <span>
              {device.lastUsedAt
                ? formatDate(device.lastUsedAt)
                : "Never"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-dim">Today's Usage</span>
            <span>{device.usage?.count || 0}</span>
          </div>

        </div>

        <div className="flex gap-2 mt-6">

          <button
            onClick={() => navigator.clipboard.writeText(device.gaid)}
            className="btn-ghost flex-1"
          >
            Copy GAID
          </button>

          <button
            onClick={() => revokeKey(device.id)}
            className="btn-ghost border-red-500/30 text-red-300"
          >
            Revoke
          </button>

        </div>
      </div>
    ))
  )}
</div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
          <div className="panel p-7 w-full max-w-sm">
            <h2 className="text-base font-bold mb-5 flex items-center gap-2">＋ Add New Device</h2>
            <form onSubmit={createDevice} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-dim">Device Name *</label>
                <input
                  autoFocus
                  required
                  placeholder="e.g. Device Name"
                  className="input-field w-full px-4 py-2.5 mt-1.5"
                  value={form.deviceName}
                  onChange={(e) =>setForm({...form, deviceName: e.target.value,})}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wide text-dim">Google Advertising ID (GAID) *</label>
                <input
                  autoFocus
                  required
                  placeholder="e.g. Google Advertising ID (GAID)"
                  className="input-field w-full px-4 py-2.5 mt-1.5"
                  value={form.gaid}
                  onChange={(e) =>setForm({...form, gaid: e.target.value,})}
                />
              </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-dim">Proxy (Optional)</label>
                <input
                  autoFocus
                  required
                  placeholder="e.g. Proxy (Optional)"
                  className="input-field w-full px-4 py-2.5 mt-1.5"
                  value={form.proxyHost}
                  onChange={(e) =>setForm({...form, proxyHost: e.target.value,})}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wide text-dim">Proxy Port (Optional)</label>
                <input
                  autoFocus
                  required
                  placeholder="e.g. Proxy Port (Optional)"
                  className="input-field w-full px-4 py-2.5 mt-1.5"
                  value={form.proxyPort}
                  onChange={(e) =>setForm({...form, proxyPort: e.target.value,})}
                />
              </div>
              </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-dim">Proxy Username (Optional)</label>
                <input
                  autoFocus
                  required
                  placeholder="e.g. Proxy Password (Optional)"
                  className="input-field w-full px-4 py-2.5 mt-1.5"
                  value={form.proxyUsername}
                  onChange={(e) =>setForm({...form, proxyUsername: e.target.value,})}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wide text-dim">Proxy Password (Optional)</label>
                <input
                  autoFocus
                  required
                  placeholder="e.g. Proxy Password (Optional)"
                  className="input-field w-full px-4 py-2.5 mt-1.5"
                  value={form.proxyPassword}
                  onChange={(e) =>setForm({...form, proxyPassword: e.target.value,})}
                />
              </div>

</div>

                {proxyResult && (
                    <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm">

                        <div>✅ Proxy Connected</div>

                        <div>IP: {proxyResult.ip}</div>

                        <div>Country: {proxyResult.country}</div>

                        <div>ISP: {proxyResult.org}</div>

                    </div>
                )}



              <button type="button" onClick={testProxy} disabled={testing} className="btn-warning w-full py-2.5">
                {testing ? 'Testing...' : '🌐 Test Proxy'}
              </button>

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
