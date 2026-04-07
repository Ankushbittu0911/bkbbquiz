import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Play, Pause, XCircle, RotateCcw, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../lib/api';

const STATUS_BADGE = { draft: 'badge-purple', active: 'badge-green', stopped: 'badge-orange', closed: 'badge-red', completed: 'badge-cyan' };
const CATEGORIES = ['Cricket', 'Football', 'Basketball', 'Tennis', 'GK', 'Bollywood', 'Science', 'History', 'Technology', 'Geography'];

const emptyForm = { title: '', description: '', category: 'Cricket', entryFee: '', totalSpots: '', startTime: '', endTime: '', quizDuration: 300, winnersCount: '', firstPrize: '' };

export default function ContestsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editContest, setEditContest] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-contests', statusFilter],
    queryFn: () => api.get('/admin/contests', { params: statusFilter ? { status: statusFilter } : {} }).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => editContest ? api.put(`/admin/contests/${editContest._id}`, data) : api.post('/admin/contests', data),
    onSuccess: () => { toast.success(editContest ? 'Contest updated' : 'Contest created'); qc.invalidateQueries(['admin-contests']); setShowModal(false); setForm(emptyForm); setEditContest(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }) => api.post(`/admin/contests/${id}/${action}`),
    onSuccess: (_, { action }) => { toast.success(`Contest ${action}d`); qc.invalidateQueries(['admin-contests']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/contests/${id}`),
    onSuccess: () => { toast.success('Contest deleted'); qc.invalidateQueries(['admin-contests']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const openEdit = (contest) => {
    setEditContest(contest);
    setForm({
      title: contest.title, description: contest.description, category: contest.category,
      entryFee: contest.entryFee, totalSpots: contest.totalSpots,
      startTime: contest.startTime ? contest.startTime.slice(0, 16) : '',
      endTime: contest.endTime ? contest.endTime.slice(0, 16) : '',
      quizDuration: contest.quizDuration, winnersCount: contest.winnersCount, firstPrize: contest.firstPrize,
    });
    setShowModal(true);
  };

  const contests = data?.contests || [];

  return (
    <div style={{ padding: 24 }} className="fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>Contests</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{data?.total || 0} total contests</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditContest(null); setForm(emptyForm); setShowModal(true); }}>
          <Plus size={15} /> Create Contest
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2" style={{ marginBottom: 16 }}>
        {['', 'active', 'draft', 'closed', 'completed', 'stopped'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: statusFilter === s ? 'linear-gradient(135deg, var(--accent-orange), var(--accent-gold))' : 'rgba(255,255,255,0.06)',
            color: statusFilter === s ? '#fff' : 'var(--text-muted)',
          }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead><tr><th>Title</th><th>Category</th><th>Entry Fee</th><th>Spots</th><th>Joined</th><th>Status</th><th>Start Time</th><th>Actions</th></tr></thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={8}><div className="shimmer" style={{ height: 16, borderRadius: 4 }} /></td></tr>
                ))
              ) : contests.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 600, maxWidth: 180 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div></td>
                  <td>{c.category}</td>
                  <td style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>₹{c.entryFee}</td>
                  <td>{c.totalSpots}</td>
                  <td style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{c.joinedCount}</td>
                  <td><span className={`badge ${STATUS_BADGE[c.status] || 'badge-orange'}`}>{c.status}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.startTime ? format(new Date(c.startTime), 'dd MMM HH:mm') : '—'}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="btn-secondary" style={{ padding: '5px 9px' }} title="Edit"><Edit size={13} /></button>
                      {c.status === 'draft' && <button onClick={() => actionMutation.mutate({ id: c._id, action: 'activate' })} className="btn-green" style={{ padding: '5px 9px' }} title="Activate"><Play size={13} /></button>}
                      {c.status === 'active' && <button onClick={() => actionMutation.mutate({ id: c._id, action: 'stop' })} className="btn-secondary" style={{ padding: '5px 9px' }} title="Stop"><Pause size={13} /></button>}
                      {['active', 'stopped'].includes(c.status) && <button onClick={() => actionMutation.mutate({ id: c._id, action: 'close' })} className="btn-danger" style={{ padding: '5px 9px' }} title="Close"><XCircle size={13} /></button>}
                      {c.joinedCount === 0 && <button onClick={() => { if (confirm('Delete contest?')) deleteMutation.mutate(c._id); }} className="btn-danger" style={{ padding: '5px 9px' }} title="Delete"><Trash2 size={13} /></button>}
                      <button onClick={() => { if (confirm('Reset contest? This deletes all tickets and winners!')) actionMutation.mutate({ id: c._id, action: 'reset' }); }} className="btn-secondary" style={{ padding: '5px 9px' }} title="Reset"><RotateCcw size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>{editContest ? 'Edit Contest' : 'Create Contest'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Title *</label>
                  <input className="input-field" placeholder="Contest title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Category *</label>
                  <select className="select-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Entry Fee (₹) *</label>
                  <input type="number" className="input-field" placeholder="e.g. 10" value={form.entryFee} onChange={(e) => setForm({ ...form, entryFee: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Total Spots *</label>
                  <input type="number" className="input-field" placeholder="e.g. 1000" value={form.totalSpots} onChange={(e) => setForm({ ...form, totalSpots: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Winners Count *</label>
                  <input type="number" className="input-field" placeholder="e.g. 10" value={form.winnersCount} onChange={(e) => setForm({ ...form, winnersCount: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>1st Prize (₹)</label>
                  <input type="number" className="input-field" placeholder="Display 1st prize" value={form.firstPrize} onChange={(e) => setForm({ ...form, firstPrize: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Start Time *</label>
                  <input type="datetime-local" className="input-field" style={{ colorScheme: 'dark' }} value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>End Time *</label>
                  <input type="datetime-local" className="input-field" style={{ colorScheme: 'dark' }} value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Quiz Duration (secs)</label>
                  <input type="number" className="input-field" value={form.quizDuration} onChange={(e) => setForm({ ...form, quizDuration: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Description</label>
                  <textarea className="input-field" placeholder="Contest description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
                </div>
              </div>
              <div className="flex gap-3" style={{ marginTop: 8 }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={createMutation.isPending}>
                  {createMutation.isPending ? <span className="spinner" /> : editContest ? 'Save Changes' : 'Create Contest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
