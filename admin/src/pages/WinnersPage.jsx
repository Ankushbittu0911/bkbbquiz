import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Shuffle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function WinnersPage() {
  const qc = useQueryClient();
  const [selectedContest, setSelectedContest] = useState('');

  const { data: contestsData } = useQuery({
    queryKey: ['admin-contests-closed'],
    queryFn: () => api.get('/admin/contests', { params: { status: 'closed' } }).then(r => r.data),
  });

  const { data: winnersData, isLoading } = useQuery({
    queryKey: ['admin-winners', selectedContest],
    queryFn: () => selectedContest ? api.get(`/admin/winners/${selectedContest}`).then(r => r.data) : Promise.resolve(null),
    enabled: !!selectedContest,
  });

  const generateMutation = useMutation({
    mutationFn: () => api.post(`/admin/winners/${selectedContest}/generate`),
    onSuccess: ({ data }) => {
      toast.success(`${data.winners?.length || 0} winners declared!`);
      qc.invalidateQueries(['admin-winners', selectedContest]);
      qc.invalidateQueries(['admin-contests-closed']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const closedContests = contestsData?.contests || [];
  const contest = winnersData?.contest;
  const winners = winnersData?.winners || [];
  const totalTickets = winnersData?.totalTickets || 0;

  return (
    <div style={{ padding: 24 }} className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>Winner Declaration</h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Random ticket-based winner draw</p>
      </div>

      {/* Contest selector */}
      <div className="card" style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
          Select Closed Contest
        </label>
        <select className="select-field" value={selectedContest} onChange={(e) => setSelectedContest(e.target.value)}>
          <option value="">-- Choose a contest --</option>
          {closedContests.map(c => (
            <option key={c._id} value={c._id}>
              {c.title} ({c.joinedCount} tickets, {c.winnersCount} winners)
              {c.winnersGenerated ? ' ✓ Winners declared' : ''}
            </option>
          ))}
        </select>
        {closedContests.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>No closed contests. Close a contest first.</p>
        )}
      </div>

      {/* Contest info + generate button */}
      {selectedContest && contest && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{contest.title}</h2>
              <div className="flex gap-4">
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Prize Pool: </span>
                  <span style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>₹{contest.prizePool?.toLocaleString()}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Tickets: </span>
                  <span style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>{totalTickets}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Winners: </span>
                  <span style={{ fontWeight: 800, color: 'var(--accent-orange)' }}>{contest.winnersCount}</span>
                </div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                ⚠️ Winners are selected randomly from the ticket pool. Score, time, and accuracy are NOT considered.
              </p>
            </div>
            {!contest.winnersGenerated ? (
              <button
                className="btn-primary"
                onClick={() => { if (confirm(`Generate ${contest.winnersCount} random winners from ${totalTickets} tickets?`)) generateMutation.mutate(); }}
                disabled={generateMutation.isPending || totalTickets === 0}
              >
                {generateMutation.isPending ? <span className="spinner" /> : <><Shuffle size={15} /> Draw Winners</>}
              </button>
            ) : (
              <div className="flex items-center gap-2" style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: 13 }}>
                <CheckCircle size={16} /> Winners Declared
              </div>
            )}
          </div>
        </div>
      )}

      {/* Winners table */}
      {winners.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Winners List ({winners.length})</h3>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Rank</th><th>Ticket</th><th>User</th><th>Prize</th><th>Group</th><th>Status</th></tr></thead>
              <tbody>
                {winners.map((w) => (
                  <tr key={w._id}>
                    <td>
                      <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, background: w.rank <= 3 ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)', color: w.rank <= 3 ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>
                        #{w.rank}
                      </div>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--accent-cyan)', fontWeight: 700 }}>{w.ticketId?.ticketNumber || '—'}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{w.userId?.name || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{w.userId?.username}</div>
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>₹{w.prizeAmount}</td>
                    <td><span className="badge badge-purple">{w.prizeGroupLabel || '—'}</span></td>
                    <td><span className={`badge ${w.prizeDistributed ? 'badge-green' : 'badge-orange'}`}>{w.prizeDistributed ? '✓ Paid' : 'Pending'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedContest && winners.length === 0 && !isLoading && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <Trophy size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)' }}>No winners declared yet. Click "Draw Winners" to start.</p>
        </div>
      )}
    </div>
  );
}
