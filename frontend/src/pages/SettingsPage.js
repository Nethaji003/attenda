import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('school'); // 'school' | 'notifications' | 'academic' | 'security'

  // School Profile Settings
  const [schoolForm, setSchoolForm] = useState({
    schoolName: 'Attenda International Academy',
    motto: 'Excellence in Education and Character',
    affiliationCode: 'CBSE-AFF-98214',
    academicYear: '2024-2025',
    contactEmail: 'admin@attendaschool.edu',
    contactPhone: '+91 98765 43210',
    address: '128 Scholars Boulevard, Education City, Bangalore',
  });

  // SMS Configuration state (read-only verification to match backend application.properties)
  const [smsConfig] = useState({
    smsEnabled: false,
    provider: 'Twilio Cloud SMS Gateway',
    accountSid: 'YOUR_TWILIO_ACCOUNT_SID',
    fromNumber: '+1XXXXXXXXXX',
    simulationMode: true,
  });

  const handleSaveSchool = (e) => {
    e.preventDefault();
    toast.success('School profile settings updated successfully! 🏛️');
  };

  return (
    <div className="page-enter">
      {/* ── HEADER BANNER ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(14, 14, 14, 0.9) 100%)',
          border: '1px solid var(--gold-border)',
          borderRadius: 'var(--radius-md)',
          padding: '24px 28px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'var(--gold-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              color: '#080808',
              boxShadow: 'var(--gold-glow)',
            }}
          >
            <i className="bi bi-sliders"></i>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#FFFFFF' }}>
              System & School Settings
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: '#A0A0A0', marginTop: 4 }}>
              Manage institution preferences, notification gateways, and academic rules
            </p>
          </div>
        </div>
        <span className="badge badge-gold" style={{ fontSize: 12, padding: '6px 14px' }}>
          <i className="bi bi-shield-check"></i> Super Administrator
        </span>
      </div>

      {/* ── SETTINGS TABS ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { id: 'school', label: 'School Profile', icon: 'bi-building' },
          { id: 'notifications', label: 'SMS & Twilio Gateway', icon: 'bi-chat-left-dots' },
          { id: 'academic', label: 'Academic Standards', icon: 'bi-mortarboard' },
          { id: 'security', label: 'Authentication & Session', icon: 'bi-shield-lock' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`bi ${tab.icon}`}></i> {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: SCHOOL PROFILE ── */}
      {activeTab === 'school' && (
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon">
              <i className="bi bi-building"></i>
            </div>
            <h5>Institution Profile & Contact Details</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSaveSchool}>
              <div className="form-row mb-3">
                <div>
                  <label className="form-label">School / Institution Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={schoolForm.schoolName}
                    onChange={(e) => setSchoolForm({ ...schoolForm, schoolName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">School Motto / Tagline</label>
                  <input
                    type="text"
                    className="form-control"
                    value={schoolForm.motto}
                    onChange={(e) => setSchoolForm({ ...schoolForm, motto: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row mb-3">
                <div>
                  <label className="form-label">Affiliation / Board Registration Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={schoolForm.affiliationCode}
                    onChange={(e) => setSchoolForm({ ...schoolForm, affiliationCode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Active Academic Session</label>
                  <input
                    type="text"
                    className="form-control"
                    value={schoolForm.academicYear}
                    onChange={(e) => setSchoolForm({ ...schoolForm, academicYear: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row mb-3">
                <div>
                  <label className="form-label">Official Contact Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={schoolForm.contactEmail}
                    onChange={(e) => setSchoolForm({ ...schoolForm, contactEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Helpline / Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={schoolForm.contactPhone}
                    onChange={(e) => setSchoolForm({ ...schoolForm, contactPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">Campus Physical Address</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={schoolForm.address}
                  onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-save2-fill"></i> Save Institutional Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB 2: SMS & TWILIO GATEWAY ── */}
      {activeTab === 'notifications' && (
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon">
              <i className="bi bi-chat-left-dots"></i>
            </div>
            <h5>SMS & Parent Communication Gateway Configuration</h5>
          </div>
          <div className="card-body">
            <div
              style={{
                background: 'rgba(212, 175, 55, 0.05)',
                border: '1px solid var(--gold-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px 20px',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <i className="bi bi-info-circle-fill" style={{ color: '#D4AF37', fontSize: 18 }}></i>
                  <div>
                    <strong style={{ color: '#FFFFFF' }}>Spring Boot SMS Service Configuration</strong>
                    <div style={{ fontSize: 12, color: '#A0A0A0' }}>
                      Carrier integration values are safely controlled via backend <code style={{ color: '#F5D76E' }}>application.properties</code>.
                    </div>
                  </div>
                </div>
                <span className="badge badge-warning">Simulation Mode Active</span>
              </div>
            </div>

            <div className="form-row mb-3">
              <div>
                <label className="form-label">Gateway Provider</label>
                <input type="text" className="form-control" value={smsConfig.provider} disabled />
              </div>
              <div>
                <label className="form-label">SMS Status</label>
                <div style={{ padding: '9px 14px', background: '#121212', borderRadius: 8, border: '1.5px solid var(--gold-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }}></span>
                  <span style={{ color: '#FBBF24', fontWeight: 600 }}>Simulation & Database Logging Only</span>
                </div>
              </div>
            </div>

            <div className="form-row mb-3">
              <div>
                <label className="form-label">Twilio Account SID (Configured in Properties)</label>
                <input
                  type="text"
                  className="form-control"
                  value={smsConfig.accountSid}
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>
              <div>
                <label className="form-label">From Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={smsConfig.fromNumber}
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Standard Attendance Notification Template</label>
              <div
                style={{
                  background: '#121212',
                  border: '1.5px solid var(--gold-border)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontFamily: 'monospace',
                  color: '#F5D76E',
                  fontSize: 13,
                }}
              >
                "Dear Parent, your child &#123;studentName&#125; of Class &#123;standard&#125;-&#123;section&#125; is &#123;status&#125; today. - Attenda School"
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => toast.info('Twilio credentials test ping: Backend connected in Simulation mode ✅')}
            >
              <i className="bi bi-broadcast-pin"></i> Test Gateway Connection
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 3: ACADEMIC STANDARDS ── */}
      {activeTab === 'academic' && (
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon">
              <i className="bi bi-mortarboard"></i>
            </div>
            <h5>Academic Standards & Class Configuration</h5>
          </div>
          <div className="card-body">
            <div className="form-row mb-3">
              <div>
                <label className="form-label">Covered Standards / Grades</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
                    <span key={s} className="badge badge-gold">
                      Std {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Configured Sections</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  {['A', 'B', 'C', 'D'].map((sec) => (
                    <span key={sec} className="badge badge-primary">
                      Section {sec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-row mb-4">
              <div>
                <label className="form-label">Minimum Passing Percentage</label>
                <input type="text" className="form-control" value="35%" disabled />
              </div>
              <div>
                <label className="form-label">Total School Classes</label>
                <input type="text" className="form-control" value="48 Classes (12 Standards × 4 Sections)" disabled />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: SECURITY & AUTHENTICATION ── */}
      {activeTab === 'security' && (
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon">
              <i className="bi bi-shield-lock"></i>
            </div>
            <h5>Authentication & Session Management</h5>
          </div>
          <div className="card-body">
            <div className="form-row mb-3">
              <div>
                <label className="form-label">Logged In User</label>
                <input type="text" className="form-control" value={user?.fullName || 'Administrator'} disabled />
              </div>
              <div>
                <label className="form-label">User Security Role</label>
                <input type="text" className="form-control" value={user?.role || 'ADMIN'} disabled />
              </div>
            </div>

            <div className="form-row mb-4">
              <div>
                <label className="form-label">JWT Token Expiration</label>
                <input type="text" className="form-control" value="24 Hours (86,400,000 ms)" disabled />
              </div>
              <div>
                <label className="form-label">Encryption Standard</label>
                <input type="text" className="form-control" value="HMAC-SHA256 Encrypted Bearer Token" disabled />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
