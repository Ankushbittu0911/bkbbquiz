import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAdminStore from '../store/adminStore';
import { Lock, Phone, Shield } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAdminStore();
  const [form, setForm] = useState({ mobile: '', password: '' });

  const loginMutation = useMutation({
    mutationFn: (data) => api.post('/auth/login', data),
    onSuccess: ({ data }) => {
      if (!data.user?.isAdmin) return toast.error('Admin access required');
      setAuth(data.user, data.token);
      toast.success('Welcome, Admin!');
      navigate('/');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Login failed'),
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28, boxShadow: '0 8px 24px rgba(249,115,22,0.4)' }}>🏆</div>
          <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 900 }}>BKBBQUIZ</h1>
          <div className="badge badge-orange" style={{ margin: '8px auto 0', display: 'inline-flex' }}>
            <Shield size={10} style={{ marginRight: 4 }} /> Admin Panel
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Admin Login</h2>
          <form onSubmit={(e) => { e.preventDefault(); loginMutation.mutate(form); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="tel" className="input-field" style={{ paddingLeft: 36 }} placeholder="Admin mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="password" className="input-field" style={{ paddingLeft: 36 }} placeholder="Admin password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12, marginTop: 4 }} disabled={loginMutation.isPending}>
              {loginMutation.isPending ? <span className="spinner" /> : '🔐 Login to Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
