import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, formatMoney, formatDate } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import NavBar from '../components/NavBar';

export default function Dashboard() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);

  const handleError = useCallback(
    (err) => {
      showToast(err.message, 'error');
      if (err.status === 401) navigate('/login');
    },
    [showToast, navigate]
  );

  useEffect(() => {
    apiFetch('/dashboard/summary', { token }).then(setSummary).catch(handleError);
  }, [token, handleError]);

  function copy(value, label) {
    navigator.clipboard.writeText(value);
    showToast(`${label} copied`, 'success');
  }

  const limit = summary?.plan?.dailyLimit;
  const used = summary?.usage?.count || 0;
  const remaining = limit === -1 ? '∞' : Math.max(0, (limit || 0) - used);

  return (
    <div className="min-h-screen grid-overlay px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <NavBar />

        {summary && !summary.hasActivePlan && (
          <div className="mb-4 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 to-transparent px-5 py-3 flex items-center gap-2 text-amber-200 text-sm">
            ⚠️ No plan active!{' '}
            <Link to="/plans" className="underline font-semibold hover:text-amber-100">
              Buy now
            </Link>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="stat-card p-5 text-center">
            <div className="text-2xl font-bold text-purple-300">{formatMoney(summary?.totalEarnings)}</div>
            <div className="text-xs text-dim mt-1">💰 Total Earnings</div>
          </div>
          <div className="stat-card p-5 text-center">
            <div className="text-2xl font-bold text-purple-300">{summary?.referrals ?? 0}</div>
            <div className="text-xs text-dim mt-1">👥 Referrals</div>
          </div>
          <div className="stat-card p-5 text-center">
            <div className="text-2xl font-bold text-purple-300">{formatMoney(summary?.balance)}</div>
            <div className="text-xs text-dim mt-1">💳 Balance</div>
          </div>
          <div className="stat-card p-5 text-center">
            <div className="text-2xl font-bold text-purple-300">
              {summary?.plan?.expiresAt ? formatDate(summary.plan.expiresAt) : 'N/A'}
            </div>
            <div className="text-xs text-dim mt-1">📅 Plan Expiry</div>
          </div>
          <div className="stat-card p-5 text-center" style={{ borderColor: 'rgba(52,211,153,0.35)' }}>
            <div className="text-2xl font-bold text-emerald-300">{remaining}</div>
            <div className="text-xs text-dim mt-1">⚡ Remaining Requests</div>
            <div className="text-[10px] text-dim mt-1">
              Limit: {limit === -1 ? 'Unlimited' : limit ?? 0} | Used: {used}
            </div>
          </div>
        </div>

        {/* Referral link */}
        <div className="panel p-6 mb-4">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">🔗 Your Referral Link</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              readOnly
              className="input-field flex-1 px-4 py-2.5 text-sm text-purple-100"
              value={summary?.referralLink || 'Loading...'}
            />
            <button
              className="btn-primary px-5 py-2.5 whitespace-nowrap"
              onClick={() => summary && copy(summary.referralLink, 'Referral link')}
            >
              📋 Copy
            </button>
          </div>
          <p className="text-xs text-dim mt-3">
            Referral Code: <span className="font-semibold text-purple-200">{summary?.referralCode || '—'}</span>
            &nbsp;|&nbsp; Commission:{' '}
            <span className="font-semibold text-purple-200">{summary?.commissionPercent ?? 10}%</span>
          </p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/api-keys" className="panel p-5 flex items-center justify-between hover:bg-white/[0.04] transition">
            <div>
              <p className="text-sm font-semibold">🔑 Manage API Keys</p>
              <p className="text-xs text-dim mt-1">Create and revoke keys for your integrations</p>
            </div>
            <span className="text-dim">→</span>
          </Link>
          <Link to="/history" className="panel p-5 flex items-center justify-between hover:bg-white/[0.04] transition">
            <div>
              <p className="text-sm font-semibold">📊 View History</p>
              <p className="text-xs text-dim mt-1">Purchases, commissions, and referred users</p>
            </div>
            <span className="text-dim">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
