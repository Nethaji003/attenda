import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

/* ─── Constants ─── */
const STANDARDS = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS  = ['A', 'B', 'C', 'D'];
const GENDERS   = ['Male', 'Female', 'Other'];
const ORDINALS  = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

const initialForm = {
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

const SEC_THEMES = {
  A: { accent: '#6366f1', light: 'rgba(99,102,241,.12)', border: 'rgba(99,102,241,.28)', text: '#4f46e5', grad: 'linear-gradient(135deg,#6366f1,#818cf8)' },
  B: { accent: '#0ea5e9', light: 'rgba(14,165,233,.12)', border: 'rgba(14,165,233,.28)', text: '#0284c7', grad: 'linear-gradient(135deg,#0ea5e9,#38bdf8)' },
  C: { accent: '#10b981', light: 'rgba(16,185,129,.12)', border: 'rgba(16,185,129,.28)', text: '#059669', grad: 'linear-gradient(135deg,#10b981,#34d399)' },
  D: { accent: '#f59e0b', light: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.28)', text: '#d97706', grad: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
};

function calcAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

function fmtDOB(dob) {
  if (!dob) return '—';
  try {
    return new Date(dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dob;
  }
}

/* ─── Stylesheet ─── */
const CSS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .gf-container {
    max-width: 820px;
    margin: 0 auto;
    padding: 24px 16px 80px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  /* Top Navigation Bar */
  .gf-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    margin-bottom: 24px;
    border: 1px solid #e2e8f0;
    flex-wrap: wrap;
    gap: 12px;
  }

  /* Header Card */
  .gf-header-card {
    background: #ffffff;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 6px 24px rgba(0,0,0,0.07);
    border: 1px solid #e2e8f0;
    margin-bottom: 20px;
    position: relative;
    animation: fadeUp 0.3s ease;
  }
  .gf-header-stripe {
    height: 12px;
    background: linear-gradient(90deg, #673ab7, #8e24aa, #7b1fa2, #512da8);
  }
  .gf-header-body {
    padding: 28px 32px 24px;
  }
  .gf-header-title {
    font-size: 28px;
    font-weight: 800;
    color: #1e1b4b;
    margin: 0 0 8px;
    letter-spacing: -0.5px;
  }
  .gf-header-desc {
    color: #4b5563;
    font-size: 14px;
    line-height: 1.6;
    margin: 0 0 16px;
  }
  .gf-header-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 14px;
    border-top: 1px solid #f1f5f9;
    font-size: 13px;
    color: #dc2626;
    font-weight: 500;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* Question Card (Google Form style) */
  .gf-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 24px 28px;
    margin-bottom: 18px;
    box-shadow: 0 3px 16px rgba(0,0,0,0.05);
    border: 1px solid #e2e8f0;
    border-left: 5px solid transparent;
    transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    animation: fadeUp 0.35s ease;
  }
  .gf-card:hover {
    box-shadow: 0 8px 26px rgba(0,0,0,0.08);
  }
  .gf-card.focused {
    border-left-color: #673ab7;
    box-shadow: 0 8px 30px rgba(103, 58, 183, 0.12);
  }

  .gf-q-title {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .gf-required-star {
    color: #dc2626;
    font-weight: 800;
  }
  .gf-q-help {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 14px;
  }

  /* Input styles (Underline / Bordered Google Forms feel) */
  .gf-input {
    width: 100%;
    border: none;
    border-bottom: 2px solid #cbd5e1;
    border-radius: 0;
    padding: 10px 0;
    font-size: 15px;
    font-family: inherit;
    color: #1e293b;
    background: transparent;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .gf-input:focus {
    border-bottom-color: #673ab7;
  }
  .gf-input::placeholder {
    color: #94a3b8;
  }

  .gf-input-boxed {
    width: 100%;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 14px;
    font-family: inherit;
    color: #1e293b;
    background: #f8fafc;
    outline: none;
    transition: all 0.2s;
  }
  .gf-input-boxed:focus {
    border-color: #673ab7;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(103, 58, 183, 0.12);
  }

  /* Radio Pills */
  .gf-radio-group {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 6px;
  }
  .gf-radio-btn {
    border: 1.5px solid #e2e8f0;
    background: #f8fafc;
    padding: 8px 18px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
    transition: all 0.18s ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .gf-radio-btn:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
  .gf-radio-btn.active {
    background: #673ab7;
    color: #ffffff;
    border-color: #673ab7;
    box-shadow: 0 4px 12px rgba(103, 58, 183, 0.3);
  }

  /* Photo drop area */
  .gf-photo-drop {
    border: 2px dashed #cbd5e1;
    border-radius: 14px;
    padding: 24px;
    text-align: center;
    background: #f8fafc;
    cursor: pointer;
    transition: all 0.2s;
  }
  .gf-photo-drop:hover {
    border-color: #673ab7;
    background: rgba(103, 58, 183, 0.03);
  }

  /* Submit Button */
  .gf-submit-btn {
    background: linear-gradient(135deg, #673ab7, #7e57c2);
    color: #ffffff;
    border: none;
    padding: 13px 36px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(103, 58, 183, 0.35);
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .gf-submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(103, 58, 183, 0.45);
    background: linear-gradient(135deg, #5e35b1, #673ab7);
  }
  .gf-submit-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  /* Response view cards */
  .resp-card {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    border: 1px solid #e2e8f0;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    animation: scaleIn 0.28s ease;
  }
  .resp-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 36px rgba(0,0,0,0.12);
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,0.65);
    backdrop-filter: blur(8px);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }
  .modal-content {
    background: #ffffff;
    border-radius: 20px;
    width: 100%;
    max-width: 580px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 60px rgba(0,0,0,0.3);
    padding: 28px;
    animation: scaleIn 0.25s ease;
  }
`;

export default function StudentRegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const isLoggedIn = !!auth?.user;
  const isAdmin = !!auth?.isAdmin;

  /* Navigation tab: 'form' (Google Form) | 'directory' (Directory) | 'classwise' */
  const [activeTab, setActiveTab] = useState('form');
  const [focusedField, setFocusedField] = useState(null);

  /* Registration Form State */
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedStudent, setSubmittedStudent] = useState(null);
  const fileInputRef = useRef(null);

  /* Directory State */
  const [students, setStudents] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStd, setFilterStd] = useState('');
  const [filterSec, setFilterSec] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);

  /* Edit Modal State (Admin / Staff) */
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [editPhoto, setEditPhoto] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  /* Calculate live age based on DOB */
  const currentAge = calcAge(form.dateOfBirth);

  /* ─── Fetch Students (Open to public or auth) ─── */
  const fetchStudents = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await studentAPI.getAll(search || undefined);
      let data = Array.isArray(res.data) ? res.data : [];
      if (filterStd) data = data.filter(s => String(s.standard) === String(filterStd));
      if (filterSec) data = data.filter(s => s.section === filterSec);
      setStudents(data);
    } catch (err) {
      // Non-blocking toast on failure
      console.error('Failed to load students', err);
    } finally {
      setLoadingList(false);
    }
  }, [search, filterStd, filterSec]);

  useEffect(() => {
    if (activeTab === 'directory' || activeTab === 'classwise') {
      const timer = setTimeout(fetchStudents, 250);
      return () => clearTimeout(timer);
    }
  }, [activeTab, fetchStudents]);

  /* ─── Form Inputs Handler ─── */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  /* ─── Submit Google Form Registration (Public Write Access!) ─── */
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Required field validation according to Google Form requirements:
    // Name, DOB, Parent Name, Mobile Number, Standard, Section
    if (!form.studentName.trim()) {
      toast.warning('Please enter Student Name');
      return;
    }
    if (!form.dateOfBirth) {
      toast.warning('Please enter Date of Birth');
      return;
    }
    if (!form.parentName.trim()) {
      toast.warning('Please enter Parent / Guardian Name');
      return;
    }
    if (!form.mobileNumber.trim() || !/^[6-9]\d{9}$/.test(form.mobileNumber.trim())) {
      toast.warning('Please enter a valid 10-digit Indian mobile number (starting with 6-9)');
      return;
    }
    if (!form.standard) {
      toast.warning('Please select a Class / Standard');
      return;
    }
    if (!form.section) {
      toast.warning('Please select a Section');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        studentName: form.studentName.trim(),
        studentId: form.studentId.trim() || undefined,
        rollNumber: form.rollNumber ? parseInt(form.rollNumber, 10) : undefined,
        standard: parseInt(form.standard, 10),
        section: form.section,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        parentName: form.parentName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        address: form.address.trim() || undefined,
      };

      let res;
      if (photo) {
        const fd = new FormData();
        fd.append('student', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        fd.append('photo', photo);
        res = await studentAPI.create(fd);
      } else {
        res = await studentAPI.create(payload);
      }
      const savedStudent = res.data;

      setSubmittedStudent(savedStudent);
      toast.success('Registration submitted successfully! 🎉');
      setForm(initialForm);
      setPhoto(null);
      setPhotoPreview(null);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Submission failed. Please check your details.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Edit Existing Student (for staff / admin) ─── */
  const openEditModal = async (id) => {
    try {
      const res = await studentAPI.getById(id);
      const s = res.data;
      setEditForm({
        studentName: s.studentName || '',
        studentId: s.studentId || '',
        rollNumber: s.rollNumber || '',
        standard: String(s.standard || '1'),
        section: s.section || 'A',
        dateOfBirth: s.dateOfBirth || '',
        gender: s.gender || 'Male',
        parentName: s.parentName || '',
        mobileNumber: s.mobileNumber || '',
        address: s.address || '',
      });
      setEditPhotoPreview(s.photoPath ? `http://localhost:8080${s.photoPath}` : null);
      setEditPhoto(null);
      setEditId(id);
      setShowEditModal(true);
    } catch {
      toast.error('Could not load student details');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const payload = {
        studentName: editForm.studentName.trim(),
        studentId: editForm.studentId.trim(),
        rollNumber: parseInt(editForm.rollNumber, 10),
        standard: parseInt(editForm.standard, 10),
        section: editForm.section,
        dateOfBirth: editForm.dateOfBirth,
        gender: editForm.gender,
        parentName: editForm.parentName.trim(),
        mobileNumber: editForm.mobileNumber.trim(),
        address: editForm.address.trim(),
      };
      const fd = new FormData();
      fd.append('student', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      if (editPhoto) fd.append('photo', editPhoto);

      await studentAPI.update(editId, fd);
      toast.success('Student record updated successfully!');
      setShowEditModal(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await studentAPI.delete(deleteConfirmId);
      toast.success('Student record removed');
      setDeleteConfirmId(null);
      fetchStudents();
    } catch {
      toast.error('Failed to remove student');
    }
  };

  /* ─── Group students for Class-wise View ─── */
  const groupedStudents = students.reduce((acc, s) => {
    const key = `${s.standard}-${s.section}`;
    if (!acc[key]) {
      acc[key] = { standard: s.standard, section: s.section, students: [] };
    }
    acc[key].students.push(s);
    return acc;
  }, {});

  const classList = selectedClass
    ? students.filter(s => s.standard === selectedClass.std && s.section === selectedClass.sec)
    : [];

  return (
    <div style={{ minHeight: '100vh', background: '#f0ebf8' }}>
      <style>{CSS}</style>

      {/* Top App Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg, #673ab7, #512da8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', fontSize: 20, boxShadow: '0 4px 12px rgba(103, 58, 183, 0.35)'
            }}>
              <i className="bi bi-mortarboard-fill"></i>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#1e1b4b', letterSpacing: '-0.3px' }}>
                Attenda School
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Student Registration Portal</span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span style={{ color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
                  Open Public Access
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* View Switcher Pills */}
            <div style={{ background: '#f3e8ff', padding: 4, borderRadius: 12, display: 'flex', gap: 4 }}>
              <button
                onClick={() => setActiveTab('form')}
                style={{
                  border: 'none',
                  background: activeTab === 'form' ? '#673ab7' : 'transparent',
                  color: activeTab === 'form' ? '#ffffff' : '#6b21a8',
                  padding: '7px 16px',
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.18s ease'
                }}
              >
                <i className="bi bi-ui-checks"></i> Google Form
              </button>
              <button
                onClick={() => setActiveTab('directory')}
                style={{
                  border: 'none',
                  background: activeTab === 'directory' ? '#673ab7' : 'transparent',
                  color: activeTab === 'directory' ? '#ffffff' : '#6b21a8',
                  padding: '7px 16px',
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.18s ease'
                }}
              >
                <i className="bi bi-people-fill"></i> Directory ({students.length || '•'})
              </button>
              <button
                onClick={() => setActiveTab('classwise')}
                style={{
                  border: 'none',
                  background: activeTab === 'classwise' ? '#673ab7' : 'transparent',
                  color: activeTab === 'classwise' ? '#ffffff' : '#6b21a8',
                  padding: '7px 16px',
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.18s ease'
                }}
              >
                <i className="bi bi-grid-fill"></i> Class-wise
              </button>
            </div>

            {/* Admin or Login Link */}
            {isLoggedIn ? (
              <button
                onClick={() => navigate('/')}
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 11,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <i className="bi bi-speedometer2"></i> Dashboard
              </button>
            ) : (
              <Link
                to="/login"
                style={{
                  textDecoration: 'none',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 11,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <i className="bi bi-shield-lock"></i> Staff Login
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="gf-container">

        {/* ══════════════════════════════════════════════════════════
            TAB 1: GOOGLE FORM REGISTRATION (WRITE ACCESS WITHOUT LOGIN)
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'form' && (
          <div>
            {submittedStudent ? (
              /* Success Confirmation Screen (Google Forms style) */
              <div className="gf-header-card" style={{ padding: '36px 32px', textAlign: 'center' }}>
                <div style={{
                  width: 76, height: 76, borderRadius: '50%', background: '#dcfce7',
                  color: '#15803d', fontSize: 36, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 8px 24px rgba(22, 163, 74, 0.2)'
                }}>
                  <i className="bi bi-check2"></i>
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>
                  Student Registered Successfully!
                </h2>
                <p style={{ color: '#64748b', fontSize: 14, maxWidth: 480, margin: '0 auto 24px' }}>
                  The admission record for <strong>{submittedStudent.studentName}</strong> has been registered into Standard {submittedStudent.standard}-{submittedStudent.section}.
                </p>

                {/* Summary Box */}
                <div style={{
                  background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 14,
                  padding: '18px 24px', maxWidth: 440, margin: '0 auto 28px', textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Student ID:</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#673ab7' }}>{submittedStudent.studentId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Standard & Section:</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Class {submittedStudent.standard} - {submittedStudent.section}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Roll Number:</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>#{submittedStudent.rollNumber}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Parent Contact:</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{submittedStudent.mobileNumber}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setSubmittedStudent(null);
                      setForm(initialForm);
                    }}
                    style={{
                      background: '#673ab7', color: '#ffffff', border: 'none',
                      padding: '11px 24px', borderRadius: 10, fontWeight: 700,
                      fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                    }}
                  >
                    <i className="bi bi-plus-circle"></i> Submit Another Student
                  </button>
                  <button
                    onClick={() => setActiveTab('directory')}
                    style={{
                      background: '#ffffff', color: '#475569', border: '1.5px solid #cbd5e1',
                      padding: '11px 24px', borderRadius: 10, fontWeight: 700,
                      fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                    }}
                  >
                    <i className="bi bi-people"></i> View Registered Directory
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} noValidate>
                {/* Google Form Header Card */}
                <div className="gf-header-card">
                  <div className="gf-header-stripe"></div>
                  <div className="gf-header-body">
                    <h1 className="gf-header-title">Student Admission & Registration Form</h1>
                    <p className="gf-header-desc">
                      Official student enrollment portal. Please fill in the student's details, date of birth, parent information, and class allocation. All submissions are directly recorded into the system.
                    </p>
                    <div className="gf-header-meta">
                      <span>* Indicates required question</span>
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>
                        <i className="bi bi-unlock-fill me-1"></i> Public Write Access (No Login Required)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Question 1: Student Name */}
                <div className={`gf-card ${focusedField === 'studentName' ? 'focused' : ''}`}>
                  <label className="gf-q-title" htmlFor="studentName">
                    Student Full Name <span className="gf-required-star">*</span>
                  </label>
                  <div className="gf-q-help">Enter full legal name as per birth certificate / official ID</div>
                  <input
                    id="studentName"
                    name="studentName"
                    type="text"
                    className="gf-input"
                    placeholder="Your answer"
                    value={form.studentName}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('studentName')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>

                {/* Question 2: Date of Birth & Live Age */}
                <div className={`gf-card ${focusedField === 'dateOfBirth' ? 'focused' : ''}`}>
                  <label className="gf-q-title" htmlFor="dateOfBirth">
                    Date of Birth <span className="gf-required-star">*</span>
                  </label>
                  <div className="gf-q-help">Select student's date of birth (age is calculated automatically)</div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      className="gf-input-boxed"
                      style={{ maxWidth: 260 }}
                      value={form.dateOfBirth}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('dateOfBirth')}
                      onBlur={() => setFocusedField(null)}
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />

                    {/* Age Indicator Badge */}
                    {currentAge !== null ? (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#f3e8ff', color: '#6b21a8', border: '1px solid #d8b4fe',
                        padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700
                      }}>
                        <i className="bi bi-cake2"></i>
                        <span>Age: <strong>{currentAge} years old</strong></span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>
                        (Age will calculate once DOB is selected)
                      </span>
                    )}
                  </div>
                </div>

                {/* Question 3: Parent / Guardian Name */}
                <div className={`gf-card ${focusedField === 'parentName' ? 'focused' : ''}`}>
                  <label className="gf-q-title" htmlFor="parentName">
                    Parent / Guardian Name <span className="gf-required-star">*</span>
                  </label>
                  <div className="gf-q-help">Father's, Mother's, or Legal Guardian's full name</div>
                  <input
                    id="parentName"
                    name="parentName"
                    type="text"
                    className="gf-input"
                    placeholder="Your answer"
                    value={form.parentName}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('parentName')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>

                {/* Question 4: Phone / Mobile Number */}
                <div className={`gf-card ${focusedField === 'mobileNumber' ? 'focused' : ''}`}>
                  <label className="gf-q-title" htmlFor="mobileNumber">
                    Phone / Mobile Number <span className="gf-required-star">*</span>
                  </label>
                  <div className="gf-q-help">10-digit Indian phone number for attendance and exam notifications</div>
                  <div style={{ position: 'relative', maxWidth: 360 }}>
                    <span style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      color: '#64748b', fontSize: 14, fontWeight: 700
                    }}>
                      +91
                    </span>
                    <input
                      id="mobileNumber"
                      name="mobileNumber"
                      type="tel"
                      maxLength={10}
                      className="gf-input"
                      style={{ paddingLeft: 38 }}
                      placeholder="9876543210"
                      value={form.mobileNumber}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setForm(prev => ({ ...prev, mobileNumber: val }));
                      }}
                      onFocus={() => setFocusedField('mobileNumber')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>

                {/* Question 5: Standard (Class) & Section */}
                <div className={`gf-card ${focusedField === 'classSection' ? 'focused' : ''}`}>
                  <div className="gf-q-title">
                    Class (Standard) & Section <span className="gf-required-star">*</span>
                  </div>
                  <div className="gf-q-help">Select the grade level and classroom section for admission</div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 10 }}>
                    {/* Standard Dropdown */}
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                        Standard (Grade)
                      </label>
                      <select
                        name="standard"
                        className="gf-input-boxed"
                        value={form.standard}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('classSection')}
                        onBlur={() => setFocusedField(null)}
                        required
                      >
                        {STANDARDS.map(s => (
                          <option key={s} value={s}>
                            Standard {s} ({ORDINALS[s]} Grade)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Section Selector */}
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                        Section
                      </label>
                      <div className="gf-radio-group">
                        {SECTIONS.map(sec => (
                          <button
                            type="button"
                            key={sec}
                            className={`gf-radio-btn ${form.section === sec ? 'active' : ''}`}
                            onClick={() => setForm(prev => ({ ...prev, section: sec }))}
                          >
                            Section {sec}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question 6: Gender */}
                <div className={`gf-card ${focusedField === 'gender' ? 'focused' : ''}`}>
                  <div className="gf-q-title">
                    Gender <span className="gf-required-star">*</span>
                  </div>
                  <div className="gf-radio-group">
                    {GENDERS.map(g => (
                      <button
                        type="button"
                        key={g}
                        className={`gf-radio-btn ${form.gender === g ? 'active' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, gender: g }))}
                      >
                        {g === 'Male' ? '👦 Male' : g === 'Female' ? '👧 Female' : '⚧ Other'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 7: Student ID & Roll Number (Optional / Auto-generated) */}
                <div className={`gf-card ${focusedField === 'identifiers' ? 'focused' : ''}`}>
                  <div className="gf-q-title">
                    Student ID & Roll Number
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b', marginLeft: 6 }}>
                      (Optional — will auto-generate if left blank)
                    </span>
                  </div>
                  <div className="gf-q-help">You can provide custom values or leave them blank for automatic assignment</div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                        Student ID
                      </label>
                      <input
                        name="studentId"
                        type="text"
                        className="gf-input-boxed"
                        placeholder="Auto-generated (e.g. STU12345)"
                        value={form.studentId}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('identifiers')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                        Roll Number
                      </label>
                      <input
                        name="rollNumber"
                        type="number"
                        min="1"
                        className="gf-input-boxed"
                        placeholder="Auto-assigned next number"
                        value={form.rollNumber}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('identifiers')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                  </div>
                </div>

                {/* Question 8: Address / Place */}
                <div className={`gf-card ${focusedField === 'address' ? 'focused' : ''}`}>
                  <label className="gf-q-title" htmlFor="address">
                    Residential Address / Place
                  </label>
                  <div className="gf-q-help">Street address, city, town, or village</div>
                  <textarea
                    id="address"
                    name="address"
                    rows={2}
                    className="gf-input-boxed"
                    placeholder="Enter permanent address or city"
                    value={form.address}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('address')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                {/* Question 9: Student Photograph (Optional) */}
                <div className={`gf-card ${focusedField === 'photo' ? 'focused' : ''}`}>
                  <div className="gf-q-title">Student Photograph (Optional)</div>
                  <div className="gf-q-help">Upload passport size photo (PNG, JPG up to 5MB)</div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePhotoSelect}
                  />

                  {photoPreview ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, background: '#f8fafc', padding: 14, borderRadius: 14, border: '1.5px solid #e2e8f0' }}>
                      <img
                        src={photoPreview}
                        alt="Student preview"
                        style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', border: '2px solid #673ab7' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{photo?.name || 'Uploaded Photo'}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{(photo?.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                        style={{
                          background: '#fee2e2', border: '1px solid #fca5a5', color: '#ef4444',
                          padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      className="gf-photo-drop"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <i className="bi bi-cloud-arrow-up" style={{ fontSize: 32, color: '#673ab7' }}></i>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginTop: 6 }}>
                        Click to upload student photo
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        Supports JPG, PNG formats
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, flexWrap: 'wrap', gap: 14 }}>
                  <button
                    type="submit"
                    className="gf-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send-fill"></i>
                        <span>Submit Registration</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Clear all entered fields?')) {
                        setForm(initialForm);
                        setPhoto(null);
                        setPhotoPreview(null);
                      }
                    }}
                    style={{
                      background: 'transparent', border: 'none', color: '#673ab7',
                      fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: '10px 16px'
                    }}
                  >
                    Clear form
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginTop: 36, color: '#94a3b8', fontSize: 11 }}>
                  This content is securely created and stored by the Attenda School Management System.
                </div>
              </form>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2: REGISTERED STUDENTS DIRECTORY (CARDS VIEW)
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'directory' && (
          <div>
            {/* Filter & Search Bar */}
            <div style={{
              background: '#ffffff', borderRadius: 16, padding: '16px 20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
              marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap'
            }}>
              {/* Search Box */}
              <div style={{ position: 'relative', flex: '1 1 240px' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="gf-input-boxed"
                  style={{ paddingLeft: 36 }}
                  placeholder="Search by name, ID or phone..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {/* Standard Filter */}
              <select
                className="gf-input-boxed"
                style={{ width: 'auto', minWidth: 140 }}
                value={filterStd}
                onChange={e => setFilterStd(e.target.value)}
              >
                <option value="">All Standards</option>
                {STANDARDS.map(s => <option key={s} value={s}>Standard {s}</option>)}
              </select>

              {/* Section Filter */}
              <select
                className="gf-input-boxed"
                style={{ width: 'auto', minWidth: 130 }}
                value={filterSec}
                onChange={e => setFilterSec(e.target.value)}
              >
                <option value="">All Sections</option>
                {SECTIONS.map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
              </select>

              {(search || filterStd || filterSec) && (
                <button
                  onClick={() => { setSearch(''); setFilterStd(''); setFilterSec(''); }}
                  style={{
                    background: '#fee2e2', border: '1px solid #fca5a5', color: '#ef4444',
                    padding: '9px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700
                  }}
                >
                  ✕ Clear
                </button>
              )}

              {/* Add Student Quick Button */}
              <button
                onClick={() => setActiveTab('form')}
                style={{
                  marginLeft: 'auto', background: 'linear-gradient(135deg, #673ab7, #7e57c2)',
                  color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: 10,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: '0 4px 14px rgba(103, 58, 183, 0.3)'
                }}
              >
                <i className="bi bi-plus-lg"></i> Register New
              </button>
            </div>

            {/* Students List Display */}
            {loadingList ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{
                  width: 40, height: 40, border: '3px solid rgba(103, 58, 183, 0.2)',
                  borderTopColor: '#673ab7', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
                }} />
                <p style={{ color: '#64748b', fontSize: 14 }}>Loading registered students...</p>
              </div>
            ) : students.length === 0 ? (
              <div style={{
                background: '#ffffff', borderRadius: 18, padding: '50px 20px',
                textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}>
                <div style={{ fontSize: 48, marginBottom: 10, opacity: 0.6 }}>📋</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>No Students Found</h3>
                <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
                  No student records match your search or filter criteria.
                </p>
                <button
                  onClick={() => setActiveTab('form')}
                  style={{
                    background: '#673ab7', color: '#fff', border: 'none', padding: '10px 22px',
                    borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer'
                  }}
                >
                  <i className="bi bi-plus-lg me-1"></i> Register First Student
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 18 }}>
                {students.map(s => {
                  const secTheme = SEC_THEMES[s.section] || SEC_THEMES.A;
                  const age = calcAge(s.dateOfBirth);

                  return (
                    <div key={s.id} className="resp-card">
                      {/* Card Top Stripe */}
                      <div style={{ height: 6, background: secTheme.grad }} />

                      <div style={{ padding: '20px 22px' }}>
                        {/* Header: Photo + Name + Class badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                          {s.photoPath ? (
                            <img
                              src={`http://localhost:8080${s.photoPath}`}
                              alt={s.studentName}
                              style={{
                                width: 52, height: 52, borderRadius: 14, objectFit: 'cover',
                                border: `2px solid ${secTheme.accent}`, flexShrink: 0
                              }}
                            />
                          ) : (
                            <div style={{
                              width: 52, height: 52, borderRadius: 14, background: secTheme.light,
                              color: secTheme.text, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 20, fontWeight: 800, flexShrink: 0
                            }}>
                              {s.studentName?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                          )}

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontWeight: 800, fontSize: 16, color: '#1e293b',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                              {s.studentName}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                              <span style={{
                                background: secTheme.light, color: secTheme.text,
                                border: `1px solid ${secTheme.border}`, padding: '2px 8px',
                                borderRadius: 6, fontSize: 11, fontWeight: 700
                              }}>
                                Class {s.standard} - {s.section}
                              </span>
                              <span style={{ fontSize: 11, color: '#64748b' }}>
                                Roll #{s.rollNumber}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Fields Grid */}
                        <div style={{
                          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                          background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #f1f5f9',
                          marginBottom: 14
                        }}>
                          <div>
                            <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                              Date of Birth
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                              {fmtDOB(s.dateOfBirth)}
                            </span>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                              Age
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#673ab7' }}>
                              {age !== null ? `${age} yrs` : '—'}
                            </span>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                              Parent / Guardian
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#334155', wordBreak: 'break-word' }}>
                              {s.parentName || '—'}
                            </span>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                              Mobile Number
                            </span>
                            <a
                              href={`tel:${s.mobileNumber}`}
                              style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', textDecoration: 'none' }}
                            >
                              📞 {s.mobileNumber || '—'}
                            </a>
                          </div>
                          {s.address && (
                            <div style={{ gridColumn: 'span 2' }}>
                              <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                                Address / Place
                              </span>
                              <span style={{ fontSize: 12, color: '#475569' }}>
                                🏠 {s.address}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions Toolbar */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 }}>
                          <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                            ID: {s.studentId}
                          </span>

                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => openEditModal(s.id)}
                              title="Edit Student"
                              style={{
                                background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569',
                                padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                              }}
                            >
                              <i className="bi bi-pencil"></i> Edit
                            </button>
                            <button
                              onClick={() => navigate(`/students/${s.id}/documents`)}
                              title="Manage Proof Documents"
                              style={{
                                background: 'rgba(103, 58, 183, 0.08)', border: '1px solid rgba(103, 58, 183, 0.25)',
                                color: '#673ab7', padding: '5px 10px', borderRadius: 8, fontSize: 12,
                                fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                              }}
                            >
                              <i className="bi bi-folder2-open"></i> Docs
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => setDeleteConfirmId(s.id)}
                                title="Remove Student"
                                style={{
                                  background: '#fee2e2', border: '1px solid #fca5a5', color: '#ef4444',
                                  padding: '5px 8px', borderRadius: 8, fontSize: 12, cursor: 'pointer'
                                }}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 3: CLASS-WISE VIEW
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'classwise' && (
          <div>
            {selectedClass ? (
              /* Single Class View */
              <div>
                <button
                  onClick={() => setSelectedClass(null)}
                  style={{
                    background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 10,
                    padding: '8px 16px', fontSize: 13, fontWeight: 700, color: '#475569',
                    cursor: 'pointer', marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6
                  }}
                >
                  <i className="bi bi-arrow-left"></i> Back to All Classes
                </button>

                <div style={{
                  background: '#ffffff', borderRadius: 16, padding: '20px 24px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', marginBottom: 20
                }}>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
                    Standard {selectedClass.std} — Section {selectedClass.sec}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
                    {classList.length} enrolled students
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                  {classList.map(s => (
                    <div key={s.id} className="resp-card" style={{ padding: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12, background: '#f3e8ff',
                          color: '#673ab7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, fontWeight: 800
                        }}>
                          {s.rollNumber}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b' }}>{s.studentName}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>ID: {s.studentId} • {calcAge(s.dateOfBirth) ? `${calcAge(s.dateOfBirth)} yrs` : '—'}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: '#475569', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div><strong>Parent:</strong> {s.parentName || '—'}</div>
                        <div><strong>Phone:</strong> {s.mobileNumber || '—'}</div>
                        <div><strong>DOB:</strong> {fmtDOB(s.dateOfBirth)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* All Classes Grid */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {Object.keys(groupedStudents).length === 0 ? (
                  <div style={{
                    gridColumn: '1 / -1', background: '#ffffff', borderRadius: 16,
                    padding: '40px 20px', textAlign: 'center', color: '#64748b'
                  }}>
                    No class enrollment records yet.
                  </div>
                ) : (
                  Object.entries(groupedStudents).map(([key, group]) => {
                    const secTheme = SEC_THEMES[group.section] || SEC_THEMES.A;
                    return (
                      <div
                        key={key}
                        onClick={() => setSelectedClass({ std: group.standard, sec: group.section })}
                        style={{
                          background: '#ffffff', borderRadius: 16, padding: '22px',
                          boxShadow: '0 4px 18px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
                          cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.06)';
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0,
                          height: 5, background: secTheme.grad
                        }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <span style={{
                            background: secTheme.light, color: secTheme.text,
                            border: `1px solid ${secTheme.border}`, padding: '4px 12px',
                            borderRadius: 8, fontSize: 13, fontWeight: 800
                          }}>
                            Class {group.standard} - {group.section}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>
                            👥 {group.students.length}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
                          {ORDINALS[group.standard]} Grade Section {group.section}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#673ab7', fontSize: 12, fontWeight: 700 }}>
                          <span>View class list</span>
                          <i className="bi bi-chevron-right"></i>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ══════════════════════════════════════════════════════════
          EDIT STUDENT MODAL
         ══════════════════════════════════════════════════════════ */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', margin: 0 }}>
                ✏️ Edit Student Information
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {editPhotoPreview && (
                  <div style={{ textAlign: 'center', marginBottom: 4 }}>
                    <img
                      src={editPhotoPreview}
                      alt="Current student photo"
                      style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid #673ab7' }}
                    />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Student Name
                  </label>
                  <input
                    type="text"
                    className="gf-input-boxed"
                    value={editForm.studentName}
                    onChange={e => setEditForm({ ...editForm, studentName: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Standard
                    </label>
                    <select
                      className="gf-input-boxed"
                      value={editForm.standard}
                      onChange={e => setEditForm({ ...editForm, standard: e.target.value })}
                    >
                      {STANDARDS.map(s => <option key={s} value={s}>Standard {s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Section
                    </label>
                    <select
                      className="gf-input-boxed"
                      value={editForm.section}
                      onChange={e => setEditForm({ ...editForm, section: e.target.value })}
                    >
                      {SECTIONS.map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="gf-input-boxed"
                      value={editForm.dateOfBirth}
                      onChange={e => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Roll Number
                    </label>
                    <input
                      type="number"
                      className="gf-input-boxed"
                      value={editForm.rollNumber}
                      onChange={e => setEditForm({ ...editForm, rollNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Parent / Guardian Name
                  </label>
                  <input
                    type="text"
                    className="gf-input-boxed"
                    value={editForm.parentName}
                    onChange={e => setEditForm({ ...editForm, parentName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    className="gf-input-boxed"
                    value={editForm.mobileNumber}
                    onChange={e => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Address
                  </label>
                  <input
                    type="text"
                    className="gf-input-boxed"
                    value={editForm.address}
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569',
                    padding: '9px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{
                    background: '#673ab7', color: '#ffffff', border: 'none',
                    padding: '9px 22px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer'
                  }}
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          DELETE CONFIRM MODAL
         ══════════════════════════════════════════════════════════ */}
      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div style={{
            background: '#ffffff', borderRadius: 18, padding: '28px', maxWidth: 400,
            width: '100%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', animation: 'scaleIn 0.2s ease'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              width: 54, height: 54, borderRadius: '50%', background: '#fee2e2',
              color: '#dc2626', fontSize: 24, display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 14px'
            }}>
              <i className="bi bi-trash"></i>
            </div>
            <h4 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
              Remove Student?
            </h4>
            <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 20px' }}>
              Are you sure you want to remove this student record? This action will deactivate their profile.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569',
                  padding: '9px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  background: '#dc2626', color: '#ffffff', border: 'none',
                  padding: '9px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer'
                }}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
