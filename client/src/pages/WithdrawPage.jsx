import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

export default function WithdrawPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [form, setForm] = useState({ amount: '', name: user?.name || '', upiId: '' });

  const { data: walletData } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => api.get('/wallet').then(r => r.data),
  });
  const winningsBalance = walletData?.wallet?.winningsBalance || 0;

  const withdrawMutation = useMutation({
    mutationFn: (data) => api.post('/withdrawals', data),
    onSuccess: () => {
      toast.success('Withdrawal request submitted! Will be processed within 24 hours.');
      qc.invalidateQueries(['wallet']);
      navigate('/wallet');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.name || !form.upiId) return toast.error('All fields required');
    if (parseFloat(form.amount) > winningsBalance) return toast.error('Insufficient winnings balance');
    withdrawMutation.mutate(form);
  };

  return (
    <div className="page pb-nav fade-in">
      <div className="header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-primary)' }}>
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 800 }}>Withdraw Money</h1>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Winnings balance */}
        <div style={{ borderRadius: 16, padding: 20, marginBottom: 16, background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(249,115,22,0.1))', border: '1px solid rgba(251,191,36,0.25)' }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Available Winnings Balance</p>
          <div className="gradient-text" style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>₹{winningsBalance.toFixed(2)}</div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Only winnings balance can be withdrawn</p>
        </div>

        {/* Info */}
        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', marginBottom: 16, display: 'flex', gap: 8 }}>
          <Info size={14} style={{ color: 'var(--accent-orange)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Withdrawals are manually processed within 24 hours. Minimum ₹100. Deposit balance cannot be withdrawn.
          </p>
        </div>

        {winningsBalance < 100 ? (
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>💰</p>
            <p style={{ fontSize: 14, fontWeight: 700 }}>Minimum ₹100 required</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Keep playing to win more!</p>
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>Play Now</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Amount (₹)</label>
              <div className="relative">
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, fontWeight: 700, color: 'var(--accent-gold)' }}>₹</span>
                <input type="number" className="input-field" style={{ paddingLeft: 32, fontSize: 18, fontWeight: 800 }} placeholder="Min ₹100" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} max={winningsBalance} min={100} required />
              </div>
              <button type="button" onClick={() => setForm({ ...form, amount: String(winningsBalance) })} style={{ fontSize: 11, color: 'var(--accent-orange)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}>
                Withdraw all ₹{winningsBalance.toFixed(2)}
              </button>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Account Holder Name</label>
              <input type="text" className="input-field" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>UPI ID</label>
              <input type="text" className="input-field" placeholder="yourname@upi" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={withdrawMutation.isPending}>
              {withdrawMutation.isPending ? <span className="spinner" style={{ width: 18, height: 18 }} /> : '🏦 Submit Withdrawal Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
