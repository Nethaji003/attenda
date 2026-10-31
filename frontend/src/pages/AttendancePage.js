import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { attendanceAPI } from '../api/services';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const STANDARDS = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS = ['A', 'B', 'C', 'D'];

export default function AttendancePage() {
  const location = useLocation();
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const [std, setStd] = useState(location.state?.std || 1);
  const [sec, setSec] = useState(location.state?.sec || 'A');
  const [date, setDate] = useState(today);
  const [sheet, setSheet] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSmsResult, setShowSmsResult] = useState(null);

  const loadSheet = useCallback(async () => {
  if (!std || !sec || !date) return;

  setLoading(true);
  setSearch('');

  try {
    const res = await attendanceAPI.getSheet(std, sec, date);
    setSheet(res.data);

    const map = {};
    res.data.forEach(s => {
      map[s.studentId] = s.status || 'PRESENT';
    });

    setStatuses(map);
  } catch {
    toast.error('Failed to load attendance sheet');
  } finally {
    setLoading(false);
  }
}, [std, sec, date]);
  useEffect(() => {
  loadSheet();
}, [loadSheet]);

  const toggle = (studentId, status) => {
    setStatuses(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const map = {};
    sheet.forEach(s => { map[s.studentId] = status; });
    setStatuses(map);
    toast.info(`All students marked as ${status}`);
  };

  const saveAttendance = async () => {
    if (sheet.length === 0) { toast.warning('No students to save'); return; }
    const unmarked = sheet.filter(s => !statuses[s.studentId]);
    if (unmarked.length > 0) { toast.warning(`${unmarked.length} students not marked`); return; }

    setSaving(true);
    try {
      const res = await attendanceAPI.save({
        standard: std,
        section: sec,
        date: date,
        entries: sheet.map(s => ({ studentId: s.studentId, status: statuses[s.studentId] })),
        markedBy: user?.username
      });
      setShowSmsResult(res.data);
      toast.success('Attendance saved successfully! 🎉');
      loadSheet();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally { setSaving(false); }
  };

  const filtered = sheet.filter(s =>
    !search ||
    s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    String(s.rollNumber).includes(search)
  );

  const presentCount = Object.values(statuses).filter(v => v === 'PRESENT').length;
  const absentCount = Object.values(statuses).filter(v => v === 'ABSENT').length;

  return (
    <div>
      {/* Controls */}
      <div className="card mb-3">
        <div className="card-body">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label className="form-label">Standard</label>
              <select className="form-select" style={{ width: 140 }} value={std} onChange={e => setStd(Number(e.target.value))}>
                {STANDARDS.map(s => <option key={s} value={s}>Standard {s}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Section</label>
              <select className="form-select" style={{ width: 110 }} value={sec} onChange={e => setSec(e.target.value)}>
                {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Date</label>
              <input type="date" className="form-control" style={{ width: 160 }} value={date}
                onChange={e => setDate(e.target.value)} max={today} />
            </div>
            <button className="btn btn-primary" onClick={loadSheet} disabled={loading}>
              <i className="bi bi-arrow-clockwise"></i> Load
            </button>
          </div>
        </div>
      </div>

      {/* Summary Bar */}
      {sheet.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', val: sheet.length, color: '#1a56db', bg: '#dbeafe' },
            { label: 'Present', val: presentCount, color: '#10b981', bg: '#dcfce7' },
            { label: 'Absent', val: absentCount, color: '#ef4444', bg: '#fee2e2' },
            { label: 'Not Marked', val: sheet.length - presentCount - absentCount, color: '#f59e0b', bg: '#fef9c3' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, padding: '10px 20px', borderRadius: 10, textAlign: 'center', minWidth: 90 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-success btn-sm" onClick={() => markAll('PRESENT')}>
              <i className="bi bi-check-all"></i> Mark All Present
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => markAll('ABSENT')}>
              <i className="bi bi-x-circle"></i> Mark All Absent
            </button>
          </div>
        </div>
      )}

      {/* Attendance Sheet */}
      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input type="text" className="form-control" placeholder="Search students..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-primary" onClick={saveAttendance} disabled={saving || sheet.length === 0}>
              {saving
                ? <><div className="spinner"></div> Saving & Sending SMS...</>
                : <><i className="bi bi-save2-fill"></i> Save Attendance</>
              }
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 36, height: 36, margin: 'auto', borderColor: 'rgba(26,86,219,.2)', borderTopColor: '#1a56db' }}></div>
            <p style={{ marginTop: 12, color: '#64748b' }}>Loading attendance sheet...</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Roll</th><th>Photo</th><th>Student Name</th><th>Student ID</th>
                <th>Parent</th><th>Mobile</th>
                <th style={{ textAlign: 'center' }}>Attendance</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="table-empty">
                  <i className="bi bi-calendar-x"></i>
                  {sheet.length === 0
                    ? `No students registered in Std ${std}-${sec}`
                    : 'No students match search'
                  }
                </td></tr>
              ) : filtered.map(s => {
                const status = statuses[s.studentId];
                return (
                  <tr key={s.studentId}>
                    <td><strong style={{ color: '#1a56db' }}>{s.rollNumber}</strong></td>
                    <td>
                      {s.photoPath
                        ? <img src={`http://localhost:8080${s.photoPath}`} className="student-avatar" alt="" />
                        : <div className="student-avatar-placeholder">{s.studentName?.[0]}</div>
                      }
                    </td>
                    <td><strong>{s.studentName}</strong></td>
                    <td><span className="badge badge-primary">{s.studentIdCode}</span></td>
                    <td style={{ fontSize: 12 }}>{s.parentName}</td>
                    <td style={{ fontSize: 12 }}>📱 {s.mobileNumber}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="att-btn-group" style={{ justifyContent: 'center' }}>
                        <button
                          className={`att-btn present ${status === 'PRESENT' ? 'active' : ''}`}
                          onClick={() => toggle(s.studentId, 'PRESENT')}>
                          <i className="bi bi-check-circle-fill"></i> Present
                        </button>
                        <button
                          className={`att-btn absent ${status === 'ABSENT' ? 'active' : ''}`}
                          onClick={() => toggle(s.studentId, 'ABSENT')}>
                          <i className="bi bi-x-circle-fill"></i> Absent
                        </button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {status === 'PRESENT' && <span className="badge badge-present">✅ Present</span>}
                      {status === 'ABSENT' && <span className="badge badge-absent">❌ Absent</span>}
                      {!status && <span className="badge badge-warning">⏳ Pending</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* SMS Result Popup */}
      {showSmsResult && (
        <div className="modal-overlay" onClick={() => setShowSmsResult(null)}>
          <div className="sms-popup" onClick={e => e.stopPropagation()}>
            <div className="sms-icon">📱</div>
            <h5 style={{ fontWeight: 700, marginBottom: 4 }}>Attendance Saved!</h5>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>SMS notifications sent to parents</p>
            <div className="sms-stats">
              <div className="sms-stat">
                <div className="num" style={{ color: '#10b981' }}>{showSmsResult.smsSent || 0}</div>
                <div className="lbl">Sent</div>
              </div>
              <div className="sms-stat">
                <div className="num" style={{ color: '#1a56db' }}>{showSmsResult.smsSimulated || 0}</div>
                <div className="lbl">Simulated</div>
              </div>
              <div className="sms-stat">
                <div className="num" style={{ color: '#ef4444' }}>{showSmsResult.smsFailed || 0}</div>
                <div className="lbl">Failed</div>
              </div>
            </div>
            {(showSmsResult.smsSimulated > 0) && (
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
                💡 Configure Twilio in application.properties to send real SMS
              </p>
            )}
            <button className="btn btn-primary" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
              onClick={() => setShowSmsResult(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
