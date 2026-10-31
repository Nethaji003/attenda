import React, { useState, useEffect } from 'react';
import { marksAPI, studentAPI, reportAPI } from '../api/services';
import { toast } from 'react-toastify';

const STANDARDS = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS = ['A', 'B', 'C', 'D'];
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Tamil', 'Hindi', 'Social Studies', 'Computer', 'Physical Education'];
const EXAM_TYPES = ['Unit Test 1', 'Unit Test 2', 'Quarterly Examination', 'Half-Yearly Examination', 'Annual Examination', 'FA1', 'FA2', 'SA1', 'SA2'];

const emptyMark = { subject: '', marksObtained: '', maxMarks: 100, examType: 'Unit Test 1', academicYear: '2024-25', published: true };

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
    studentAPI.getByClass(std, sec).then(r => {
      setStudents(r.data);
      setSelectedStudent(null);
      setMarks([]);
    }).catch(() => toast.error('Failed to load students'));
  }, [std, sec]);

  const loadMarks = async (studentId) => {
    setSelectedStudent(studentId);
    setLoading(true);
    try {
      const res = await marksAPI.getByStudent(studentId);
      setMarks(res.data);
    } catch { toast.error('Failed to load marks'); }
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const student = students.find(s => s.id === selectedStudent);
    if (!student) { toast.error('Select a student first'); return; }

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
      toast.success('Marks saved successfully');
      setShowModal(false);
      setEditMarkId(null);
      setForm(emptyMark);
      loadMarks(selectedStudent);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save marks');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this mark entry?')) return;
    try {
      await marksAPI.delete(id);
      toast.success('Deleted');
      loadMarks(selectedStudent);
    } catch { toast.error('Delete failed'); }
  };

  const openEdit = (mark) => {
    setForm({
      subject: mark.subject,
      marksObtained: mark.marksObtained,
      maxMarks: mark.maxMarks,
      examType: mark.examType,
      academicYear: mark.academicYear,
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
      a.href = url; a.download = `student_${selectedStudent}_report.pdf`; a.click();
      toast.success('Report downloaded');
    } catch { toast.error('Download failed'); }
  };

  const selectedStudentData = students.find(s => s.id === selectedStudent);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
      {/* Student List Panel */}
      <div className="card" style={{ alignSelf: 'start' }}>
        <div className="card-header">
          <div className="card-header-icon"><i className="bi bi-people-fill"></i></div>
          <h5>Select Student</h5>
        </div>
        <div className="card-body" style={{ padding: '12px 0' }}>
          <div style={{ padding: '0 12px 12px', display: 'flex', gap: 8 }}>
            <select className="form-select" style={{ flex: 1 }} value={std} onChange={e => setStd(Number(e.target.value))}>
              {STANDARDS.map(s => <option key={s} value={s}>Std {s}</option>)}
            </select>
            <select className="form-select" style={{ width: 80 }} value={sec} onChange={e => setSec(e.target.value)}>
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {students.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>No students</div>
          ) : students.map(s => (
            <div key={s.id}
              onClick={() => loadMarks(s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', cursor: 'pointer',
                background: selectedStudent === s.id ? '#dbeafe' : 'transparent',
                borderLeft: selectedStudent === s.id ? '3px solid #1a56db' : '3px solid transparent',
                transition: 'all .15s'
              }}>
              <div className="student-avatar-placeholder" style={{ width: 32, height: 32, fontSize: 12 }}>{s.studentName[0]}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.studentName}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Roll {s.rollNumber}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marks Panel */}
      <div>
        {selectedStudentData && (
          <div className="card mb-3">
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="student-avatar-placeholder" style={{ width: 48, height: 48, fontSize: 18 }}>
                {selectedStudentData.studentName[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedStudentData.studentName}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {selectedStudentData.studentId} • Std {std}-{sec} • Roll {selectedStudentData.rollNumber}
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={downloadStudentPdf}>
                <i className="bi bi-file-pdf"></i> Download Report
              </button>
              <button className="btn btn-primary" onClick={() => { setForm(emptyMark); setEditMarkId(null); setShowModal(true); }}>
                <i className="bi bi-plus"></i> Add Marks
              </button>
            </div>
          </div>
        )}

        <div className="table-wrapper">
          {!selectedStudent ? (
            <div className="table-empty" style={{ padding: 60 }}>
              <i className="bi bi-journal-text"></i>
              Select a student from the left panel to view marks
            </div>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <div className="spinner" style={{ width: 32, height: 32, margin: 'auto', borderColor: 'rgba(26,86,219,.2)', borderTopColor: '#1a56db' }}></div>
            </div>
          ) : (
            <table>
              <thead>
                <tr><th>Subject</th><th>Exam Type</th><th>Year</th><th>Obtained</th><th>Max</th><th>%</th><th>Grade</th><th>Published</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {marks.length === 0 ? (
                  <tr><td colSpan={9} className="table-empty">
                    <i className="bi bi-journal-x"></i> No marks added yet
                  </td></tr>
                ) : marks.map(m => {
                  const pct = Math.round(m.marksObtained / m.maxMarks * 100);
                  const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F';
                  const gradeColor = pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
                  const isPub = m.published !== false;
                  return (
                    <tr key={m.id}>
                      <td><strong>{m.subject}</strong></td>
                      <td><span className="badge badge-primary">{m.examType}</span></td>
                      <td>{m.academicYear}</td>
                      <td style={{ fontWeight: 700, color: '#1a56db' }}>{m.marksObtained}</td>
                      <td>{m.maxMarks}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="progress-bar-wrapper" style={{ width: 60 }}>
                            <div className="progress-bar-fill" style={{ width: `${pct}%`, background: gradeColor }} />
                          </div>
                          <span style={{ fontWeight: 700, color: gradeColor }}>{pct}%</span>
                        </div>
                      </td>
                      <td><span style={{ fontWeight: 800, color: gradeColor }}>{grade}</span></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{
                            padding: '2px 8px', fontSize: 11, fontWeight: 700, borderRadius: 6, border: 'none',
                            background: isPub ? '#dcfce7' : '#f1f5f9',
                            color: isPub ? '#15803d' : '#64748b',
                            cursor: 'pointer'
                          }}
                          onClick={async () => {
                            try {
                              await marksAPI.togglePublish(m.id, !isPub);
                              toast.success(isPub ? 'Result unpublished' : 'Result published to student!');
                              loadMarks(selectedStudent);
                            } catch { toast.error('Failed to change publish status'); }
                          }}
                        >
                          <i className={`bi bi-${isPub ? 'eye-fill' : 'eye-slash'}`}></i> {isPub ? 'Published' : 'Hidden'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(m)}>
                            <i className="bi bi-pencil-fill" style={{ color: '#1a56db' }}></i>
                          </button>
                          <button className="btn btn-outline btn-sm btn-icon" onClick={() => handleDelete(m.id)}>
                            <i className="bi bi-trash-fill" style={{ color: '#ef4444' }}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Marks Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h4><i className="bi bi-journal-plus me-2" style={{ color: '#1a56db' }}></i>{editMarkId ? 'Edit' : 'Add'} Marks</h4>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div style={{ marginBottom: 14 }}>
                  <label className="form-label">Subject *</label>
                  <select className="form-select" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required>
                    <option value="">Select subject</option>
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-row" style={{ marginBottom: 14 }}>
                  <div>
                    <label className="form-label">Exam Type</label>
                    <select className="form-select" value={form.examType} onChange={e => setForm({...form, examType: e.target.value})}>
                      {EXAM_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Academic Year</label>
                    <input className="form-control" value={form.academicYear}
                      onChange={e => setForm({...form, academicYear: e.target.value})} placeholder="2024-25" />
                  </div>
                </div>
                <div className="form-row" style={{ marginBottom: 14 }}>
                  <div>
                    <label className="form-label">Marks Obtained *</label>
                    <input type="number" className="form-control" value={form.marksObtained}
                      onChange={e => setForm({...form, marksObtained: e.target.value})}
                      min={0} max={form.maxMarks} required />
                  </div>
                  <div>
                    <label className="form-label">Maximum Marks</label>
                    <input type="number" className="form-control" value={form.maxMarks}
                      onChange={e => setForm({...form, maxMarks: e.target.value})} min={1} />
                  </div>
                </div>
                {form.marksObtained && form.maxMarks && (
                  <div style={{ background: '#f0f4ff', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                    <strong style={{ fontSize: 18, color: '#1a56db' }}>
                      {Math.round(form.marksObtained / form.maxMarks * 100)}%
                    </strong>
                    <span style={{ marginLeft: 8, color: '#64748b' }}>Score</span>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-check-lg"></i> {editMarkId ? 'Update' : 'Save'} Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
