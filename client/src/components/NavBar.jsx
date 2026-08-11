import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ITEMS = [
  { to: '/dashboard', icon: '⌂', label: 'Home' },
  { to: '/devices', icon: '📱', label: 'API Keys' },
  { to: '/history', icon: '💾', label: 'History', badge: 'New' },
  { to: '/profile', icon: '👤', label: 'Profile' },
  { to: '/plans', icon: '♛', label: 'Plans' }
];

export default function NavBar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="panel px-4 py-3 mb-4 flex items-center justify-center gap-3 flex-wrap">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          title={item.label}
          className={({ isActive }) =>
            `relative w-11 h-11 rounded-full flex items-center justify-center text-lg transition
             ${isActive ? 'bg-gradient-to-br from-purple-500 to-violet-700 text-white shadow-lg shadow-purple-900/40' : 'bg-white/[0.04] text-purple-100 hover:bg-white/[0.08]'}`
          }
        >
          <span aria-hidden="true">{item.icon}</span>
          <span className="sr-only">{item.label}</span>
          {item.badge && (
            <span className="absolute -top-1.5 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
              {item.badge}
            </span>
          )}
        </NavLink>
      ))}

      <button
        onClick={handleLogout}
        title="Log out"
        className="w-11 h-11 rounded-full flex items-center justify-center text-lg bg-white/[0.04] text-purple-100 hover:bg-white/[0.08] transition"
      >
        <span aria-hidden="true">⏻</span>
        <span className="sr-only">Log out</span>
      </button>
    </nav>
  );
}
