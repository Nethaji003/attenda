import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../api/services';
import { toast } from 'react-toastify';

const STANDARDS = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS  = ['A', 'B', 'C', 'D'];
const GENDERS   = ['Male', 'Female', 'Other'];

const emptyForm = {
  studentName: '',
  studentId: '',
  rollNumber: '',
  standard: '1',
  section: 'A',
  dateOfBirth: '',
  gender: 'Male',
  parentName: '',
  mobileNumber: '',
  address: '',
};

export default function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStandard, setSelectedStandard] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Profile View Modal
  const [viewStudent, setViewStudent] = useState(null);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fileRef = useRef();

  const fetchStudents = async (q = '') => {
    setLoading(true);
    try {
      const res = await studentAPI.getAll(q || undefined);
      setStudents(res.data || []);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchStudents(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Open Add modal
  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setPhoto(null);
    setPhotoPreview(null);
    setShowModal(true);
  };

  // Open Edit modal
  const openEdit = async (id) => {
    try {
      const res = await studentAPI.getById(id);
      const s = res.data;
      setForm({
        studentName: s.studentName,
        studentId: s.studentId,
        rollNumber: s.rollNumber,
        standard: String(s.standard),
        section: s.section,
        dateOfBirth: s.dateOfBirth || '',
        gender: s.gender || 'Male',
        parentName: s.parentName || '',
        mobileNumber: s.mobileNumber || '',
        address: s.address || '',
      });
      setPhotoPreview(s.photoPath ? `http://localhost:8080${s.photoPath}` : null);
      setPhoto(null);
      setEditId(id);
      setShowModal(true);
    } catch {
      toast.error('Failed to load student details');
    }
  };

  // View Profile Modal
  const openProfile = (student) => {
    setViewStudent(student);
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
      toast.warning('Please fill all required student fields');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      const studentBlob = new Blob([JSON.stringify(form)], { type: 'application/json' });
      fd.append('student', studentBlob);
      if (photo) fd.append('photo', photo);

      if (editId) {
        await studentAPI.update(editId, fd);
        toast.success('Student record updated successfully! 🎓');
      } else {
        await studentAPI.create(fd);
        toast.success('New student admitted successfully! 🎉');
      }
      setShowModal(false);
      fetchStudents(search);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save student record');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await studentAPI.delete(deleteTarget.id);
      toast.success(`Student ${deleteTarget.studentName} removed successfully`);
      setDeleteTarget(null);
      fetchStudents(search);
    } catch {
      toast.error('Failed to delete student record');
    } finally {
      setDeleting(false);
    }
  };

  // Filter students by Standard and Section
  const filteredStudents = students.filter((s) => {
    const matchesStandard =
      selectedStandard === 'ALL' || String(s.standard) === String(selectedStandard);
    const matchesSection =
      selectedSection === 'ALL' || s.section?.toUpperCase() === selectedSection.toUpperCase();
    return matchesStandard && matchesSection;
  });

  return (
    <div className="page-enter">
      {/* ── TOP STATS & ACTIONS HEADER ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(18, 18, 18, 0.9) 100%)',
          border: '1px solid var(--gold-border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'var(--gold-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color: '#080808',
              boxShadow: 'var(--gold-glow)',
            }}
          >
            <i className="bi bi-people-fill"></i>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#FFFFFF' }}>
              Student Management Console
            </h3>
            <p style={{ margin: 0, fontSize: 12.5, color: '#A0A0A0', marginTop: 2 }}>
              Total Enrolled Students: <strong style={{ color: '#F5D76E' }}>{students.length}</strong> | Showing: <strong style={{ color: '#FFFFFF' }}>{filteredStudents.length}</strong>
            </p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={openAdd}>
          <i className="bi bi-person-plus-fill"></i> Add Student
        </button>
      </div>

      {/* ── TABLE CONTAINER WITH ADVANCED FILTERS ── */}
      <div className="table-wrapper">
        {/* Filter & Search Toolbar */}
        <div className="table-toolbar">
          {/* Search box */}
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, registration ID, or roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Standard Filter (1 to 12) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#D4AF37' }}>Standard:</span>
            <select
              className="form-select"
              style={{ width: 130, padding: '7px 12px', fontSize: 12.5 }}
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
            >
              <option value="ALL">All Standards</option>
              {STANDARDS.map((s) => (
                <option key={s} value={s}>
                  Std {s}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter (A, B, C, D) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#D4AF37' }}>Section:</span>
            <select
              className="form-select"
              style={{ width: 110, padding: '7px 12px', fontSize: 12.5 }}
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="ALL">All (A-D)</option>
              {SECTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>

          {(selectedStandard !== 'ALL' || selectedSection !== 'ALL' || search) && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSelectedStandard('ALL');
                setSelectedSection('ALL');
                setSearch('');
              }}
            >
              <i className="bi bi-x-circle"></i> Reset Filters
            </button>
          )}

          <span className="badge badge-gold" style={{ marginLeft: 'auto' }}>
            {filteredStudents.length} Students Listed
          </span>
        </div>

        {/* Table View */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 36, height: 36, margin: 'auto' }}></div>
            <p style={{ marginTop: 12, color: '#A0A0A0' }}>Fetching student directory...</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th style={{ width: 60 }}>Photo</th>
                <th>Student Name / Reg No</th>
                <th>Class & Sec</th>
                <th>Roll No</th>
                <th>Parent / Guardian</th>
                <th>Contact</th>
                <th>Gender</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="table-empty">
                    <i className="bi bi-people"></i>
                    {search || selectedStandard !== 'ALL' || selectedSection !== 'ALL'
                      ? 'No students matched the chosen filter or search query.'
                      : 'No student records in database. Click "Add Student" above to enroll.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr key={s.id}>
                    <td style={{ color: '#888', fontWeight: 600 }}>{idx + 1}</td>
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
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: '#FFFFFF',
                          cursor: 'pointer',
                        }}
                        onClick={() => openProfile(s)}
                        title="Click to view full student profile"
                      >
                        {s.studentName}
                      </div>
                      <span className="badge badge-gold" style={{ marginTop: 3, fontSize: 10.5 }}>
                        {s.studentId}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(212, 175, 55, 0.1)',
                          border: '1px solid var(--gold-border)',
                          color: '#F5D76E',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        Std {s.standard} - {s.section}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: '#FFFFFF' }}>{s.rollNumber}</td>
                    <td>
                      <div style={{ color: '#FFFFFF', fontSize: 13 }}>{s.parentName || '—'}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{s.address || 'Resident'}</div>
                    </td>
                    <td>
                      <a
                        href={`tel:${s.mobileNumber}`}
                        style={{
                          color: '#38BDF8',
                          fontSize: 12.5,
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <i className="bi bi-telephone-fill" style={{ fontSize: 11 }}></i>
                        {s.mobileNumber}
                      </a>
                    </td>
                    <td style={{ fontSize: 12.5, color: '#A0A0A0' }}>{s.gender || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        {/* View Profile */}
                        <button
                          className="btn btn-outline btn-sm btn-icon"
                          data-tooltip="View Profile"
                          onClick={() => openProfile(s)}
                        >
                          <i className="bi bi-eye-fill" style={{ color: '#D4AF37' }}></i>
                        </button>

                        {/* Documents */}
                        <button
                          className="btn btn-outline btn-sm btn-icon"
                          data-tooltip="Student Documents"
                          onClick={() =>
                            navigate(`/students/${s.id}/documents`, {
                              state: { studentName: s.studentName, studentId: s.studentId },
                            })
                          }
                        >
                          <i className="bi bi-folder-fill" style={{ color: '#F5D76E' }}></i>
                        </button>

                        {/* Edit */}
                        <button
                          className="btn btn-outline btn-sm btn-icon"
                          data-tooltip="Edit Record"
                          onClick={() => openEdit(s.id)}
                        >
                          <i className="bi bi-pencil-fill" style={{ color: '#38BDF8' }}></i>
                        </button>

                        {/* Delete */}
                        <button
                          className="btn btn-outline btn-sm btn-icon"
                          data-tooltip="Delete Student"
                          onClick={() => setDeleteTarget(s)}
                        >
                          <i className="bi bi-trash-fill" style={{ color: '#EF4444' }}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── MODAL: ADD / EDIT STUDENT ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className={`bi bi-${editId ? 'pencil-square' : 'person-plus-fill'}`} style={{ color: '#D4AF37', fontSize: 20 }}></i>
                <h4>{editId ? 'Edit Student Profile' : 'Admit New Student'}</h4>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Photo Upload Area */}
                <div style={{ marginBottom: 20 }}>
                  <label className="form-label">Student Passport Photo</label>
                  <div className="photo-upload-area" onClick={() => fileRef.current?.click()}>
                    <input
                      type="file"
                      ref={fileRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                    {photoPreview ? (
                      <img src={photoPreview} className="photo-preview" alt="Preview" />
                    ) : (
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: 'rgba(212, 175, 55, 0.1)',
                          border: '2px dashed var(--gold-border)',
                          margin: '0 auto 8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#D4AF37',
                          fontSize: 28,
                        }}
                      >
                        <i className="bi bi-camera"></i>
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: '#D4AF37', fontWeight: 600 }}>
                      {photoPreview ? 'Click to Change Photo' : 'Click to Upload Student Photo (JPG / PNG)'}
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="form-row mb-3">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Rahul Sharma"
                      value={form.studentName}
                      onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Registration Number (Student ID) *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. STU2024001"
                      value={form.studentId}
                      onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row three-col mb-3">
                  <div>
                    <label className="form-label">Standard (1 to 12) *</label>
                    <select
                      className="form-select"
                      value={form.standard}
                      onChange={(e) => setForm({ ...form, standard: e.target.value })}
                      required
                    >
                      {STANDARDS.map((s) => (
                        <option key={s} value={s}>
                          Standard {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Section (A to D) *</label>
                    <select
                      className="form-select"
                      value={form.section}
                      onChange={(e) => setForm({ ...form, section: e.target.value })}
                      required
                    >
                      {SECTIONS.map((sec) => (
                        <option key={sec} value={sec}>
                          Section {sec}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Roll Number *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 15"
                      value={form.rollNumber}
                      onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row mb-3">
                  <div>
                    <label className="form-label">Parent / Guardian Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Vikram Sharma"
                      value={form.parentName}
                      onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Parent Mobile Number (for SMS Alerts) *</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="10 digit mobile (e.g. 9876543210)"
                      value={form.mobileNumber}
                      onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row mb-3">
                  <div>
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.dateOfBirth}
                      onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    >
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label">Permanent Residential Address</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Enter resident address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <><div className="spinner"></div> Saving Record...</>
                  ) : (
                    <><i className="bi bi-check2-circle"></i> {editId ? 'Update Student' : 'Admit Student'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: VIEW STUDENT PROFILE (Section 3 Requirement) ── */}
      {viewStudent && (
        <div className="modal-overlay" onClick={() => setViewStudent(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="bi bi-person-vcard-fill" style={{ color: '#D4AF37', fontSize: 22 }}></i>
                <h4>Student Dossier & Profile</h4>
              </div>
              <button className="modal-close" onClick={() => setViewStudent(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="modal-body">
              {/* Profile Card Header */}
              <div
                style={{
                  display: 'flex',
                  gap: 18,
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(18, 18, 18, 0.8) 100%)',
                  padding: '20px',
                  borderRadius: 14,
                  border: '1px solid var(--gold-border)',
                  marginBottom: 20,
                }}
              >
                {viewStudent.photoPath ? (
                  <img
                    src={`http://localhost:8080${viewStudent.photoPath}`}
                    style={{
                      width: 72,
                      height: 72,
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
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: 'var(--gold-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#080808',
                      fontSize: 28,
                      fontWeight: 800,
                      boxShadow: 'var(--gold-glow)',
                    }}
                  >
                    {viewStudent.studentName?.[0] || 'S'}
                  </div>
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#FFFFFF' }}>
                    {viewStudent.studentName}
                  </h3>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    <span className="badge badge-gold">{viewStudent.studentId}</span>
                    <span className="badge badge-primary">
                      Std {viewStudent.standard}-{viewStudent.section}
                    </span>
                    <span className="badge" style={{ background: '#222', color: '#DDD' }}>
                      Roll #{viewStudent.rollNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 14,
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                }}
              >
                <div>
                  <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>
                    Parent / Guardian
                  </span>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF', marginTop: 2 }}>
                    {viewStudent.parentName || '—'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>
                    Mobile Number
                  </span>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#38BDF8', marginTop: 2 }}>
                    📱 {viewStudent.mobileNumber || '—'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>
                    Date of Birth
                  </span>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#FFFFFF', marginTop: 2 }}>
                    {viewStudent.dateOfBirth
                      ? new Date(viewStudent.dateOfBirth).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>
                    Gender
                  </span>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#FFFFFF', marginTop: 2 }}>
                    {viewStudent.gender || '—'}
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>
                    Address
                  </span>
                  <div style={{ fontSize: 13, color: '#E0E0E0', marginTop: 2 }}>
                    {viewStudent.address || 'Standard School Residence / Day Scholar'}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  const s = viewStudent;
                  setViewStudent(null);
                  openEdit(s.id);
                }}
              >
                <i className="bi bi-pencil-fill"></i> Edit Profile
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const s = viewStudent;
                  setViewStudent(null);
                  navigate(`/students/${s.id}/documents`, {
                    state: { studentName: s.studentName, studentId: s.studentId },
                  });
                }}
              >
                <i className="bi bi-folder-fill"></i> Manage Documents
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRM DELETE ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header" style={{ borderBottomColor: 'rgba(239, 68, 68, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ color: '#EF4444', fontSize: 22 }}></i>
                <h4>Confirm Student Deletion</h4>
              </div>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '24px 20px' }}>
              <p style={{ color: '#E0E0E0', fontSize: 14 }}>
                Are you sure you want to remove <strong>{deleteTarget.studentName}</strong> ({deleteTarget.studentId}) from the student registry?
              </p>
              <p style={{ color: '#888', fontSize: 12 }}>
                This will archive attendance logs and academic performance associated with this student.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button type="button" className="btn btn-outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? (
                  <><div className="spinner"></div> Deleting...</>
                ) : (
                  <><i className="bi bi-trash-fill"></i> Delete Student</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
