import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Calendar, AlertTriangle, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

// ── Confirm Modal ──────────────────────────────────────────────────────────────
function ConfirmModal({ open, onClose, onConfirm, loading }) {
  const [typed, setTyped] = useState('');
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div className="card" style={{ maxWidth: 440, width: '100%', border: '1px solid rgba(239,68,68,0.4)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} style={{ color: '#ef4444' }} />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#ef4444' }}>Hard Reset — Irreversible!</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>This will permanently delete all platform data</p>
          </div>
        </div>

        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          The following will be <strong style={{ color: '#ef4444' }}>permanently deleted</strong>:<br />
          • All Deposits &amp; Withdrawals<br />
          • All Contests, Tickets &amp; Winners<br />
          • All Transactions<br />
          • All user wallet balances will be set to ₹0
        </div>

        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
          Type <code style={{ color: '#ef4444' }}>RESET</code> to confirm:
        </label>
        <input
          className="input-field"
          placeholder="RESET"
          value={typed}
          onChange={e => setTyped(e.target.value)}
          style={{ marginBottom: 14 }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
            Cancel
          </button>
          <button
            onClick={() => { setTyped(''); onConfirm(); }}
            disabled={typed !== 'RESET' || loading}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
              background: typed === 'RESET' ? '#ef4444' : 'rgba(239,68,68,0.2)',
              color: typed === 'RESET' ? '#fff' : 'rgba(239,68,68,0.4)',
              cursor: typed === 'RESET' ? 'pointer' : 'not-allowed',
              fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <><Trash2 size={14} /> Reset Everything</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api.get('/admin/settings').then(r => r.data),
  });

  const [form, setForm] = useState({
    merchantUpiId: '', merchantName: '', platformFeePercent: 30, appName: '',
    supportEmail: '', supportPhone: '', referralBonus: 50,
    minDeposit: 10, maxDeposit: 50000, minWithdrawal: 100, maxWithdrawal: 10000,
    maxContestEntriesPerUser: 20, maintenanceMode: false, statsFromDate: '',
  });
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    if (data?.settings) {
      const s = data.settings;
      setForm(f => ({
        ...f, ...s,
        statsFromDate: s.statsFromDate ? new Date(s.statsFromDate).toISOString().slice(0, 10) : '',
      }));
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (payload) => api.put('/admin/settings', payload),
    onSuccess: () => { toast.success('Settings saved!'); qc.invalidateQueries(['admin-settings']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const resetMutation = useMutation({
    mutationFn: () => api.post('/admin/settings/reset-stats'),
    onSuccess: () => {
      toast.success('Platform data reset successfully!');
      setShowReset(false);
      qc.invalidateQueries(['admin-dashboard']);
      qc.invalidateQueries(['admin-settings']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Reset failed'),
  });

  const handleSave = (e) => {
    e.preventDefault();
    const payload = { ...form };
    // Convert empty string to null so Mongo stores null (no filter)
    if (!payload.statsFromDate) payload.statsFromDate = null;
    saveMutation.mutate(payload);
  };

  const clearDateFilter = () => {
    setForm(f => ({ ...f, statsFromDate: '' }));
    saveMutation.mutate({ statsFromDate: null });
  };

  const fields = [
    { group: 'Payment', items: [
      { key: 'merchantUpiId', label: 'Merchant UPI ID', type: 'text', placeholder: 'yourname@upi' },
      { key: 'merchantName', label: 'Merchant Name', type: 'text', placeholder: 'Your App Name' },
      { key: 'platformFeePercent', label: 'Platform Fee (%)', type: 'number', min: 0, max: 100 },
    ]},
    { group: 'App', items: [
      { key: 'appName', label: 'App Name', type: 'text' },
      { key: 'supportEmail', label: 'Support Email', type: 'email' },
      { key: 'supportPhone', label: 'Support Phone', type: 'text' },
      { key: 'referralBonus', label: 'Referral Bonus (₹)', type: 'number', min: 0 },
    ]},
    { group: 'Limits', items: [
      { key: 'minDeposit', label: 'Min Deposit (₹)', type: 'number', min: 1 },
      { key: 'maxDeposit', label: 'Max Deposit (₹)', type: 'number', min: 1 },
      { key: 'minWithdrawal', label: 'Min Withdrawal (₹)', type: 'number', min: 1 },
      { key: 'maxWithdrawal', label: 'Max Withdrawal (₹)', type: 'number', min: 1 },
      { key: 'maxContestEntriesPerUser', label: 'Max Entries Per Contest', type: 'number', min: 1 },
    ]},
  ];

  return (
    <div style={{ padding: 24 }} className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>Settings</h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Configure platform settings</p>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gap: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="shimmer" style={{ height: 120, borderRadius: 14 }} />)}
        </div>
      ) : (
        <form onSubmit={handleSave} style={{ maxWidth: 700 }}>

          {/* Maintenance mode toggle */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: 14, fontWeight: 700 }}>Maintenance Mode</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Block all user access to the app</p>
              </div>
              <button type="button" onClick={() => setForm({ ...form, maintenanceMode: !form.maintenanceMode })} style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative',
                background: form.maintenanceMode ? 'var(--accent-red)' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.2s',
              }}>
                <div style={{ width: 18, height: 18, borderRadius: 9, background: '#fff', position: 'absolute', top: 3, left: form.maintenanceMode ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
              </button>
            </div>
          </div>

          {/* Field groups */}
          {fields.map(({ group, items }) => (
            <div key={group} className="card" style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-orange)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{group}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {items.map(({ key, label, type, placeholder, min, max }) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{label}</label>
                    <input
                      type={type}
                      className="input-field"
                      placeholder={placeholder || ''}
                      value={form[key] ?? ''}
                      onChange={(e) => setForm({ ...form, [key]: type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                      min={min}
                      max={max}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* ── Stats Date Filter ── */}
          <div className="card" style={{ marginBottom: 14, border: '1px solid rgba(6,182,212,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Calendar size={16} style={{ color: 'var(--accent-cyan)' }} />
              <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Dashboard Stats From Date
              </h3>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
              Dashboard totals (deposits, revenue, prizes) will only include data <strong>on or after</strong> this date.
              Leave blank to show all-time stats.
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Start Date (optional)
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={form.statsFromDate || ''}
                  onChange={e => setForm({ ...form, statsFromDate: e.target.value })}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              {form.statsFromDate && (
                <button
                  type="button"
                  onClick={clearDateFilter}
                  style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}
                >
                  Clear Filter
                </button>
              )}
            </div>
            {form.statsFromDate && (
              <p style={{ fontSize: 11, color: 'var(--accent-cyan)', marginTop: 8 }}>
                📊 Showing stats from {new Date(form.statsFromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} onwards
              </p>
            )}
          </div>

          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '12px 32px', marginBottom: 32 }} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <span className="spinner" /> : <><Save size={15} /> Save All Settings</>}
          </button>
        </form>
      )}

      {/* ── Danger Zone ── */}
      <div style={{ maxWidth: 700, border: '1px solid rgba(239,68,68,0.35)', borderRadius: 14, padding: 20, background: 'rgba(239,68,68,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <AlertTriangle size={18} style={{ color: '#ef4444' }} />
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>Danger Zone</h3>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Hard Reset</strong> — permanently deletes all deposits, withdrawals, contests, tickets, winners and transactions, and zeros all user wallets.
          This <strong style={{ color: '#ef4444' }}>cannot be undone</strong>. Use only when starting fresh.
        </p>
        <button
          type="button"
          onClick={() => setShowReset(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10,
            border: '1px solid rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.1)',
            color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: 13,
          }}
        >
          <Trash2 size={15} /> Reset All Platform Stats
        </button>
      </div>

      <ConfirmModal
        open={showReset}
        onClose={() => setShowReset(false)}
        onConfirm={() => resetMutation.mutate()}
        loading={resetMutation.isPending}
      />
    </div>
  );
}
