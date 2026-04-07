import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Trophy, HelpCircle, Users, ArrowDownLeft, ArrowUpRight, Bell, Settings, LogOut, Ticket } from 'lucide-react';
import useAdminStore from '../store/adminStore';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/contests', icon: Trophy, label: 'Contests' },
  { path: '/questions', icon: HelpCircle, label: 'Questions' },
  { path: '/winners', icon: Trophy, label: 'Winners' },
  { path: '/users', icon: Users, label: 'Users' },
  { path: '/deposits', icon: ArrowDownLeft, label: 'Deposits' },
  { path: '/withdrawals', icon: ArrowUpRight, label: 'Withdrawals' },
  { path: '/notifications', icon: Bell, label: 'Notifications' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAdminStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40, overflowY: 'auto' }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div className="gradient-text" style={{ fontSize: 20, fontWeight: 900 }}>🏆 BKBBQUIZ</div>
          <div className="badge badge-orange" style={{ marginTop: 6 }}>Admin Panel</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(({ path, icon: Icon, label, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderRadius: 10, marginBottom: 2, textDecoration: 'none', transition: 'all 0.15s',
                background: isActive ? 'rgba(249,115,22,0.12)' : 'transparent',
                color: isActive ? 'var(--accent-orange)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500, fontSize: 13,
                borderLeft: isActive ? '3px solid var(--accent-orange)' : '3px solid transparent',
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{user?.name}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 10 }}>Administrator</div>
          <button onClick={handleLogout} className="btn-danger" style={{ width: '100%', justifyContent: 'center', padding: '7px 12px' }}>
            <LogOut size={13} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
