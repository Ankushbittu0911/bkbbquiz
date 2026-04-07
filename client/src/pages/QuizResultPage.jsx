import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Check, X, Ticket, Home } from 'lucide-react';

export default function QuizResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const ticket = location.state?.ticket;

  if (!ticket) {
    navigate('/tickets');
    return null;
  }

  const total = ticket.correctAnswers + ticket.wrongAnswers;
  const accuracy = total > 0 ? Math.round((ticket.correctAnswers / total) * 100) : 0;
  const minutes = Math.floor((ticket.timeTaken || 0) / 60);
  const seconds = (ticket.timeTaken || 0) % 60;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-8 fade-in" style={{ background: 'var(--bg-primary)' }}>
      {/* Result card */}
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Score circle */}
        <div className="text-center" style={{ marginBottom: 24 }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(251,191,36,0.2))',
            border: '3px solid rgba(249,115,22,0.4)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div className="gradient-text" style={{ fontSize: 28, fontWeight: 900 }}>{ticket.score}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>POINTS</div>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Quiz Complete! 🎉</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{ticket.contestTitle}</p>
        </div>

        {/* Stats grid */}
        <div className="glass" style={{ borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 12, borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
              <Check size={16} style={{ color: 'var(--accent-green)', margin: '0 auto 4px' }} />
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-green)' }}>{ticket.correctAnswers}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Correct</div>
            </div>
            <div style={{ padding: 12, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
              <X size={16} style={{ color: 'var(--accent-red)', margin: '0 auto 4px' }} />
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-red)' }}>{ticket.wrongAnswers}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Wrong</div>
            </div>
            <div style={{ padding: 12, borderRadius: 12, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-cyan)' }}>{accuracy}%</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Accuracy</div>
            </div>
            <div style={{ padding: 12, borderRadius: 12, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-purple)' }}>{minutes}:{String(seconds).padStart(2, '0')}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Time Taken</div>
            </div>
          </div>
        </div>

        {/* Ticket number */}
        <div className="glass" style={{ borderRadius: 16, padding: 16, marginBottom: 20, textAlign: 'center' }}>
          <div className="flex items-center justify-center gap-2" style={{ marginBottom: 4 }}>
            <Ticket size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ticket Number</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>
            {ticket.ticketNumber}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            Winners will be declared after the contest ends
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/tickets')}>
            <Ticket size={15} /> My Tickets
          </button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={() => navigate('/')}>
            <Home size={15} /> Home
          </button>
        </div>
      </div>
    </div>
  );
}
