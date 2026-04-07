import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import ContestCard from '../components/ContestCard';
import useAuthStore from '../store/authStore';

const CATEGORIES = ['All', 'Cricket', 'Football', 'Basketball', 'Tennis', 'GK', 'Bollywood', 'Science', 'History', 'Technology', 'Geography'];

export default function HomePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [cat, setCat] = useState('All');

  const { data, isLoading, error } = useQuery({
    queryKey: ['contests', cat],
    queryFn: () => api.get('/contests', { params: cat !== 'All' ? { category: cat } : {} }).then(r => r.data),
  });

  const { data: walletData } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => api.get('/wallet').then(r => r.data),
  });

  const contests = data?.contests || [];
  const totalBalance = walletData?.wallet?.totalBalance || 0;

  return (
    <div className="page pb-nav fade-in">
      {/* Header */}
      <div className="header">
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Welcome back,</p>
            <h1 style={{ fontSize: 16, fontWeight: 800 }}>{user?.name?.split(' ')[0]} 👋</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/wallet')} style={{
              background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: 10, padding: '5px 12px', cursor: 'pointer',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Bal </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-gold)' }}>₹{totalBalance.toFixed(0)}</span>
            </button>
            <button onClick={() => navigate('/notifications')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 12, padding: 8, cursor: 'pointer', color: 'var(--text-primary)' }}>
              <Bell size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Hero banner */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{
          borderRadius: 16, padding: '20px',
          background: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(6,182,212,0.1) 100%)',
          border: '1px solid rgba(249,115,22,0.2)', marginBottom: 16, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.08 }}>🏆</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>
            <span className="gradient-text">Win Real Cash</span> 🎯
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Join quiz contests. Answer correctly. Win big!</p>
          <div className="flex items-center gap-4">
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent-gold)' }}>
                ₹{contests.reduce((s, c) => s + (c.firstPrize || 0), 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Total Prizes</div>
            </div>
            <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent-cyan)' }}>{contests.length}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Live Contests</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ paddingLeft: 16, marginBottom: 16, overflowX: 'auto', display: 'flex', gap: 8, scrollbarWidth: 'none' }}>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600,
            whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
            background: cat === c ? 'linear-gradient(135deg, var(--accent-orange), var(--accent-gold))' : 'rgba(255,255,255,0.06)',
            color: cat === c ? '#fff' : 'var(--text-muted)',
            boxShadow: cat === c ? '0 4px 12px rgba(249,115,22,0.3)' : 'none',
          }}>
            {c}
          </button>
        ))}
        <div style={{ width: 16, flexShrink: 0 }} />
      </div>

      {/* Contests list */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shimmer" style={{ height: 180, borderRadius: 16 }} />
          ))
        ) : error ? (
          <div className="card text-center" style={{ padding: 32 }}>
            <p style={{ color: 'var(--accent-red)', fontSize: 14 }}>Failed to load contests</p>
          </div>
        ) : contests.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎮</div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No active contests in this category</p>
          </div>
        ) : (
          contests.map((contest) => <ContestCard key={contest._id} contest={contest} />)
        )}
      </div>
    </div>
  );
}
