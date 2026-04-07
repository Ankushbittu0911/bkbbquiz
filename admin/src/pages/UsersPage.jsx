import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Ban, CheckCircle, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [walletModal, setWalletModal] = useState(null);
  const [walletForm, setWalletForm] = useState({ amount: '', type: 'credit', balanceType: 'deposit', description: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => api.get('/admin/users', { params: search ? { search } : {} }).then(r => r.data),
    debounce: 500,
  });

  const banMutation = useMutation({
    mutationFn: ({ id, ban }) => api.put(`/admin/users/${id}/${ban ? 'ban' : 'unban'}`),
    onSuccess: (_, { ban }) => { toast.success(`User ${ban ? 'banned' : 'unbanned'}`); qc.invalidateQueries(['admin-users']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const walletMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/admin/users/${id}/wallet`, data),
    onSuccess: () => { toast.success('Wallet adjusted'); qc.invalidateQueries(['admin-users']); setWalletModal(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const users = data?.users || [];

  return (
    <div style={{ padding: 24 }} className="fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>Users</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{data?.total || 0} registered users</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" style={{ paddingLeft: 36, width: 250 }} placeholder="Search name, mobile, email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Username</th><th>Mobile</th><th>Balance</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <tr key={i}><td colSpan={7}><div className="shimmer" style={{ height: 14, borderRadius: 4 }} /></td></tr>)
              ) : users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>@{u.username}</td>
                  <td>{u.mobile}</td>
                  <td>
                    <div style={{ fontSize: 12, color: 'var(--accent-gold)', fontWeight: 700 }}>₹{((u.wallet?.depositBalance || 0) + (u.wallet?.winningsBalance || 0)).toFixed(0)}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>D:{(u.wallet?.depositBalance || 0).toFixed(0)} W:{(u.wallet?.winningsBalance || 0).toFixed(0)}</div>
                  </td>
                  <td><span className={`badge ${u.isBanned ? 'badge-red' : 'badge-green'}`}>{u.isBanned ? 'Banned' : 'Active'}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => banMutation.mutate({ id: u._id, ban: !u.isBanned })} className={u.isBanned ? 'btn-green' : 'btn-danger'} style={{ padding: '5px 9px' }}>
                        {u.isBanned ? <CheckCircle size={13} /> : <Ban size={13} />}
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </button>
                      <button onClick={() => { setWalletModal(u); setWalletForm({ amount: '', type: 'credit', balanceType: 'deposit', description: '' }); }} className="btn-secondary" style={{ padding: '5px 9px' }}>
                        <Wallet size={13} /> Wallet
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wallet modal */}
      {walletModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setWalletModal(null)}>
          <div className="modal">
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Adjust Wallet</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>{walletModal.name} (@{walletModal.username})</p>
            <form onSubmit={(e) => { e.preventDefault(); walletMutation.mutate({ id: walletModal._id, data: walletForm }); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Amount (₹)</label>
                  <input type="number" className="input-field" min={1} value={walletForm.amount} onChange={(e) => setWalletForm({ ...walletForm, amount: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Action</label>
                  <select className="select-field" value={walletForm.type} onChange={(e) => setWalletForm({ ...walletForm, type: e.target.value })}>
                    <option value="credit">Credit (+)</option>
                    <option value="debit">Debit (-)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Balance Type</label>
                  <select className="select-field" value={walletForm.balanceType} onChange={(e) => setWalletForm({ ...walletForm, balanceType: e.target.value })}>
                    <option value="deposit">Deposit Balance</option>
                    <option value="winnings">Winnings Balance</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Description</label>
                  <input type="text" className="input-field" placeholder="Reason..." value={walletForm.description} onChange={(e) => setWalletForm({ ...walletForm, description: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setWalletModal(null)}>Cancel</button>
                <button type="submit" className={`${walletForm.type === 'credit' ? 'btn-green' : 'btn-danger'}`} style={{ flex: 2, justifyContent: 'center' }} disabled={walletMutation.isPending}>
                  {walletMutation.isPending ? <span className="spinner" /> : `${walletForm.type === 'credit' ? '+ Credit' : '- Debit'} ₹${walletForm.amount || 0}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
