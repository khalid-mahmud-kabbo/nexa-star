import { useEffect, useState } from 'react';
import { apiFetch, formatMoney, formatDate } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import NavBar from '../components/NavBar';

function statusColor(status) {
  if (status === 'completed') return 'text-emerald-400';
  if (status === 'pending') return 'text-amber-400';
  return 'text-red-400';
}

export default function History() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState('history');
  const [history, setHistory] = useState(null);
  const [referrals, setReferrals] = useState(null);

  useEffect(() => {
    apiFetch('/dashboard/history', { token })
      .then((d) => setHistory(d.history))
      .catch((err) => showToast(err.message, 'error'));
    apiFetch('/dashboard/referrals', { token })
      .then((d) => setReferrals(d.referrals))
      .catch((err) => showToast(err.message, 'error'));
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen grid-overlay px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <NavBar />

        <div className="panel p-6">
          <div className="flex gap-6 border-b border-white/10 mb-5">
            <button
              className={`tab-btn text-sm font-medium ${tab === 'history' ? 'active' : ''}`}
              onClick={() => setTab('history')}
            >
              📊 History
            </button>
            <button
              className={`tab-btn text-sm font-medium ${tab === 'referrals' ? 'active' : ''}`}
              onClick={() => setTab('referrals')}
            >
              👥 Referrals
            </button>
          </div>

          {tab === 'history' && (
            <div className="space-y-2">
              {history === null && <p className="text-dim text-sm">Loading...</p>}
              {history?.length === 0 && <p className="text-dim text-sm">No history yet</p>}
              {history?.map((h) => (
                <div
                  key={h._id}
                  className="flex items-center justify-between border border-white/5 rounded-lg px-4 py-3 bg-white/[0.02]"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {h.type === 'plan_purchase' ? `Plan purchase — ${h.planName || ''}` : 'Referral commission'}
                    </p>
                    <p className="text-xs text-dim">{formatDate(h.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        h.type === 'referral_commission' ? 'text-emerald-300' : 'text-purple-200'
                      }`}
                    >
                      {h.type === 'referral_commission' ? '+' : ''}
                      {formatMoney(h.amount)}
                    </p>
                    <p className={`text-[10px] uppercase tracking-wide ${statusColor(h.status)}`}>{h.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'referrals' && (
            <div className="space-y-2">
              {referrals === null && <p className="text-dim text-sm">Loading...</p>}
              {referrals?.length === 0 && (
                <p className="text-dim text-sm">No referrals yet — share your link to start earning.</p>
              )}
              {referrals?.map((r) => (
                <div
                  key={r.email}
                  className="flex items-center justify-between border border-white/5 rounded-lg px-4 py-3 bg-white/[0.02]"
                >
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-dim">
                      {r.email} · joined {formatDate(r.joinedAt)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      r.hasActivePlan ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-dim'
                    }`}
                  >
                    {r.hasActivePlan ? r.planName : 'No active plan'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
