import { NavLink, useLocation } from 'react-router-dom';
import { Home, Ticket, Trophy, Wallet, Menu } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/tickets', icon: Ticket, label: 'Tickets' },
  { path: '/results', icon: Trophy, label: 'Results' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/menu', icon: Menu, label: 'Menu' },
];

export default function BottomNav() {
  const location = useLocation();

  // Hide on quiz page
  if (location.pathname.includes('/quiz/')) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto"
      style={{
        background: 'rgba(10, 14, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <NavLink
              key={path}
              to={path}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200"
              style={{
                color: isActive ? 'var(--accent-orange)' : 'var(--text-muted)',
                minWidth: 56,
              }}
            >
              <div
                className="relative transition-all duration-200"
                style={{
                  padding: isActive ? '6px 12px' : '6px 8px',
                  borderRadius: 12,
                  background: isActive ? 'rgba(249,115,22,0.12)' : 'transparent',
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
