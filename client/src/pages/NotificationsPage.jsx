import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
  });

  const readMutation = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries(['notifications']),
  });

  const readAllMutation = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries(['notifications']),
  });

  const notifications = data?.notifications || [];

  return (
    <div className="page pb-nav fade-in">
      <div className="header">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800 }}>Notifications</h1>
            {data?.unreadCount > 0 && <p style={{ fontSize: 11, color: 'var(--accent-orange)', fontWeight: 600 }}>{data.unreadCount} unread</p>}
          </div>
          {data?.unreadCount > 0 && (
            <button onClick={() => readAllMutation.mutate()} style={{ fontSize: 11, color: 'var(--accent-cyan)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="shimmer" style={{ height: 70, borderRadius: 12 }} />)
        ) : notifications.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <Bell size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n._id}
              onClick={() => !n.isRead && readMutation.mutate(n._id)}
              style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: n.isRead ? 'default' : 'pointer', textAlign: 'left' }}
            >
              <div style={{
                padding: 14, borderRadius: 12,
                background: n.isRead ? 'var(--bg-card)' : 'rgba(249,115,22,0.06)',
                border: `1px solid ${n.isRead ? 'var(--border)' : 'rgba(249,115,22,0.2)'}`,
                display: 'flex', gap: 12,
              }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{n.icon || '🔔'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-start justify-between gap-2">
                    <p style={{ fontSize: 13, fontWeight: 700, color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                      {n.title}
                    </p>
                    {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-orange)', flexShrink: 0, marginTop: 4 }} />}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.4 }}>{n.message}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                    {n.createdAt ? format(new Date(n.createdAt), 'dd MMM, hh:mm a') : ''}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
