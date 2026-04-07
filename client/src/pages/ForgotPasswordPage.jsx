import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: (data) => api.post('/auth/forgot-password', data),
    onSuccess: () => setSent(true),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to send'),
  });

  return (
    <div className="min-h-screen flex flex-col px-6 py-12" style={{ background: 'var(--bg-primary)' }}>
      <Link to="/login" className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 40 }}>
        <ArrowLeft size={18} /> Back to Login
      </Link>

      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Forgot Password</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>Enter your email to receive a reset link</p>
        </div>

        {sent ? (
          <div className="glass text-center" style={{ borderRadius: 20, padding: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Email Sent!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>If that email exists, a password reset link has been sent. Check your inbox.</p>
          </div>
        ) : (
          <div className="glass" style={{ borderRadius: 20, padding: 24 }}>
            <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ email }); }}>
              <div className="relative" style={{ marginBottom: 20 }}>
                <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="email" className="input-field" style={{ paddingLeft: 38 }} placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={mutation.isPending}>
                {mutation.isPending ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Send Reset Link'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
