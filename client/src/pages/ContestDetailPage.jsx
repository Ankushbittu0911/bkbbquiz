import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Users, Trophy, Zap, Timer, Star, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import CountdownTimer from '../components/CountdownTimer';

const CATEGORY_ICONS = { Cricket: '🏏', Football: '⚽', Basketball: '🏀', Tennis: '🎾', GK: '🧠', Bollywood: '🎬', Science: '🔬', History: '📜', Technology: '💻', Geography: '🌍' };

export default function ContestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showPrize, setShowPrize] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['contest', id],
    queryFn: () => api.get(`/contests/${id}`).then(r => r.data),
  });

  const { data: walletData } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => api.get('/wallet').then(r => r.data),
  });

  const joinMutation = useMutation({
    mutationFn: () => api.post(`/contests/${id}/join`),
    onSuccess: ({ data }) => {
      toast.success('Joined! Starting quiz...');
      qc.invalidateQueries(['wallet']);
      navigate(`/quiz/${id}`, { state: { ticketId: data.ticketId } });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to join'),
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  const { contest, leaderboard = [] } = data || {};
  if (!contest) return null;

  const spotsLeft = contest.totalSpots - contest.joinedCount;
  const wallet = walletData?.wallet;
  const canAfford = wallet && wallet.totalBalance >= contest.entryFee;

  return (
    <div className="page pb-nav fade-in">
      {/* Header */}
      <div className="header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-primary)' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: 15, fontWeight: 800 }}>{contest.title}</h1>
            <span className="badge badge-orange">{contest.category}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Hero card */}
        <div style={{
          borderRadius: 16, padding: 20, marginBottom: 16,
          background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(6,182,212,0.08))',
          border: '1px solid rgba(249,115,22,0.2)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, fontSize: 100, opacity: 0.06 }}>
            {CATEGORY_ICONS[contest.category] || '🏆'}
          </div>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>1st Prize</div>
              <div className="gradient-text" style={{ fontSize: 28, fontWeight: 900 }}>₹{contest.firstPrize?.toLocaleString() || '0'}</div>
            </div>
            <div className="text-right">
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Prize Pool</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-gold)' }}>₹{contest.prizePool?.toLocaleString() || '0'}</div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-cyan)' }}>{contest.winnersCount}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Winners</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div className="text-center">
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-orange)' }}>₹{contest.entryFee}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Entry Fee</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div className="text-center">
              <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>{spotsLeft?.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Spots Left</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div className="text-center">
              <div style={{ fontSize: 14, fontWeight: 700 }}>{contest.joinedCount?.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Joined</div>
            </div>
          </div>
        </div>

        {/* Countdown + Timer info */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Contest ends in</p>
              <CountdownTimer endTime={contest.endTime} />
            </div>
            <div className="flex items-center gap-1.5">
              <Timer size={13} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: 12, color: 'var(--accent-cyan)', fontWeight: 600 }}>
                {Math.floor(contest.quizDuration / 60)} min quiz
              </span>
            </div>
          </div>
        </div>

        {/* Prize breakup accordion */}
        <div className="card" style={{ marginBottom: 12 }}>
          <button onClick={() => setShowPrize(!showPrize)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0 }}>
            <div className="flex items-center gap-2">
              <Trophy size={15} style={{ color: 'var(--accent-gold)' }} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>Prize Breakup</span>
            </div>
            {showPrize ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
          </button>
          {showPrize && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(contest.prizeGroups || []).map((group, i) => (
                <div key={i} className="flex items-center justify-between" style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{group.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{group.percentage}% of pool</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent-gold)' }}>
                    ₹{Math.floor((contest.prizePool * group.percentage) / 100 / (group.rankTo - group.rankFrom + 1)).toLocaleString()}
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>/winner</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <Star size={15} style={{ color: 'var(--accent-orange)' }} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>Top Players</span>
            </div>
            {leaderboard.slice(0, 5).map((ticket, i) => (
              <div key={ticket._id} className="flex items-center gap-3" style={{ marginBottom: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, fontWeight: 800, fontSize: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: i === 0 ? 'rgba(251,191,36,0.2)' : i === 1 ? 'rgba(203,213,225,0.1)' : i === 2 ? 'rgba(180,83,9,0.15)' : 'rgba(255,255,255,0.05)',
                  color: i === 0 ? 'var(--accent-gold)' : 'var(--text-muted)',
                }}>#{i + 1}</div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{ticket.userId?.name || 'Player'}</div>
                <div style={{ fontSize: 12, color: 'var(--accent-orange)', fontWeight: 700 }}>{ticket.score} pts</div>
              </div>
            ))}
          </div>
        )}

        {/* Wallet notice */}
        {!canAfford && (
          <div style={{ padding: 12, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--accent-red)', fontWeight: 600 }}>
              ⚠️ Insufficient balance. Add ₹{Math.ceil(contest.entryFee - (wallet?.totalBalance || 0))} more to join.
            </p>
          </div>
        )}

        {/* CTA */}
        {contest.status === 'active' ? (
          <div className="flex gap-3">
            {!canAfford && (
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/deposit')}>+ Add Money</button>
            )}
            <button
              className="btn-primary"
              style={{ flex: 2 }}
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending || !canAfford || spotsLeft <= 0}
            >
              {joinMutation.isPending ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Zap size={16} /> Pay ₹{contest.entryFee} & Play</>}
            </button>
          </div>
        ) : (
          <div className="card text-center" style={{ padding: 20 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Contest is {contest.status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
