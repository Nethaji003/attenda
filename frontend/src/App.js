import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/StudentsPage';
import AttendancePage from './pages/AttendancePage';
import ReportsPage from './pages/ReportsPage';
import MarksPage from './pages/MarksPage';
import StudentRegisterPage from './pages/StudentRegisterPage';
import StudentDocumentsPage from './pages/StudentDocumentsPage';

import StudentDashboard from './pages/StudentDashboard';

function PrivateRoute({ children, roleRequired }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <div className="spinner" style={{ width: 40, height: 40, borderColor: 'rgba(26,86,219,.2)', borderTopColor: '#1a56db' }}></div>
  </div>;
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

  const pageTitles = {
    '/': 'Dashboard', '/students': 'Student Management',
    '/attendance': 'Attendance', '/reports': 'Reports', '/marks': 'Academic Marks',
    '/student-register': 'Student Register'
  };
  const path = window.location.pathname;

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="app-wrapper">
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 999 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <header className="top-navbar">
          <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className={`bi bi-${sidebarOpen ? 'x' : 'list'}`}></i>
          </button>
          <div className="page-title">
            {pageTitles[path] || 'Attenda'}
            <div className="page-subtitle">School Management System</div>
          </div>
          <span className="navbar-date">
            <i className="bi bi-calendar3 me-1"></i>{today}
          </span>
        </header>
        <div className="page-content page-enter">{children}</div>
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
          <Route path="/student/dashboard" element={<PrivateRoute roleRequired="STUDENT"><StudentDashboard /></PrivateRoute>} />
          <Route path="/" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
          <Route path="/students" element={<PrivateRoute><AppLayout><StudentsPage /></AppLayout></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><AppLayout><AttendancePage /></AppLayout></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><AppLayout><ReportsPage /></AppLayout></PrivateRoute>} />
          <Route path="/marks" element={<PrivateRoute><AppLayout><MarksPage /></AppLayout></PrivateRoute>} />
          <Route path="/students/:studentId/documents" element={<PrivateRoute><StudentDocumentsPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
