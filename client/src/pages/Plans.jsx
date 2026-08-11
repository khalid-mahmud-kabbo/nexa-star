import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, formatMoney } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import NavBar from '../components/NavBar';

const FEATURED_PLAN_ID = 'year';

export default function Plans() {
  const { token, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(null);
  const [plans, setPlans] = useState(null);
  const [buyingId, setBuyingId] = useState(null);

  useEffect(() => {
    apiFetch('/dashboard/summary', { token })
      .then((s) => setBalance(s.balance))
      .catch((err) => {
        if (err.status === 401) {
          logout();
          navigate('/login');
        }
      });

    apiFetch('/plans').then((d) => setPlans(d.plans));
  }, [token, logout, navigate]);

  async function buyPlan(planId) {
    setBuyingId(planId);
    try {
      const { payment_url, transaction_id } = await apiFetch('/payment/checkout', {
        method: 'POST',
        body: { planId },
        token
      });
      localStorage.setItem('pendingTransactionId', transaction_id);
      window.location.href = payment_url;
    } catch (err) {
      showToast(err.message, 'error');
      setBuyingId(null);
    }
  }

  return (
    <div className="min-h-screen grid-overlay px-4 py-10">
      <div className="max-w-5xl mx-auto mb-6">
        <NavBar />
      </div>

      <div className="max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-extrabold flex items-center justify-center gap-2">
          💎 <span className="brand-gradient">Select a Plan</span>
        </h1>
        <p className="text-sm text-dim mt-2">💰 Balance: {formatMoney(balance)}</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans === null && <p className="text-dim col-span-full text-center">Loading plans...</p>}

        {plans?.map((p) => (
          <div key={p.id} className={`plan-card ${p.id === FEATURED_PLAN_ID ? 'featured' : ''} p-7 flex flex-col`}>
            <h3 className="text-lg font-semibold text-purple-200">{p.name}</h3>
            <p className="text-3xl font-extrabold my-3 brand-gradient">{formatMoney(p.price)}</p>
            <p className="text-xs text-dim mb-5">⏱ {p.durationDays === 1 ? '1 day' : `${p.durationDays} days`}</p>

            <div className="space-y-2 text-sm mb-6 flex-1">
              <p className="flex items-center gap-2">
                ⚡ Daily Requests
                <span className="ml-auto font-semibold">{p.dailyLimit === -1 ? 'Unlimited' : p.dailyLimit}</span>
              </p>
              <p className="flex items-center gap-2">
                📱 Devices
                <span className="ml-auto font-semibold">{p.deviceLimit === -1 ? 'Unlimited' : p.deviceLimit}</span>
              </p>
            </div>

            <button
              disabled={buyingId === p.id}
              onClick={() => buyPlan(p.id)}
              className="btn-primary w-full py-2.5"
            >
              {buyingId === p.id ? 'Redirecting to ZiniPay...' : 'Buy Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
