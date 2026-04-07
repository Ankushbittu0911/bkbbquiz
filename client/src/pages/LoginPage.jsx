import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Phone, Lock, Zap } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ mobile: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const loginMutation = useMutation({
    mutationFn: (data) => api.post('/auth/login', data),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.token);
      toast.success('Welcome back! 🎮');
      navigate('/');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Login failed');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.mobile || !form.password) return toast.error('All fields required');
    loginMutation.mutate(form);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', top: -100, right: -100, width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: -100, left: -100, width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
        {/* Logo */}
        <div className="text-center mb-8 slide-up">
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(249,115,22,0.4)',
            fontSize: 32,
          }}>🏆</div>
          <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>BKBBQUIZ</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>Play. Win. Repeat.</p>
        </div>

        {/* Form card */}
        <div className="glass slide-up w-full" style={{ borderRadius: 20, padding: 24, animationDelay: '0.1s' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Welcome back</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Login with your mobile number</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Mobile Number</label>
              <div className="relative">
                <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  className="input-field"
                  style={{ paddingLeft: 40 }}
                  placeholder="Enter mobile number"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  maxLength={10}
                  inputMode="numeric"
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Password</label>
              <div className="relative">
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field"
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--accent-orange)', fontWeight: 600 }}>Forgot Password?</Link>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loginMutation.isPending}
              style={{ marginTop: 4 }}
            >
              {loginMutation.isPending ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Zap size={16} /> Login & Play</>}
            </button>
          </form>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 20, textAlign: 'center' }}>
          New to BKBBQUIZ?{' '}
          <Link to="/register" style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>Create Account</Link>
        </p>
      </div>
    </div>
  );
}
