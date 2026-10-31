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

const DOC_ICONS = {
  'Birth Certificate': '🍼',
  'Aadhaar Card': '🪪',
  'Transfer Certificate': '📜',
  'Caste Certificate': '📄',
  'Income Certificate': '💰',
  'Medical Certificate': '🏥',
  'Passport': '✈️',
  'Previous Marksheet': '📊',
  'Residence Proof': '🏠',
  'Other': '📁',
};

function formatDate(dt) {
  if (!dt) return '';
  try {
    return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return dt; }
}

function fileIcon(fileName) {
  if (!fileName) return '📄';
  const ext = fileName.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return '🖼️';
  if (ext === 'pdf') return '📕';
  if (['doc', 'docx'].includes(ext)) return '📝';
  if (['xls', 'xlsx'].includes(ext)) return '📊';
  return '📄';
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
      setDocuments(docsRes.data);
      setStudent(stuRes.data);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { toast.warning('Please select a file'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('documentType', docType);
      fd.append('description', description);
      fd.append('file', file);
      await documentAPI.upload(studentId, fd);
      toast.success('Document uploaded successfully! ✅');
      setShowUpload(false);
      setFile(null); setDescription('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await documentAPI.delete(studentId, docId);
      toast.success('Document deleted');
      fetchData();
    } catch { toast.error('Delete failed'); }
  };

  const stuName = student?.studentName || location.state?.studentName || 'Student';
  const stuIdLabel = student?.studentId || location.state?.studentId || '';

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeInUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
    @keyframes slideIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
    .doc-card { transition: all 0.22s ease; animation: fadeInUp 0.3s ease both; }
    .doc-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.4) !important; }
    .upload-drop { transition: all 0.2s ease; }
    .upload-drop:hover { border-color: rgba(99,102,241,0.6) !important; background: rgba(99,102,241,0.08) !important; }
    .inp:focus { border-color: rgba(99,102,241,0.6) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; outline: none; }
    .inp::placeholder { color: rgba(255,255,255,0.25); }
    .del-btn:hover { background: rgba(239,68,68,0.25) !important; }
    .view-btn:hover { background: rgba(99,102,241,0.25) !important; }
    select.inp option { background: #1e1b4b; color: white; }
  `;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0b0f1a 0%, #111827 50%, #0d1b2a 100%)', fontFamily: 'Inter, sans-serif' }}>
      <style>{styles}</style>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(11,15,26,0.88)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '13px 28px', display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <button onClick={() => navigate('/students')} style={{
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10, color: 'rgba(255,255,255,0.8)', padding: '8px 15px',
          cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'Inter, sans-serif',
        }}>
          <i className="bi bi-arrow-left"></i> Students
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 4px 16px rgba(245,158,11,0.4)',
          }}>📁</div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>Document Manager</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
              {stuName} {stuIdLabel && <span style={{ color: 'rgba(255,255,255,0.25)' }}>· {stuIdLabel}</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 20, padding: '5px 14px', color: '#fcd34d', fontSize: 12, fontWeight: 700,
          }}>
            📂 {documents.length} Documents
          </span>
          <button onClick={() => setShowUpload(true)} style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', borderRadius: 12, color: 'white', padding: '9px 20px',
            cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7,
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)', fontFamily: 'Inter, sans-serif',
          }}>
            <i className="bi bi-cloud-upload-fill"></i> Upload Document
          </button>
        </div>
      </div>

      <div style={{ padding: '28px', maxWidth: 1100, margin: '0 auto' }}>

        {/* Student Info Card */}
        {student && (
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 18, padding: '20px 24px', marginBottom: 28,
            display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
            animation: 'fadeInUp 0.4s ease',
          }}>
            {student.photoPath ? (
              <img src={`http://localhost:8080${student.photoPath}`} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(99,102,241,0.4)' }} />
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, fontWeight: 800, color: 'white',
              }}>{stuName[0]}</div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>{stuName}</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
                {[
                  { icon: '🆔', val: student.studentId },
                  { icon: '📚', val: `Std ${student.standard}-${student.section}` },
                  { icon: '👤', val: student.parentName },
                  { icon: '📱', val: student.mobileNumber },
                  { icon: '📍', val: student.address || '—' },
                ].map(item => (
                  <span key={item.icon} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {item.icon} <span style={{ color: 'rgba(255,255,255,0.75)' }}>{item.val}</span>
                  </span>
                ))}
              </div>
            </div>
            <div style={{
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: 12, padding: '10px 18px', textAlign: 'center',
            }}>
              <div style={{ color: '#fcd34d', fontWeight: 800, fontSize: 22 }}>{documents.length}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Documents</div>
            </div>
          </div>
        )}

        {/* Access Notice */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 12, padding: '12px 18px', marginBottom: 24,
        }}>
          <span style={{ fontSize: 18 }}>✏️</span>
          <div>
            <span style={{ color: '#a5b4fc', fontWeight: 700, fontSize: 13 }}>Write Access — </span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>You can upload, view and delete proof documents for this student.</span>
          </div>
        </div>

        {/* Document Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }}></div>
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading documents…</p>
          </div>
        ) : documents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', animation: 'fadeInUp 0.4s ease' }}>
            <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }}>📂</div>
            <h3 style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, margin: '0 0 10px' }}>No documents yet</h3>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14, margin: '0 0 24px' }}>Upload proof documents like Birth Certificate, Aadhaar Card etc.</p>
            <button onClick={() => setShowUpload(true)} style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
              borderRadius: 12, color: 'white', padding: '12px 28px',
              cursor: 'pointer', fontSize: 14, fontWeight: 700,
              fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
            }}>
              <i className="bi bi-cloud-upload-fill me-2"></i> Upload First Document
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {documents.map((doc, idx) => (
              <div key={doc.id} className="doc-card" style={{
                animationDelay: `${idx * 0.05}s`,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 18, overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              }}>
                {/* Card top color bar */}
                <div style={{ height: 4, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}></div>
                <div style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                      background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                    }}>{fileIcon(doc.fileName)}</div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>{DOC_ICONS[doc.documentType] || '📄'}</span>
                        <span style={{
                          background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
                          border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20,
                          padding: '2px 10px', fontSize: 11, fontWeight: 700,
                        }}>{doc.documentType}</span>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.fileName}
                      </div>
                      {doc.description && (
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>{doc.description}</div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                      <i className="bi bi-clock me-1"></i>{formatDate(doc.uploadedAt)}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={`http://localhost:8080/api${doc.filePath}`} target="_blank" rel="noopener noreferrer"
                        className="view-btn" style={{
                          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                          borderRadius: 8, padding: '5px 12px', color: '#a5b4fc',
                          fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5,
                          transition: 'all 0.2s', fontWeight: 600,
                        }}>
                        <i className="bi bi-eye"></i> View
                      </a>
                      <button className="del-btn" onClick={() => handleDelete(doc.id)} style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: 8, padding: '5px 10px', color: '#fca5a5',
                        fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                        transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                      }}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={e => e.target === e.currentTarget && setShowUpload(false)}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1f35, #1e1b4b)',
            border: '1px solid rgba(99,102,241,0.3)', borderRadius: 24,
            width: '100%', maxWidth: 500, overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            animation: 'slideIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(99,102,241,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>📤</span>
                <div>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>Upload Document</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>For: {stuName}</div>
                </div>
              </div>
              <button onClick={() => setShowUpload(false)} style={{
                background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8,
                color: 'rgba(255,255,255,0.6)', width: 32, height: 32, cursor: 'pointer',
                fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>×</button>
            </div>

            <form onSubmit={handleUpload} style={{ padding: '24px' }}>

              {/* Document Type */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>
                  Document Type *
                </label>
                <select className="inp" value={docType} onChange={e => setDocType(e.target.value)}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, padding: '11px 14px', color: 'white', fontSize: 14,
                    fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                  }}>
                  {DOC_TYPES.map(t => <option key={t} value={t}>{DOC_ICONS[t]} {t}</option>)}
                </select>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>
                  Description (optional)
                </label>
                <input className="inp" type="text" value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Original Aadhaar, DOB as per certificate…"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, padding: '11px 14px', color: 'white', fontSize: 14,
                    fontFamily: 'Inter, sans-serif',
                  }} />
              </div>

              {/* File Drop Zone */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>
                  File *
                </label>
                <div className="upload-drop"
                  onClick={() => fileRef.current.click()}
                  style={{
                    border: `2px dashed ${file ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: 14, padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
                    background: file ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
                  }}>
                  {file ? (
                    <div>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>{fileIcon(file.name)}</div>
                      <div style={{ color: '#a5b4fc', fontWeight: 700, fontSize: 14 }}>{file.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 4 }}>
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                      <div style={{ color: 'rgba(99,102,241,0.7)', fontSize: 12, marginTop: 6 }}>Click to change file</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.6 }}>📂</div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600 }}>Click to select file</div>
                      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 6 }}>PDF, JPG, PNG, DOC, etc. (max 10MB)</div>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileRef} hidden onChange={e => setFile(e.target.files[0] || null)} />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowUpload(false)} style={{
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12, color: 'rgba(255,255,255,0.7)', padding: '11px 22px',
                  cursor: 'pointer', fontSize: 13, fontFamily: 'Inter, sans-serif',
                }}>Cancel</button>
                <button type="submit" disabled={uploading} style={{
                  background: uploading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', borderRadius: 12, color: 'white', padding: '11px 26px',
                  cursor: uploading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif',
                  boxShadow: uploading ? 'none' : '0 4px 16px rgba(99,102,241,0.4)',
                }}>
                  {uploading ? (
                    <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div> Uploading…</>
                  ) : (
                    <><i className="bi bi-cloud-upload-fill"></i> Upload</>
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
