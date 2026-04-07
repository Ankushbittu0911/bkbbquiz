import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAdminStore from './store/adminStore';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContestsPage from './pages/ContestsPage';
import QuestionsPage from './pages/QuestionsPage';
import WinnersPage from './pages/WinnersPage';
import UsersPage from './pages/UsersPage';
import DepositsPage from './pages/DepositsPage';
import WithdrawalsPage from './pages/WithdrawalsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';

const ProtectedRoute = ({ children }) => {
  const { token, user } = useAdminStore();
  if (!token) return <Navigate to="/login" replace />;
  if (!user?.isAdmin) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/contests" element={<ContestsPage />} />
                <Route path="/questions" element={<QuestionsPage />} />
                <Route path="/winners/:contestId?" element={<WinnersPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/deposits" element={<DepositsPage />} />
                <Route path="/withdrawals" element={<WithdrawalsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
