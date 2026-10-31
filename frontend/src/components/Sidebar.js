import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: 'bi-grid-1x2-fill',       label: 'Dashboard',        path: '/',                 section: 'MAIN' },
  { icon: 'bi-people-fill',          label: 'Students',         path: '/students',         section: 'MAIN' },
  { icon: 'bi-person-lines-fill',    label: 'Student Register', path: '/student-register', section: 'MAIN' },
  { icon: 'bi-calendar-check-fill',  label: 'Attendance',       path: '/attendance',       section: 'MAIN' },
  { icon: 'bi-bar-chart-fill',       label: 'Reports',          path: '/reports',          section: 'REPORTS' },
  { icon: 'bi-journal-text',         label: 'Marks',            path: '/marks',            section: 'REPORTS' },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const sections = [...new Set(navItems.map(i => i.section))];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon"><i className="bi bi-mortarboard-fill"></i></div>
        <div className="brand-text">
          <div className="brand-name">Attenda</div>
          <div className="brand-sub">School Management</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map(section => (
          <div key={section}>
            <div className="nav-section-title">{section}</div>
            {navItems.filter(i => i.section === section).map(item => (
              <button
                key={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNav(item.path)}
              >
                <i className={`bi ${item.icon}`}></i>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{user?.fullName?.[0] || 'U'}</div>
          <div className="user-info">
            <div className="user-name">{user?.fullName || 'User'}</div>
            <div className="user-role">{user?.role || 'TEACHER'}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={logout}>
          <i className="bi bi-box-arrow-right"></i> Sign Out
        </button>
      </div>
    </aside>
  );
}
