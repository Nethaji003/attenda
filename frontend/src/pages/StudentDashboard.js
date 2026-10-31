import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentPortalAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function StudentDashboard() {
  const {  logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
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
const loadAllStudentData = useCallback(async () => {
  setLoading(true);

  try {
    const [profRes, attRes, perfRes, marksRes, resultsRes] = await Promise.all([
      studentPortalAPI.getMyProfile(),
      studentPortalAPI.getMyAttendance(),
      studentPortalAPI.getMyPerformance(),
      studentPortalAPI.getMyMarks(),
      studentPortalAPI.getMyResults()
    ]);

    setProfile(profRes.data);
    setAttendance(attRes.data);
    setPerformance(perfRes.data);
    setMarks(marksRes.data);
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

  useEffect(() => {
    loadMonthlyAttendance(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  

  const loadMonthlyAttendance = async (year, month) => {
    try {
      const res = await studentPortalAPI.getMonthlyAttendance(year, month);
      setMonthlyAtt(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExamFilterChange = async (exam) => {
    setSelectedExam(exam);
    try {
      const [mRes, rRes] = await Promise.all([
        studentPortalAPI.getMyMarks({ examType: exam, academicYear: selectedYearFilter }),
        studentPortalAPI.getMyResults({ examType: exam, academicYear: selectedYearFilter })
      ]);
      setMarks(mRes.data);
      setResults(rRes.data);
    } catch (err) {
      toast.error('Failed to filter marks.');
    }
  };

  const handleYearFilterChange = async (year) => {
    setSelectedYearFilter(year);
    try {
      const [mRes, rRes] = await Promise.all([
        studentPortalAPI.getMyMarks({ examType: selectedExam, academicYear: year }),
        studentPortalAPI.getMyResults({ examType: selectedExam, academicYear: year })
      ]);
      setMarks(mRes.data);
      setResults(rRes.data);
    } catch (err) {
      toast.error('Failed to filter marks.');
    }
  };

  const handleDownloadMarksheet = async (examTypeParam) => {
    setPdfDownloading(true);
    try {
      const exam = examTypeParam || selectedExam || '';
      const year = selectedYearFilter || '';
      const res = await studentPortalAPI.downloadMarksheet({ examType: exam, academicYear: year });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `marksheet_${profile?.studentId || 'student'}${exam ? '_' + exam : ''}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Marksheet downloaded successfully! 📄');
    } catch (err) {
      toast.error('Could not download marksheet. Please try again.');
    } finally {
      setPdfDownloading(false);
    }
  };

  const getProgressColor = (pct) => {
    if (pct >= 75) return '#10b981'; // Green
    if (pct >= 60) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
        <div className="spinner" style={{ width: 44, height: 44, borderColor: 'rgba(26,86,219,.2)', borderTopColor: '#1a56db' }}></div>
        <div style={{ fontWeight: 600, color: '#64748b', fontSize: 15 }}>Loading Student Portal...</div>
      </div>
    );
  }

  const attPct = attendance?.attendancePercentage || 0;
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDayIndex = new Date(selectedYear, selectedMonth - 1, 1).getDay();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>

      {/* SIDEBAR NAVIGATION */}
      <aside style={{
        width: 260,
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
      }}>
        {/* Brand */}
        <div style={{ padding: '20px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: '#fff', boxShadow: '0 4px 12px rgba(26,86,219,0.4)'
          }}>
            <i className="bi bi-mortarboard-fill"></i>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.3 }}>Attenda</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Student Portal</div>
          </div>
        </div>

        {/* Student Mini Profile in Sidebar */}
        <div style={{
          padding: '16px 20px',
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          {profile?.photoPath ? (
            <img
              src={profile.photoPath}
              alt={profile.studentName}
              style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #3b82f6' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 18, color: '#fff'
            }}>
              {profile?.studentName?.[0] || 'S'}
            </div>
          )}
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.studentName}
            </div>
            <div style={{ fontSize: 11, color: '#38bdf8' }}>{profile?.studentId}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Class {profile?.standard}-{profile?.section}</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {[
            { id: 'overview', label: 'Overview', icon: 'bi-grid-1x2-fill' },
            { id: 'profile', label: 'My Profile', icon: 'bi-person-circle' },
            { id: 'attendance', label: 'My Attendance', icon: 'bi-calendar-check-fill' },
            { id: 'marks', label: 'My Marks', icon: 'bi-journal-check' },
            { id: 'results', label: 'Examination Results', icon: 'bi-award-fill' },
            { id: 'performance', label: 'Academic Performance', icon: 'bi-graph-up-arrow' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 8,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 13,
                fontWeight: activeTab === item.id ? 700 : 500,
                cursor: 'pointer',
                marginBottom: 4,
                transition: 'all 0.15s ease',
                background: activeTab === item.id ? 'linear-gradient(90deg, #1a56db, #2563eb)' : 'transparent',
                color: activeTab === item.id ? '#ffffff' : '#94a3b8',
                boxShadow: activeTab === item.id ? '0 4px 12px rgba(26,86,219,0.35)' : 'none'
              }}
            >
              <i className={`bi ${item.icon}`} style={{ fontSize: 16 }}></i>
              {item.label}
            </button>
          ))}

          {/* Quick Download Marksheet button in sidebar */}
          <button
            onClick={() => handleDownloadMarksheet()}
            disabled={pdfDownloading}
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: 8,
              border: '1px dashed rgba(59, 130, 246, 0.4)',
              background: 'rgba(59, 130, 246, 0.08)',
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: 12,
              transition: 'all 0.15s ease'
            }}
          >
            <i className="bi bi-file-earmark-pdf-fill" style={{ fontSize: 16 }}></i>
            {pdfDownloading ? 'Generating...' : 'Download Marksheet'}
          </button>
        </nav>

        {/* Logout Footer */}
        <div style={{ padding: '16px 14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => { logout(); navigate('/login'); toast.info('Signed out successfully'); }}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: 'none',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ marginLeft: 260, flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* TOP NAVBAR */}
        <header style={{
          height: 64,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>
              {activeTab === 'overview' && 'Student Dashboard Overview'}
              {activeTab === 'profile' && 'My Profile (Read Only)'}
              {activeTab === 'attendance' && 'My Attendance & Calendar'}
              {activeTab === 'marks' && 'Subject-wise Marks'}
              {activeTab === 'results' && 'Official Examination Results'}
              {activeTab === 'performance' && 'Academic Performance & Analytics'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Attenda Portal &bull; Academic Session 2024–2025
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Download Marksheet Navbar button */}
            <button
              onClick={() => handleDownloadMarksheet()}
              disabled={pdfDownloading}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
            >
              <i className="bi bi-download"></i>
              {pdfDownloading ? 'Generating PDF...' : 'Download Marksheet PDF'}
            </button>

            <div style={{ height: 28, width: 1, background: '#e2e8f0' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{profile?.studentName}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Student &bull; {profile?.studentId}</div>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#1a56db', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14
              }}>
                {profile?.studentName?.[0] || 'S'}
              </div>
            </div>
          </div>
        </header>

        {/* TAB CONTENTS */}
        <main style={{ padding: '24px 28px', flex: 1 }}>

          {/* ============================================================== */}
          {/* TAB 1: OVERVIEW */}
          {/* ============================================================== */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Top Banner Student Card */}
              <div style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1a56db 60%, #0284c7 100%)',
                borderRadius: 16,
                padding: '24px 28px',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 20,
                boxShadow: '0 10px 25px rgba(26,86,219,0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  {profile?.photoPath ? (
                    <img
                      src={profile.photoPath}
                      alt={profile.studentName}
                      style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{
                      width: 72, height: 72, borderRadius: 16,
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 32, fontWeight: 800
                    }}>
                      {profile?.studentName?.[0] || 'S'}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 13, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
                      Enrolled Student
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, marginTop: 2 }}>{profile?.studentName}</div>
                    <div style={{ fontSize: 13, color: '#e0e7ff', marginTop: 4, display: 'flex', gap: 14 }}>
                      <span><strong>Reg No:</strong> {profile?.studentId}</span>
                      <span><strong>Roll No:</strong> {profile?.rollNumber}</span>
                      <span><strong>Class:</strong> {profile?.standard}th Standard - {profile?.section}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="btn btn-outline btn-sm"
                    style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
                  >
                    <i className="bi bi-person"></i> View Full Profile
                  </button>
                  <button
                    onClick={() => handleDownloadMarksheet()}
                    className="btn btn-sm"
                    style={{ background: '#ffffff', color: '#1a56db', fontWeight: 700 }}
                  >
                    <i className="bi bi-file-earmark-pdf"></i> Download Marksheet
                  </button>
                </div>
              </div>

              {/* 4 Attendance Summary Cards */}
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
                  Attendance Summary
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>

                  {/* Card 1: Total Working Days */}
                  <div style={{ background: '#fff', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: 12, fontWeight: 600 }}>
                      <span>Total Working Days</span>
                      <i className="bi bi-calendar-event" style={{ fontSize: 18, color: '#1a56db' }}></i>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginTop: 8 }}>
                      {attendance?.totalWorkingDays || 0}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Recorded class sessions</div>
                  </div>

                  {/* Card 2: Present Days */}
                  <div style={{ background: '#fff', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: 12, fontWeight: 600 }}>
                      <span>Present Days</span>
                      <i className="bi bi-check-circle-fill" style={{ fontSize: 18, color: '#10b981' }}></i>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981', marginTop: 8 }}>
                      {attendance?.presentDays || 0}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Days marked present</div>
                  </div>

                  {/* Card 3: Absent Days */}
                  <div style={{ background: '#fff', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: 12, fontWeight: 600 }}>
                      <span>Absent Days</span>
                      <i className="bi bi-x-circle-fill" style={{ fontSize: 18, color: '#ef4444' }}></i>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444', marginTop: 8 }}>
                      {attendance?.absentDays || 0}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Days marked absent</div>
                  </div>

                  {/* Card 4: Attendance Percentage */}
                  <div style={{ background: '#fff', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: 12, fontWeight: 600 }}>
                      <span>Attendance %</span>
                      <i className="bi bi-percent" style={{ fontSize: 18, color: getProgressColor(attPct) }}></i>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: getProgressColor(attPct), marginTop: 8 }}>
                      {attPct}%
                    </div>
                    <div style={{ fontSize: 11, color: attPct >= 75 ? '#10b981' : '#ef4444', marginTop: 4, fontWeight: 600 }}>
                      {attPct >= 75 ? '✓ Meets 75% Criteria' : '⚠ Below 75% Requirement'}
                    </div>
                  </div>
                </div>

                {/* Attendance Progress Bar */}
                <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 12, border: '1px solid #e2e8f0', marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                    <span>Overall Attendance Progress</span>
                    <span>{attPct}%</span>
                  </div>
                  <div style={{ height: 10, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(0, attPct))}%`,
                      background: getProgressColor(attPct),
                      borderRadius: 999,
                      transition: 'width 0.4s ease'
                    }}></div>
                  </div>
                </div>
              </div>

              {/* 4 Academic Performance Cards */}
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
                  Academic Overview
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>

                  <div style={{ background: '#fff', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Marks Obtained</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', marginTop: 6 }}>
                      {results?.totalObtainedMarks || 0}
                      <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}> / {results?.totalMaxMarks || 0}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Across all published examinations</div>
                  </div>

                  <div style={{ background: '#fff', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Overall Academic %</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#1a56db', marginTop: 6 }}>
                      {results?.overallPercentage || 0}%
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Cumulative aggregate percentage</div>
                  </div>

                  <div style={{ background: '#fff', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Overall Grade</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#7c3aed', marginTop: 6 }}>
                      {results?.overallGrade || '—'}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Grading: A+ (&ge;90%), A (&ge;80%), B+ (&ge;70%)</div>
                  </div>

                  <div style={{ background: '#fff', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Final Examination Status</div>
                    <div style={{
                      fontSize: 22, fontWeight: 800, marginTop: 8,
                      color: results?.resultStatus === 'PASS' ? '#10b981' : (results?.resultStatus === 'FAIL' ? '#ef4444' : '#64748b')
                    }}>
                      {results?.resultStatus === 'PASS' ? 'PASSED ✓' : (results?.resultStatus === 'FAIL' ? 'NEEDS IMPROVEMENT' : 'No Published Results')}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Certified by examination cell</div>
                  </div>
                </div>
              </div>

              {/* Recent Published Marks Preview Table */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>
                    Published Examination Marks
                  </div>
                  <button onClick={() => setActiveTab('marks')} className="btn btn-outline btn-sm">
                    View All Marks &rarr;
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ margin: 0 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', fontSize: 12 }}>
                        <th>Subject</th>
                        <th>Examination</th>
                        <th>Session</th>
                        <th style={{ textAlign: 'center' }}>Max Marks</th>
                        <th style={{ textAlign: 'center' }}>Marks Obtained</th>
                        <th style={{ textAlign: 'center' }}>Subject %</th>
                        <th style={{ textAlign: 'center' }}>Grade</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marks.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                            <i className="bi bi-inbox" style={{ fontSize: 24, display: 'block', marginBottom: 8 }}></i>
                            No examination marks have been published yet for your class.
                          </td>
                        </tr>
                      ) : (
                        marks.slice(0, 5).map((m, idx) => (
                          <tr key={idx} style={{ fontSize: 13 }}>
                            <td style={{ fontWeight: 600, color: '#1e293b' }}>{m.subject}</td>
                            <td><span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{m.examType}</span></td>
                            <td style={{ color: '#64748b' }}>{m.academicYear}</td>
                            <td style={{ textAlign: 'center' }}>{m.maxMarks}</td>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: '#1e293b' }}>{m.marksObtained}</td>
                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{m.percentage}%</td>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: '#1a56db' }}>{m.grade}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                                background: m.pass ? '#dcfce7' : '#fee2e2',
                                color: m.pass ? '#15803d' : '#b91c1c'
                              }}>
                                {m.pass ? 'PASS' : 'FAIL'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: MY PROFILE (READ ONLY) */}
          {/* ============================================================== */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>
              <div style={{
                background: '#fef3c7',
                border: '1px solid #fde68a',
                color: '#92400e',
                borderRadius: 12,
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 13
              }}>
                <i className="bi bi-shield-lock-fill" style={{ fontSize: 20 }}></i>
                <div>
                  <strong>Read-Only Access:</strong> Student profiles are verified against school administrative records. Only school authorities can modify student records.
                </div>
              </div>

              {/* Profile Card */}
              <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '28px' }}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid #f1f5f9' }}>
                  {profile?.photoPath ? (
                    <img
                      src={profile.photoPath}
                      alt={profile.studentName}
                      style={{ width: 90, height: 90, borderRadius: 18, objectFit: 'cover', border: '3px solid #1a56db' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{
                      width: 90, height: 90, borderRadius: 18,
                      background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 36, color: '#fff', fontWeight: 800
                    }}>
                      {profile?.studentName?.[0] || 'S'}
                    </div>
                  )}
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1e293b' }}>{profile?.studentName}</h2>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
                      Registration No: <strong style={{ color: '#1a56db' }}>{profile?.studentId}</strong> &bull; Roll No: <strong>{profile?.rollNumber}</strong>
                    </p>
                    <span style={{ display: 'inline-block', marginTop: 8, background: '#dbeafe', color: '#1e40af', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                      Class {profile?.standard}th &bull; Section {profile?.section}
                    </span>
                  </div>
                </div>

                {/* Section 1: Personal Info */}
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="bi bi-person-fill" style={{ color: '#1a56db' }}></i> Personal Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
                  <div className="profile-field">
                    <span className="profile-label">Full Name</span>
                    <span className="profile-val">{profile?.studentName || '—'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">Registration Number</span>
                    <span className="profile-val">{profile?.studentId || '—'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">Roll Number</span>
                    <span className="profile-val">{profile?.rollNumber || '—'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">Date of Birth</span>
                    <span className="profile-val">{profile?.dateOfBirth || '—'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">Gender</span>
                    <span className="profile-val">{profile?.gender || '—'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">Blood Group</span>
                    <span className="profile-val">{profile?.bloodGroup || 'O+ (Recorded)'}</span>
                  </div>
                </div>

                {/* Section 2: Academic Info */}
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="bi bi-mortarboard-fill" style={{ color: '#1a56db' }}></i> Academic Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
                  <div className="profile-field">
                    <span className="profile-label">Standard / Class</span>
                    <span className="profile-val">{profile?.standard}th Standard</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">Section</span>
                    <span className="profile-val">Section {profile?.section}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">Academic Session</span>
                    <span className="profile-val">2024–2025</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">Admission Status</span>
                    <span className="profile-val" style={{ color: '#10b981', fontWeight: 700 }}>Active Enrolled</span>
                  </div>
                </div>

                {/* Section 3: Contact Info */}
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="bi bi-telephone-fill" style={{ color: '#1a56db' }}></i> Contact & Residence Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div className="profile-field">
                    <span className="profile-label">Parent / Guardian Name</span>
                    <span className="profile-val">{profile?.parentName || '—'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">Parent Contact Mobile</span>
                    <span className="profile-val">{profile?.mobileNumber || '—'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">Student Email</span>
                    <span className="profile-val">{profile?.email || `${profile?.studentId?.toLowerCase()}@attenda.edu`}</span>
                  </div>
                  <div className="profile-field" style={{ gridColumn: 'span 2' }}>
                    <span className="profile-label">Residential Address</span>
                    <span className="profile-val">{profile?.address || 'Recorded on school admission file.'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: ATTENDANCE & MONTHLY CALENDAR */}
          {/* ============================================================== */}
          {activeTab === 'attendance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* 4 Attendance Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div style={{ background: '#fff', padding: '16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Total Working Days</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginTop: 4 }}>{attendance?.totalWorkingDays || 0}</div>
                </div>
                <div style={{ background: '#fff', padding: '16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Present Days</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>{attendance?.presentDays || 0}</div>
                </div>
                <div style={{ background: '#fff', padding: '16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Absent Days</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444', marginTop: 4 }}>{attendance?.absentDays || 0}</div>
                </div>
                <div style={{ background: '#fff', padding: '16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Attendance %</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: getProgressColor(attPct), marginTop: 4 }}>{attPct}%</div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div style={{ background: '#fff', padding: '18px 24px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                  <span>Required Attendance (Min 75%)</span>
                  <span style={{ color: getProgressColor(attPct), fontWeight: 800 }}>{attPct}%</span>
                </div>
                <div style={{ height: 12, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, attPct))}%`, background: getProgressColor(attPct), borderRadius: 999 }}></div>
                </div>
                <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 11, color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></span> Green: &ge; 75%</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }}></span> Orange: 60% - 74%</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span> Red: &lt; 60%</span>
                </div>
              </div>

              {/* Monthly Calendar View */}
              <div style={{ background: '#fff', padding: '24px', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
                      Monthly Attendance Calendar
                    </h3>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      Green: Present &bull; Red: Absent &bull; Gray: Weekend / No class
                    </div>
                  </div>

                  {/* Month / Year Navigator */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(y => y - 1); }
                        else { setSelectedMonth(m => m - 1); }
                      }}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    <span style={{ fontWeight: 700, fontSize: 13, minWidth: 120, textAlign: 'center' }}>
                      {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(y => y + 1); }
                        else { setSelectedMonth(m => m + 1); }
                      }}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, textAlign: 'center' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} style={{ fontWeight: 700, fontSize: 12, color: '#64748b', padding: '6px 0' }}>{d}</div>
                  ))}

                  {/* Empty slots for days prior to 1st of month */}
                  {[...Array(firstDayIndex)].map((_, i) => (
                    <div key={`empty-${i}`} style={{ height: 42 }}></div>
                  ))}

                  {/* Calendar Days */}
                  {[...Array(daysInMonth)].map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const status = monthlyAtt?.calendar?.[dateStr];

                    let bg = '#f8fafc';
                    let color = '#64748b';
                    let border = '1px solid #e2e8f0';

                    if (status === 'PRESENT') {
                      bg = '#dcfce7';
                      color = '#15803d';
                      border = '1px solid #86efac';
                    } else if (status === 'ABSENT') {
                      bg = '#fee2e2';
                      color = '#b91c1c';
                      border = '1px solid #fca5a5';
                    }

                    return (
                      <div
                        key={dayNum}
                        title={status ? `${dateStr}: ${status}` : `${dateStr}: No Record`}
                        style={{
                          height: 44,
                          borderRadius: 8,
                          background: bg,
                          color: color,
                          border: border,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{dayNum}</span>
                        {status && (
                          <span style={{ fontSize: 9, textTransform: 'uppercase' }}>
                            {status === 'PRESENT' ? 'P' : 'A'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Attendance History Table */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: 14 }}>
                  Detailed Attendance History (Read Only)
                </div>
                <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                  <table className="table" style={{ margin: 0 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', fontSize: 12 }}>
                        <th>Date</th>
                        <th>Day of Week</th>
                        <th>Status</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!attendance?.records || attendance.records.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                            No attendance history recorded.
                          </td>
                        </tr>
                      ) : (
                        attendance.records.map((r, i) => (
                          <tr key={i} style={{ fontSize: 13 }}>
                            <td style={{ fontWeight: 600 }}>{r.date}</td>
                            <td style={{ color: '#64748b' }}>{r.day}</td>
                            <td>
                              <span style={{
                                padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                                background: r.status === 'PRESENT' ? '#dcfce7' : '#fee2e2',
                                color: r.status === 'PRESENT' ? '#15803d' : '#b91c1c'
                              }}>
                                {r.status}
                              </span>
                            </td>
                            <td style={{ color: '#64748b', fontSize: 12 }}>{r.remarks}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: MY MARKS */}
          {/* ============================================================== */}
          {activeTab === 'marks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Header & Examination Selector */}
              <div style={{
                background: '#fff', padding: '18px 24px', borderRadius: 14,
                border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: 14
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' }}>Subject-wise Marks</h3>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    Official published marks recorded in student evaluation register.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <select
                    className="form-select"
                    style={{ fontSize: 13, minWidth: 160 }}
                    value={selectedExam}
                    onChange={(e) => handleExamFilterChange(e.target.value)}
                  >
                    <option value="">All Examinations</option>
                    <option value="Unit Test 1">Unit Test 1</option>
                    <option value="Unit Test 2">Unit Test 2</option>
                    <option value="Quarterly Examination">Quarterly Examination</option>
                    <option value="Half-Yearly Examination">Half-Yearly Examination</option>
                    <option value="Annual Examination">Annual Examination</option>
                  </select>

                  <button
                    onClick={() => handleDownloadMarksheet(selectedExam)}
                    disabled={pdfDownloading}
                    className="btn btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                  >
                    <i className="bi bi-file-earmark-pdf"></i> Download PDF
                  </button>
                </div>
              </div>

              {/* Marks Table */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', fontSize: 12 }}>
                      <th>Subject Name</th>
                      <th>Exam Name</th>
                      <th style={{ textAlign: 'center' }}>Maximum Marks</th>
                      <th style={{ textAlign: 'center' }}>Obtained Marks</th>
                      <th style={{ textAlign: 'center' }}>Subject %</th>
                      <th style={{ textAlign: 'center' }}>Grade</th>
                      <th style={{ textAlign: 'center' }}>Pass / Fail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                          <i className="bi bi-file-text" style={{ fontSize: 32, display: 'block', marginBottom: 8 }}></i>
                          No published marks found for the selected examination criteria.
                        </td>
                      </tr>
                    ) : (
                      <>
                        {marks.map((m, idx) => (
                          <tr key={idx} style={{ fontSize: 13 }}>
                            <td style={{ fontWeight: 700, color: '#1e293b' }}>{m.subject}</td>
                            <td><span style={{ background: '#e0e7ff', color: '#4338ca', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{m.examType}</span></td>
                            <td style={{ textAlign: 'center' }}>{m.maxMarks}</td>
                            <td style={{ textAlign: 'center', fontWeight: 800, color: '#1e293b' }}>{m.marksObtained}</td>
                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{m.percentage}%</td>
                            <td style={{ textAlign: 'center', fontWeight: 800, color: '#1a56db' }}>{m.grade}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                                background: m.pass ? '#dcfce7' : '#fee2e2',
                                color: m.pass ? '#15803d' : '#b91c1c'
                              }}>
                                {m.pass ? 'PASS' : 'FAIL'}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {/* Summary Total Row */}
                        {results && (
                          <tr style={{ background: '#f8fafc', fontWeight: 800, fontSize: 13 }}>
                            <td colSpan="2">TOTAL ACADEMIC AGGREGATE</td>
                            <td style={{ textAlign: 'center' }}>{results.totalMaxMarks}</td>
                            <td style={{ textAlign: 'center', color: '#1a56db' }}>{results.totalObtainedMarks}</td>
                            <td style={{ textAlign: 'center' }}>{results.overallPercentage}%</td>
                            <td style={{ textAlign: 'center', color: '#7c3aed' }}>{results.overallGrade}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800,
                                background: results.resultStatus === 'PASS' ? '#dcfce7' : '#fee2e2',
                                color: results.resultStatus === 'PASS' ? '#15803d' : '#b91c1c'
                              }}>
                                {results.resultStatus}
                              </span>
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: EXAMINATION RESULTS */}
          {/* ============================================================== */}
          {activeTab === 'results' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Filter Card */}
              <div style={{
                background: '#fff', padding: '18px 24px', borderRadius: 14,
                border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: 14
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' }}>Examination Results</h3>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    Official published evaluation results certified by school administration.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <select
                    className="form-select"
                    style={{ fontSize: 13, minWidth: 160 }}
                    value={selectedExam}
                    onChange={(e) => handleExamFilterChange(e.target.value)}
                  >
                    <option value="">All Examinations</option>
                    {results?.availableExams?.map(ex => (
                      <option key={ex} value={ex}>{ex}</option>
                    ))}
                  </select>

                  <select
                    className="form-select"
                    style={{ fontSize: 13, minWidth: 140 }}
                    value={selectedYearFilter}
                    onChange={(e) => handleYearFilterChange(e.target.value)}
                  >
                    <option value="">All Sessions</option>
                    {results?.availableYears?.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleDownloadMarksheet(selectedExam)}
                    disabled={pdfDownloading}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                  >
                    <i className="bi bi-file-earmark-pdf"></i> Download Official Marksheet
                  </button>
                </div>
              </div>

              {/* Result Summary Banner */}
              {results && results.totalMaxMarks > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc, #edf2f7)',
                  borderRadius: 16,
                  padding: '20px 24px',
                  border: '1px solid #e2e8f0',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 16,
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Total Maximum</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', marginTop: 4 }}>{results.totalMaxMarks}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Total Obtained</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#1a56db', marginTop: 4 }}>{results.totalObtainedMarks}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Overall Percentage</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#0ea5e9', marginTop: 4 }}>{results.overallPercentage}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Academic Grade</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#7c3aed', marginTop: 4 }}>{results.overallGrade}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Final Verdict</div>
                    <div style={{
                      fontSize: 18, fontWeight: 800, marginTop: 4,
                      color: results.resultStatus === 'PASS' ? '#10b981' : '#ef4444'
                    }}>
                      {results.resultStatus === 'PASS' ? 'PASSED ✓' : 'FAILED'}
                    </div>
                  </div>
                </div>
              )}

              {/* Subject Breakdown Table */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', fontSize: 12 }}>
                      <th>Subject</th>
                      <th>Exam</th>
                      <th style={{ textAlign: 'center' }}>Max Marks</th>
                      <th style={{ textAlign: 'center' }}>Obtained</th>
                      <th style={{ textAlign: 'center' }}>Percentage</th>
                      <th style={{ textAlign: 'center' }}>Grade</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!results?.subjectMarks || results.subjectMarks.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                          No published results match this selection.
                        </td>
                      </tr>
                    ) : (
                      results.subjectMarks.map((s, idx) => (
                        <tr key={idx} style={{ fontSize: 13 }}>
                          <td style={{ fontWeight: 700 }}>{s.subject}</td>
                          <td><span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{s.examType}</span></td>
                          <td style={{ textAlign: 'center' }}>{s.maxMarks}</td>
                          <td style={{ textAlign: 'center', fontWeight: 800 }}>{s.marksObtained}</td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{s.percentage}%</td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: '#1a56db' }}>{s.grade}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                              background: s.pass ? '#dcfce7' : '#fee2e2',
                              color: s.pass ? '#15803d' : '#b91c1c'
                            }}>
                              {s.pass ? 'PASS' : 'FAIL'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: ACADEMIC PERFORMANCE & ANALYTICS */}
          {/* ============================================================== */}
          {activeTab === 'performance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Top Overview Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Overall Percentage</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#1a56db', marginTop: 4 }}>
                    {performance?.overallPercentage || 0}%
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Aggregated across all tests</div>
                </div>

                <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Overall Grade</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#7c3aed', marginTop: 4 }}>
                    {performance?.overallGrade || '—'}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>School board grading scale</div>
                </div>

                <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Attendance Correlation</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: getProgressColor(performance?.attendancePercentage || 0), marginTop: 4 }}>
                    {performance?.attendancePercentage || 0}%
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Consistent attendance factor</div>
                </div>
              </div>

              {/* Subject-Wise Performance Progress Bars */}
              <div style={{ background: '#fff', padding: '24px', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
                  Subject-wise Academic Mastery
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {!performance?.subjectPerformance || performance.subjectPerformance.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                      No subject marks recorded yet to build performance charts.
                    </div>
                  ) : (
                    performance.subjectPerformance.map((sub, i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                          <span style={{ color: '#1e293b' }}>{sub.subject}</span>
                          <span>
                            <strong style={{ color: '#1a56db' }}>{sub.percentage}%</strong>
                            <span style={{ color: '#64748b', marginLeft: 8 }}>({sub.obtained} / {sub.max} marks &bull; Grade {sub.grade})</span>
                          </span>
                        </div>
                        <div style={{ height: 10, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min(100, Math.max(0, sub.percentage))}%`,
                            background: sub.percentage >= 75 ? '#10b981' : (sub.percentage >= 50 ? '#3b82f6' : '#ef4444'),
                            borderRadius: 999,
                            transition: 'width 0.4s ease'
                          }}></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Examination-Wise Trend Progression */}
              <div style={{ background: '#fff', padding: '24px', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
                  Examination-wise Performance Progression
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  {!performance?.examProgress || performance.examProgress.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 20, color: '#94a3b8' }}>
                      No examination history available.
                    </div>
                  ) : (
                    performance.examProgress.map((ex, i) => (
                      <div key={i} style={{ background: '#f8fafc', padding: '16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: 12, color: '#4338ca', fontWeight: 700, background: '#e0e7ff', display: 'inline-block', padding: '2px 8px', borderRadius: 6 }}>
                          {ex.examType}
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginTop: 10 }}>
                          {ex.percentage}%
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                          Score: {ex.totalObtained} / {ex.totalMax} &bull; Grade: <strong>{ex.grade}</strong>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      <style>{`
        .profile-field {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .profile-label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .profile-val {
          font-size: 14px;
          color: #1e293b;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
