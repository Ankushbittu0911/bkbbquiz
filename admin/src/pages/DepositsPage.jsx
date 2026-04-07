import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function DepositsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('pending');
  const [viewModal, setViewModal] = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [noteAction, setNoteAction] = useState('');
  const [note, setNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-deposits', status],
    queryFn: () => api.get('/admin/deposits', { params: { status } }).then(r => r.data),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action, note }) => api.put(`/admin/deposits/${id}/${action}`, { note, reason: note }),
    onSuccess: (_, { action }) => { toast.success(`Deposit ${action}d`); qc.invalidateQueries(['admin-deposits']); setNoteModal(null); setNote(''); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deposits = data?.deposits || [];

  return (
    <div style={{ padding: 24 }} className="fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>Deposits</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pending: ₹{data?.pendingTotal?.toLocaleString() || '0'}</p>
        </div>
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', 'all'].map((s) => (
            <button key={s} onClick={() => setStatus(s)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: status === s ? 'linear-gradient(135deg, var(--accent-orange), var(--accent-gold))' : 'rgba(255,255,255,0.06)', color: status === s ? '#fff' : 'var(--text-muted)' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead><tr><th>User</th><th>Amount</th><th>Tx ID</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6}><div className="shimmer" style={{ height: 14, borderRadius: 4 }} /></td></tr>)
              ) : deposits.map((d) => (
                <tr key={d._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{d.userId?.name || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.userId?.mobile}</div>
                  </td>
                  <td style={{ fontWeight: 900, color: 'var(--accent-green)', fontSize: 15 }}>₹{d.amount}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.transactionId || '—'}</td>
                  <td><span className={`badge ${d.status === 'approved' ? 'badge-green' : d.status === 'rejected' ? 'badge-red' : 'badge-orange'}`}>{d.status}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{format(new Date(d.createdAt), 'dd MMM HH:mm')}</td>
                  <td>
                    <div className="flex gap-1">
                      {d.screenshotUrl && (
                        <button onClick={() => setViewModal(d)} className="btn-secondary" style={{ padding: '5px 9px' }}><Eye size={13} /></button>
                      )}
                      {d.status === 'pending' && (
                        <>
                          <button onClick={() => { setNoteModal(d); setNoteAction('approve'); setNote(''); }} className="btn-green" style={{ padding: '5px 9px' }}><CheckCircle size={13} /> Approve</button>
                          <button onClick={() => { setNoteModal(d); setNoteAction('reject'); setNote(''); }} className="btn-danger" style={{ padding: '5px 9px' }}><XCircle size={13} /> Reject</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screenshot modal */}
      {viewModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setViewModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Deposit Screenshot</h3>
            <img src={viewModal.screenshotUrl} alt="Deposit proof" style={{ width: '100%', borderRadius: 10, marginBottom: 12 }} />
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setViewModal(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Note/action modal */}
      {noteModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setNoteModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{noteAction === 'approve' ? '✅ Approve Deposit' : '❌ Reject Deposit'}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Amount: <strong style={{ color: 'var(--accent-gold)' }}>₹{noteModal.amount}</strong> from {noteModal.userId?.name}</p>
            <textarea className="input-field" placeholder={noteAction === 'approve' ? 'Admin note (optional)...' : 'Reason for rejection...'} value={note} onChange={(e) => setNote(e.target.value)} rows={2} style={{ marginBottom: 12 }} />
            <div className="flex gap-3">
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setNoteModal(null)}>Cancel</button>
              <button className={noteAction === 'approve' ? 'btn-green' : 'btn-danger'} style={{ flex: 2, justifyContent: 'center' }} disabled={actionMutation.isPending}
                onClick={() => actionMutation.mutate({ id: noteModal._id, action: noteAction, note })}>
                {actionMutation.isPending ? <span className="spinner" /> : noteAction === 'approve' ? '✅ Approve' : '❌ Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
