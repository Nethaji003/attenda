import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentPortalAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/* ─── Radial Ring Gauge for Student Attendance % ─── */
function StudentAttendanceRing({ pct = 0, size = 110 }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - Math.min(100, Math.max(0, pct)) / 100);
  const col = pct >= 75 ? '#D4AF37' : pct >= 60 ? '#F5D76E' : '#EF4444';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(212, 175, 55, 0.12)" strokeWidth="7" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke={col}
        strokeWidth="7"
        strokeDasharray={circ}
        strokeDashoffset={fill}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{
          transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          filter: `drop-shadow(0 0 6px ${col})`,
        }}
      />
      <text
        x="50"
        y="46"
        textAnchor="middle"
        fontSize="17"
        fontWeight="800"
        fill="#FFFFFF"
        fontFamily="'Outfit', sans-serif"
      >
        {pct}%
      </text>
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fontSize="8"
        fontWeight="700"
        letterSpacing="0.5"
        fill="#F5D76E"
        fontFamily="'Outfit', sans-serif"
      >
        OVERALL
      </text>
    </svg>
  );
}

export default function StudentDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'profile' | 'attendance' | 'marks' | 'results' | 'performance' | 'notifications'
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [monthlyAtt, setMonthlyAtt] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [marks, setMarks] = useState([]);
  const [results, setResults] = useState(null);
  const [performance, setPerformance] = useState(null);

  // Filters for Marks & Results
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  // Student specific notifications (Section 7 Requirement)
  const [studentNotifs] = useState([
    {
      id: 1,
      title: 'Term Examination Schedule Released',
      message: 'The upcoming midterm examination timetable has been published. Please review your enrolled subject schedule.',
      date: 'Today',
      type: 'EXAM',
    },
    {
      id: 2,
      title: 'Daily Attendance Status Confirmed',
      message: 'Your attendance record for today has been logged by the class faculty.',
      date: 'Today',
      type: 'ATTENDANCE',
    },
    {
      id: 3,
      title: 'Annual Sports & Athletics Meet',
      message: 'Students are encouraged to register for inter-house track and field competitions with physical education mentors.',
      date: '2 days ago',
      type: 'EVENT',
    },
    {
      id: 4,
      title: 'Library Book Return Notice',
      message: 'All borrowed reference books must be re-validated prior to the examination break.',
      date: '4 days ago',
      type: 'GENERAL',
    },
  ]);

  const loadAllStudentData = useCallback(async () => {
    setLoading(true);
    try {
      const [profRes, attRes, perfRes, marksRes, resultsRes] = await Promise.all([
        studentPortalAPI.getMyProfile(),
        studentPortalAPI.getMyAttendance(),
        studentPortalAPI.getMyPerformance(),
        studentPortalAPI.getMyMarks(),
        studentPortalAPI.getMyResults(),
      ]);

      setProfile(profRes.data);
      setAttendance(attRes.data);
      setPerformance(perfRes.data);
      setMarks(marksRes.data || []);
      setResults(resultsRes.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Session expired or unauthorized. Please log in again.');
        logout();
        navigate('/login');
      } else {
        toast.error('Failed to load student data. Please retry.');
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    loadAllStudentData();
  }, [loadAllStudentData]);

  const loadMonthlyAttendance = useCallback(async (yr, mo) => {
    try {
      const res = await studentPortalAPI.getMonthlyAttendance(yr, mo);
      setMonthlyAtt(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadMonthlyAttendance(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, loadMonthlyAttendance]);

  const handleExamFilterChange = async (exam) => {
    setSelectedExam(exam);
    try {
      const [mRes, rRes] = await Promise.all([
        studentPortalAPI.getMyMarks({ examType: exam, academicYear: selectedYearFilter }),
        studentPortalAPI.getMyResults({ examType: exam, academicYear: selectedYearFilter }),
      ]);
      setMarks(mRes.data || []);
      setResults(rRes.data);
    } catch {
      toast.error('Failed to filter examination marks');
    }
  };

  const handleYearFilterChange = async (yr) => {
    setSelectedYearFilter(yr);
    try {
      const [mRes, rRes] = await Promise.all([
        studentPortalAPI.getMyMarks({ examType: selectedExam, academicYear: yr }),
        studentPortalAPI.getMyResults({ examType: selectedExam, academicYear: yr }),
      ]);
      setMarks(mRes.data || []);
      setResults(rRes.data);
    } catch {
      toast.error('Failed to filter marks');
    }
  };

  const handleDownloadMarksheet = async (examTypeParam) => {
    setPdfDownloading(true);
    try {
      const exam = examTypeParam || selectedExam || '';
      const yr = selectedYearFilter || '';
      const res = await studentPortalAPI.downloadMarksheet({ examType: exam, academicYear: yr });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `marksheet_${profile?.studentId || 'student'}${exam ? '_' + exam : ''}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Official PDF Marksheet downloaded! 📄');
    } catch {
      toast.error('Could not download marksheet. Please try again.');
    } finally {
      setPdfDownloading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#080808',
          gap: 16,
        }}
      >
        <div className="spinner" style={{ width: 44, height: 44, borderTopColor: '#D4AF37' }}></div>
        <div style={{ fontWeight: 700, color: '#D4AF37', fontSize: 15, letterSpacing: 0.5 }}>
          Loading Student Portal...
        </div>
      </div>
    );
  }

  const attPct = attendance?.attendancePercentage || 0;
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDayIndex = new Date(selectedYear, selectedMonth - 1, 1).getDay();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080808', color: '#FFFFFF' }}>
      {/* ── STUDENT SIDEBAR NAVIGATION ── */}
      <aside
        style={{
          width: 260,
          background: '#111111',
          borderRight: '1px solid var(--gold-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          boxShadow: '4px 0 25px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: '22px 24px',
            borderBottom: '1px solid var(--gold-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, transparent 100%)',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--gold-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: '#080808',
              boxShadow: 'var(--gold-glow)',
            }}
          >
            <i className="bi bi-mortarboard-fill"></i>
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 800,
                fontSize: 18,
                background: 'var(--gold-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ATTENDA
            </div>
            <div style={{ fontSize: 11, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Student Portal
            </div>
          </div>
        </div>

        {/* Student Mini Profile in Sidebar */}
        <div
          style={{
            padding: '16px 20px',
            background: 'rgba(212, 175, 55, 0.04)',
            borderBottom: '1px solid var(--gold-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {profile?.photoPath ? (
            <img
              src={profile.photoPath}
              alt={profile.studentName}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--gold-primary)',
                boxShadow: 'var(--gold-glow)',
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--gold-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 18,
                color: '#080808',
                boxShadow: 'var(--gold-glow)',
              }}
            >
              {profile?.studentName?.[0] || 'S'}
            </div>
          )}
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#FFFFFF' }}>
              {profile?.studentName}
            </div>
            <div style={{ fontSize: 11, color: '#F5D76E' }}>{profile?.studentId}</div>
            <div style={{ fontSize: 11, color: '#888' }}>
              Class {profile?.standard}-{profile?.section}
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {[
            { id: 'overview', label: 'Overview', icon: 'bi-grid-1x2-fill' },
            { id: 'profile', label: 'My Profile', icon: 'bi-person-circle' },
            { id: 'attendance', label: 'My Attendance', icon: 'bi-calendar-check-fill' },
            { id: 'marks', label: 'My Marks', icon: 'bi-journal-check' },
            { id: 'results', label: 'Examination Results', icon: 'bi-award-fill' },
            { id: 'performance', label: 'Academic Performance', icon: 'bi-graph-up-arrow' },
            { id: 'notifications', label: 'Notifications', icon: 'bi-bell-fill' },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <i className={`bi ${item.icon}`}></i>
                <span>{item.label}</span>
                {item.id === 'notifications' && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#D4AF37',
                      boxShadow: '0 0 6px #D4AF37',
                    }}
                  />
                )}
              </button>
            );
          })}

          {/* Quick Marksheet Download Button */}
          <button
            onClick={() => handleDownloadMarksheet()}
            disabled={pdfDownloading}
            className="btn btn-outline btn-sm"
            style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
          >
            {pdfDownloading ? (
              <><div className="spinner"></div> Generating...</>
            ) : (
              <><i className="bi bi-file-earmark-pdf-fill"></i> Download Marksheet</>
            )}
          </button>
        </nav>

        {/* Footer Logout */}
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={logout}>
            <i className="bi bi-box-arrow-right"></i> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT VIEW ── */}
      <main style={{ marginLeft: 260, flex: 1, padding: '28px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        {/* Top Navbar Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: '1px solid var(--gold-border)',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#FFFFFF' }}>
              Welcome, {profile?.studentName}! 🎓
            </h2>
            <p style={{ margin: 0, fontSize: 12.5, color: '#D4AF37', marginTop: 2 }}>
              Roll #{profile?.rollNumber} • Standard {profile?.standard} Section {profile?.section} • Academic Session 2024-2025
            </p>
          </div>
          <span className="badge badge-gold" style={{ fontSize: 12, padding: '6px 14px' }}>
            <i className="bi bi-shield-check"></i> Authenticated Student Session
          </span>
        </div>

        {/* ══════════════ TAB 1: OVERVIEW ══════════════ */}
        {activeTab === 'overview' && (
          <div className="page-enter">
            {/* Quick KPI Stat Cards */}
            <div className="stats-grid mb-4">
              <div className="stat-card" style={{ '--card-accent': '#D4AF37' }}>
                <div className="stat-icon" style={{ background: 'rgba(212, 175, 55, 0.12)', color: '#D4AF37' }}>
                  <i className="bi bi-calendar-check-fill"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value" style={{ color: '#FFFFFF' }}>{attendance?.presentDays ?? 0}</div>
                  <div className="stat-label">Present Days</div>
                </div>
              </div>

              <div className="stat-card" style={{ '--card-accent': '#EF4444' }}>
                <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }}>
                  <i className="bi bi-calendar-x-fill"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value" style={{ color: '#F87171' }}>{attendance?.absentDays ?? 0}</div>
                  <div className="stat-label">Absent Days</div>
                </div>
              </div>

              <div className="stat-card" style={{ '--card-accent': '#38BDF8' }}>
                <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38BDF8' }}>
                  <i className="bi bi-journal-bookmark-fill"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value" style={{ color: '#38BDF8' }}>{marks.length}</div>
                  <div className="stat-label">Graded Subjects</div>
                </div>
              </div>

              {/* Attendance Ring Card */}
              <div
                className="stat-card"
                style={{
                  '--card-accent': '#D4AF37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <StudentAttendanceRing pct={attPct} size={90} />
                <div style={{ flex: 1, marginLeft: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#FFFFFF' }}>Attendance Rate</div>
                  <div style={{ fontSize: 11, color: '#A0A0A0', marginTop: 4 }}>
                    {attPct >= 75 ? '🟢 Eligible for Finals' : '🔴 Below 75% Threshold'}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Notifications & Quick Announcements */}
            <div className="card mb-4">
              <div className="card-header">
                <div className="card-header-icon">
                  <i className="bi bi-bell-fill"></i>
                </div>
                <h5>Student Announcements & Circulars</h5>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {studentNotifs.slice(0, 3).map((n) => (
                    <div
                      key={n.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(212, 175, 55, 0.12)',
                        borderRadius: 10,
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong style={{ color: '#FFFFFF', fontSize: 13.5 }}>{n.title}</strong>
                        <div style={{ fontSize: 12, color: '#A0A0A0', marginTop: 2 }}>{n.message}</div>
                      </div>
                      <span className="badge badge-gold" style={{ fontSize: 10 }}>{n.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ TAB 2: MY PROFILE ══════════════ */}
        {activeTab === 'profile' && profile && (
          <div className="card page-enter">
            <div className="card-header">
              <div className="card-header-icon">
                <i className="bi bi-person-circle"></i>
              </div>
              <h5>Student Academic Profile & Identification</h5>
            </div>
            <div className="card-body">
              <div
                style={{
                  display: 'flex',
                  gap: 20,
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(18, 18, 18, 0.9) 100%)',
                  padding: '24px',
                  borderRadius: 14,
                  border: '1px solid var(--gold-border)',
                  marginBottom: 24,
                }}
              >
                {profile.photoPath ? (
                  <img
                    src={profile.photoPath}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--gold-primary)',
                      boxShadow: 'var(--gold-glow)',
                    }}
                    alt=""
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'var(--gold-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#080808',
                      fontSize: 32,
                      fontWeight: 800,
                      boxShadow: 'var(--gold-glow)',
                    }}
                  >
                    {profile.studentName?.[0] || 'S'}
                  </div>
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#FFFFFF' }}>
                    {profile.studentName}
                  </h3>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    <span className="badge badge-gold">{profile.studentId}</span>
                    <span className="badge badge-primary">
                      Class {profile.standard}-{profile.section}
                    </span>
                    <span className="badge" style={{ background: '#222', color: '#FFF' }}>
                      Roll #{profile.rollNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 16,
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: 20,
                  borderRadius: 12,
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                }}
              >
                <div>
                  <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Parent / Guardian</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginTop: 2 }}>{profile.parentName || '—'}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Registered Mobile</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#38BDF8', marginTop: 2 }}>📱 {profile.mobileNumber || '—'}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Date of Birth</span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginTop: 2 }}>
                    {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Gender</span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginTop: 2 }}>{profile.gender || '—'}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Permanent Address</span>
                  <div style={{ fontSize: 13.5, color: '#E0E0E0', marginTop: 2 }}>{profile.address || 'Standard Campus Residence'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ TAB 3: MY ATTENDANCE & CALENDAR ══════════════ */}
        {activeTab === 'attendance' && (
          <div className="page-enter">
            {/* Monthly Calendar View */}
            <div className="card mb-4">
              <div className="card-header">
                <div className="card-header-icon">
                  <i className="bi bi-calendar3"></i>
                </div>
                <h5>Monthly Attendance Calendar</h5>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                  <select
                    className="form-select"
                    style={{ width: 140, padding: '6px 12px', fontSize: 12 }}
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  >
                    {MONTHS.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="form-control"
                    style={{ width: 100, padding: '6px 12px', fontSize: 12 }}
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="card-body">
                {/* Month summary pill */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <span className="badge badge-gold">Month Recorded: {monthlyAtt?.totalDaysRecorded || 0} Days</span>
                  <span className="badge badge-present">Present: {monthlyAtt?.presentDays || 0}</span>
                  <span className="badge badge-absent">Absent: {monthlyAtt?.absentDays || 0}</span>
                  <span className="badge badge-gold" style={{ marginLeft: 'auto' }}>
                    Month Rate: {monthlyAtt?.percentage || 0}%
                  </span>
                </div>

                {/* Calendar Days Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, textAlign: 'center' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} style={{ fontSize: 11, fontWeight: 700, color: '#D4AF37', padding: '6px 0' }}>
                      {d}
                    </div>
                  ))}

                  {/* Empty slots before first day */}
                  {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {/* Days */}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const padMonth = String(selectedMonth).padStart(2, '0');
                    const padDay = String(day).padStart(2, '0');
                    const dateKey = `${selectedYear}-${padMonth}-${padDay}`;
                    const status = monthlyAtt?.calendar?.[dateKey];

                    return (
                      <div
                        key={day}
                        style={{
                          height: 52,
                          background:
                            status === 'PRESENT'
                              ? 'var(--success-bg)'
                              : status === 'ABSENT'
                              ? 'var(--danger-bg)'
                              : status === 'LEAVE'
                              ? 'var(--warning-bg)'
                              : '#121212',
                          border: `1px solid ${
                            status === 'PRESENT'
                              ? 'var(--success-border)'
                              : status === 'ABSENT'
                              ? 'var(--danger-border)'
                              : status === 'LEAVE'
                              ? 'var(--warning-border)'
                              : 'rgba(212, 175, 55, 0.12)'
                          }`,
                          borderRadius: 8,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 4,
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>{day}</span>
                        {status === 'PRESENT' && <span style={{ fontSize: 9, color: '#34D399', fontWeight: 800 }}>P</span>}
                        {status === 'ABSENT' && <span style={{ fontSize: 9, color: '#F87171', fontWeight: 800 }}>A</span>}
                        {status === 'LEAVE' && <span style={{ fontSize: 9, color: '#FBBF24', fontWeight: 800 }}>L</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Attendance History Records List */}
            <div className="table-wrapper">
              <div className="table-toolbar">
                <h5 style={{ margin: 0, color: '#FFFFFF', fontSize: 14 }}>
                  Historical Attendance Log (Past 180 Days)
                </h5>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(attendance?.records || []).slice(0, 20).map((r, i) => (
                    <tr key={i}>
                      <td><strong style={{ color: '#FFFFFF' }}>{r.date}</strong></td>
                      <td style={{ color: '#A0A0A0' }}>{r.day}</td>
                      <td>
                        {r.status === 'PRESENT' && <span className="badge badge-present">✅ Present</span>}
                        {r.status === 'ABSENT' && <span className="badge badge-absent">❌ Absent</span>}
                        {r.status === 'LEAVE' && <span className="badge badge-leave">🟡 On Leave</span>}
                      </td>
                      <td style={{ color: '#888', fontSize: 12 }}>{r.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════ TAB 4: MY MARKS & ACADEMIC PERFORMANCE ══════════════ */}
        {activeTab === 'marks' && (
          <div className="page-enter">
            <div className="card mb-4">
              <div className="card-header">
                <div className="card-header-icon">
                  <i className="bi bi-journal-check"></i>
                </div>
                <h5>Enrolled Course Marks & Subject Scores</h5>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <select
                    className="form-select"
                    style={{ width: 150, padding: '6px 10px', fontSize: 12 }}
                    value={selectedExam}
                    onChange={(e) => handleExamFilterChange(e.target.value)}
                  >
                    <option value="">All Examinations</option>
                    <option value="Unit Test 1">Unit Test 1</option>
                    <option value="Unit Test 2">Unit Test 2</option>
                    <option value="Quarterly Examination">Quarterly Exam</option>
                    <option value="Half-Yearly Examination">Half-Yearly</option>
                    <option value="Annual Examination">Annual Exam</option>
                  </select>

                  <select
                    className="form-select"
                    style={{ width: 120, padding: '6px 10px', fontSize: 12 }}
                    value={selectedYearFilter}
                    onChange={(e) => handleYearFilterChange(e.target.value)}
                  >
                    <option value="">All Years</option>
                    <option value="2024-25">2024-25</option>
                    <option value="2023-24">2023-24</option>
                  </select>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleDownloadMarksheet()}
                    disabled={pdfDownloading}
                  >
                    <i className="bi bi-file-earmark-pdf-fill"></i> Download Marksheet PDF
                  </button>
                </div>
              </div>
              <div className="card-body">
                {marks.length === 0 ? (
                  <div className="table-empty">
                    <i className="bi bi-journal-x"></i>
                    No published examination marks available yet.
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Exam Term</th>
                          <th>Max Marks</th>
                          <th>Marks Obtained</th>
                          <th>Percentage</th>
                          <th>Letter Grade</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marks.map((m, i) => (
                          <tr key={m.id || i}>
                            <td><strong style={{ color: '#FFFFFF', fontSize: 13.5 }}>{m.subject}</strong></td>
                            <td style={{ color: '#F5D76E' }}>{m.examType}</td>
                            <td>{m.maxMarks}</td>
                            <td style={{ fontWeight: 800, color: '#FFFFFF' }}>{m.marksObtained}</td>
                            <td>
                              <span style={{ fontWeight: 700, color: m.percentage >= 75 ? '#34D399' : m.percentage >= 35 ? '#FBBF24' : '#F87171' }}>
                                {m.percentage}%
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-gold">{m.grade}</span>
                            </td>
                            <td>
                              {m.pass ? (
                                <span className="badge badge-present">PASSED</span>
                              ) : (
                                <span className="badge badge-absent">FAILED</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ TAB 5: EXAMINATION RESULTS ══════════════ */}
        {activeTab === 'results' && (
          <div className="page-enter">
            <div className="card mb-4">
              <div className="card-header">
                <div className="card-header-icon">
                  <i className="bi bi-award-fill"></i>
                </div>
                <h5>Institutional Examination Results</h5>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginLeft: 'auto' }}
                  onClick={() => handleDownloadMarksheet()}
                  disabled={pdfDownloading}
                >
                  <i className="bi bi-file-earmark-pdf-fill"></i> Download Official Marksheet
                </button>
              </div>
              <div className="card-body">
                {results ? (
                  <div>
                    {/* Aggregates Card */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 16,
                        marginBottom: 20,
                      }}
                    >
                      <div className="stat-card" style={{ '--card-accent': '#D4AF37' }}>
                        <div className="stat-info">
                          <div className="stat-value" style={{ color: '#FFFFFF' }}>{results.totalMarksObtained || 0}</div>
                          <div className="stat-label">Total Marks Scored</div>
                        </div>
                      </div>
                      <div className="stat-card" style={{ '--card-accent': '#38BDF8' }}>
                        <div className="stat-info">
                          <div className="stat-value" style={{ color: '#38BDF8' }}>{results.totalMaxMarks || 0}</div>
                          <div className="stat-label">Maximum Marks</div>
                        </div>
                      </div>
                      <div className="stat-card" style={{ '--card-accent': '#10B981' }}>
                        <div className="stat-info">
                          <div className="stat-value" style={{ color: '#34D399' }}>{results.overallPercentage || 0}%</div>
                          <div className="stat-label">Cumulative GPA %</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="table-empty">
                    <i className="bi bi-award"></i>
                    No formal examination aggregate published yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ TAB 6: ACADEMIC PERFORMANCE ══════════════ */}
        {activeTab === 'performance' && (
          <div className="card page-enter">
            <div className="card-header">
              <div className="card-header-icon">
                <i className="bi bi-graph-up-arrow"></i>
              </div>
              <h5>Academic Performance & Growth Metrics</h5>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <p style={{ color: '#A0A0A0', fontSize: 13 }}>
                  Institutional performance analysis based on continuous assessment and midterm evaluations.
                </p>
                {performance && (
                  <div
                    style={{
                      background: 'rgba(212, 175, 55, 0.06)',
                      border: '1px solid var(--gold-border)',
                      borderRadius: 12,
                      padding: '14px 18px',
                      display: 'flex',
                      gap: 20,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Academic Standing</span>
                      <div style={{ color: '#F5D76E', fontWeight: 800, fontSize: 16 }}>{performance.standing || 'Good Standing'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Grade Point Average</span>
                      <div style={{ color: '#34D399', fontWeight: 800, fontSize: 16 }}>{performance.gpa || `${performance.overallPercentage || 85}%`}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Evaluation Period</span>
                      <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 14 }}>Academic Year 2024-25</div>
                    </div>
                  </div>
                )}
                {marks.map((m) => (
                  <div key={m.id || m.subject}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <strong style={{ color: '#FFFFFF', fontSize: 13.5 }}>{m.subject}</strong>
                      <span style={{ color: '#F5D76E', fontWeight: 700 }}>{m.marksObtained} / {m.maxMarks} ({m.percentage}%)</span>
                    </div>
                    <div className="progress-bar-wrapper">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${m.percentage}%`,
                          background: m.percentage >= 75 ? 'var(--gold-gradient)' : '#10B981',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ TAB 7: NOTIFICATIONS (Section 7 Requirement) ══════════════ */}
        {activeTab === 'notifications' && (
          <div className="card page-enter">
            <div className="card-header">
              <div className="card-header-icon">
                <i className="bi bi-bell-fill"></i>
              </div>
              <h5>Student Notifications & Official Notices</h5>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {studentNotifs.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--gold-border)',
                      borderRadius: 12,
                      padding: '16px 20px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 14, color: '#FFFFFF' }}>{n.title}</strong>
                      <span className="badge badge-gold">{n.date}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#A0A0A0', marginTop: 6, marginBottom: 0 }}>
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
