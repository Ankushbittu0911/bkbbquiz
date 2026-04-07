import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from './store/authStore';
import BottomNav from './components/BottomNav';
import api from './lib/api';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HomePage from './pages/HomePage';
import ContestDetailPage from './pages/ContestDetailPage';
import QuizPage from './pages/QuizPage';
import QuizResultPage from './pages/QuizResultPage';
import TicketsPage from './pages/TicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import ResultsPage from './pages/ResultsPage';
import WalletPage from './pages/WalletPage';
import DepositPage from './pages/DepositPage';
import WithdrawPage from './pages/WithdrawPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import MenuPage from './pages/MenuPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { token } = useAuthStore();
  return !token ? children : <Navigate to="/" replace />;
};

function MaintenanceScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24,
      background: 'var(--bg-primary)', textAlign: 'center',
    }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🔧</div>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Under Maintenance</h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 300, marginBottom: 28 }}>
        We're making improvements to BKBBQUIZ. We'll be back soon!
      </p>
      <div style={{
        padding: '12px 24px', borderRadius: 12,
        background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
      }}>
        <p style={{ fontSize: 12, color: 'var(--accent-orange)', fontWeight: 700 }}>🏆 BKBBQUIZ · Back Soon</p>
      </div>
    </div>
  );
}

export default function App() {
  const { token } = useAuthStore();

  const { data: publicSettings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => api.get('/settings/public').then(r => r.data),
    refetchInterval: 30000, // Re-check every 30s
    staleTime: 20000,
  });

  if (publicSettings?.settings?.maintenanceMode) {
    return (
      <div className="max-w-md mx-auto relative min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <MaintenanceScreen />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto relative min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <Routes>
          {/* Guest routes */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
          <Route path="/reset-password/:token" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/contest/:id" element={<ProtectedRoute><ContestDetailPage /></ProtectedRoute>} />
          <Route path="/quiz/:contestId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/quiz/:contestId/result" element={<ProtectedRoute><QuizResultPage /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
          <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/deposit" element={<ProtectedRoute><DepositPage /></ProtectedRoute>} />
          <Route path="/withdraw" element={<ProtectedRoute><WithdrawPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
          <Route path="/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />
          <Route path="/terms" element={<ProtectedRoute><TermsPage /></ProtectedRoute>} />
          <Route path="/privacy" element={<ProtectedRoute><PrivacyPage /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Bottom navigation only for authenticated users */}
        {token && <BottomNav />}
      </div>
    </BrowserRouter>
  );
}
