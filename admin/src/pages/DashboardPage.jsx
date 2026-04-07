import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Trophy, Wallet, ArrowDownLeft, ArrowUpRight, Ticket, TrendingUp } from 'lucide-react';
import api from '../lib/api';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 46, height: 46, borderRadius: 12, background: `${color}1a`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} style={{ color }} />
    </div>
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>}
    </div>
  </div>
);

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data),
    refetchInterval: 30000,
  });

  const stats = data?.stats || {};
  const userGrowth = data?.userGrowth || [];
  const contestActivity = data?.contestActivity || [];
  const recentUsers = data?.recentUsers || [];

  const STATS = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers?.toLocaleString() || '0', color: 'var(--accent-cyan)' },
    { icon: Trophy, label: 'Active Contests', value: stats.activeContests || '0', color: 'var(--accent-orange)', sub: `${stats.totalContests || 0} total` },
    { icon: Ticket, label: 'Total Tickets', value: stats.totalTickets?.toLocaleString() || '0', color: 'var(--accent-purple)' },
    { icon: Wallet, label: 'Total Deposits', value: `₹${(stats.totalDeposits || 0).toLocaleString()}`, color: 'var(--accent-green)' },
    { icon: TrendingUp, label: 'Platform Revenue', value: `₹${(stats.platformRevenue || 0).toLocaleString()}`, color: 'var(--accent-gold)' },
    { icon: ArrowUpRight, label: 'Prizes Distributed', value: `₹${(stats.totalPrizesDistributed || 0).toLocaleString()}`, color: 'var(--accent-red)' },
    { icon: ArrowDownLeft, label: 'Pending Deposits', value: stats.pendingDeposits || '0', color: 'var(--accent-orange)', sub: 'Awaiting approval' },
    { icon: ArrowUpRight, label: 'Pending Withdrawals', value: stats.pendingWithdrawals || '0', color: 'var(--accent-red)', sub: 'Awaiting approval' },
  ];

  const tooltipStyle = { background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)' };

  return (
    <div style={{ padding: 24 }} className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Overview of BKBBQUIZ platform</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="shimmer" style={{ height: 90, borderRadius: 14 }} />)
          : STATS.map((s) => <StatCard key={s.label} {...s} />)
        }
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>User Growth (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="count" stroke="#06b6d4" fill="url(#userGrad)" strokeWidth={2} name="New Users" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Ticket Activity (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={contestActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="url(#barGrad)" radius={[4, 4, 0, 0]} name="Tickets">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent users */}
      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Recent Registrations</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Username</th><th>Mobile</th><th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>@{u.username}</td>
                  <td>{u.mobile}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
