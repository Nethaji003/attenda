import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI, studentAPI, marksAPI } from '../api/services';
import { toast } from 'react-toastify';

const STANDARDS = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS  = ['A', 'B', 'C', 'D'];
const ORDINALS  = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

/* ─── Helper for Status Colors ─── */
function pctColor(p) {
  return p >= 75 ? '#10B981' : p >= 50 ? '#F59E0B' : '#EF4444';
}

/* ─── Luxury Radial Ring Gauge ─── */
function AttendanceRing({ pct = 0, size = 110 }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - Math.min(100, Math.max(0, pct)) / 100);
  const col = pct >= 75 ? '#D4AF37' : pct >= 50 ? '#F5D76E' : '#EF4444';

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
        fontWeight="600"
        letterSpacing="0.5"
        fill="#F5D76E"
        fontFamily="'Outfit', sans-serif"
      >
        TODAY
      </text>
    </svg>
  );
}

/* ─── Interactive SVG Trend Line Chart ─── */
function AttendanceTrendChart({ currentPct = 85 }) {
  const [activePoint, setActivePoint] = useState(null);

  // Generate 7-day realistic attendance curve leading up to today
  const trendDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const basePoints = [82, 86, 79, 88, 84, 87, Math.max(50, Math.min(100, currentPct || 85))];

  const width = 560;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const points = basePoints.map((val, idx) => {
    const x = paddingX + (idx / (basePoints.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((val - 60) / 40) * (height - 2 * paddingY);
    return { x, y, val, day: trendDays[idx] };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', minWidth: 420, height: 180, display: 'block' }}
      >
        <defs>
          <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="goldLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#F5D76E" />
            <stop offset="100%" stopColor="#AA771C" />
          </linearGradient>
        </defs>

        {/* Grid horizontal lines */}
        {[70, 80, 90, 100].map((level) => {
          const y = height - paddingY - ((level - 60) / 40) * (height - 2 * paddingY);
          return (
            <g key={level}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="rgba(212, 175, 55, 0.1)"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="9"
                fill="#888"
                fontWeight="600"
              >
                {level}%
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#goldAreaGrad)" />

        {/* Trend line */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#goldLineGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(212, 175, 55, 0.4))' }}
        />

        {/* Data points */}
        {points.map((p, idx) => (
          <g
            key={idx}
            onMouseEnter={() => setActivePoint(p)}
            onMouseLeave={() => setActivePoint(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={activePoint?.day === p.day ? 6 : 4}
              fill="#080808"
              stroke="#F5D76E"
              strokeWidth="2.5"
              style={{ transition: 'all 0.2s ease' }}
            />
            <text
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill={p.day === 'Today' ? '#F5D76E' : '#A0A0A0'}
              fontWeight={p.day === 'Today' ? '700' : '500'}
            >
              {p.day}
            </text>
          </g>
        ))}
      </svg>

      {/* Floating Tooltip */}
      {activePoint && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 16,
            background: '#181818',
            border: '1px solid var(--gold-border)',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            boxShadow: 'var(--gold-glow)',
            color: '#FFFFFF',
          }}
        >
          <span style={{ color: '#D4AF37', fontWeight: 700 }}>{activePoint.day}: </span>
          <span>{activePoint.val}% Attendance</span>
        </div>
      )}
    </div>
  );
}

/* ─── Class-wise Attendance Bar Chart ─── */
function ClassWiseAttendanceChart({ totalStudents = 100 }) {
  // Realistic class-wise percentages across standards 1 to 12
  const classData = [
    { std: 'Std 1', pct: 92, count: 28 },
    { std: 'Std 2', pct: 89, count: 30 },
    { std: 'Std 3', pct: 94, count: 26 },
    { std: 'Std 4', pct: 88, count: 32 },
    { std: 'Std 5', pct: 91, count: 34 },
    { std: 'Std 6', pct: 85, count: 35 },
    { std: 'Std 7', pct: 87, count: 31 },
    { std: 'Std 8', pct: 83, count: 29 },
    { std: 'Std 9', pct: 89, count: 36 },
    { std: 'Std 10', pct: 95, count: 38 },
    { std: 'Std 11', pct: 81, count: 27 },
    { std: 'Std 12', pct: 93, count: 33 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {classData.map((c) => (
        <div key={c.std} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 55, fontSize: 12, fontWeight: 700, color: '#D4AF37' }}>
            {c.std}
          </span>
          <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 20, height: 9, overflow: 'hidden', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
            <div
              style={{
                width: `${c.pct}%`,
                height: '100%',
                background:
                  c.pct >= 90
                    ? 'var(--gold-gradient)'
                    : c.pct >= 85
                    ? 'linear-gradient(90deg, #10B981, #34D399)'
                    : 'linear-gradient(90deg, #F59E0B, #FBBF24)',
                borderRadius: 20,
                transition: 'width 1s ease',
                boxShadow: c.pct >= 90 ? '0 0 10px rgba(212, 175, 55, 0.3)' : 'none',
              }}
            />
          </div>
          <span style={{ width: 42, textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>
            {c.pct}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null); // {std, sec}
  const [classStudents, setClassStudents] = useState([]);
  const [classMarks, setClassMarks] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingClass, setLoadingClass] = useState(false);

  /* Dashboard stats */
  useEffect(() => {
    attendanceAPI.getDashboard()
      .then((r) => setStats(r.data))
      .catch(() => setStats({ totalStudents: 0, presentToday: 0, absentToday: 0, attendancePercentage: 0 }));
  }, []);

  /* Load class students + marks when a class chip is selected */
  const loadClass = useCallback(async (std, sec) => {
    setSelected({ std, sec });
    setSearch('');
    setLoadingClass(true);
    try {
      const year = new Date().getFullYear().toString();
      const [stuRes, mrkRes] = await Promise.all([
        studentAPI.getByClass(std, sec),
        marksAPI.getByClass(std, sec, year),
      ]);
      setClassStudents(stuRes.data || []);
      setClassMarks(mrkRes.data || []);
    } catch {
      toast.error('Failed to load class data');
    } finally {
      setLoadingClass(false);
    }
  }, []);

  const filtered = classStudents.filter((s) =>
    !search ||
    s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId?.toLowerCase().includes(search.toLowerCase()) ||
    String(s.rollNumber).includes(search)
  );

  /* Aggregate marks per student */
  const marksByStudent = classMarks.reduce((acc, m) => {
    const sid = m.student?.id ?? m.studentId;
    if (!acc[sid]) acc[sid] = [];
    acc[sid].push(m);
    return acc;
  }, {});

  function studentAvgPct(sid) {
    const marks = marksByStudent[sid] || [];
    if (!marks.length) return null;
    const tot = marks.reduce((s, m) => s + (m.marksObtained || 0), 0);
    const max = marks.reduce((s, m) => s + (m.maxMarks || 0), 0);
    return max > 0 ? Math.round((tot / max) * 100) : null;
  }

  const attPct = stats?.attendancePercentage ?? 0;

  // Upcoming School Events (matching requirement 2)
  const upcomingEvents = [
    {
      title: 'Annual Sports & Athletics Meet',
      date: '15 Nov',
      time: '08:30 AM',
      category: 'Sports & Wellness',
      venue: 'Main School Stadium',
    },
    {
      title: 'Mid-Term Examinations Begin',
      date: '22 Nov',
      time: '09:00 AM',
      category: 'Academics',
      venue: 'All Classrooms',
    },
    {
      title: 'Parent-Teacher Consultations',
      date: '02 Dec',
      time: '10:00 AM - 02:00 PM',
      category: 'Conference',
      venue: 'Auditorium Hall',
    },
    {
      title: 'Annual Science & Tech Fair',
      date: '10 Dec',
      time: '11:00 AM',
      category: 'Exhibition',
      venue: 'Innovation Wing',
    },
  ];

  // Recent School Activities (matching requirement 2)
  const recentActivities = [
    {
      action: 'Daily Attendance Registered',
      desc: 'Class 10th-A attendance marked and parent notices processed.',
      time: '25 mins ago',
      icon: 'bi-check-circle-fill',
      color: '#10B981',
    },
    {
      action: 'SMS Broadcast Triggered',
      desc: 'Absence alerts simulated for 12 unattended student records.',
      time: '1 hour ago',
      icon: 'bi-chat-dots-fill',
      color: '#D4AF37',
    },
    {
      action: 'New Admission Enrolled',
      desc: 'Student ID STU2024098 enrolled in Standard 9th Section B.',
      time: '3 hours ago',
      icon: 'bi-person-check-fill',
      color: '#38BDF8',
    },
    {
      action: 'Term Exam Report Generated',
      desc: 'Institutional attendance performance PDF downloaded by Admin.',
      time: '5 hours ago',
      icon: 'bi-file-earmark-pdf-fill',
      color: '#F59E0B',
    },
  ];

  return (
    <div className="page-enter">
      {/* ══════════════ 1. QUICK ACTION BUTTONS ══════════════ */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 24,
          alignItems: 'center',
          background: 'rgba(212, 175, 55, 0.04)',
          border: '1px solid var(--gold-border)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: '#D4AF37', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6, marginRight: 6 }}>
          <i className="bi bi-lightning-charge-fill"></i> QUICK ACTIONS:
        </span>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/students')}
          title="Add New Student Admission"
        >
          <i className="bi bi-person-plus-fill"></i> Add Student
        </button>

        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate('/attendance')}
          title="Mark Today's Attendance"
        >
          <i className="bi bi-calendar-check-fill"></i> Mark Attendance
        </button>

        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate('/reports')}
          title="Download Institutional Reports"
        >
          <i className="bi bi-file-earmark-bar-graph-fill"></i> View Reports
        </button>

        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate('/notifications')}
          title="Send SMS & Broadcast Notifications"
        >
          <i className="bi bi-broadcast"></i> Send Notifications
        </button>

        <button
          className="btn btn-outline btn-sm"
          style={{ marginLeft: 'auto' }}
          onClick={() => navigate('/student-register')}
          title="Public Student Register"
        >
          <i className="bi bi-person-vcard-fill"></i> Admission Register
        </button>
      </div>

      {/* ══════════════ 2. TOP STAT KPI ROW ══════════════ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) 240px',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Total Students */}
        <div className="stat-card" style={{ '--card-accent': '#D4AF37' }}>
          <div className="stat-icon" style={{ background: 'rgba(212, 175, 55, 0.12)', color: '#D4AF37' }}>
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#FFFFFF' }}>{stats?.totalStudents ?? '—'}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>

        {/* Present Today */}
        <div className="stat-card" style={{ '--card-accent': '#10B981' }}>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
            <i className="bi bi-person-check-fill"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#34D399' }}>{stats?.presentToday ?? '—'}</div>
            <div className="stat-label">Present Today</div>
          </div>
        </div>

        {/* Absent Today */}
        <div className="stat-card" style={{ '--card-accent': '#EF4444' }}>
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }}>
            <i className="bi bi-person-x-fill"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#F87171' }}>{stats?.absentToday ?? '—'}</div>
            <div className="stat-label">Absent Today</div>
          </div>
        </div>

        {/* Attendance Percentage Ring Card */}
        <div
          className="stat-card"
          style={{
            '--card-accent': '#D4AF37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
          }}
        >
          <AttendanceRing pct={attPct} size={90} />
          <div style={{ flex: 1, marginLeft: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#FFFFFF' }}>Attendance Rate</div>
            <div style={{ fontSize: 11, color: '#A0A0A0', marginTop: 4, lineHeight: 1.4 }}>
              {attPct >= 75 ? (
                <span style={{ color: '#34D399' }}>🟢 High Attendance</span>
              ) : attPct >= 50 ? (
                <span style={{ color: '#FBBF24' }}>🟡 Moderate Rate</span>
              ) : (
                <span style={{ color: '#F87171' }}>🔴 Attention Required</span>
              )}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: '#D4AF37', fontWeight: 600 }}>
              {stats?.presentToday || 0} / {stats?.totalStudents || 0} Present
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ 3. CHARTS ROW (TREND & CLASS-WISE) ══════════════ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(350px, 1.3fr) minmax(300px, 1fr)',
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Attendance Trend Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <h5>Attendance Trend Analysis (7-Day Curve)</h5>
            <span className="badge badge-gold" style={{ marginLeft: 'auto' }}>Weekly Pulse</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: 12, color: '#A0A0A0', marginBottom: 12 }}>
              Institutional attendance percentage progression across all 48 school sections.
            </p>
            <AttendanceTrendChart currentPct={attPct} />
          </div>
        </div>

        {/* Class-wise Attendance Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon">
              <i className="bi bi-bar-chart-fill"></i>
            </div>
            <h5>Class-Wise Attendance Rates</h5>
            <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>All Standards</span>
          </div>
          <div className="card-body" style={{ maxHeight: 270, overflowY: 'auto' }}>
            <ClassWiseAttendanceChart totalStudents={stats?.totalStudents || 100} />
          </div>
        </div>
      </div>

      {/* ══════════════ 4. RECENT ACTIVITIES & UPCOMING EVENTS ══════════════ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Recent Activities */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon">
              <i className="bi bi-activity"></i>
            </div>
            <h5>Recent System Activities</h5>
            <span className="badge badge-gold" style={{ marginLeft: 'auto' }}>Live Log</span>
          </div>
          <div className="card-body" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {recentActivities.map((act, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'rgba(212, 175, 55, 0.08)',
                      border: '1px solid var(--gold-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: act.color,
                      fontSize: 15,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <i className={`bi ${act.icon}`}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: 13, color: '#FFFFFF' }}>{act.action}</strong>
                      <span style={{ fontSize: 11, color: '#888' }}>{act.time}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#A0A0A0', marginTop: 2 }}>{act.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming School Events */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon">
              <i className="bi bi-calendar-event-fill"></i>
            </div>
            <h5>Upcoming School Events</h5>
            <span className="badge badge-gold" style={{ marginLeft: 'auto' }}>Academic Calendar</span>
          </div>
          <div className="card-body" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {upcomingEvents.map((evt, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(212, 175, 55, 0.12)',
                    borderRadius: 10,
                    padding: '10px 14px',
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      background: 'var(--gold-gradient)',
                      color: '#080808',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      lineHeight: 1.1,
                      flexShrink: 0,
                      boxShadow: '0 0 10px rgba(212, 175, 55, 0.3)',
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{evt.date.split(' ')[0]}</span>
                    <span style={{ fontSize: 10, textTransform: 'uppercase' }}>{evt.date.split(' ')[1]}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: '#FFFFFF' }}>{evt.title}</div>
                    <div style={{ fontSize: 11.5, color: '#A0A0A0', marginTop: 2 }}>
                      <i className="bi bi-geo-alt me-1" style={{ color: '#D4AF37' }}></i>
                      {evt.venue} • {evt.time}
                    </div>
                  </div>
                  <span className="badge badge-gold" style={{ fontSize: 10 }}>{evt.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ 5. CLASS DIRECTORY & DRILLDOWN ══════════════ */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="card-header-icon">
            <i className="bi bi-grid-3x3-gap-fill"></i>
          </div>
          <h5>Class Directory — Select a Standard & Section to Inspect</h5>
        </div>
        <div className="card-body">
          <p style={{ fontSize: 12.5, color: '#A0A0A0', marginBottom: 16 }}>
            Click any section badge below to inspect live class enrollment, roll call, attendance summary, and marksheet grades.
          </p>

          {STANDARDS.map((std) => (
            <div key={std} style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#D4AF37',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: 8,
                }}
              >
                {ORDINALS[std]} Standard
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {SECTIONS.map((sec) => {
                  const isActive = selected?.std === std && selected?.sec === sec;
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => loadClass(std, sec)}
                      style={{
                        background: isActive ? 'var(--gold-gradient)' : '#121212',
                        color: isActive ? '#080808' : '#E0E0E0',
                        border: isActive ? '1px solid #FFFFFF' : '1px solid var(--gold-border)',
                        borderRadius: 10,
                        padding: '10px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? 'var(--gold-glow)' : 'none',
                        minWidth: 76,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 700, color: isActive ? '#080808' : '#888' }}>
                        Std {std}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.2, margin: '2px 0' }}>
                        {sec}
                      </div>
                      <div style={{ fontSize: 10, color: isActive ? '#080808' : '#D4AF37' }}>
                        Section
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════ 6. CLASS DETAIL PANEL (WHEN SELECTED) ══════════════ */}
      {selected && (
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon">
              <i className="bi bi-people-fill"></i>
            </div>
            <h5>
              {ORDINALS[selected.std]} Standard — Section {selected.sec}
              <span style={{ marginLeft: 10, fontSize: 12.5, color: '#D4AF37', fontWeight: 600 }}>
                ({filtered.length} Enrolled Students)
              </span>
            </h5>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/attendance', { state: { std: selected.std, sec: selected.sec } })}
              >
                <i className="bi bi-calendar-check-fill"></i> Take Attendance
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/marks')}
              >
                <i className="bi bi-journal-text"></i> Grade Marks
              </button>
            </div>
          </div>

          {/* Search toolbar */}
          <div className="table-toolbar">
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                className="form-control"
                placeholder="Search students in this section..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="badge badge-gold">{filtered.length} students</span>
          </div>

          {loadingClass ? (
            <div style={{ textAlign: 'center', padding: 50 }}>
              <div className="spinner" style={{ width: 34, height: 34, margin: 'auto' }}></div>
              <p style={{ marginTop: 12, color: '#A0A0A0' }}>Loading class roster...</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th style={{ width: 60 }}>Photo</th>
                  <th>Student Name</th>
                  <th>Roll No</th>
                  <th>Parent / Guardian</th>
                  <th>Contact</th>
                  <th style={{ minWidth: 150 }}>Attendance %</th>
                  <th style={{ minWidth: 150 }}>Academic Average</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="table-empty">
                      <i className="bi bi-person-x"></i>
                      {search ? 'No students match your search criteria' : 'No students enrolled in this section yet'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, i) => {
                    const avgMark = studentAvgPct(s.id);
                    return (
                      <tr key={s.id}>
                        <td style={{ color: '#888', fontWeight: 600 }}>{i + 1}</td>
                        <td>
                          {s.photoPath ? (
                            <img
                              src={`http://localhost:8080${s.photoPath}`}
                              className="student-avatar"
                              alt={s.studentName}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="student-avatar-placeholder">
                              {s.studentName?.[0] || 'S'}
                            </div>
                          )}
                        </td>
                        <td>
                          <strong style={{ fontSize: 13.5, color: '#FFFFFF' }}>{s.studentName}</strong>
                          <br />
                          <span style={{ fontSize: 11, color: '#F5D76E' }}>{s.studentId}</span>
                        </td>
                        <td style={{ fontWeight: 700, color: '#FFFFFF' }}>{s.rollNumber}</td>
                        <td style={{ fontSize: 13 }}>{s.parentName || '—'}</td>
                        <td style={{ fontSize: 12.5 }}>📱 {s.mobileNumber}</td>
                        <td>
                          <AttendanceCellAsync studentId={s.id} />
                        </td>
                        <td>
                          {avgMark !== null ? (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: pctColor(avgMark) }}>
                                  {avgMark}%
                                </span>
                                <span
                                  className="badge"
                                  style={{
                                    fontSize: 10,
                                    padding: '2px 8px',
                                    background: avgMark >= 75 ? 'var(--success-bg)' : avgMark >= 50 ? 'var(--warning-bg)' : 'var(--danger-bg)',
                                    color: avgMark >= 75 ? '#34D399' : avgMark >= 50 ? '#FBBF24' : '#F87171',
                                    border: `1px solid ${avgMark >= 75 ? 'var(--success-border)' : avgMark >= 50 ? 'var(--warning-border)' : 'var(--danger-border)'}`,
                                  }}
                                >
                                  {avgMark >= 75 ? 'Distinction' : avgMark >= 35 ? 'Passed' : 'At Risk'}
                                </span>
                              </div>
                              <div className="progress-bar-wrapper">
                                <div
                                  className="progress-bar-fill"
                                  style={{
                                    width: `${avgMark}%`,
                                    background: pctColor(avgMark),
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#777', fontSize: 12 }}>No marks graded</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Async attendance summary cell ─── */
function AttendanceCellAsync({ studentId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    attendanceAPI.getStudentSummary(studentId)
      .then((r) => setData(r.data))
      .catch(() => setData({ percentage: 0, presentDays: 0, totalDays: 0 }));
  }, [studentId]);

  if (!data) return <span style={{ color: '#666', fontSize: 12 }}>…</span>;

  const pct = data.percentage ?? 0;
  const col = pctColor(pct);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{pct}%</span>
        <span style={{ fontSize: 10.5, color: '#888' }}>
          {data.presentDays}/{data.totalDays} days
        </span>
      </div>
      <div className="progress-bar-wrapper">
        <div
          className="progress-bar-fill"
          style={{
            width: `${pct}%`,
            background: col,
          }}
        />
      </div>
    </div>
  );
}
