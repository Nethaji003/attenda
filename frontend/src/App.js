import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/StudentsPage';
import AttendancePage from './pages/AttendancePage';
import ReportsPage from './pages/ReportsPage';
import MarksPage from './pages/MarksPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import StudentRegisterPage from './pages/StudentRegisterPage';
import StudentDocumentsPage from './pages/StudentDocumentsPage';
import StudentDashboard from './pages/StudentDashboard';

function PrivateRoute({ children, roleRequired }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#080808', gap: 16 }}>
        <div className="spinner" style={{ width: 44, height: 44, borderTopColor: '#D4AF37' }}></div>
        <div style={{ color: '#D4AF37', fontWeight: 600, fontSize: 14 }}>Authenticating Session...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roleRequired && user.role !== roleRequired) {
    if (user.role === 'STUDENT') {
      return <Navigate to="/student/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // Prevent students from accessing staff layout
  if (!roleRequired && user.role === 'STUDENT') {
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
}

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitles = {
    '/': 'Dashboard Overview',
    '/students': 'Student Management',
    '/attendance': 'Daily Attendance Console',
    '/reports': 'Institutional Reports & Analytics',
    '/marks': 'Academic Marks & Grades',
    '/notifications': 'Notification Dispatch & Gateway',
    '/settings': 'System & Institutional Settings',
    '/student-register': 'Student Admission Register',
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="app-wrapper">
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <header className="top-navbar">
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation menu"
          >
            <i className={`bi bi-${sidebarOpen ? 'x-lg' : 'list'}`}></i>
          </button>
          <div className="page-title">
            <span style={{ color: '#FFFFFF' }}>{pageTitles[location.pathname] || 'Attenda Management'}</span>
            <div className="page-subtitle">Premium Black & Gold School Management System</div>
          </div>
          <span className="navbar-date">
            <i className="bi bi-calendar3" style={{ color: '#D4AF37' }}></i>
            {today}
          </span>
        </header>
        <main className="page-content page-enter">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/student-register" element={<StudentRegisterPage />} />
          <Route
            path="/student/dashboard"
            element={
              <PrivateRoute roleRequired="STUDENT">
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/students"
            element={
              <PrivateRoute>
                <AppLayout>
                  <StudentsPage />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <PrivateRoute>
                <AppLayout>
                  <AttendancePage />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <AppLayout>
                  <ReportsPage />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/marks"
            element={
              <PrivateRoute>
                <AppLayout>
                  <MarksPage />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <AppLayout>
                  <NotificationsPage />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/students/:studentId/documents"
            element={
              <PrivateRoute>
                <StudentDocumentsPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
