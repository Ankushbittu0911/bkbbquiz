import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const NOTIFICATION_TYPES = ['general', 'contest', 'wallet', 'winner', 'system'];

export default function NotificationsPage() {
  const [form, setForm] = useState({ title: '', message: '', type: 'general', icon: '📢', userId: '' });

  const sendMutation = useMutation({
    mutationFn: (data) => api.post('/admin/notifications', data),
    onSuccess: () => { toast.success('Notification sent!'); setForm({ title: '', message: '', type: 'general', icon: '📢', userId: '' }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <div style={{ padding: 24 }} className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>Notifications</h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Send push notifications to users</p>
      </div>

      <div style={{ maxWidth: 600 }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>📤 Send Notification</h2>
          <form onSubmit={(e) => { e.preventDefault(); sendMutation.mutate(form); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Title *</label>
              <input type="text" className="input-field" placeholder="Notification title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Message *</label>
              <textarea className="input-field" placeholder="Notification message..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Type</label>
                <select className="select-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {NOTIFICATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Icon</label>
                <input type="text" className="input-field" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>User ID (blank=all)</label>
                <input type="text" className="input-field" placeholder="Specific user ID" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} />
              </div>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
              <p style={{ fontSize: 11, color: 'var(--accent-cyan)', fontWeight: 600 }}>
                {form.userId ? '📩 Sending to specific user' : '📢 Broadcasting to ALL users'}
              </p>
            </div>
            <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }} disabled={sendMutation.isPending}>
              {sendMutation.isPending ? <span className="spinner" /> : <><Send size={15} /> Send Now</>}
            </button>
          </form>
        </div>

        {/* Preview */}
        {(form.title || form.message) && (
          <div className="card">
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Preview</p>
            <div style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 10, background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)' }}>
              <div style={{ fontSize: 24 }}>{form.icon}</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700 }}>{form.title || 'Title...'}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{form.message || 'Message...'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
