import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { documentAPI, studentAPI } from '../api/services';
import { toast } from 'react-toastify';

const DOC_TYPES = [
  'Birth Certificate',
  'Aadhaar Card',
  'Transfer Certificate',
  'Caste Certificate',
  'Income Certificate',
  'Medical Certificate',
  'Passport',
  'Previous Marksheet',
  'Residence Proof',
  'Other',
];

function formatDate(dt) {
  if (!dt) return '';
  try {
    return new Date(dt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dt;
  }
}

export default function StudentDocumentsPage() {
  const { studentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [docsRes, stuRes] = await Promise.all([
        documentAPI.getAll(studentId),
        studentAPI.getById(studentId),
      ]);
      setDocuments(docsRes.data || []);
      setStudent(stuRes.data);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.warning('Please select a file to upload');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('documentType', docType);
      fd.append('description', description);
      fd.append('file', file);
      await documentAPI.upload(studentId, fd);
      toast.success('Document uploaded successfully! 📁');
      setShowUpload(false);
      setFile(null);
      setDescription('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Document upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this official document from student dossier?')) return;
    try {
      await documentAPI.delete(studentId, docId);
      toast.success('Document deleted');
      fetchData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const stuName = student?.studentName || location.state?.studentName || 'Student';
  const stuIdLabel = student?.studentId || location.state?.studentId || '';

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#FFFFFF', padding: '24px' }}>
      {/* Top Navbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: 'rgba(18, 18, 18, 0.95)',
          border: '1px solid var(--gold-border)',
          borderRadius: 14,
          padding: '14px 20px',
          marginBottom: 24,
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate('/students')}
        >
          <i className="bi bi-arrow-left"></i> Back to Students
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--gold-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: '#080808',
              boxShadow: 'var(--gold-glow)',
            }}
          >
            <i className="bi bi-folder-fill"></i>
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#FFFFFF' }}>
              Document Vault: {stuName}
            </h4>
            <div style={{ fontSize: 12, color: '#D4AF37' }}>
              Registration ID: {stuIdLabel} • {documents.length} Files Attached
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowUpload(true)}>
          <i className="bi bi-cloud-arrow-up-fill"></i> Upload Document
        </button>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Document Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 36, height: 36, margin: 'auto' }}></div>
            <p style={{ marginTop: 12, color: '#A0A0A0' }}>Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <i className="bi bi-folder-x" style={{ fontSize: 52, color: '#D4AF37', display: 'block', marginBottom: 14 }}></i>
            <h4 style={{ color: '#FFFFFF' }}>No Documents Attached Yet</h4>
            <p style={{ color: '#A0A0A0', fontSize: 13, maxWidth: 380, margin: '8px auto 20px' }}>
              Upload verification certificates, Aadhaar proof, medical records, or previous school transfer certificates.
            </p>
            <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
              <i className="bi bi-cloud-upload-fill"></i> Upload First Document
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="card"
                style={{
                  background: '#121212',
                  border: '1px solid var(--gold-border)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: 'rgba(212, 175, 55, 0.12)',
                        border: '1px solid var(--gold-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        color: '#F5D76E',
                      }}
                    >
                      <i className="bi bi-file-earmark-text-fill"></i>
                    </div>
                    <span className="badge badge-gold">{doc.documentType}</span>
                  </div>

                  <strong style={{ fontSize: 14, color: '#FFFFFF', display: 'block', marginBottom: 4 }}>
                    {doc.fileName || 'Attached Document'}
                  </strong>
                  <p style={{ fontSize: 12, color: '#A0A0A0', marginBottom: 10 }}>
                    {doc.description || 'No additional description provided'}
                  </p>
                  <div style={{ fontSize: 11, color: '#777' }}>
                    Uploaded on: {formatDate(doc.createdAt)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 18, borderTop: '1px solid rgba(212,175,55,0.1)', paddingTop: 14 }}>
                  {doc.filePath && (
                    <a
                      href={`http://localhost:8080${doc.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <i className="bi bi-eye"></i> View File
                    </a>
                  )}
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: 'var(--danger-border)', color: '#F87171' }}
                    onClick={() => handleDelete(doc.id)}
                    title="Delete Document"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL: UPLOAD DOCUMENT ── */}
      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="bi bi-cloud-arrow-up-fill" style={{ color: '#D4AF37', fontSize: 20 }}></i>
                <h4>Upload Official Document</h4>
              </div>
              <button className="modal-close" onClick={() => setShowUpload(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Document Classification *</label>
                  <select
                    className="form-select"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    {DOC_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Description / Certificate Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Original issued by municipal registrar"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Select File (PDF, PNG, JPG) *</label>
                  <div className="photo-upload-area" onClick={() => fileRef.current?.click()}>
                    <input
                      type="file"
                      ref={fileRef}
                      style={{ display: 'none' }}
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <div style={{ fontSize: 28, color: '#D4AF37', marginBottom: 6 }}>
                      <i className="bi bi-file-earmark-arrow-up"></i>
                    </div>
                    <div style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 600 }}>
                      {file ? file.name : 'Click to choose file from computer'}
                    </div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                      Max upload size: 10MB
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowUpload(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? (
                    <><div className="spinner"></div> Uploading...</>
                  ) : (
                    <><i className="bi bi-upload"></i> Upload to Vault</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
