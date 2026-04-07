import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Ticket, Check, X, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';

const statusBadge = (ticket) => {
  if (!ticket.contestId || ticket.contestId.status !== 'completed') return <span className="badge badge-orange">Pending</span>;
  if (ticket.isWinner) return <span className="badge badge-green">🏆 Winner</span>;
  return <span className="badge badge-red">No Win</span>;
};

export default function TicketsPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => api.get('/tickets').then(r => r.data),
  });

  const tickets = data?.tickets || [];

  return (
    <div className="page pb-nav fade-in">
      <div className="header">
        <h1 style={{ fontSize: 18, fontWeight: 800 }}>My Tickets</h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>All your contest entries</p>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="shimmer" style={{ height: 100, borderRadius: 12 }} />)
        ) : tickets.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <Ticket size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No tickets yet</p>
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
              Play Now
            </button>
          </div>
        ) : (
          tickets.map((ticket) => (
            <button
              key={ticket._id}
              style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
              onClick={() => navigate(`/tickets/${ticket._id}`)}
            >
              <div className="card card-hover" style={{ padding: 14 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, truncate: true }} className="truncate">{ticket.contestId?.title || 'Contest'}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      {ticket.ticketNumber} · {ticket.contestId?.category}
                    </p>
                  </div>
                  {statusBadge(ticket)}
                </div>
                <div className="flex items-center gap-4">
                  {ticket.status === 'completed' ? (
                    <>
                      <div className="flex items-center gap-1">
                        <Check size={12} style={{ color: 'var(--accent-green)' }} />
                        <span style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>{ticket.correctAnswers}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <X size={12} style={{ color: 'var(--accent-red)' }} />
                        <span style={{ fontSize: 12, color: 'var(--accent-red)', fontWeight: 600 }}>{ticket.wrongAnswers}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--accent-orange)', fontWeight: 700 }}>{ticket.score} pts</div>
                      {ticket.isWinner && (
                        <div className="flex items-center gap-1">
                          <Trophy size={12} style={{ color: 'var(--accent-gold)' }} />
                          <span style={{ fontSize: 12, color: 'var(--accent-gold)', fontWeight: 700 }}>₹{ticket.prizeWon}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Quiz in progress...</span>
                  )}
                  <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
                    {ticket.createdAt ? format(new Date(ticket.createdAt), 'dd MMM') : ''}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
