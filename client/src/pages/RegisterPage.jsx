import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Phone, Mail, Lock, Calendar, AtSign, Zap } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', username: '', mobile: '', email: '', dob: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1);

  const registerMutation = useMutation({
    mutationFn: (data) => api.post('/auth/register', data),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.token);
      toast.success('Account created! Welcome to BKBBQUIZ 🎉');
      navigate('/');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Registration failed'),
  });

  const handleNext = () => {
    if (step === 1) {
      if (!form.name || !form.username || !form.mobile) return toast.error('Fill all fields');
      if (form.mobile.length !== 10) return toast.error('Enter valid 10-digit mobile');
      setStep(2);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.dob || !form.password) return toast.error('Fill all fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    const { confirmPassword, ...data } = form;
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <div style={{ position: 'fixed', top: -80, right: -80, width: 250, height: 250, background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
        {/* Logo */}
        <div className="text-center mb-8 slide-up">
          <div style={{ fontSize: 28, fontWeight: 900 }} className="gradient-text">🏆 BKBBQUIZ</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Join & Start Winning</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} style={{
              width: s === step ? 32 : 8, height: 8, borderRadius: 4,
              background: s <= step ? 'linear-gradient(90deg, var(--accent-orange), var(--accent-gold))' : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        <div className="glass w-full slide-up" style={{ borderRadius: 20, padding: 24 }}>
          {step === 1 ? (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Personal Info</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Step 1 of 2</p>
              <div className="flex flex-col gap-4">
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Full Name</label>
                  <div className="relative">
                    <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" className="input-field" style={{ paddingLeft: 38 }} placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Username</label>
                  <div className="relative">
                    <AtSign size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" className="input-field" style={{ paddingLeft: 38 }} placeholder="Unique username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '') })} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Mobile Number</label>
                  <div className="relative">
                    <Phone size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="tel" className="input-field" style={{ paddingLeft: 38 }} placeholder="10-digit mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })} maxLength={10} inputMode="numeric" />
                  </div>
                </div>
                <button className="btn-primary w-full" onClick={handleNext} style={{ marginTop: 4 }}>
                  Continue →
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Account Setup</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Step 2 of 2</p>
              <div className="flex flex-col gap-4">
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email</label>
                  <div className="relative">
                    <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="email" className="input-field" style={{ paddingLeft: 38 }} placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Date of Birth</label>
                  <div className="relative">
                    <Calendar size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="date" className="input-field" style={{ paddingLeft: 38, colorScheme: 'dark' }} value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Password</label>
                  <div className="relative">
                    <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type={showPass ? 'text' : 'password'} className="input-field" style={{ paddingLeft: 38, paddingRight: 44 }} placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Confirm Password</label>
                  <div className="relative">
                    <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="password" className="input-field" style={{ paddingLeft: 38 }} placeholder="Repeat password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Zap size={15} /> Create Account</>}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 16 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
