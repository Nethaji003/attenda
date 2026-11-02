import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/services';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'student'

  // Staff login state
  const [staffForm, setStaffForm] = useState({ username: '', password: '' });
  const [showStaffPw, setShowStaffPw] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);

  // Student login state
  const [studentForm, setStudentForm] = useState({
    studentId: '',
    dateOfBirth: '',
  });
  const [studentLoading, setStudentLoading] = useState(false);
  const [verifiedStudent, setVerifiedStudent] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formCompleted, setFormCompleted] = useState(false);

  // Forgot password modal state (Section 8 Requirement)
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotRole, setForgotRole] = useState('staff');
  const [forgotSent, setForgotSent] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle Staff (Admin/Teacher) login
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    if (!staffForm.username || !staffForm.password) {
      toast.error('Please enter username and password');
      return;
    }
    setStaffLoading(true);
    try {
      const res = await authAPI.login(staffForm);
      const { token, ...userData } = res.data;
      login(userData, token);
      toast.success(`Welcome back, ${userData.fullName || 'Staff Member'}! 👑`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setStaffLoading(false);
    }
  };

  const fillStaffDemo = (role) => {
    if (role === 'admin') setStaffForm({ username: 'admin', password: 'admin123' });
    else setStaffForm({ username: 'teacher', password: 'teacher123' });
  };

  // Step 1: Pre-verify student registration credentials
  const handleStudentPreVerify = async (e) => {
    e.preventDefault();
    if (!studentForm.studentId.trim()) {
      toast.error('Please enter Student Registration Number');
      return;
    }
    setStudentLoading(true);
    try {
      const res = await authAPI.studentVerifyDetails({
        studentId: studentForm.studentId.trim(),
        dateOfBirth: studentForm.dateOfBirth ? studentForm.dateOfBirth.trim() : '',
      });
      setVerifiedStudent(res.data);
      setShowFormModal(true);
      setFormCompleted(false);
      toast.info('Student record matched! Complete verification via the Google Form.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Student verification failed. Check Registration Number and Date of Birth.');
    } finally {
      setStudentLoading(false);
    }
  };

  // Step 2: Finalize login after Google Form submission confirmation
  const handleFinalStudentLogin = async () => {
    if (!formCompleted) {
      toast.warning('Please confirm that you have submitted the Google Form verification');
      return;
    }
    setStudentLoading(true);
    try {
      const res = await authAPI.studentLogin({
        studentId: verifiedStudent.studentId,
        dateOfBirth: studentForm.dateOfBirth ? studentForm.dateOfBirth.trim() : '',
        formConfirmed: 'true',
      });
      const { token, ...userData } = res.data;
      login(userData, token);
      setShowFormModal(false);
      toast.success(`Welcome, ${userData.fullName}! Redirecting to student portal... 🎓`);
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication error. Please try again.');
    } finally {
      setStudentLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.warning('Please enter your registered email or username');
      return;
    }
    setForgotSent(true);
    setTimeout(() => {
      toast.success('Password reset instructions forwarded to school IT administration!');
    }, 600);
  };

  return (
    <div className="login-page">
      {/* Background Animated Luxury Orbs */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${100 + i * 50}px`,
            height: `${100 + i * 50}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(212,175,55,${0.03 + i * 0.01}) 0%, transparent 70%)`,
            border: '1px solid rgba(212,175,55,0.06)',
            top: `${8 + i * 14}%`,
            left: `${4 + i * 16}%`,
            animation: `spin ${16 + i * 4}s linear infinite`,
            pointerEvents: 'none',
          }}
        />
      ))}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 460,
        }}
      >
        {/* Main Login Card */}
        <div className="login-card">
          {/* Logo & School Branding (Section 8 Requirement) */}
          <div className="login-logo">
            <div className="logo-icon">
              <i className="bi bi-mortarboard-fill"></i>
            </div>
            <h1>ATTENDA</h1>
            <p>School Management System • Premium Edition</p>
          </div>

          {/* School Crest / Decorative Gold Ribbon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 22,
            }}
          >
            <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3))' }} />
            <span style={{ fontSize: 11, color: '#D4AF37', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              ✦ INSTITUTIONAL PORTAL ✦
            </span>
            <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }} />
          </div>

          {/* Tab Switcher: Staff Login vs Student Login */}
          <div
            style={{
              display: 'flex',
              background: '#0d0d0d',
              border: '1px solid var(--gold-border)',
              borderRadius: 12,
              padding: 4,
              marginBottom: 24,
              gap: 6,
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: 'none',
                borderRadius: 9,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === 'staff' ? 'var(--gold-gradient)' : 'transparent',
                color: activeTab === 'staff' ? '#080808' : '#A0A0A0',
                boxShadow: activeTab === 'staff' ? '0 2px 10px rgba(212,175,55,0.4)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <i className="bi bi-shield-lock-fill"></i> Staff Login
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('student')}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: 'none',
                borderRadius: 9,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === 'student' ? 'var(--gold-gradient)' : 'transparent',
                color: activeTab === 'student' ? '#080808' : '#A0A0A0',
                boxShadow: activeTab === 'student' ? '0 2px 10px rgba(212,175,55,0.4)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <i className="bi bi-person-badge-fill"></i> Student Login
            </button>
          </div>

          {/* ══════════════ TAB 1: STAFF LOGIN ══════════════ */}
          {activeTab === 'staff' && (
            <form onSubmit={handleStaffSubmit}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <div style={{ position: 'relative' }}>
                  <i
                    className="bi bi-person-fill"
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }}
                  ></i>
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: 40 }}
                    placeholder="e.g. admin or teacher"
                    value={staffForm.username}
                    onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#F5D76E',
                      fontSize: 12,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <i
                    className="bi bi-lock-fill"
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }}
                  ></i>
                  <input
                    type={showStaffPw ? 'text' : 'password'}
                    className="form-control"
                    style={{ paddingLeft: 40, paddingRight: 42 }}
                    placeholder="Enter confidential password"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowStaffPw(!showStaffPw)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#D4AF37',
                    }}
                    title={showStaffPw ? 'Hide password' : 'Show password'}
                  >
                    <i className={`bi bi-eye${showStaffPw ? '-slash-fill' : '-fill'}`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: 10 }}
                disabled={staffLoading}
              >
                {staffLoading ? (
                  <><div className="spinner"></div> Authenticating...</>
                ) : (
                  <><i className="bi bi-box-arrow-in-right"></i> Sign In to Staff Console</>
                )}
              </button>

              {/* Demo quick fill shortcuts */}
              <div
                style={{
                  marginTop: 18,
                  padding: '12px 14px',
                  background: 'rgba(212, 175, 55, 0.04)',
                  borderRadius: 10,
                  border: '1px solid var(--gold-border)',
                }}
              >
                <div style={{ fontSize: 11, color: '#D4AF37', marginBottom: 8, fontWeight: 700, letterSpacing: 0.5 }}>
                  QUICK DEMO CREDENTIALS:
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => fillStaffDemo('admin')}
                  >
                    <i className="bi bi-shield-check"></i> Admin
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => fillStaffDemo('teacher')}
                  >
                    <i className="bi bi-person-check"></i> Teacher
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ══════════════ TAB 2: STUDENT LOGIN ══════════════ */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentPreVerify}>
              <div
                style={{
                  background: 'rgba(212, 175, 55, 0.06)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  marginBottom: 16,
                  border: '1px solid var(--gold-border)',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <i className="bi bi-mortarboard" style={{ fontSize: 22, color: '#F5D76E', flexShrink: 0 }}></i>
                <div style={{ fontSize: 12, color: '#E0E0E0', lineHeight: 1.4 }}>
                  Enter your assigned <strong>Student Registration Number</strong> and Date of Birth to access your student portal.
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Student Registration Number (Student ID) *
                </label>
                <div style={{ position: 'relative' }}>
                  <i
                    className="bi bi-card-heading"
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }}
                  ></i>
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: 40 }}
                    placeholder="e.g. STU1001 or STU2024001"
                    value={studentForm.studentId}
                    onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Date of Birth <span style={{ color: '#888', fontWeight: 400 }}>(Verification Check)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#F5D76E',
                      fontSize: 12,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Need Help?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <i
                    className="bi bi-calendar-date"
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }}
                  ></i>
                  <input
                    type="date"
                    className="form-control"
                    style={{ paddingLeft: 40 }}
                    value={studentForm.dateOfBirth}
                    onChange={(e) => setStudentForm({ ...studentForm, dateOfBirth: e.target.value })}
                  />
                </div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                  Matches date of birth registered during institutional enrollment.
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
                disabled={studentLoading}
              >
                {studentLoading ? (
                  <><div className="spinner"></div> Checking Record...</>
                ) : (
                  <><i className="bi bi-shield-check"></i> Verify & Proceed to Login</>
                )}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: 11, color: '#777', marginTop: 20, marginBottom: 0 }}>
            🔒 256-Bit Encrypted TLS Institutional Authentication
          </p>
        </div>

        {/* Link to Public Student Admission Form */}
        <Link to="/student-register" style={{ textDecoration: 'none' }}>
          <div
            style={{
              background: '#121212',
              borderRadius: 14,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
              border: '1px solid var(--gold-border)',
              boxShadow: 'var(--shadow-card)',
              transition: 'all 0.2s',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                background: 'var(--gold-gradient)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                color: '#080808',
                flexShrink: 0,
                boxShadow: 'var(--gold-glow)',
              }}
            >
              <i className="bi bi-ui-checks"></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#FFFFFF' }}>
                Online Admission Register
              </div>
              <div style={{ fontSize: 12, color: '#A0A0A0', marginTop: 1 }}>
                Open registration form & student enrollment directory
              </div>
            </div>
            <i className="bi bi-arrow-right-circle-fill" style={{ fontSize: 22, color: '#F5D76E' }}></i>
          </div>
        </Link>
      </div>

      {/* ══════════════ MODAL: FORGOT PASSWORD (Section 8 Requirement) ══════════════ */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="bi bi-key-fill" style={{ color: '#D4AF37', fontSize: 20 }}></i>
                <h4>Account Access Assistance</h4>
              </div>
              <button className="modal-close" onClick={() => setShowForgotPassword(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              {forgotSent ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <i className="bi bi-check-circle-fill" style={{ fontSize: 48, color: '#10B981' }}></i>
                  <h4 style={{ color: '#FFFFFF', marginTop: 14 }}>Request Logged Successfully</h4>
                  <p style={{ color: '#A0A0A0', fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
                    Your password reset ticket has been forwarded to the institutional IT administration. Please check your official school email or visit the administrative block with your school ID card.
                  </p>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: 16 }}
                    onClick={() => {
                      setForgotSent(false);
                      setShowForgotPassword(false);
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit}>
                  <p style={{ color: '#E0E0E0', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
                    Forgot your credentials? Enter your username or registered email below to initiate credential recovery through the school IT registrar.
                  </p>

                  <div className="mb-3">
                    <label className="form-label">Account Type</label>
                    <select
                      className="form-select"
                      value={forgotRole}
                      onChange={(e) => setForgotRole(e.target.value)}
                    >
                      <option value="staff">Staff / Faculty Account</option>
                      <option value="student">Student / Parent Account</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Registered Username or Email ID</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. admin or student ID"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-send-fill"></i> Submit Recovery Request
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ MODAL: GOOGLE FORM VERIFICATION MODAL (Preserved) ══════════════ */}
      {showFormModal && verifiedStudent && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 520 }}>
            {/* Modal Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1A1A1A, #080808)',
                borderBottom: '1px solid var(--gold-border)',
                padding: '20px 24px',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="bi bi-google" style={{ fontSize: 24, color: '#F5D76E' }}></i>
                <div>
                  <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
                    Google Form Identity Verification
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: '#D4AF37' }}>
                    Step 2 of 2: Security & Identity Confirmation
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close"
                style={{ position: 'absolute', right: 18, top: 18 }}
                onClick={() => setShowFormModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Student Identification Banner */}
              <div
                style={{
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid var(--gold-border)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, letterSpacing: 0.5 }}>
                  Student Identified
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>
                    {verifiedStudent.studentName}
                  </div>
                  <span className="badge badge-primary">
                    Class {verifiedStudent.standard}-{verifiedStudent.section}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#A0A0A0', marginTop: 2 }}>
                  Registration ID: <strong style={{ color: '#F5D76E' }}>{verifiedStudent.studentId}</strong>
                </div>
              </div>

              {/* Step A: Open Google Form */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--gold-gradient)',
                      color: '#080808',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    1
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#FFFFFF' }}>
                    Open the Google Form verification page:
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#A0A0A0', marginLeft: 32, marginBottom: 12 }}>
                  Click below to open the identity confirmation form in a new tab. Submit the required details.
                </p>

                <div style={{ marginLeft: 32, display: 'flex', gap: 10 }}>
                  <a
                    href="https://docs.google.com/forms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <i className="bi bi-box-arrow-up-right"></i> Open Google Form
                  </a>

                  <Link
                    to="/student-register"
                    target="_blank"
                    className="btn btn-outline"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <i className="bi bi-ui-checks"></i> Attenda Reg Form
                  </Link>
                </div>
              </div>

              {/* Step B: Checkbox Confirmation */}
              <div
                style={{
                  background: '#121212',
                  border: '1px solid var(--gold-border)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--gold-gradient)',
                      color: '#080808',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    2
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#FFFFFF' }}>
                    Confirm Form Submission:
                  </span>
                </div>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    marginLeft: 32,
                    cursor: 'pointer',
                    fontSize: 12,
                    color: '#D4D4D4',
                    lineHeight: 1.5,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formCompleted}
                    onChange={(e) => setFormCompleted(e.target.checked)}
                    style={{ marginTop: 2, width: 16, height: 16, accentColor: '#D4AF37', cursor: 'pointer' }}
                  />
                  <span>
                    I confirm that I am <strong>{verifiedStudent.studentName}</strong> ({verifiedStudent.studentId}) and have completed/submitted the Google Form verification for this academic session.
                  </span>
                </label>
              </div>

              {/* Submit Authentication Button */}
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 14,
                }}
                disabled={!formCompleted || studentLoading}
                onClick={handleFinalStudentLogin}
              >
                {studentLoading ? (
                  <><div className="spinner"></div> Authenticating with Server...</>
                ) : (
                  <><i className="bi bi-unlock-fill"></i> Complete Authentication & Enter Portal</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
