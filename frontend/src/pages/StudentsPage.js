import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../api/services';
import { toast } from 'react-toastify';

const STANDARDS = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS = ['A', 'B', 'C', 'D'];
const GENDERS = ['Male', 'Female', 'Other'];

const emptyForm = {
  studentName: '', studentId: '', rollNumber: '', standard: '',
  section: '', dateOfBirth: '', gender: 'Male',
  parentName: '', mobileNumber: '', address: ''
};

const sectionColors = {
  A: '#6366f1', B: '#0ea5e9', C: '#10b981', D: '#f59e0b',
};

export default function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const fileRef = useRef();

  const fetchStudents = async (q = '') => {
    setLoading(true);
    try {
      const res = await studentAPI.getAll(q || undefined);
      setStudents(res.data);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchStudents(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => {
    setEditId(null); setForm(emptyForm); setPhoto(null); setPhotoPreview(null); setShowModal(true);
  };

  const openEdit = async (id) => {
    try {
      const res = await studentAPI.getById(id);
      const s = res.data;
      setForm({
        studentName: s.studentName, studentId: s.studentId,
        rollNumber: s.rollNumber, standard: s.standard, section: s.section,
        dateOfBirth: s.dateOfBirth, gender: s.gender,
        parentName: s.parentName, mobileNumber: s.mobileNumber, address: s.address || ''
      });
      setPhotoPreview(s.photoPath ? `http://localhost:8080${s.photoPath}` : null);
      setPhoto(null); setEditId(id); setShowModal(true);
    } catch { toast.error('Failed to load student'); }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentName || !form.studentId || !form.rollNumber || !form.standard || !form.section) {
      toast.warning('Please fill all required fields'); return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      const studentBlob = new Blob([JSON.stringify(form)], { type: 'application/json' });
      fd.append('student', studentBlob);
      if (photo) fd.append('photo', photo);
      if (editId) await studentAPI.update(editId, fd);
      else await studentAPI.create(fd);
      toast.success(`Student ${editId ? 'updated' : 'added'} successfully! ✅`);
      setShowModal(false);
      fetchStudents(search);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save student');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await studentAPI.delete(deleteId);
      toast.success('Student removed');
      setDeleteId(null);
      fetchStudents(search);
    } catch { toast.error('Delete failed'); }
  };

  const inp = (field, props = {}) => ({
    className: 'form-control',
    value: form[field] ?? '',
    onChange: e => setForm({ ...form, [field]: e.target.value }),
    ...props,
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input type="text" className="form-control" placeholder="Search by name, ID, roll no…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="badge badge-primary">{students.length} total</span>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-primary" onClick={openAdd}>
              <i className="bi bi-person-plus-fill"></i> Add Student
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div className="spinner" style={{ width: 32, height: 32, margin: 'auto', borderColor: 'rgba(26,86,219,.2)', borderTopColor: '#1a56db' }}></div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th><th>Photo</th><th>Name / DOB</th><th>Student ID</th>
                <th>Class</th><th>Roll</th><th>Gender</th>
                <th>Parent</th><th>Place</th><th>Mobile</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={11} className="table-empty">
                  <i className="bi bi-people"></i>
                  {search ? 'No students match your search' : 'No students added yet. Click "Add Student" to begin.'}
                </td></tr>
              ) : students.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ color: '#94a3b8', fontSize: 12 }}>{i + 1}</td>
                  <td>
                    {s.photoPath
                      ? <img src={`http://localhost:8080${s.photoPath}`} className="student-avatar" alt="" />
                      : <div className="student-avatar-placeholder" style={{ background: `linear-gradient(135deg, ${sectionColors[s.section] || '#6366f1'}, #8b5cf6)` }}>{s.studentName[0]}</div>
                    }
                  </td>
                  <td>
                    <strong style={{ fontSize: 14 }}>{s.studentName}</strong>
                    <br />
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      {s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </span>
                  </td>
                  <td><span className="badge badge-primary">{s.studentId}</span></td>
                  <td>
                    <span style={{
                      background: `${sectionColors[s.section] || '#6366f1'}20`,
                      color: sectionColors[s.section] || '#6366f1',
                      border: `1px solid ${sectionColors[s.section] || '#6366f1'}44`,
                      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    }}>Std {s.standard}-{s.section}</span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{s.rollNumber}</td>
                  <td style={{ fontSize: 12, color: '#64748b' }}>{s.gender}</td>
                  <td style={{ fontSize: 13 }}>{s.parentName}</td>
                  <td style={{ fontSize: 12, color: '#64748b', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.address || '—'}</td>
                  <td>📱 <span style={{ fontSize: 13, fontWeight: 600 }}>{s.mobileNumber}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-outline btn-sm btn-icon" data-tooltip="Documents"
                        onClick={() => navigate(`/students/${s.id}/documents`, { state: { studentName: s.studentName, studentId: s.studentId } })}>
                        <i className="bi bi-folder-fill" style={{ color: '#f59e0b' }}></i>
                      </button>
                      <button className="btn btn-outline btn-sm btn-icon" data-tooltip="Edit"
                        onClick={() => openEdit(s.id)}>
                        <i className="bi bi-pencil-fill" style={{ color: '#1a56db' }}></i>
                      </button>
                      <button className="btn btn-outline btn-sm btn-icon" data-tooltip="Delete"
                        onClick={() => setDeleteId(s.id)}>
                        <i className="bi bi-trash-fill" style={{ color: '#ef4444' }}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ====== Add / Edit Modal ====== */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 660 }}>
            <div className="modal-header">
              <h4>
                <i className={`bi bi-person-${editId ? 'gear' : 'plus'}-fill me-2`} style={{ color: '#6366f1' }}></i>
                {editId ? 'Edit Student' : 'Register New Student'}
              </h4>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">

                {/* Photo Upload */}
                <div style={{ textAlign: 'center', marginBottom: 22 }}>
                  <div className="photo-upload-area" onClick={() => fileRef.current.click()} style={{ position: 'relative', overflow: 'hidden' }}>
                    {photoPreview
                      ? <img src={photoPreview} className="photo-preview" alt="preview" />
                      : <>
                          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: 22 }}>📷</div>
                          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Click to upload photo</p>
                        </>
                    }
                  </div>
                  <input type="file" ref={fileRef} accept="image/*" hidden onChange={handlePhotoChange} />
                </div>

                {/* Section Label */}
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
                  📋 Basic Information
                </div>

                <div className="form-row three-col" style={{ marginBottom: 14 }}>
                  <div>
                    <label className="form-label">Student Name *</label>
                    <input {...inp('studentName')} placeholder="Full name" required />
                  </div>
                  <div>
                    <label className="form-label">Student ID *</label>
                    <input {...inp('studentId')} placeholder="e.g. STU001" required disabled={!!editId} />
                  </div>
                  <div>
                    <label className="form-label">Roll Number *</label>
                    <input type="number" {...inp('rollNumber')} placeholder="Roll no" required />
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: 14 }}>
                  <div>
                    <label className="form-label">Standard *</label>
                    <select className="form-select" value={form.standard} onChange={e => setForm({ ...form, standard: e.target.value })} required>
                      <option value="">Select Standard</option>
                      {STANDARDS.map(s => <option key={s} value={s}>Standard {s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Section *</label>
                    <select className="form-select" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} required>
                      <option value="">Select Section</option>
                      {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: 14 }}>
                  <div>
                    <label className="form-label">Date of Birth</label>
                    <input type="date" {...inp('dateOfBirth')} />
                  </div>
                  <div>
                    <label className="form-label">Gender</label>
                    <select className="form-select" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                      {GENDERS.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                {/* Section Label */}
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #f1f5f9', marginTop: 6 }}>
                  👨‍👩‍👧 Parent & Contact
                </div>

                <div className="form-row" style={{ marginBottom: 14 }}>
                  <div>
                    <label className="form-label">Parent / Guardian Name *</label>
                    <input {...inp('parentName')} placeholder="Parent/Guardian full name" required />
                  </div>
                  <div>
                    <label className="form-label">Mobile Number *</label>
                    <input type="tel" {...inp('mobileNumber', { maxLength: 10 })} placeholder="10-digit mobile number" required />
                  </div>
                </div>

                <div style={{ marginBottom: 6 }}>
                  <label className="form-label">Place / Address</label>
                  <textarea className="form-control" rows={2}
                    value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="Village, town or full address…" />
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner"></div> Saving…</> : <><i className="bi bi-check-lg"></i> {editId ? 'Update' : 'Register'} Student</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 380 }}>
            <div className="modal-body" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
              <h5>Remove Student?</h5>
              <p style={{ color: '#64748b', marginTop: 8 }}>This will deactivate the student record. Attendance history is preserved.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}><i className="bi bi-trash"></i> Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
