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
      toast.success(`Welcome back, ${userData.fullName}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Check your credentials.');
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
      toast.info('Student record matched! Please complete verification via the Google Form.');
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
      toast.success(`Welcome, ${userData.fullName}! Redirecting to your dashboard... 🎉`);
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication error. Please try again.');
    } finally {
      setStudentLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background Animated Orbs */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${60 + i * 40}px`, height: `${60 + i * 40}px`,
          borderRadius: '50%',
          background: `rgba(26,86,219,${0.04 + i * 0.01})`,
          border: '1px solid rgba(26,86,219,.12)',
          top: `${10 + i * 12}%`, left: `${5 + i * 15}%`,
          animation: `spin ${8 + i * 2}s linear infinite`,
          pointerEvents: 'none'
        }} />
      ))}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1, width: '100%', maxWidth: 440, padding: '0 16px' }}>

        {/* Login Card */}
        <div className="login-card" style={{ padding: '28px 24px' }}>
          <div className="login-logo" style={{ marginBottom: 20 }}>
            <div className="logo-icon"><i className="bi bi-mortarboard-fill"></i></div>
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>Attenda</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>School Attendance & Academic Portal</p>
          </div>

          {/* Login Type Switcher Tabs */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: 12,
            padding: 4,
            marginBottom: 22,
            gap: 4
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              style={{
                flex: 1,
                padding: '9px 12px',
                border: 'none',
                borderRadius: 9,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all .2s',
                background: activeTab === 'staff' ? '#ffffff' : 'transparent',
                color: activeTab === 'staff' ? '#1a56db' : '#64748b',
                boxShadow: activeTab === 'staff' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <i className="bi bi-shield-lock"></i> Staff Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              style={{
                flex: 1,
                padding: '9px 12px',
                border: 'none',
                borderRadius: 9,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all .2s',
                background: activeTab === 'student' ? '#ffffff' : 'transparent',
                color: activeTab === 'student' ? '#1a56db' : '#64748b',
                boxShadow: activeTab === 'student' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <i className="bi bi-person-badge"></i> Student Login
            </button>
          </div>

          {/* TAB 1: STAFF LOGIN */}
          {activeTab === 'staff' && (
            <form onSubmit={handleStaffSubmit}>
              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 600, fontSize: 12 }}>Username</label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-person" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}></i>
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: 36, fontSize: 13 }}
                    placeholder="e.g. admin or teacher"
                    value={staffForm.username}
                    onChange={e => setStaffForm({ ...staffForm, username: e.target.value })}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label" style={{ fontWeight: 600, fontSize: 12 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-lock" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}></i>
                  <input
                    type={showStaffPw ? 'text' : 'password'}
                    className="form-control"
                    style={{ paddingLeft: 36, paddingRight: 40, fontSize: 13 }}
                    placeholder="Enter password"
                    value={staffForm.password}
                    onChange={e => setStaffForm({ ...staffForm, password: e.target.value })}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStaffPw(!showStaffPw)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  >
                    <i className={`bi bi-eye${showStaffPw ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '11px', justifyContent: 'center', fontWeight: 600 }}
                disabled={staffLoading}
              >
                {staffLoading
                  ? <><div className="spinner"></div> Signing in...</>
                  : <><i className="bi bi-box-arrow-in-right"></i> Staff Sign In</>
                }
              </button>

              {/* Demo shortcuts */}
              <div style={{ marginTop: 16, padding: '12px', background: '#f8faff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11, color: '#64748b', marginBottom: 8, fontWeight: 600 }}>Quick Demo Fill:</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }} onClick={() => fillStaffDemo('admin')}>
                    <i className="bi bi-shield-check"></i> Admin
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }} onClick={() => fillStaffDemo('teacher')}>
                    <i className="bi bi-person-badge"></i> Teacher
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: STUDENT LOGIN & GOOGLE FORM VERIFICATION */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentPreVerify}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(26,86,219,.08), rgba(14,165,233,.08))',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 16,
                border: '1px solid rgba(26,86,219,.2)',
                display: 'flex',
                gap: 10,
                alignItems: 'center'
              }}>
                <i className="bi bi-shield-check" style={{ fontSize: 20, color: '#1a56db', flexShrink: 0 }}></i>
                <div style={{ fontSize: 12, color: '#1e293b', lineHeight: 1.4 }}>
                  Enter your <strong>Student Registration Number</strong> and Date of Birth to proceed with verification.
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 600, fontSize: 12 }}>
                  Student Registration Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-card-heading" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}></i>
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: 36, fontSize: 13 }}
                    placeholder="e.g. STU1001 or STU2024001"
                    value={studentForm.studentId}
                    onChange={e => setStudentForm({ ...studentForm, studentId: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label" style={{ fontWeight: 600, fontSize: 12 }}>
                  Date of Birth <span style={{ color: '#64748b', fontWeight: 400 }}>(Security Check)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-calendar-date" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}></i>
                  <input
                    type="date"
                    className="form-control"
                    style={{ paddingLeft: 36, fontSize: 13 }}
                    value={studentForm.dateOfBirth}
                    onChange={e => setStudentForm({ ...studentForm, dateOfBirth: e.target.value })}
                  />
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  Matches date of birth recorded during school admission.
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '11px', justifyContent: 'center', fontWeight: 600 }}
                disabled={studentLoading}
              >
                {studentLoading
                  ? <><div className="spinner"></div> Checking record...</>
                  : <><i className="bi bi-shield-check"></i> Verify & Proceed to Login</>
                }
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 18, marginBottom: 0 }}>
            🔒 256-bit Encrypted Server Authentication
          </p>
        </div>

        {/* Student Register Navigation link */}
        <Link to="/student-register" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'rgba(255,255,255,.95)',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0,0,0,.1)',
            border: '2px solid rgba(26,86,219,.15)',
            transition: 'all .2s',
          }}>
            <div style={{
              width: 44, height: 44,
              background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: 'white', flexShrink: 0,
            }}>
              <i className="bi bi-ui-checks"></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Student Online Admission Form</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>
                Open registration form & student enrollment directory
              </div>
            </div>
            <i className="bi bi-arrow-right-circle-fill" style={{ fontSize: 20, color: '#1a56db' }}></i>
          </div>
        </Link>
      </div>

      {/* GOOGLE FORM VERIFICATION MODAL */}
      {showFormModal && verifiedStudent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 18,
            width: '100%',
            maxWidth: 520,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            animation: 'scaleIn 0.25s ease'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #673ab7, #1a56db)',
              padding: '20px 24px',
              color: 'white',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="bi bi-google" style={{ fontSize: 22 }}></i>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Google Form Student Verification</h3>
                  <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>Step 2 of 2: Security & Identity Confirmation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                style={{
                  position: 'absolute', right: 16, top: 16,
                  background: 'rgba(255,255,255,.2)', border: 'none',
                  color: 'white', width: 32, height: 32, borderRadius: '50%',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Student Identification Banner */}
              <div style={{
                background: '#f8faff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 20
              }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: 0.5 }}>
                  Student Identified
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>{verifiedStudent.studentName}</div>
                  <div style={{ fontSize: 12, background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                    Class {verifiedStudent.standard}-{verifiedStudent.section}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Registration ID: <strong>{verifiedStudent.studentId}</strong>
                </div>
              </div>

              {/* Step A: Open Google Form */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%', background: '#1a56db',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700
                  }}>1</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
                    Open the Google Form verification page:
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#64748b', marginLeft: 32, marginBottom: 12 }}>
                  Click the button below to open the verification form in a new tab. Submit the required identity confirmation.
                </p>

                <div style={{ marginLeft: 32, display: 'flex', gap: 10 }}>
                  <a
                    href="https://docs.google.com/forms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      borderColor: '#673ab7',
                      color: '#673ab7',
                      fontWeight: 600,
                      padding: '10px 14px'
                    }}
                  >
                    <i className="bi bi-box-arrow-up-right"></i> Open Google Form
                  </a>

                  <Link
                    to="/student-register"
                    target="_blank"
                    className="btn btn-outline"
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      borderColor: '#1a56db',
                      color: '#1a56db',
                      fontWeight: 600,
                      padding: '10px 14px'
                    }}
                  >
                    <i className="bi bi-ui-checks"></i> Attenda Reg Form
                  </Link>
                </div>
              </div>

              {/* Step B: Checkbox Confirmation */}
              <div style={{
                background: '#f1f5f9',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 20
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%', background: '#1a56db',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700
                  }}>2</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
                    Confirm Form Submission:
                  </span>
                </div>

                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  marginLeft: 32,
                  cursor: 'pointer',
                  fontSize: 12,
                  color: '#334155',
                  lineHeight: 1.5,
                  userSelect: 'none'
                }}>
                  <input
                    type="checkbox"
                    checked={formCompleted}
                    onChange={e => setFormCompleted(e.target.checked)}
                    style={{ marginTop: 2, width: 16, height: 16, accentColor: '#1a56db', cursor: 'pointer' }}
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
                  opacity: formCompleted ? 1 : 0.6,
                  cursor: formCompleted ? 'pointer' : 'not-allowed'
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
