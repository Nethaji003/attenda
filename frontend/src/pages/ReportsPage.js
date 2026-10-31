import React, { useState } from 'react';
import { attendanceAPI, reportAPI } from '../api/services';
import { toast } from 'react-toastify';

const STANDARDS = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS = ['A', 'B', 'C', 'D'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const downloadBlob = (data, filename, type) => {
  const url = window.URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  window.URL.revokeObjectURL(url);
};

export default function ReportsPage() {
  const today = new Date().toISOString().split('T')[0];
  const [tab, setTab] = useState('daily');
  const [dailyDate, setDailyDate] = useState(today);
  const [dailyData, setDailyData] = useState([]);
  const [loadingDaily, setLoadingDaily] = useState(false);

  const [monthStd, setMonthStd] = useState(1);
  const [monthSec, setMonthSec] = useState('A');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthData, setMonthData] = useState([]);
  const [loadingMonth, setLoadingMonth] = useState(false);

  const loadDaily = async () => {
    setLoadingDaily(true);
    try {
      const res = await attendanceAPI.getDailyReport(dailyDate);
      setDailyData(res.data);
    } catch { toast.error('Failed to load report'); }
    finally { setLoadingDaily(false); }
  };

  const loadMonthly = async () => {
    setLoadingMonth(true);
    try {
      const res = await attendanceAPI.getMonthlyReport(monthStd, monthSec, year, month);
      setMonthData(res.data);
    } catch { toast.error('Failed to load report'); }
    finally { setLoadingMonth(false); }
  };

  const downloadDailyPdf = async () => {
    try {
      const res = await reportAPI.downloadDailyPdf(dailyDate);
      downloadBlob(res.data, `attendance_${dailyDate}.pdf`, 'application/pdf');
      toast.success('PDF downloaded');
    } catch { toast.error('PDF download failed'); }
  };

  const downloadDailyExcel = async () => {
    try {
      const res = await reportAPI.downloadDailyExcel(dailyDate);
      downloadBlob(res.data, `attendance_${dailyDate}.xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      toast.success('Excel downloaded');
    } catch { toast.error('Excel download failed'); }
  };

  // Group monthly data by date
  const monthGrouped = monthData.reduce((acc, r) => {
    const key = r.attendanceDate;
    if (!acc[key]) acc[key] = { present: 0, absent: 0 };
    r.status === 'PRESENT' ? acc[key].present++ : acc[key].absent++;
    return acc;
  }, {});

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {[['daily', 'bi-calendar-day', 'Daily Report'], ['monthly', 'bi-calendar-month', 'Monthly Report']].map(([t, icon, label]) => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab(t)}>
            <i className={`bi ${icon}`}></i> {label}
          </button>
        ))}
      </div>

      {tab === 'daily' && (
        <div>
          <div className="card mb-3">
            <div className="card-body">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div>
                  <label className="form-label">Select Date</label>
                  <input type="date" className="form-control" style={{ width: 180 }} value={dailyDate}
                    onChange={e => setDailyDate(e.target.value)} max={today} />
                </div>
                <button className="btn btn-primary" onClick={loadDaily} disabled={loadingDaily}>
                  <i className="bi bi-search"></i> Generate Report
                </button>
                {dailyData.length > 0 && (
                  <>
                    <button className="btn btn-danger" onClick={downloadDailyPdf}>
                      <i className="bi bi-file-pdf"></i> Download PDF
                    </button>
                    <button className="btn btn-success" onClick={downloadDailyExcel}>
                      <i className="bi bi-file-excel"></i> Download Excel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {dailyData.length > 0 && (
            <>
              {/* Summary */}
              <div className="stats-grid" style={{ marginBottom: 16 }}>
                {[
                  { label: 'Total', value: dailyData.length, color: '#1a56db', bg: '#dbeafe' },
                  { label: 'Present', value: dailyData.filter(r => r.status === 'PRESENT').length, color: '#10b981', bg: '#dcfce7' },
                  { label: 'Absent', value: dailyData.filter(r => r.status === 'ABSENT').length, color: '#ef4444', bg: '#fee2e2' },
                  { label: 'Attendance %', value: `${Math.round(dailyData.filter(r => r.status === 'PRESENT').length / dailyData.length * 100)}%`, color: '#7c3aed', bg: '#ede9fe' },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, padding: '16px 20px', borderRadius: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 13, color: s.color, fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>#</th><th>Name</th><th>Std</th><th>Sec</th>
                      <th>Roll</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyData.map((r, i) => (
                      <tr key={r.id}>
                        <td style={{ color: '#94a3b8' }}>{i + 1}</td>
                        <td><strong>{r.studentName}</strong></td>
                        <td>{r.standard}</td>
                        <td>{r.section}</td>
                        <td>{r.rollNumber}</td>
                        <td>
                          <span className={`badge badge-${r.status.toLowerCase()}`}>
                            {r.status === 'PRESENT' ? '✅' : '❌'} {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'monthly' && (
        <div>
          <div className="card mb-3">
            <div className="card-body">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div>
                  <label className="form-label">Standard</label>
                  <select className="form-select" style={{ width: 130 }} value={monthStd} onChange={e => setMonthStd(Number(e.target.value))}>
                    {STANDARDS.map(s => <option key={s} value={s}>Std {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Section</label>
                  <select className="form-select" style={{ width: 110 }} value={monthSec} onChange={e => setMonthSec(e.target.value)}>
                    {SECTIONS.map(s => <option key={s} value={s}>Sec {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Month</label>
                  <select className="form-select" style={{ width: 140 }} value={month} onChange={e => setMonth(Number(e.target.value))}>
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Year</label>
                  <input type="number" className="form-control" style={{ width: 100 }} value={year}
                    onChange={e => setYear(Number(e.target.value))} min={2020} max={2030} />
                </div>
                <button className="btn btn-primary" onClick={loadMonthly} disabled={loadingMonth}>
                  <i className="bi bi-search"></i> Generate
                </button>
              </div>
            </div>
          </div>

          {Object.keys(monthGrouped).length > 0 && (
            <div className="table-wrapper">
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 700 }}>
                Monthly Summary — Std {monthStd}-{monthSec} — {MONTHS[month - 1]} {year}
              </div>
              <table>
                <thead>
                  <tr><th>Date</th><th>Present</th><th>Absent</th><th>Total</th><th>Attendance %</th></tr>
                </thead>
                <tbody>
                  {Object.entries(monthGrouped).sort().map(([date, d]) => {
                    const total = d.present + d.absent;
                    const pct = Math.round(d.present / total * 100);
                    return (
                      <tr key={date}>
                        <td><strong>{new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</strong></td>
                        <td><span style={{ color: '#10b981', fontWeight: 700 }}>{d.present}</span></td>
                        <td><span style={{ color: '#ef4444', fontWeight: 700 }}>{d.absent}</span></td>
                        <td>{total}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="progress-bar-wrapper" style={{ width: 80 }}>
                              <div className="progress-bar-fill"
                                style={{ width: `${pct}%`, background: pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444' }} />
                            </div>
                            <span style={{ fontWeight: 700 }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
