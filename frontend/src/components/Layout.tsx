import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isDemoMode } from '../api';
import GlobalSearch from './GlobalSearch';
import { ThemeToggle } from './ThemeProvider';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [showDemoBanner, setShowDemoBanner] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  useEffect(() => {
    // Check demo mode after a short delay to allow API calls to determine mode
    const timer = setTimeout(() => {
      setShowDemoBanner(isDemoMode());
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Global keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setShowGlobalSearch(true);
      }
      if (event.key === 'Escape') {
        setShowGlobalSearch(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      path: '/patients',
      label: 'Patients',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      path: '/batches',
      label: 'Batches',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      path: '/messages',
      label: 'Messages',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="18" y1="20" x2="18" y2="4" />
          <line x1="6" y1="20" x2="6" y2="16" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0d12' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '240px',
          backgroundColor: '#141921',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🏥</span>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#00d4a8',
                letterSpacing: '-0.5px',
              }}
            >
              MedRetain
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '20px 0' }}>
          {/* Quick Search Button */}
          <div style={{ padding: '0 20px 20px' }}>
            <button
              onClick={() => setShowGlobalSearch(true)}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'rgba(76, 201, 240, 0.1)',
                border: '1px solid rgba(76, 201, 240, 0.3)',
                borderRadius: '8px',
                color: '#4cc9f0',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(76, 201, 240, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(76, 201, 240, 0.1)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔍 Quick Search
              </div>
              <kbd style={{
                padding: '2px 6px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'monospace'
              }}>
                ⌘K
              </kbd>
            </button>
          </div>

          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  color: isActive ? '#00d4a8' : '#9ca3af',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? 'rgba(0, 212, 168, 0.1)' : 'transparent',
                  borderLeft: isActive ? '3px solid #00d4a8' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#9ca3af';
                  }
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div style={{ padding: '20px 20px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <ThemeToggle />
        </div>

        {/* Version Tag */}
        <div
          style={{
            padding: '20px',
            fontSize: '12px',
            color: '#6b7280',
          }}
        >
          MVP v1.0
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '240px', flex: 1, padding: '32px', minHeight: '100vh' }}>
        {showDemoBanner && (
          <div
            style={{
              backgroundColor: 'rgba(76, 201, 240, 0.1)',
              border: '1px solid rgba(76, 201, 240, 0.3)',
              borderRadius: '8px',
              padding: '12px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '20px' }}>🎮</span>
            <div>
              <div style={{ color: '#4cc9f0', fontWeight: 600, fontSize: '14px' }}>Demo Mode Active</div>
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                Viewing sample data. Connect backend API for live data.
              </div>
            </div>
          </div>
        )}
        {children}
      </div>

      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
      />
    </div>
  );
};

export default Layout;
