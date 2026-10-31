import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI, studentAPI, marksAPI } from '../api/services';
import { toast } from 'react-toastify';

const STANDARDS = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS  = ['A', 'B', 'C', 'D'];
const ORDINALS  = ['','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];

/* ─── small helpers ──────────────────────────────────────── */
function pctColor(p) {
  return p >= 75 ? '#10b981' : p >= 50 ? '#f59e0b' : '#ef4444';
}

/** SVG ring gauge for attendance % */
function AttendanceRing({ pct = 0, size = 120 }) {
  const r   = 46;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - pct / 100);
  const col  = pctColor(pct);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none"
        stroke={col} strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={fill}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="50" y="47" textAnchor="middle" fontSize="18" fontWeight="900"
        fill={col} fontFamily="Inter,sans-serif">{pct}%</text>
      <text x="50" y="61" textAnchor="middle" fontSize="8"
        fill="rgba(255,255,255,.4)" fontFamily="Inter,sans-serif">Attendance</text>
    </svg>
  );
}

/** Thin progress bar */
function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: 8, height: 7, width: '100%', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 8, transition: 'width .8s ease' }} />
    </div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin   { to{transform:rotate(360deg)} }
  .dash-card { animation: fadeUp .4s ease both; }
  .cls-chip2 { border-radius:12px; padding:14px 18px; cursor:pointer; text-align:center;
    transition:all .22s cubic-bezier(.34,1.56,.64,1); }
  .cls-chip2:hover { transform:translateY(-4px) scale(1.05); }
  .sub-badge { display:inline-flex; align-items:center; padding:4px 12px; border-radius:20px;
    font-size:11px; font-weight:700; }
