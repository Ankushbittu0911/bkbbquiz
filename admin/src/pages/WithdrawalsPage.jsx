import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function WithdrawalsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('pending');
  const [modal, setModal] = useState(null);
  const [action, setAction] = useState('');
  const [utr, setUtr] = useState('');
  const [note, setNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-withdrawals', status],
    queryFn: () => api.get('/admin/withdrawals', { params: { status } }).then(r => r.data),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, act, utr, note }) => api.put(`/admin/withdrawals/${id}/${act}`, { utr, note, reason: note }),
    onSuccess: (_, { act }) => { toast.success(`Withdrawal ${act}d`); qc.invalidateQueries(['admin-withdrawals']); setModal(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const withdrawals = data?.withdrawals || [];

  return (
    <div style={{ padding: 24 }} className="fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>Withdrawals</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Process user withdrawal requests</p>
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
            <thead><tr><th>User</th><th>Amount</th><th>UPI ID</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6}><div className="shimmer" style={{ height: 14, borderRadius: 4 }} /></td></tr>)
              ) : withdrawals.map((w) => (
                <tr key={w._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{w.userId?.name || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{w.name}</div>
                  </td>
                  <td style={{ fontWeight: 900, color: 'var(--accent-red)', fontSize: 15 }}>₹{w.amount}</td>
                  <td style={{ fontSize: 12, color: 'var(--accent-cyan)', fontWeight: 600 }}>{w.upiId}</td>
                  <td><span className={`badge ${w.status === 'approved' ? 'badge-green' : w.status === 'rejected' ? 'badge-red' : 'badge-orange'}`}>{w.status}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{format(new Date(w.createdAt), 'dd MMM HH:mm')}</td>
                  <td>
                    {w.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => { setModal(w); setAction('approve'); setUtr(''); setNote(''); }} className="btn-green" style={{ padding: '5px 9px' }}><CheckCircle size={13} /> Approve</button>
                        <button onClick={() => { setModal(w); setAction('reject'); setUtr(''); setNote(''); }} className="btn-danger" style={{ padding: '5px 9px' }}><XCircle size={13} /> Reject</button>
                      </div>
                    )}
                    {w.transactionReference && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>UTR: {w.transactionReference}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{action === 'approve' ? '✅ Approve Withdrawal' : '❌ Reject Withdrawal'}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              ₹{modal.amount} to <strong>{modal.upiId}</strong> ({modal.name})
            </p>
            {action === 'approve' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>UTR / Transaction Reference</label>
                <input type="text" className="input-field" placeholder="Enter UTR number..." value={utr} onChange={(e) => setUtr(e.target.value)} />
              </div>
            )}
            <textarea className="input-field" style={{ marginBottom: 12 }} placeholder={action === 'approve' ? 'Admin note (optional)...' : 'Reason for rejection...'} value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            <div className="flex gap-3">
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
              <button className={action === 'approve' ? 'btn-green' : 'btn-danger'} style={{ flex: 2, justifyContent: 'center' }} disabled={actionMutation.isPending}
                onClick={() => actionMutation.mutate({ id: modal._id, act: action, utr, note })}>
                {actionMutation.isPending ? <span className="spinner" /> : action === 'approve' ? '✅ Confirm Approve' : '❌ Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
