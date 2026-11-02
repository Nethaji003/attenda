import React, { useState, useEffect } from 'react';
import { marksAPI, studentAPI, reportAPI } from '../api/services';
import { toast } from 'react-toastify';

const STANDARDS = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS  = ['A', 'B', 'C', 'D'];
const SUBJECTS  = ['Mathematics', 'Science', 'English', 'Tamil', 'Hindi', 'Social Studies', 'Computer', 'Physical Education'];
const EXAM_TYPES = ['Unit Test 1', 'Unit Test 2', 'Quarterly Examination', 'Half-Yearly Examination', 'Annual Examination', 'FA1', 'FA2', 'SA1', 'SA2'];

const emptyMark = {
  subject: '',
  marksObtained: '',
  maxMarks: 100,
  examType: 'Unit Test 1',
  academicYear: '2024-25',
  published: true,
};

export default function MarksPage() {
  const [std, setStd] = useState(1);
  const [sec, setSec] = useState('A');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyMark);
  const [editMarkId, setEditMarkId] = useState(null);

  useEffect(() => {
    studentAPI.getByClass(std, sec)
      .then((r) => {
        setStudents(r.data || []);
        setSelectedStudent(null);
        setMarks([]);
      })
      .catch(() => toast.error('Failed to load class students'));
  }, [std, sec]);

  const loadMarks = async (studentId) => {
    setSelectedStudent(studentId);
    setLoading(true);
    try {
      const res = await marksAPI.getByStudent(studentId);
      setMarks(res.data || []);
    } catch {
      toast.error('Failed to load student marks');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudent);
    if (!student) {
      toast.error('Please select a student from the left panel first');
      return;
    }

    const data = {
      ...form,
      marksObtained: Number(form.marksObtained),
      maxMarks: Number(form.maxMarks),
      student: { id: selectedStudent },
      standard: std,
      section: sec,
    };

    try {
      if (editMarkId) await marksAPI.update(editMarkId, data);
      else await marksAPI.add(data);
      toast.success('Academic marks recorded successfully! 📝');
      setShowModal(false);
      setEditMarkId(null);
      setForm(emptyMark);
      loadMarks(selectedStudent);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save marks');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this graded mark entry?')) return;
    try {
      await marksAPI.delete(id);
      toast.success('Mark entry deleted');
      loadMarks(selectedStudent);
    } catch {
      toast.error('Delete failed');
    }
  };

  const openEdit = (mark) => {
    setForm({
      subject: mark.subject,
      marksObtained: mark.marksObtained,
      maxMarks: mark.maxMarks,
      examType: mark.examType,
      academicYear: mark.academicYear,
      published: mark.published ?? true,
    });
    setEditMarkId(mark.id);
    setShowModal(true);
  };

  const downloadStudentPdf = async () => {
    if (!selectedStudent) return;
    try {
      const res = await reportAPI.downloadStudentPdf(selectedStudent);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `student_${selectedStudent}_academic_report.pdf`;
      a.click();
      toast.success('Report PDF downloaded! 📄');
    } catch {
      toast.error('Download failed');
    }
  };

  const selectedStudentData = students.find((s) => s.id === selectedStudent);

  return (
    <div className="page-enter" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 300px) 1fr', gap: 20 }}>
      {/* ── LEFT PANEL: STUDENT SELECTOR ── */}
      <div className="card" style={{ alignSelf: 'start' }}>
        <div className="card-header">
          <div className="card-header-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <h5>Select Class & Student</h5>
        </div>
        <div className="card-body" style={{ padding: '14px 16px' }}>
          {/* Class Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <select
              className="form-select"
              style={{ flex: 1 }}
              value={std}
              onChange={(e) => setStd(Number(e.target.value))}
            >
              {STANDARDS.map((s) => (
                <option key={s} value={s}>
                  Std {s}
                </option>
              ))}
            </select>
            <select
              className="form-select"
              style={{ width: 90 }}
              value={sec}
              onChange={(e) => setSec(e.target.value)}
            >
              {SECTIONS.map((s) => (
                <option key={s} value={s}>
                  Sec {s}
                </option>
              ))}
            </select>
          </div>

          {/* Student list items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: '60vh', overflowY: 'auto' }}>
            {students.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#888', fontSize: 13 }}>
                No students enrolled in Std {std}-{sec}
              </div>
            ) : (
              students.map((s) => {
                const isSelected = selectedStudent === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => loadMarks(s.id)}
                    style={{
                      background: isSelected ? 'var(--gold-gradient)' : 'rgba(255, 255, 255, 0.02)',
                      color: isSelected ? '#080808' : '#FFFFFF',
                      border: isSelected ? '1px solid #FFFFFF' : '1px solid var(--gold-border)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: isSelected ? '#080808' : 'var(--gold-gradient)',
                        color: isSelected ? '#F5D76E' : '#080808',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {s.rollNumber}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.studentName}
                      </div>
                      <div style={{ fontSize: 11, color: isSelected ? '#222' : '#A0A0A0' }}>
                        {s.studentId}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: MARKS MANAGEMENT ── */}
      <div>
        {selectedStudentData ? (
          <div>
            {/* Header info */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(18, 18, 18, 0.9) 100%)',
                border: '1px solid var(--gold-border)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 24px',
                marginBottom: 20,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#FFFFFF' }}>
                  {selectedStudentData.studentName}
                </h3>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <span className="badge badge-gold">{selectedStudentData.studentId}</span>
                  <span className="badge badge-primary">Roll #{selectedStudentData.rollNumber}</span>
                  <span className="badge" style={{ background: '#222', color: '#FFF' }}>
                    Standard {std}-{sec}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={downloadStudentPdf}>
                  <i className="bi bi-file-earmark-pdf-fill"></i> Download Report PDF
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditMarkId(null);
                    setForm(emptyMark);
                    setShowModal(true);
                  }}
                >
                  <i className="bi bi-plus-circle-fill"></i> Add Subject Marks
                </button>
              </div>
            </div>

            {/* Marks Table */}
            <div className="table-wrapper">
              <div className="table-toolbar">
                <h5 style={{ margin: 0, color: '#FFFFFF', fontSize: 14 }}>
                  Academic Assessment Marks ({marks.length} Subjects Graded)
                </h5>
                <span className="badge badge-gold" style={{ marginLeft: 'auto' }}>
                  Official Grading
                </span>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 50 }}>
                  <div className="spinner" style={{ width: 34, height: 34, margin: 'auto' }}></div>
                  <p style={{ marginTop: 12, color: '#A0A0A0' }}>Loading student marks...</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Exam Type</th>
                      <th>Max Marks</th>
                      <th>Marks Obtained</th>
                      <th>Percentage</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="table-empty">
                          <i className="bi bi-journal-x"></i>
                          No marks entered for this student yet. Click "Add Subject Marks" above.
                        </td>
                      </tr>
                    ) : (
                      marks.map((m) => {
                        const pct = m.maxMarks > 0 ? Math.round((m.marksObtained / m.maxMarks) * 100) : 0;
                        const isPass = pct >= 35;
                        return (
                          <tr key={m.id}>
                            <td>
                              <strong style={{ color: '#FFFFFF', fontSize: 13.5 }}>{m.subject}</strong>
                            </td>
                            <td>
                              <span className="badge badge-gold">{m.examType}</span>
                            </td>
                            <td>{m.maxMarks}</td>
                            <td>
                              <strong style={{ fontSize: 14, color: isPass ? '#34D399' : '#F87171' }}>
                                {m.marksObtained}
                              </strong>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div className="progress-bar-wrapper" style={{ width: 70 }}>
                                  <div
                                    className="progress-bar-fill"
                                    style={{
                                      width: `${pct}%`,
                                      background: isPass ? 'var(--gold-gradient)' : '#EF4444',
                                    }}
                                  />
                                </div>
                                <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{pct}%</span>
                              </div>
                            </td>
                            <td>
                              {isPass ? (
                                <span className="badge badge-present">PASSED</span>
                              ) : (
                                <span className="badge badge-absent">FAILED</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: 6 }}>
                                <button
                                  className="btn btn-outline btn-sm btn-icon"
                                  onClick={() => openEdit(m)}
                                  data-tooltip="Edit Marks"
                                >
                                  <i className="bi bi-pencil-fill" style={{ color: '#38BDF8' }}></i>
                                </button>
                                <button
                                  className="btn btn-outline btn-sm btn-icon"
                                  onClick={() => handleDelete(m.id)}
                                  data-tooltip="Delete"
                                >
                                  <i className="bi bi-trash-fill" style={{ color: '#EF4444' }}></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <i className="bi bi-arrow-left-circle" style={{ fontSize: 48, color: '#D4AF37', display: 'block', marginBottom: 12 }}></i>
            <h4 style={{ color: '#FFFFFF' }}>Select a Student from the Class Roster</h4>
            <p style={{ color: '#A0A0A0', fontSize: 13, maxWidth: 420, margin: '8px auto 0' }}>
              Choose a standard and section on the left, then click any student to review and grade examination marks.
            </p>
          </div>
        )}
      </div>

      {/* ── MODAL: ADD / EDIT MARK ENTRY ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="bi bi-journal-plus" style={{ color: '#D4AF37', fontSize: 20 }}></i>
                <h4>{editMarkId ? 'Edit Academic Marks' : 'Add Subject Marks'}</h4>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Mathematics, Science"
                    list="subject-suggestions"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                  />
                  <datalist id="subject-suggestions">
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>

                <div className="form-row mb-3">
                  <div>
                    <label className="form-label">Marks Obtained *</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-control"
                      placeholder="e.g. 85"
                      value={form.marksObtained}
                      onChange={(e) => setForm({ ...form, marksObtained: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Maximum Marks *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.maxMarks}
                      onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row mb-3">
                  <div>
                    <label className="form-label">Exam Type</label>
                    <select
                      className="form-select"
                      value={form.examType}
                      onChange={(e) => setForm({ ...form, examType: e.target.value })}
                    >
                      {EXAM_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Academic Year</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.academicYear}
                      onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-check2-circle"></i> Save Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