`;

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats,        setStats]        = useState(null);
  const [selected,     setSelected]     = useState(null);   // {std, sec}
  const [classStudents,setClassStudents] = useState([]);
  const [classMarks,   setClassMarks]   = useState([]);
  const [search,       setSearch]       = useState('');
  const [loadingClass, setLoadingClass]  = useState(false);

  /* dashboard stats */
  useEffect(() => {
    attendanceAPI.getDashboard()
      .then(r => setStats(r.data))
      .catch(() => setStats({ totalStudents: 0, presentToday: 0, absentToday: 0, attendancePercentage: 0 }));
  }, []);

  /* load class students + marks when a class is selected */
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
      setClassStudents(stuRes.data);
      setClassMarks(mrkRes.data);
    } catch {
      toast.error('Failed to load class data');
    } finally { setLoadingClass(false); }
  }, []);

  const filtered = classStudents.filter(s =>
    !search ||
    s.studentName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase()) ||
    String(s.rollNumber).includes(search)
  );

  /* aggregate marks per student */
  const marksByStudent = classMarks.reduce((acc, m) => {
    if (!acc[m.student?.id ?? m.studentId]) acc[m.student?.id ?? m.studentId] = [];
    acc[m.student?.id ?? m.studentId].push(m);
    return acc;
  }, {});

  function studentAvgPct(sid) {
    const marks = marksByStudent[sid] || [];
    if (!marks.length) return null;
    const tot = marks.reduce((s, m) => s + m.marksObtained, 0);
    const max = marks.reduce((s, m) => s + m.maxMarks, 0);
    return max > 0 ? Math.round((tot / max) * 100) : null;
  }

  const attPct = stats?.attendancePercentage ?? 0;

  /* ── top stat cards ─────────────────────────────────────── */
  const statCards = [
    { label: 'Total Students',  val: stats?.totalStudents    ?? '—', icon: '👥', col: '#6366f1', bg: 'rgba(99,102,241,.15)'  },
    { label: 'Present Today',   val: stats?.presentToday     ?? '—', icon: '✅', col: '#10b981', bg: 'rgba(16,185,129,.15)'  },
    { label: 'Absent Today',    val: stats?.absentToday      ?? '—', icon: '❌', col: '#ef4444', bg: 'rgba(239,68,68,.15)'   },
  ];

  return (
    <div>
      <style>{CSS}</style>

      {/* ══════════════ TOP ROW ══════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr)) 200px', gap: 16, marginBottom: 24 }}>

        {/* Stat Cards */}
        {statCards.map((c, i) => (
          <div key={c.label} className="stat-card dash-card" style={{ animationDelay: `${i * 0.08}s`, '--card-accent': c.col }}>
            <div className="stat-icon" style={{ background: c.bg, color: c.col, fontSize: 22 }}>{c.icon}</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: c.col }}>{c.val}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}

        {/* Attendance Ring Card */}
        <div className="stat-card dash-card" style={{ animationDelay: '.24s', '--card-accent': pctColor(attPct), flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <AttendanceRing pct={attPct} size={100} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b' }}>Today's Rate</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, lineHeight: 1.5 }}>
              {attPct >= 75
                ? '🟢 Good attendance'
                : attPct >= 50
                  ? '🟡 Moderate attendance'
                  : '🔴 Low attendance'}
            </div>
            <div style={{ marginTop: 8 }}>
              <ProgressBar value={stats?.presentToday ?? 0} max={stats?.totalStudents ?? 1} color={pctColor(attPct)} />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ QUICK INSIGHT BARS ══════════════ */}
      <div className="card mb-4 dash-card" style={{ animationDelay: '.32s' }}>
        <div className="card-header">
          <div className="card-header-icon"><i className="bi bi-bar-chart-fill"></i></div>
          <h5>Attendance Overview</h5>
        </div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
          {[
            { label: 'Present',    val: stats?.presentToday ?? 0, max: stats?.totalStudents ?? 1, col: '#10b981', icon: '✅' },
            { label: 'Absent',     val: stats?.absentToday  ?? 0, max: stats?.totalStudents ?? 1, col: '#ef4444', icon: '❌' },
            { label: 'Attendance', val: attPct, max: 100, col: pctColor(attPct), icon: '📊', suffix: '%' },
          ].map(item => (
            <div key={item.label} style={{
              background: '#f8fafc', borderRadius: 14, padding: '14px 16px',
              border: '1.5px solid #e2e8f0',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{item.icon} {item.label}</span>
                <span style={{ fontWeight: 900, fontSize: 18, color: item.col }}>
                  {item.val}{item.suffix || ''}
                </span>
              </div>
              <ProgressBar value={item.val} max={item.max} color={item.col} />
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════ CLASS GRID ══════════════ */}
      <div className="card mb-4 dash-card" style={{ animationDelay: '.4s' }}>
        <div className="card-header">
          <div className="card-header-icon"><i className="bi bi-grid-3x3-gap-fill"></i></div>
          <h5>Class Directory — Click a section to view students, attendance & marks</h5>
        </div>
        <div className="card-body">
          {STANDARDS.map(std => (
            <div key={std} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8 }}>
                {ORDINALS[std]} Standard
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {SECTIONS.map(sec => {
                  const isActive = selected?.std === std && selected?.sec === sec;
                  return (
                    <div key={sec} className="cls-chip2"
                      onClick={() => loadClass(std, sec)}
                      style={{
                        background: isActive ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#f8fafc',
                        border: isActive ? '2px solid #6366f1' : '1.5px solid #e2e8f0',
                        boxShadow: isActive ? '0 4px 18px rgba(99,102,241,.4)' : '0 2px 8px rgba(0,0,0,.06)',
                        minWidth: 80,
                      }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: isActive ? 'rgba(255,255,255,.7)' : '#94a3b8' }}>Std {std}</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: isActive ? '#fff' : '#1e293b', lineHeight: 1.1, margin: '4px 0' }}>{sec}</div>
                      <div style={{ fontSize: 10, color: isActive ? 'rgba(255,255,255,.6)' : '#94a3b8' }}>Section</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════ CLASS DETAIL PANEL ══════════════ */}
      {selected && (
        <div className="card dash-card" style={{ animationDelay: '0s' }}>
          <div className="card-header">
            <div className="card-header-icon"><i className="bi bi-people-fill"></i></div>
            <h5>
              {ORDINALS[selected.std]} Std — Section {selected.sec}
              <span style={{ marginLeft: 8, fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                ({filtered.length} students)
              </span>
            </h5>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm"
                onClick={() => navigate('/attendance', { state: { std: selected.std, sec: selected.sec } })}>
                <i className="bi bi-calendar-check"></i> Take Attendance
              </button>
              <button className="btn btn-outline btn-sm"
                onClick={() => navigate('/marks')}>
                <i className="bi bi-journal-text"></i> Marks
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="table-toolbar">
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input type="text" className="form-control" placeholder="Search students…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <span className="badge badge-primary">{filtered.length} students</span>
          </div>

          {loadingClass ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <div className="spinner" style={{ width: 32, height: 32, borderColor: 'rgba(99,102,241,.2)', borderTopColor: '#6366f1', margin: 'auto' }}></div>
              <p style={{ marginTop: 10, color: '#64748b' }}>Loading…</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Roll</th>
                  <th>Parent</th>
                  <th>Mobile</th>
                  <th style={{ minWidth: 140 }}>Attendance %</th>
                  <th style={{ minWidth: 150 }}>Avg Marks %</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="table-empty">
                    <i className="bi bi-person-x"></i>
                    {search ? 'No students match search' : 'No students in this class'}
                  </td></tr>
                ) : filtered.map((s, i) => {
                  const avgMark = studentAvgPct(s.id);
                  return (
                    <tr key={s.id}>
                      <td style={{ color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                      <td>
                        {s.photoPath
                          ? <img src={`http://localhost:8080${s.photoPath}`} className="student-avatar" alt={s.studentName} />
                          : <div className="student-avatar-placeholder" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>{s.studentName[0]}</div>
                        }
                      </td>
                      <td>
                        <strong style={{ fontSize: 14 }}>{s.studentName}</strong>
                        <br /><span style={{ fontSize: 11, color: '#94a3b8' }}>{s.studentId}</span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{s.rollNumber}</td>
                      <td style={{ fontSize: 13 }}>{s.parentName || '—'}</td>
                      <td style={{ fontSize: 13 }}>📱 {s.mobileNumber}</td>

                      {/* Attendance % cell */}
                      <td>
                        <AttendanceCellAsync studentId={s.id} />
                      </td>

                      {/* Avg Marks % cell */}
                      <td>
                        {avgMark !== null ? (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: pctColor(avgMark) }}>{avgMark}%</span>
                              <span className="sub-badge" style={{
                                background: avgMark >= 75 ? '#dcfce7' : avgMark >= 50 ? '#fef3c7' : '#fee2e2',
                                color: pctColor(avgMark), fontSize: 10,
                              }}>
                                {avgMark >= 75 ? 'Pass' : avgMark >= 33 ? 'Average' : 'Low'}
                              </span>
                            </div>
                            <ProgressBar value={avgMark} max={100} color={pctColor(avgMark)} />
                          </div>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: 12 }}>No marks</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Async attendance cell (fetches per-student summary) ─── */
function AttendanceCellAsync({ studentId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    attendanceAPI.getStudentSummary(studentId)
      .then(r => setData(r.data))
      .catch(() => setData({ percentage: 0, presentDays: 0, totalDays: 0 }));
  }, [studentId]);

  if (!data) return <span style={{ color: '#cbd5e1', fontSize: 12 }}>…</span>;

  const pct = data.percentage ?? 0;
  const col = pctColor(pct);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{pct}%</span>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>{data.presentDays}/{data.totalDays}d</span>
      </div>
      <div style={{ background: 'rgba(0,0,0,.07)', borderRadius: 8, height: 7, width: '100%', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 8, transition: 'width .8s ease' }} />
      </div>
    </div>
  );
}
