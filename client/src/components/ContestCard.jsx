import CountdownTimer from './CountdownTimer';
import { Users, Trophy, Zap, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_ICONS = {
  Cricket: '🏏', Football: '⚽', Basketball: '🏀', Tennis: '🎾',
  GK: '🧠', Bollywood: '🎬', Science: '🔬', History: '📜',
  Technology: '💻', Geography: '🌍',
};

const STATUS_COLORS = {
  active: 'badge-green',
  closed: 'badge-orange',
  completed: 'badge-purple',
  stopped: 'badge-red',
};

export default function ContestCard({ contest }) {
  const navigate = useNavigate();
  const spotsLeft = contest.totalSpots - contest.joinedCount;
  const fillPercent = ((contest.joinedCount / contest.totalSpots) * 100).toFixed(0);

  return (
    <div
      className="card card-hover slide-up"
      onClick={() => navigate(`/contest/${contest._id}`)}
      style={{ padding: 0, overflow: 'hidden' }}
    >
      {/* Header gradient */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(6,182,212,0.08) 100%)',
        padding: '14px 16px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span style={{ fontSize: 22 }}>{CATEGORY_ICONS[contest.category] || '🏆'}</span>
            <div className="min-w-0">
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }} className="truncate">
                {contest.title}
              </h3>
              <span className={`badge ${STATUS_COLORS[contest.status] || 'badge-orange'}`} style={{ marginTop: 4 }}>
                {contest.category}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="gradient-text" style={{ fontSize: 18, fontWeight: 900 }}>
              ₹{contest.firstPrize?.toLocaleString() || contest.prizePool?.toLocaleString() || '0'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>1st Prize</div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ padding: '10px 16px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
          <div className="flex items-center gap-3">
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Prize Pool</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-gold)' }}>₹{contest.prizePool?.toLocaleString() || '0'}</div>
            </div>
            <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Entry</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>₹{contest.entryFee}</div>
            </div>
            <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Winners</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-cyan)' }}>{contest.winnersCount}</div>
            </div>
          </div>
          <CountdownTimer endTime={contest.endTime} />
        </div>

        {/* Spots progress bar */}
        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${fillPercent}%`,
              background: fillPercent > 80 ? 'var(--accent-red)' : 'linear-gradient(90deg, var(--accent-orange), var(--accent-gold))',
              borderRadius: 4,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {contest.joinedCount?.toLocaleString()} / {contest.totalSpots?.toLocaleString()}
          </span>
        </div>

        {/* CTA Button */}
        <button className="btn-primary w-full" style={{ padding: '10px 16px', fontSize: 13 }}>
          <Zap size={14} />
          Play Quiz & Win
          <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
        </button>
      </div>
    </div>
  );
}
