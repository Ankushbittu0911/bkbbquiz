import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Trophy, Check, X, Ticket, Timer } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.get(`/tickets/${id}`).then(r => r.data),
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  const ticket = data?.ticket;
  if (!ticket) return null;

  const contest = ticket.contestId;
  const minutes = Math.floor((ticket.timeTaken || 0) / 60);
  const secs = (ticket.timeTaken || 0) % 60;

  return (
    <div className="page pb-nav fade-in">
      <div className="header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-primary)' }}>
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 800 }}>Ticket Detail</h1>
        </div>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Ticket card */}
        <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {/* Top section */}
          <div style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(251,191,36,0.1))', padding: '20px 16px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>TICKET NUMBER</p>
                <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent-cyan)', letterSpacing: '0.03em' }}>{ticket.ticketNumber}</p>
              </div>
              {ticket.isWinner ? (
                <div style={{ textAlign: 'right' }}>
                  <div className="badge badge-gold" style={{ marginBottom: 4 }}>🏆 WINNER</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent-gold)' }}>₹{ticket.prizeWon}</div>
                </div>
              ) : (
                <span className={`badge ${contest?.status === 'completed' ? 'badge-red' : 'badge-orange'}`}>
                  {contest?.status === 'completed' ? 'No Win' : 'Pending'}
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, fontWeight: 700 }}>{contest?.title}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {contest?.category} · {ticket.completedAt ? format(new Date(ticket.completedAt), 'dd MMM yyyy, hh:mm a') : 'In progress'}
            </p>
          </div>

          {/* Divider with notches */}
          <div style={{ position: 'relative', height: 1, background: 'var(--border)' }}>
            <div style={{ position: 'absolute', left: -10, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: 'var(--bg-primary)' }} />
            <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: 'var(--bg-primary)' }} />
          </div>

          {/* Bottom section */}
          <div style={{ background: 'var(--bg-card)', padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { label: 'Score', value: ticket.score, color: 'var(--accent-orange)' },
                { label: 'Correct', value: ticket.correctAnswers, color: 'var(--accent-green)', icon: Check },
                { label: 'Wrong', value: ticket.wrongAnswers, color: 'var(--accent-red)', icon: X },
                { label: 'Time', value: `${minutes}:${String(secs).padStart(2, '0')}`, color: 'var(--accent-purple)' },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color }}>{value}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {ticket.isWinner && (
          <div style={{ padding: 16, borderRadius: 12, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', textAlign: 'center' }}>
            <p style={{ fontSize: 20, marginBottom: 4 }}>🎉</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-gold)' }}>Congratulations! You won ₹{ticket.prizeWon}!</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Rank #{ticket.rank} · Prize credited to your wallet</p>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-3">
          <button className="btn-secondary" style={{ flex: 1 }} onClick={() => navigate(`/contest/${contest?._id}`)}>
            View Contest
          </button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={() => navigate('/')}>
            Play More
          </button>
        </div>
      </div>
    </div>
  );
}
