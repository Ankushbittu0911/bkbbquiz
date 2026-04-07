import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, User, Mail, Calendar, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', dob: user?.dob ? user.dob.slice(0, 10) : '' });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put('/auth/profile', data),
    onSuccess: ({ data }) => {
      updateUser(data.user);
      toast.success('Profile updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  return (
    <div className="page pb-nav fade-in">
      <div className="header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-primary)' }}>
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 800 }}>Edit Profile</h1>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
            background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, boxShadow: '0 8px 24px rgba(249,115,22,0.4)',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <p style={{ fontSize: 16, fontWeight: 800 }}>{user?.name}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{user?.username}</p>
          <div className="flex items-center justify-center gap-3" style={{ marginTop: 8 }}>
            <span className="badge badge-cyan">{user?.mobile}</span>
            <span className="badge badge-orange">#{user?.referralCode}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(form); }} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Full Name</label>
            <div className="relative">
              <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" className="input-field" style={{ paddingLeft: 38 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email</label>
            <div className="relative">
              <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" className="input-field" style={{ paddingLeft: 38 }} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Date of Birth</label>
            <div className="relative">
              <Calendar size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="date" className="input-field" style={{ paddingLeft: 38, colorScheme: 'dark' }} value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
