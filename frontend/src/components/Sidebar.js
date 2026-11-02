import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navSections = [
  {
    title: 'MAIN MENU',
    items: [
      { icon: 'bi-grid-1x2-fill', label: 'Dashboard', path: '/' },
      { icon: 'bi-people-fill', label: 'Students', path: '/students' },
      { icon: 'bi-calendar-check-fill', label: 'Attendance', path: '/attendance' },
      { icon: 'bi-bar-chart-fill', label: 'Reports', path: '/reports' },
      { icon: 'bi-bell-fill', label: 'Notifications', path: '/notifications' },
      { icon: 'bi-gear-fill', label: 'Settings', path: '/settings' },
    ]
  },
  {
    title: 'ACADEMICS',
    items: [
      { icon: 'bi-journal-check', label: 'Marks & Grades', path: '/marks' },
      { icon: 'bi-person-lines-fill', label: 'Student Register', path: '/student-register' },
    ]
  }
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <i className="bi bi-mortarboard-fill"></i>
        </div>
        <div className="brand-text">
          <div className="brand-name">ATTENDA</div>
          <div className="brand-sub">Premium School Suite</div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="sidebar-nav">
        {navSections.map((sec) => (
          <div key={sec.title} style={{ marginBottom: 12 }}>
            <div className="nav-section-title">{sec.title}</div>
            {sec.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleNav(item.path)}
                  title={item.label}
                >
                  <i className={`bi ${item.icon}`}></i>
                  <span>{item.label}</span>
                  {item.path === '/notifications' && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: '#D4AF37',
                        boxShadow: '0 0 8px #D4AF37',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer Profile */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.fullName?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.fullName || 'Administrator'}</div>
            <div className="user-role">
              <i className="bi bi-shield-fill-check me-1" style={{ color: '#D4AF37' }}></i>
              {user?.role || 'STAFF'}
            </div>
          </div>
        </div>
        <button className="btn-logout" onClick={logout} title="Sign Out">
          <i className="bi bi-box-arrow-right"></i> Sign Out
        </button>
      </div>
    </aside>
  );
}
