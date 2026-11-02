import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { attendanceAPI } from '../api/services';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const STANDARDS = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS  = ['A', 'B', 'C', 'D'];

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

  // Attendance History Tab/View (Section 4 Requirement)
  const [viewTab, setViewTab] = useState('sheet'); // 'sheet' | 'history'
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadSheet = useCallback(async () => {
    if (!std || !sec || !date) return;
    setLoading(true);
    setSearch('');
    try {
      const res = await attendanceAPI.getSheet(std, sec, date);
      const studentSheet = res.data || [];
      setSheet(studentSheet);

      const map = {};
      studentSheet.forEach((s) => {
        map[s.studentId] = s.status || 'PRESENT';
      });
      setStatuses(map);
    } catch {
      toast.error('Failed to load attendance sheet for selected class');
    } finally {
      setLoading(false);
    }
  }, [std, sec, date]);

  useEffect(() => {
    loadSheet();
  }, [loadSheet]);

  // Load class attendance history
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const now = new Date();
      const res = await attendanceAPI.getMonthlyReport(std, sec, now.getFullYear(), now.getMonth() + 1);
      const records = res.data || [];

      // Group by date
      const grouped = records.reduce((acc, r) => {
        const d = r.attendanceDate;
        if (!acc[d]) acc[d] = { date: d, present: 0, absent: 0, leave: 0, total: 0 };
        acc[d].total++;
        if (r.status === 'PRESENT') acc[d].present++;
        else if (r.status === 'LEAVE') acc[d].leave++;
        else acc[d].absent++;
        return acc;
      }, {});

      setHistoryData(Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date)));
    } catch {
      toast.error('Failed to load class attendance history');
    } finally {
      setLoadingHistory(false);
    }
  }, [std, sec]);

  useEffect(() => {
    if (viewTab === 'history') {
      loadHistory();
    }
  }, [viewTab, loadHistory]);

  const toggle = (studentId, status) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const map = {};
    sheet.forEach((s) => {
      map[s.studentId] = status;
    });
    setStatuses(map);
    toast.info(`Marked all students as ${status}`);
  };

  const saveAttendance = async () => {
    if (sheet.length === 0) {
      toast.warning('No student roster found to save');
      return;
    }
    const unmarked = sheet.filter((s) => !statuses[s.studentId]);
    if (unmarked.length > 0) {
      toast.warning(`${unmarked.length} student(s) still have pending marks`);
      return;
    }

    setSaving(true);
    try {
      const res = await attendanceAPI.save({
        standard: std,
        section: sec,
        date: date,
        entries: sheet.map((s) => ({
          studentId: s.studentId,
          status: statuses[s.studentId] || 'PRESENT',
        })),
        markedBy: user?.username || user?.fullName || 'ADMIN',
      });
      setShowSmsResult(res.data);
      toast.success('Attendance saved and notifications logged! 🎉');
      loadSheet();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const filtered = sheet.filter(
    (s) =>
      !search ||
      s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      s.studentIdCode?.toLowerCase().includes(search.toLowerCase()) ||
      String(s.rollNumber).includes(search)
  );

  const presentCount = Object.values(statuses).filter((v) => v === 'PRESENT').length;
  const absentCount  = Object.values(statuses).filter((v) => v === 'ABSENT').length;
  const leaveCount   = Object.values(statuses).filter((v) => v === 'LEAVE').length;
  const totalCount   = sheet.length;
  const attPct       = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div className="page-enter">
      {/* ── TOP CONTROLS CARD ── */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="card-header-icon">
            <i className="bi bi-calendar-check-fill"></i>
          </div>
          <h5>Class Attendance Console</h5>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button
              className={`btn btn-sm ${viewTab === 'sheet' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setViewTab('sheet')}
            >
              <i className="bi bi-check2-square"></i> Mark Sheet
            </button>
            <button
              className={`btn btn-sm ${viewTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setViewTab('history')}
            >
              <i className="bi bi-clock-history"></i> Attendance History
            </button>
          </div>
        </div>

        <div className="card-body">
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* Standard */}
            <div>
              <label className="form-label">Standard</label>
              <select
                className="form-select"
                style={{ width: 140 }}
                value={std}
                onChange={(e) => setStd(Number(e.target.value))}
              >
                {STANDARDS.map((s) => (
                  <option key={s} value={s}>
                    Standard {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="form-label">Section</label>
              <select
                className="form-select"
                style={{ width: 120 }}
                value={sec}
                onChange={(e) => setSec(e.target.value)}
              >
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="form-label">Attendance Date</label>
              <input
                type="date"
                className="form-control"
                style={{ width: 160 }}
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <button
              className="btn btn-outline"
              onClick={() => setDate(today)}
              title="Set to today's date"
            >
              Today
            </button>

            <button
              className="btn btn-primary"
              onClick={loadSheet}
              disabled={loading}
            >
              <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i> Load Sheet
            </button>
          </div>
        </div>
      </div>

      {viewTab === 'sheet' ? (
        <>
          {/* ── ATTENDANCE SUMMARY BAR (Section 4 Requirement) ── */}
          {sheet.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr)) minmax(180px, 1.2fr)',
                gap: 12,
                marginBottom: 20,
              }}
            >
              {/* Total */}
              <div
                style={{
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid var(--gold-border)',
                  borderRadius: 12,
                  padding: '12px 18px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
                  {totalCount}
                </div>
                <div style={{ fontSize: 11, color: '#D4AF37', fontWeight: 700, textTransform: 'uppercase', marginTop: 4 }}>
                  Total Enrolled
                </div>
              </div>

              {/* Present */}
              <div
                style={{
                  background: 'var(--success-bg)',
                  border: '1px solid var(--success-border)',
                  borderRadius: 12,
                  padding: '12px 18px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: '#34D399', lineHeight: 1 }}>
                  {presentCount}
                </div>
                <div style={{ fontSize: 11, color: '#34D399', fontWeight: 700, textTransform: 'uppercase', marginTop: 4 }}>
                  Present Today
                </div>
              </div>

              {/* Absent */}
              <div
                style={{
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  borderRadius: 12,
                  padding: '12px 18px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: '#F87171', lineHeight: 1 }}>
                  {absentCount}
                </div>
                <div style={{ fontSize: 11, color: '#F87171', fontWeight: 700, textTransform: 'uppercase', marginTop: 4 }}>
                  Absent Today
                </div>
              </div>

              {/* Leave */}
              <div
                style={{
                  background: 'var(--warning-bg)',
                  border: '1px solid var(--warning-border)',
                  borderRadius: 12,
                  padding: '12px 18px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: '#FBBF24', lineHeight: 1 }}>
                  {leaveCount}
                </div>
                <div style={{ fontSize: 11, color: '#FBBF24', fontWeight: 700, textTransform: 'uppercase', marginTop: 4 }}>
                  Approved Leave
                </div>
              </div>

              {/* Attendance % Metric Card */}
              <div
                style={{
                  background: '#121212',
                  border: '1px solid var(--gold-border)',
                  borderRadius: 12,
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#A0A0A0', fontWeight: 600 }}>Attendance:</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#F5D76E' }}>{attPct}%</span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${attPct}%`,
                        background:
                          attPct >= 75
                            ? 'var(--gold-gradient)'
                            : attPct >= 50
                            ? '#F59E0B'
                            : '#EF4444',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ATTENDANCE SHEET TABLE ── */}
          <div className="table-wrapper">
            <div className="table-toolbar">
              {/* Search box */}
              <div className="search-box">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search students in this class..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Bulk Quick Marks */}
              {sheet.length > 0 && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: 'var(--success-border)', color: '#34D399' }}
                    onClick={() => markAll('PRESENT')}
                  >
                    <i className="bi bi-check-all"></i> Mark All Present
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: 'var(--danger-border)', color: '#F87171' }}
                    onClick={() => markAll('ABSENT')}
                  >
                    <i className="bi bi-x-circle"></i> Mark All Absent
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: 'var(--warning-border)', color: '#FBBF24' }}
                    onClick={() => markAll('LEAVE')}
                  >
                    <i className="bi bi-pause-circle"></i> Mark All Leave
                  </button>
                </div>
              )}

              {/* Save Attendance Button */}
              <div style={{ marginLeft: 'auto' }}>
                <button
                  className="btn btn-primary"
                  onClick={saveAttendance}
                  disabled={saving || sheet.length === 0}
                >
                  {saving ? (
                    <><div className="spinner"></div> Saving & Disagreeing SMS...</>
                  ) : (
                    <><i className="bi bi-save2-fill"></i> Save Attendance</>
                  )}
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div className="spinner" style={{ width: 36, height: 36, margin: 'auto' }}></div>
                <p style={{ marginTop: 12, color: '#A0A0A0' }}>Loading class roster...</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>Roll</th>
                    <th style={{ width: 60 }}>Photo</th>
                    <th>Student Name</th>
                    <th>Registration ID</th>
                    <th>Parent / Guardian</th>
                    <th>Contact</th>
                    <th style={{ textAlign: 'center', minWidth: 260 }}>Mark Attendance</th>
                    <th style={{ textAlign: 'center' }}>Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="table-empty">
                        <i className="bi bi-calendar-x"></i>
                        {sheet.length === 0
                          ? `No students registered in Std ${std}-${sec}`
                          : 'No students match your search criteria'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s) => {
                      const status = statuses[s.studentId];
                      return (
                        <tr key={s.studentId}>
                          <td>
                            <strong style={{ color: '#D4AF37', fontSize: 14 }}>
                              #{s.rollNumber}
                            </strong>
                          </td>
                          <td>
                            {s.photoPath ? (
                              <img
                                src={`http://localhost:8080${s.photoPath}`}
                                className="student-avatar"
                                alt=""
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="student-avatar-placeholder">
                                {s.studentName?.[0] || 'S'}
                              </div>
                            )}
                          </td>
                          <td>
                            <strong style={{ fontSize: 13.5, color: '#FFFFFF' }}>
                              {s.studentName}
                            </strong>
                          </td>
                          <td>
                            <span className="badge badge-gold">{s.studentIdCode}</span>
                          </td>
                          <td style={{ fontSize: 12.5 }}>{s.parentName || '—'}</td>
                          <td style={{ fontSize: 12.5 }}>📱 {s.mobileNumber}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="att-btn-group">
                              {/* Present */}
                              <button
                                type="button"
                                className={`att-btn present ${status === 'PRESENT' ? 'active' : ''}`}
                                onClick={() => toggle(s.studentId, 'PRESENT')}
                              >
                                <i className="bi bi-check-circle-fill"></i> Present
                              </button>

                              {/* Absent */}
                              <button
                                type="button"
                                className={`att-btn absent ${status === 'ABSENT' ? 'active' : ''}`}
                                onClick={() => toggle(s.studentId, 'ABSENT')}
                              >
                                <i className="bi bi-x-circle-fill"></i> Absent
                              </button>

                              {/* Leave */}
                              <button
                                type="button"
                                className={`att-btn leave ${status === 'LEAVE' ? 'active' : ''}`}
                                onClick={() => toggle(s.studentId, 'LEAVE')}
                              >
                                <i className="bi bi-clock-fill"></i> Leave
                              </button>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {status === 'PRESENT' && (
                              <span className="badge badge-present">✅ Present</span>
                            )}
                            {status === 'ABSENT' && (
                              <span className="badge badge-absent">❌ Absent</span>
                            )}
                            {status === 'LEAVE' && (
                              <span className="badge badge-leave">🟡 On Leave</span>
                            )}
                            {!status && (
                              <span className="badge badge-warning">⏳ Pending</span>
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
        </>
      ) : (
        /* ── ATTENDANCE HISTORY VIEW (Section 4 Requirement) ── */
        <div className="table-wrapper">
          <div className="table-toolbar">
            <h5 style={{ margin: 0, color: '#FFFFFF', fontSize: 15 }}>
              Attendance History Archive: Standard {std}-{sec}
            </h5>
            <span className="badge badge-gold" style={{ marginLeft: 'auto' }}>
              {historyData.length} Recorded Dates
            </span>
          </div>

          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: 50 }}>
              <div className="spinner" style={{ width: 34, height: 34, margin: 'auto' }}></div>
              <p style={{ marginTop: 12, color: '#A0A0A0' }}>Loading historical logs...</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total Enrolled</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>On Leave</th>
                  <th>Attendance %</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {historyData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-empty">
                      <i className="bi bi-journal-x"></i>
                      No prior attendance history recorded for Std {std}-{sec} in current period.
                    </td>
                  </tr>
                ) : (
                  historyData.map((h) => {
                    const pct = h.total > 0 ? Math.round((h.present / h.total) * 100) : 0;
                    return (
                      <tr key={h.date}>
                        <td>
                          <strong style={{ color: '#FFFFFF' }}>
                            {new Date(h.date).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </strong>
                        </td>
                        <td>{h.total}</td>
                        <td>
                          <span style={{ color: '#34D399', fontWeight: 700 }}>{h.present}</span>
                        </td>
                        <td>
                          <span style={{ color: '#F87171', fontWeight: 700 }}>{h.absent}</span>
                        </td>
                        <td>
                          <span style={{ color: '#FBBF24', fontWeight: 700 }}>{h.leave}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="progress-bar-wrapper" style={{ width: 90 }}>
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${pct}%`,
                                  background: pct >= 75 ? 'var(--gold-gradient)' : '#EF4444',
                                }}
                              />
                            </div>
                            <span style={{ fontWeight: 700, color: '#F5D76E' }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              setDate(h.date);
                              setViewTab('sheet');
                            }}
                          >
                            <i className="bi bi-eye-fill"></i> Inspect Sheet
                          </button>
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

      {/* ── SMS NOTIFICATION DELIVERY FEEDBACK MODAL ── */}
      {showSmsResult && (
        <div className="modal-overlay" onClick={() => setShowSmsResult(null)}>
          <div className="sms-popup" onClick={(e) => e.stopPropagation()}>
            <div className="sms-icon">📱</div>
            <h4 style={{ fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>
              Attendance Saved & Notified!
            </h4>
            <p style={{ color: '#A0A0A0', fontSize: 13, marginBottom: 16 }}>
              {showSmsResult.message || 'Parent notifications have been processed.'}
            </p>

            <div className="sms-stats">
              <div className="sms-stat">
                <div className="num" style={{ color: '#34D399' }}>{showSmsResult.smsSent || 0}</div>
                <div className="lbl">Live Sent</div>
              </div>
              <div className="sms-stat">
                <div className="num" style={{ color: '#F5D76E' }}>{showSmsResult.smsSimulated || 0}</div>
                <div className="lbl">Simulated</div>
              </div>
              <div className="sms-stat">
                <div className="num" style={{ color: '#F87171' }}>{showSmsResult.smsFailed || 0}</div>
                <div className="lbl">Failed</div>
              </div>
            </div>

            {showSmsResult.smsSimulated > 0 && (
              <p style={{ fontSize: 11.5, color: '#D4AF37', marginTop: 10, lineHeight: 1.4 }}>
                ℹ️ Messages were safely simulated and logged in the database. (Live cellular carrier SMS requires active Twilio credentials in application.properties).
              </p>
            )}

            <button
              className="btn btn-primary"
              style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
              onClick={() => setShowSmsResult(null)}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
