import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, Minus, RotateCcw, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';

const txIcon = (type) => {
  const map = {
    deposit: { icon: Plus, color: 'var(--accent-green)', bg: 'rgba(16,185,129,0.15)' },
    withdrawal: { icon: Minus, color: 'var(--accent-red)', bg: 'rgba(239,68,68,0.15)' },
    contest_entry: { icon: ArrowUpRight, color: 'var(--accent-orange)', bg: 'rgba(249,115,22,0.15)' },
    prize_winning: { icon: Trophy, color: 'var(--accent-gold)', bg: 'rgba(251,191,36,0.15)' },
    refund: { icon: RotateCcw, color: 'var(--accent-cyan)', bg: 'rgba(6,182,212,0.15)' },
    admin_credit: { icon: Plus, color: 'var(--accent-green)', bg: 'rgba(16,185,129,0.15)' },
    admin_debit: { icon: Minus, color: 'var(--accent-red)', bg: 'rgba(239,68,68,0.15)' },
    referral_bonus: { icon: Trophy, color: 'var(--accent-purple)', bg: 'rgba(139,92,246,0.15)' },
  };
  return map[type] || { icon: Wallet, color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.06)' };
};

const isCredit = (type) => ['deposit', 'prize_winning', 'refund', 'admin_credit', 'referral_bonus'].includes(type);

export default function WalletPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => api.get('/wallet').then(r => r.data),
  });

  const wallet = data?.wallet;
  const transactions = data?.transactions || [];

  return (
    <div className="page pb-nav fade-in">
      <div className="header">
        <h1 style={{ fontSize: 18, fontWeight: 800 }}>My Wallet</h1>
      </div>

      <div style={{ padding: 16 }}>
        {/* Balance cards */}
        <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 16, background: 'linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(6,182,212,0.15) 100%)', border: '1px solid rgba(249,115,22,0.25)', padding: 20 }}>
          <div className="text-center" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Balance</p>
            <div className="gradient-text" style={{ fontSize: 36, fontWeight: 900, marginTop: 4 }}>
              ₹{isLoading ? '...' : (wallet?.totalBalance || 0).toFixed(2)}
            </div>
          </div>
          <div className="flex gap-3">
            <div style={{ flex: 1, borderRadius: 12, background: 'rgba(255,255,255,0.07)', padding: 12, textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Deposit Balance</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-cyan)' }}>₹{(wallet?.depositBalance || 0).toFixed(2)}</p>
            </div>
            <div style={{ flex: 1, borderRadius: 12, background: 'rgba(255,255,255,0.07)', padding: 12, textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Winnings</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-gold)' }}>₹{(wallet?.winningsBalance || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3" style={{ marginBottom: 20 }}>
          <button className="btn-primary" style={{ flex: 1 }} onClick={() => navigate('/deposit')}>
            <ArrowDownLeft size={16} /> Add Money
          </button>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/withdraw')}>
            <ArrowUpRight size={16} /> Withdraw
          </button>
        </div>

        {/* Transactions */}
        <div style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Recent Transactions</h2>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="shimmer" style={{ height: 56, borderRadius: 12, marginBottom: 8 }} />)
          ) : transactions.length === 0 ? (
            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No transactions yet</p>
            </div>
          ) : (
            transactions.map((tx) => {
              const { icon: Icon, color, bg } = txIcon(tx.type);
              const credit = isCredit(tx.type);
              return (
                <div key={tx._id} className="flex items-center gap-3" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600 }} className="truncate">{tx.description || tx.type.replace(/_/g, ' ')}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{tx.createdAt ? format(new Date(tx.createdAt), 'dd MMM, hh:mm a') : ''}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: credit ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                      {credit ? '+' : '-'}₹{tx.amount}
                    </p>
                    <span className={`badge ${tx.status === 'completed' ? 'badge-green' : tx.status === 'pending' ? 'badge-orange' : 'badge-red'}`} style={{ fontSize: 9, padding: '2px 6px' }}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
