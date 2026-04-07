import { useNavigate } from 'react-router-dom';
import { User, Lock, FileText, Shield, Phone, LogOut, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const menuItems = [
  { icon: User, label: 'Edit Profile', path: '/profile', color: 'var(--accent-cyan)' },
  { icon: Lock, label: 'Change Password', path: '/change-password', color: 'var(--accent-orange)' },
  { icon: FileText, label: 'Terms & Conditions', path: '/terms', color: 'var(--accent-gold)' },
  { icon: Shield, label: 'Privacy Policy', path: '/privacy', color: 'var(--accent-green)' },
  { icon: Phone, label: 'Contact Us', path: '/contact', color: 'var(--accent-purple)' },
];

export default function MenuPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="page pb-nav fade-in">
      <div className="header">
        <h1 style={{ fontSize: 18, fontWeight: 800 }}>Menu</h1>
      </div>

      <div style={{ padding: 16 }}>
        {/* User card */}
        <div style={{ borderRadius: 16, padding: 20, marginBottom: 20, background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(6,182,212,0.1))', border: '1px solid rgba(249,115,22,0.2)' }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, boxShadow: '0 4px 14px rgba(249,115,22,0.4)', flexShrink: 0 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800 }}>{user?.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{user?.username} · {user?.mobile}</p>
              <span className="badge badge-orange" style={{ marginTop: 4 }}>Referral: {user?.referralCode}</span>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
          {menuItems.map(({ icon: Icon, label, path, color }, i) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                borderBottom: i < menuItems.length - 1 ? '1px solid var(--border)' : 'none',
                textAlign: 'left',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} style={{ color }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{label}</span>
              <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={16} style={{ color: 'var(--accent-red)' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-red)' }}>Logout</span>
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 24 }}>
          BKBBQUIZ v1.0 · Play responsibly
        </p>
      </div>
    </div>
  );
}
