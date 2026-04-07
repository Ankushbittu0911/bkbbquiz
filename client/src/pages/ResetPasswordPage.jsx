import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const mutation = useMutation({
    mutationFn: (data) => api.post(`/auth/reset-password/${token}`, data),
    onSuccess: ({ data }) => {
      if (data.token) setAuth(data.user, data.token);
      toast.success('Password reset successfully!');
      navigate('/login');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Reset failed'),
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="glass w-full" style={{ borderRadius: 20, padding: 24, maxWidth: 400 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>🔑 Reset Password</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Enter your new password below.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (password.length < 6) return toast.error('Min 6 characters'); mutation.mutate({ password }); }}>
          <div className="relative" style={{ marginBottom: 20 }}>
            <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type={showPass ? 'text' : 'password'} className="input-field" style={{ paddingLeft: 38, paddingRight: 44 }} placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={mutation.isPending}>
            {mutation.isPending ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
