import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

const CONTENT = {
  completed: { icon: '✅', title: 'Payment successful', subtitle: 'Your plan is now active.' },
  cancelled: { icon: '✖️', title: 'Payment cancelled', subtitle: 'No charge was made. You can try again anytime.' },
  failed: {
    icon: '⚠️',
    title: 'Payment failed',
    subtitle: 'Something went wrong. Please try again or contact support.'
  },
  pending: { icon: '⏳', title: 'Still processing…', subtitle: 'This can take a few seconds. Refresh if it does not update.' }
};

export default function PaymentResult() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const cancelled = searchParams.get('status') === 'cancelled';
  const [state, setState] = useState(cancelled ? 'cancelled' : 'checking');

  useEffect(() => {
    if (cancelled) return;

    const transactionId = localStorage.getItem('pendingTransactionId');
    if (!transactionId) {
      setState('pending');
      return;
    }

    let cancelledEffect = false;

    async function poll() {
      try {
        const { status } = await apiFetch(`/payment/status/${transactionId}`, { token });
        if (cancelledEffect) return;
        setState(status);
        if (status === 'completed' || status === 'failed' || status === 'cancelled') {
          localStorage.removeItem('pendingTransactionId');
        } else {
          setTimeout(poll, 2500);
        }
      } catch {
        if (!cancelledEffect) setState('pending');
      }
    }

    poll();
    return () => {
      cancelledEffect = true;
    };
  }, [cancelled, token]);

  const content = CONTENT[state] || { icon: '⏳', title: 'Checking payment status…', subtitle: 'Please wait, this only takes a moment.' };

  return (
    <div className="min-h-screen grid-overlay flex items-center justify-center px-4">
      <div className="panel p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">{content.icon}</div>
        <h1 className="text-xl font-bold mb-2">{content.title}</h1>
        <p className="text-sm text-dim mb-6">{content.subtitle}</p>
        <Link to="/dashboard" className="btn-primary inline-block px-6 py-2.5">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
