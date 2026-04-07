import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';

export default function ResultsPage() {
  const navigate = useNavigate();

  const { data: ticketData, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => api.get('/tickets').then(r => r.data),
  });

  const completedTickets = (ticketData?.tickets || []).filter(
    t => t.contestId?.status === 'completed' && t.status === 'completed'
  );

  return (
    <div className="page pb-nav fade-in">
      <div className="header">
        <h1 style={{ fontSize: 18, fontWeight: 800 }}>Results</h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Your completed contest results</p>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="shimmer" style={{ height: 90, borderRadius: 12 }} />)
        ) : completedTickets.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <Trophy size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No completed contests yet</p>
          </div>
        ) : (
          completedTickets.map((ticket) => (
            <button key={ticket._id} style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
              onClick={() => navigate(`/tickets/${ticket._id}`)}>
              <div className={`card card-hover ${ticket.isWinner ? 'glow-gold' : ''}`} style={{
                padding: 14,
                borderColor: ticket.isWinner ? 'rgba(251,191,36,0.3)' : 'var(--border)',
              }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: 700 }} className="truncate">{ticket.contestId?.title}</p>
                  {ticket.isWinner
                    ? <span className="badge badge-gold">🏆 Won ₹{ticket.prizeWon}</span>
                    : <span className="badge badge-red">No Win</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ticket.ticketNumber}</span>
                  <span style={{ fontSize: 11, color: 'var(--accent-orange)', fontWeight: 700 }}>Rank #{ticket.rank || '—'}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ticket.score} pts</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {ticket.completedAt ? format(new Date(ticket.completedAt), 'dd MMM') : ''}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
