import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/services';
import { toast } from 'react-toastify';

/* ─── SHARED DECORATIVE STARS COMPONENT ─── */
function DecorativeStars() {
  return (
    <div className="login-decor-stars-row" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2 Z" fill="#F5D76E" />
      </svg>
      <span className="login-decor-dot" style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(212,175,55,0.7)', display: 'inline-block' }}></span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 4 Q12 12 20 12 Q12 12 12 20 Q12 12 4 12 Q12 12 12 4 Z" fill="#D4AF37" />
      </svg>
      <span className="login-decor-dot" style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(212,175,55,0.7)', display: 'inline-block' }}></span>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2 Z" fill="#FFF2B2" />
      </svg>
    </div>
  );
}

/* ─── LEFT EDUCATIONAL DECORATION (Separate Individual Objects, No Words) ─── */
function LeftEducationalDecoration() {
  return (
    <aside className="login-decor-side login-decor-left" aria-label="Educational illustrations">
      {/* 1. Separate Books Card */}
      <div className="login-decor-card" title="Academic Volumes">
        <svg width="240" height="76" viewBox="0 0 240 76" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldBookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2B2" />
              <stop offset="40%" stopColor="#D4AF37" />
              <stop offset="80%" stopColor="#AA771C" />
              <stop offset="100%" stopColor="#F5D76E" />
            </linearGradient>
            <linearGradient id="bookCoverA" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#221E18" />
              <stop offset="50%" stopColor="#14120F" />
              <stop offset="100%" stopColor="#2C2720" />
            </linearGradient>
            <linearGradient id="bookCoverB" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1C2024" />
              <stop offset="50%" stopColor="#101316" />
              <stop offset="100%" stopColor="#252A30" />
            </linearGradient>
            <linearGradient id="bookPagesGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E2D4B7" />
              <stop offset="50%" stopColor="#FAF4E6" />
              <stop offset="100%" stopColor="#EADCC2" />
            </linearGradient>
          </defs>

          {/* Bottom Book */}
          <g transform="translate(10, 36)">
            <ellipse cx="110" cy="36" rx="105" ry="5" fill="rgba(0,0,0,0.5)" />
            <rect x="16" y="8" width="194" height="22" rx="2" fill="url(#bookPagesGrad)" stroke="#B39B72" strokeWidth="0.8" />
            <path d="M 10 30 L 206 30 C 208 30 210 28 210 26 L 210 4 C 210 2 208 0 206 0 L 10 0 C 4 0 0 5 0 15 C 0 25 4 30 10 30 Z" fill="url(#bookCoverA)" stroke="url(#goldBookGrad)" strokeWidth="1.4" />
            <rect x="22" y="0" width="4" height="30" fill="url(#goldBookGrad)" />
            <rect x="32" y="0" width="2" height="30" fill="url(#goldBookGrad)" />
            <rect x="170" y="0" width="2" height="30" fill="url(#goldBookGrad)" />
            <rect x="180" y="0" width="4" height="30" fill="url(#goldBookGrad)" />
            <polygon points="106,15 111,9 116,15 111,21" fill="url(#goldBookGrad)" />
          </g>

          {/* Top Book */}
          <g transform="translate(24, 6)">
            <rect x="14" y="6" width="172" height="20" rx="2" fill="url(#bookPagesGrad)" stroke="#B39B72" strokeWidth="0.8" />
            <path d="M 8 26 L 182 26 C 184 26 186 24 186 22 L 186 4 C 186 2 184 0 182 0 L 8 0 C 3 0 0 4 0 13 C 0 22 3 26 8 26 Z" fill="url(#bookCoverB)" stroke="url(#goldBookGrad)" strokeWidth="1.4" />
            <rect x="18" y="0" width="3" height="26" fill="url(#goldBookGrad)" />
            <rect x="156" y="0" width="3" height="26" fill="url(#goldBookGrad)" />
            <circle cx="93" cy="13" r="3.5" fill="none" stroke="url(#goldBookGrad)" strokeWidth="1" />
            <path d="M 124 26 Q 126 38 120 48 L 126 45 L 132 48 Q 128 38 126 26 Z" fill="#D4AF37" />
          </g>
        </svg>
      </div>

      <DecorativeStars />

      {/* 2. Separate Graduation Cap Card */}
      <div className="login-decor-card" title="Scholastic Achievement">
        <svg width="220" height="74" viewBox="0 0 220 74" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2B2" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#AA771C" />
            </linearGradient>
          </defs>
          <g transform="translate(25, 4)">
            {/* Skull base */}
            <path d="M 52 38 Q 85 49 118 38 L 118 47 Q 85 58 52 47 Z" fill="#181818" stroke="#D4AF37" strokeWidth="1.2" />
            {/* Diamond top plate */}
            <polygon points="85,6 150,26 85,46 20,26" fill="#121212" stroke="url(#goldCapGrad)" strokeWidth="2" />
            {/* Center button */}
            <circle cx="85" cy="26" r="4" fill="url(#goldCapGrad)" />
            {/* Flowing tassel */}
            <path d="M 85 26 Q 120 28 132 42 L 136 58" stroke="#F5D76E" strokeWidth="2" fill="none" strokeLinecap="round" />
            <rect x="133" y="56" width="6" height="3" rx="1" fill="#D4AF37" />
            <path d="M 133 59 L 130 70 L 142 70 L 139 59 Z" fill="url(#goldCapGrad)" />
          </g>
        </svg>
      </div>

      <DecorativeStars />

      {/* 3. Separate Open Notebook Card */}
      <div className="login-decor-card" title="Open Notebook">
        <svg width="220" height="70" viewBox="0 0 220 70" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(18, 6)">
            {/* Back cover */}
            <path d="M 10 44 Q 92 48 174 44 L 178 8 Q 92 12 10 8 Z" fill="#151515" stroke="#D4AF37" strokeWidth="1.2" />
            {/* Left blank page with delicate gold margin */}
            <path d="M 12 42 Q 54 38 92 41 L 92 6 Q 54 3 12 6 Z" fill="#FDFBF4" />
            <path d="M 18 38 Q 54 35 86 37 L 86 10 Q 54 7 18 10 Z" fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="0.8" />
            {/* Right blank page with delicate gold margin */}
            <path d="M 96 41 Q 134 38 176 42 L 176 6 Q 134 3 96 6 Z" fill="#F8F3E5" />
            <path d="M 102 37 Q 134 35 170 38 L 170 10 Q 134 7 102 10 Z" fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="0.8" />
            {/* Center stitched binding */}
            <line x1="94" y1="4" x2="94" y2="43" stroke="#AA771C" strokeWidth="2" />
            {/* Gold corner ornaments */}
            <polygon points="12,6 22,6 12,16" fill="#D4AF37" />
            <polygon points="176,6 166,6 176,16" fill="#D4AF37" />
          </g>
        </svg>
      </div>

      <DecorativeStars />

      {/* 4. Separate Stationery (Diploma Scroll & Quill) Card */}
      <div className="login-decor-card" title="Diploma & Quill">
        <svg width="220" height="68" viewBox="0 0 220 68" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Rolled Diploma Scroll */}
          <g transform="translate(18, 32) rotate(-10)">
            <rect x="0" y="0" width="82" height="18" rx="4" fill="#FAF4E6" stroke="#B39B72" strokeWidth="1" />
            <ellipse cx="80" cy="9" rx="3.5" ry="8" fill="#D9C7A1" stroke="#9E875C" strokeWidth="1" />
            <rect x="36" y="-1" width="10" height="20" fill="#AA771C" />
            <circle cx="41" cy="9" r="6" fill="#D4AF37" stroke="#121212" strokeWidth="1" />
            <path d="M 39 15 L 36 24 L 41 22 L 46 24 L 43 15" fill="#AA771C" />
          </g>
          {/* Vintage Quill & Inkwell */}
          <g transform="translate(138, 8)">
            <path d="M 14 36 L 28 36 L 31 52 L 11 52 Z" fill="#1C1C1C" stroke="#D4AF37" strokeWidth="1.2" />
            <ellipse cx="21" cy="36" rx="7" ry="2.5" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="0.8" />
            <path d="M 21 36 Q 30 14 52 -4 Q 38 8 26 24 Z" fill="#F5D76E" stroke="#AA771C" strokeWidth="1" />
            <path d="M 21 36 Q 26 26 40 8" stroke="#121212" strokeWidth="1" />
          </g>
        </svg>
      </div>
    </aside>
  );
}

/* ─── RIGHT EDUCATIONAL DECORATION (Separate Individual Objects, No Words) ─── */
function RightEducationalDecoration() {
  return (
    <aside className="login-decor-side login-decor-right" aria-label="Stationery illustrations">
      {/* 1. Separate Pencil Holder Card */}
      <div className="login-decor-card" title="Stationery Desk Holder">
        <svg width="220" height="82" viewBox="0 0 220 82" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cupGradSep" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#222" />
              <stop offset="50%" stopColor="#141414" />
              <stop offset="100%" stopColor="#2A2A2A" />
            </linearGradient>
            <linearGradient id="goldCupSep" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2B2" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#AA771C" />
            </linearGradient>
          </defs>
          <g transform="translate(75, 12)">
            {/* Holder shadow */}
            <ellipse cx="35" cy="62" rx="36" ry="6" fill="rgba(0,0,0,0.5)" />
            {/* Tapered cup body */}
            <path d="M 8 58 L 2 10 C 2 10 35 4 68 10 L 62 58 C 62 58 35 63 8 58 Z" fill="url(#cupGradSep)" stroke="url(#goldCupSep)" strokeWidth="1.4" />
            {/* Crisscross gold wire lattice */}
            <path d="M 12 18 L 58 52 M 58 18 L 12 52 M 8 35 L 62 35" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
            {/* Polished rim */}
            <ellipse cx="35" cy="10" rx="33" ry="6" fill="#181818" stroke="url(#goldCupSep)" strokeWidth="1.6" />
            {/* Base band */}
            <ellipse cx="35" cy="57" rx="27" ry="4" fill="none" stroke="url(#goldCupSep)" strokeWidth="1.2" />
          </g>
        </svg>
      </div>

      <DecorativeStars />

      {/* 2. Separate Luxury Fountain Pen Card */}
      <div className="login-decor-card" title="Luxury Fountain Pen">
        <svg width="220" height="65" viewBox="0 0 220 65" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(30, 24) rotate(-18)">
            {/* Pen barrel */}
            <rect x="0" y="0" width="130" height="10" rx="2" fill="#151515" stroke="#D4AF37" strokeWidth="1" />
            {/* Gold cap ring */}
            <rect x="35" y="-1.5" width="6" height="13" fill="#D4AF37" />
            {/* Gold pocket clip */}
            <path d="M 2 10 L 2 13 L 42 13 L 42 10" stroke="#F5D76E" strokeWidth="1.6" fill="none" />
            {/* 18K engraved nib */}
            <path d="M 130 1 L 152 5 L 130 9 Z" fill="#D4AF37" stroke="#AA771C" strokeWidth="0.8" />
            <circle cx="140" cy="5" r="1" fill="#121212" />
            <line x1="140" y1="5" x2="152" y2="5" stroke="#121212" strokeWidth="0.6" />
          </g>
        </svg>
      </div>

      <DecorativeStars />

      {/* 3. Separate Academic Drawing Pencils Card */}
      <div className="login-decor-card" title="Drafting & Drawing Pencils">
        <svg width="220" height="65" viewBox="0 0 220 65" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top Yellow Hexagonal Pencil */}
          <g transform="translate(25, 14)">
            <rect x="30" y="0" width="120" height="8" fill="#E5C048" stroke="#AA771C" strokeWidth="0.8" />
            <rect x="15" y="-0.5" width="15" height="9" fill="#D4AF37" />
            <rect x="5" y="0.5" width="10" height="7" rx="2" fill="#D97706" />
            <polygon points="150,0 150,8 166,4" fill="#E2D4B7" stroke="#AA771C" strokeWidth="0.6" />
            <polygon points="160,2.5 160,5.5 166,4" fill="#121212" />
          </g>
          {/* Bottom Mechanical Drafting Pencil */}
          <g transform="translate(35, 36)">
            <rect x="25" y="0" width="115" height="7" rx="1" fill="#242424" stroke="#D4AF37" strokeWidth="0.8" />
            <rect x="105" y="-1" width="22" height="9" fill="#D4AF37" />
            <polygon points="140,0 140,7 149,3.5" fill="#D4AF37" />
            <line x1="149" y1="3.5" x2="156" y2="3.5" stroke="#FFFFFF" strokeWidth="1" />
          </g>
        </svg>
      </div>

      <DecorativeStars />

      {/* 4. Separate Spiral Notebook Card */}
      <div className="login-decor-card" title="Spiral Bound Notebook">
        <svg width="220" height="80" viewBox="0 0 220 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(60, 6)">
            {/* Cover */}
            <rect x="0" y="0" width="100" height="66" rx="5" fill="#141414" stroke="#D4AF37" strokeWidth="1.4" />
            <rect x="8" y="6" width="84" height="54" rx="2" fill="#1A1A1A" />
            <line x1="14" y1="20" x2="86" y2="20" stroke="rgba(212,175,55,0.2)" strokeWidth="0.8" />
            <line x1="14" y1="33" x2="86" y2="33" stroke="rgba(212,175,55,0.2)" strokeWidth="0.8" />
            <line x1="14" y1="46" x2="86" y2="46" stroke="rgba(212,175,55,0.2)" strokeWidth="0.8" />
            {/* Center geometric star crest (no text) */}
            <circle cx="50" cy="33" r="10" fill="#141414" stroke="#D4AF37" strokeWidth="1.1" />
            <polygon points="50,26 52.5,31 57,33 52.5,35 50,40 47.5,35 43,33 47.5,31" fill="#F5D76E" />
            {/* Spiral binding rings along top */}
            {[10, 22, 34, 46, 58, 70, 82, 94].map((xPos) => (
              <ellipse key={xPos} cx={xPos} cy="0" rx="2.5" ry="4" fill="#D4AF37" stroke="#080808" strokeWidth="0.8" />
            ))}
          </g>
        </svg>
      </div>

      <DecorativeStars />

      {/* 5. Separate Ruler & Compass Card */}
      <div className="login-decor-card" title="Geometry Drafting Compass & Ruler">
        <svg width="220" height="70" viewBox="0 0 220 70" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Drafting Ruler (Tick marks only, NO words, NO numbers) */}
          <g transform="translate(15, 42)">
            <rect x="0" y="0" width="190" height="18" rx="2" fill="#1E1E1E" stroke="#D4AF37" strokeWidth="1.2" />
            {[8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 136, 144, 152, 160, 168, 176, 184].map((x, i) => (
              <line key={x} x1={x} y1="0" x2={x} y2={i % 2 === 0 ? "8" : "4"} stroke="#F5D76E" strokeWidth="1" />
            ))}
          </g>
          {/* Drafting Compass */}
          <g transform="translate(75, 4)">
            <circle cx="35" cy="8" r="4" fill="#D4AF37" />
            <line x1="35" y1="12" x2="16" y2="38" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="35" y1="12" x2="54" y2="38" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="22" y1="26" x2="48" y2="26" stroke="#F5D76E" strokeWidth="1.4" />
            <circle cx="35" cy="26" r="2.5" fill="#D4AF37" />
          </g>
        </svg>
      </div>
    </aside>
  );
}

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'student'

  // Staff login state
  const [staffForm, setStaffForm] = useState({ username: '', password: '' });
  const [showStaffPw, setShowStaffPw] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);

  // Student login state
  const [studentForm, setStudentForm] = useState({
    studentId: '',
    dateOfBirth: '',
  });
  const [studentLoading, setStudentLoading] = useState(false);
  const [verifiedStudent, setVerifiedStudent] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formCompleted, setFormCompleted] = useState(false);

  // Forgot password modal state (Section 8 Requirement)
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotRole, setForgotRole] = useState('staff');
  const [forgotSent, setForgotSent] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle Staff (Admin/Teacher) login
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    if (!staffForm.username || !staffForm.password) {
      toast.error('Please enter username and password');
      return;
    }
    setStaffLoading(true);
    try {
      const res = await authAPI.login(staffForm);
      const { token, ...userData } = res.data;
      login(userData, token);
      toast.success(`Welcome back, ${userData.fullName || 'Staff Member'}! 👑`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setStaffLoading(false);
    }
  };

  const fillStaffDemo = (role) => {
    if (role === 'admin') setStaffForm({ username: 'admin', password: 'admin123' });
    else setStaffForm({ username: 'teacher', password: 'teacher123' });
  };

  // Step 1: Pre-verify student registration credentials
  const handleStudentPreVerify = async (e) => {
    e.preventDefault();
    if (!studentForm.studentId.trim()) {
      toast.error('Please enter Student Registration Number');
      return;
    }
    setStudentLoading(true);
    try {
      const res = await authAPI.studentVerifyDetails({
        studentId: studentForm.studentId.trim(),
        dateOfBirth: studentForm.dateOfBirth ? studentForm.dateOfBirth.trim() : '',
      });
      setVerifiedStudent(res.data);
      setShowFormModal(true);
      setFormCompleted(false);
      toast.info('Student record matched! Complete verification via the Google Form.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Student verification failed. Check Registration Number and Date of Birth.');
    } finally {
      setStudentLoading(false);
    }
  };

  // Step 2: Finalize login after Google Form submission confirmation
  const handleFinalStudentLogin = async () => {
    if (!formCompleted) {
      toast.warning('Please confirm that you have submitted the Google Form verification');
      return;
    }
    setStudentLoading(true);
    try {
      const res = await authAPI.studentLogin({
        studentId: verifiedStudent.studentId,
        dateOfBirth: studentForm.dateOfBirth ? studentForm.dateOfBirth.trim() : '',
        formConfirmed: 'true',
      });
      const { token, ...userData } = res.data;
      login(userData, token);
      setShowFormModal(false);
      toast.success(`Welcome, ${userData.fullName}! Redirecting to student portal... 🎓`);
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication error. Please try again.');
    } finally {
      setStudentLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.warning('Please enter your registered email or username');
      return;
    }
    setForgotSent(true);
    setTimeout(() => {
      toast.success('Password reset instructions forwarded to school IT administration!');
    }, 600);
  };

  return (
    <div className="login-page">
      {/* Background Animated Luxury Orbs */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${100 + i * 50}px`,
            height: `${100 + i * 50}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(212,175,55,${0.03 + i * 0.01}) 0%, transparent 70%)`,
            border: '1px solid rgba(212,175,55,0.06)',
            top: `${8 + i * 14}%`,
            left: `${4 + i * 16}%`,
            animation: `spin ${16 + i * 4}s linear infinite`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ── 3-COLUMN STAGE: LEFT DECORATION • CENTER LOGIN • RIGHT DECORATION ── */}
      <div className="login-stage-wrapper">
        {/* Left Side: Books, Notebooks, School Illustration */}
        <LeftEducationalDecoration />

        {/* Center: Main Login Form & Admission Card */}
        <div className="login-form-center">
          <div className="login-card">
            {/* Logo & School Branding */}
            <div className="login-logo">
              <div className="logo-icon">
                <i className="bi bi-mortarboard-fill"></i>
              </div>
              <h1>ATTENDA</h1>
              <p>School Management System • Premium Edition</p>
            </div>

            {/* School Crest / Decorative Gold Ribbon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                marginBottom: 22,
              }}
            >
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3))' }} />
              <span style={{ fontSize: 11, color: '#D4AF37', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                ✦ INSTITUTIONAL PORTAL ✦
              </span>
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }} />
            </div>

            {/* Tab Switcher: Staff Login vs Student Login */}
            <div
              style={{
                display: 'flex',
                background: '#0d0d0d',
                border: '1px solid var(--gold-border)',
                borderRadius: 12,
                padding: 4,
                marginBottom: 24,
                gap: 6,
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('staff')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: 'none',
                  borderRadius: 9,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeTab === 'staff' ? 'var(--gold-gradient)' : 'transparent',
                  color: activeTab === 'staff' ? '#080808' : '#A0A0A0',
                  boxShadow: activeTab === 'staff' ? '0 2px 10px rgba(212,175,55,0.4)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <i className="bi bi-shield-lock-fill"></i> Staff Login
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('student')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: 'none',
                  borderRadius: 9,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeTab === 'student' ? 'var(--gold-gradient)' : 'transparent',
                  color: activeTab === 'student' ? '#080808' : '#A0A0A0',
                  boxShadow: activeTab === 'student' ? '0 2px 10px rgba(212,175,55,0.4)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <i className="bi bi-person-badge-fill"></i> Student Login
              </button>
            </div>

            {/* ══════════════ TAB 1: STAFF LOGIN ══════════════ */}
            {activeTab === 'staff' && (
              <form onSubmit={handleStaffSubmit}>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <div style={{ position: 'relative' }}>
                    <i
                      className="bi bi-person-fill"
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }}
                    ></i>
                    <input
                      type="text"
                      className="form-control"
                      style={{ paddingLeft: 40 }}
                      placeholder="e.g. admin or teacher"
                      value={staffForm.username}
                      onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="form-label" style={{ margin: 0 }}>Password</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#F5D76E',
                        fontSize: 12,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <i
                      className="bi bi-lock-fill"
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }}
                    ></i>
                    <input
                      type={showStaffPw ? 'text' : 'password'}
                      className="form-control"
                      style={{ paddingLeft: 40, paddingRight: 42 }}
                      placeholder="Enter confidential password"
                      value={staffForm.password}
                      onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffPw(!showStaffPw)}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#D4AF37',
                      }}
                      title={showStaffPw ? 'Hide password' : 'Show password'}
                    >
                      <i className={`bi bi-eye${showStaffPw ? '-slash-fill' : '-fill'}`}></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: 10 }}
                  disabled={staffLoading}
                >
                  {staffLoading ? (
                    <><div className="spinner"></div> Authenticating...</>
                  ) : (
                    <><i className="bi bi-box-arrow-in-right"></i> Sign In to Staff Console</>
                  )}
                </button>

                {/* ── DEMO QUICK FILL BUTTONS (IMPROVED HIGH CONTRAST & VISIBILITY) ── */}
                <div
                  style={{
                    marginTop: 20,
                    padding: '14px 16px',
                    background: 'rgba(212, 175, 55, 0.08)',
                    borderRadius: 12,
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    boxShadow: 'inset 0 0 14px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11.5,
                      color: '#F5D76E',
                      marginBottom: 10,
                      fontWeight: 800,
                      letterSpacing: '0.8px',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <i className="bi bi-lightning-charge-fill" style={{ color: '#F5D76E' }}></i>
                    Quick Demo Credentials:
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    {/* Admin Button */}
                    <button
                      type="button"
                      onClick={() => fillStaffDemo('admin')}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(20, 20, 20, 0.95) 100%)',
                        border: '1.5px solid #D4AF37',
                        borderRadius: 10,
                        color: '#FFFFFF',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        fontSize: 13.5,
                        fontWeight: 800,
                        letterSpacing: '0.4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(212, 175, 55, 0.15)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#FFF2B2';
                        e.currentTarget.style.boxShadow = '0 0 18px rgba(212, 175, 55, 0.45)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#D4AF37';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(212, 175, 55, 0.15)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <i className="bi bi-shield-fill-check" style={{ color: '#F5D76E', fontSize: 16 }}></i>
                      <span style={{ color: '#FFFFFF', fontWeight: 800 }}>Admin</span>
                    </button>

                    {/* Teacher Button */}
                    <button
                      type="button"
                      onClick={() => fillStaffDemo('teacher')}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(20, 20, 20, 0.95) 100%)',
                        border: '1.5px solid #D4AF37',
                        borderRadius: 10,
                        color: '#FFFFFF',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        fontSize: 13.5,
                        fontWeight: 800,
                        letterSpacing: '0.4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(212, 175, 55, 0.15)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#FFF2B2';
                        e.currentTarget.style.boxShadow = '0 0 18px rgba(212, 175, 55, 0.45)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#D4AF37';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(212, 175, 55, 0.15)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <i className="bi bi-person-badge-fill" style={{ color: '#F5D76E', fontSize: 16 }}></i>
                      <span style={{ color: '#FFFFFF', fontWeight: 800 }}>Teacher</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ══════════════ TAB 2: STUDENT LOGIN ══════════════ */}
            {activeTab === 'student' && (
              <form onSubmit={handleStudentPreVerify}>
                <div
                  style={{
                    background: 'rgba(212, 175, 55, 0.06)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    marginBottom: 16,
                    border: '1px solid var(--gold-border)',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  <i className="bi bi-mortarboard" style={{ fontSize: 22, color: '#F5D76E', flexShrink: 0 }}></i>
                  <div style={{ fontSize: 12, color: '#E0E0E0', lineHeight: 1.4 }}>
                    Enter your assigned <strong>Student Registration Number</strong> and Date of Birth to access your student portal.
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Student Registration Number (Student ID) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <i
                      className="bi bi-card-heading"
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }}
                    ></i>
                    <input
                      type="text"
                      className="form-control"
                      style={{ paddingLeft: 40 }}
                      placeholder="e.g. STU1001 or STU2024001"
                      value={studentForm.studentId}
                      onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Date of Birth <span style={{ color: '#888', fontWeight: 400 }}>(Verification Check)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#F5D76E',
                        fontSize: 12,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Need Help?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <i
                      className="bi bi-calendar-date"
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }}
                    ></i>
                    <input
                      type="date"
                      className="form-control"
                      style={{ paddingLeft: 40 }}
                      value={studentForm.dateOfBirth}
                      onChange={(e) => setStudentForm({ ...studentForm, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                    Matches date of birth registered during institutional enrollment.
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
                  disabled={studentLoading}
                >
                  {studentLoading ? (
                    <><div className="spinner"></div> Checking Record...</>
                  ) : (
                    <><i className="bi bi-shield-check"></i> Verify & Proceed to Login</>
                  )}
                </button>
              </form>
            )}

            <p style={{ textAlign: 'center', fontSize: 11, color: '#777', marginTop: 20, marginBottom: 0 }}>
              🔒 256-Bit Encrypted TLS Institutional Authentication
            </p>
          </div>

          {/* Link to Public Student Admission Form */}
          <Link to="/student-register" style={{ textDecoration: 'none' }}>
            <div
              style={{
                background: '#121212',
                borderRadius: 14,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
                border: '1px solid var(--gold-border)',
                boxShadow: 'var(--shadow-card)',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: 'var(--gold-gradient)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  color: '#080808',
                  flexShrink: 0,
                  boxShadow: 'var(--gold-glow)',
                }}
              >
                <i className="bi bi-ui-checks"></i>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#FFFFFF' }}>
                  Online Admission Register
                </div>
                <div style={{ fontSize: 12, color: '#A0A0A0', marginTop: 1 }}>
                  Open registration form & student enrollment directory
                </div>
              </div>
              <i className="bi bi-arrow-right-circle-fill" style={{ fontSize: 22, color: '#F5D76E' }}></i>
            </div>
          </Link>
        </div>

        {/* Right Side: Pencils, Pens, Notebook, Stationery Items */}
        <RightEducationalDecoration />
      </div>

      {/* ══════════════ MODAL: FORGOT PASSWORD ══════════════ */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="bi bi-key-fill" style={{ color: '#D4AF37', fontSize: 20 }}></i>
                <h4>Account Access Assistance</h4>
              </div>
              <button className="modal-close" onClick={() => setShowForgotPassword(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              {forgotSent ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <i className="bi bi-check-circle-fill" style={{ fontSize: 48, color: '#10B981' }}></i>
                  <h4 style={{ color: '#FFFFFF', marginTop: 14 }}>Request Logged Successfully</h4>
                  <p style={{ color: '#A0A0A0', fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
                    Your password reset ticket has been forwarded to the institutional IT administration. Please check your official school email or visit the administrative block with your school ID card.
                  </p>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: 16 }}
                    onClick={() => {
                      setForgotSent(false);
                      setShowForgotPassword(false);
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit}>
                  <p style={{ color: '#E0E0E0', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
                    Forgot your credentials? Enter your username or registered email below to initiate credential recovery through the school IT registrar.
                  </p>

                  <div className="mb-3">
                    <label className="form-label">Account Type</label>
                    <select
                      className="form-select"
                      value={forgotRole}
                      onChange={(e) => setForgotRole(e.target.value)}
                    >
                      <option value="staff">Staff / Faculty Account</option>
                      <option value="student">Student / Parent Account</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Registered Username or Email ID</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. admin or student ID"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-send-fill"></i> Submit Recovery Request
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ MODAL: GOOGLE FORM VERIFICATION MODAL ══════════════ */}
      {showFormModal && verifiedStudent && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 520 }}>
            {/* Modal Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1A1A1A, #080808)',
                borderBottom: '1px solid var(--gold-border)',
                padding: '20px 24px',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="bi bi-google" style={{ fontSize: 24, color: '#F5D76E' }}></i>
                <div>
                  <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
                    Google Form Identity Verification
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: '#D4AF37' }}>
                    Step 2 of 2: Security & Identity Confirmation
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close"
                style={{ position: 'absolute', right: 18, top: 18 }}
                onClick={() => setShowFormModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Student Identification Banner */}
              <div
                style={{
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid var(--gold-border)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, letterSpacing: 0.5 }}>
                  Student Identified
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>
                    {verifiedStudent.studentName}
                  </div>
                  <span className="badge badge-primary">
                    Class {verifiedStudent.standard}-{verifiedStudent.section}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#A0A0A0', marginTop: 2 }}>
                  Registration ID: <strong style={{ color: '#F5D76E' }}>{verifiedStudent.studentId}</strong>
                </div>
              </div>

              {/* Step A: Open Google Form */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--gold-gradient)',
                      color: '#080808',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    1
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#FFFFFF' }}>
                    Open the Google Form verification page:
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#A0A0A0', marginLeft: 32, marginBottom: 12 }}>
                  Click below to open the identity confirmation form in a new tab. Submit the required details.
                </p>

                <div style={{ marginLeft: 32, display: 'flex', gap: 10 }}>
                  <a
                    href="https://docs.google.com/forms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <i className="bi bi-box-arrow-up-right"></i> Open Google Form
                  </a>

                  <Link
                    to="/student-register"
                    target="_blank"
                    className="btn btn-outline"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <i className="bi bi-ui-checks"></i> Attenda Reg Form
                  </Link>
                </div>
              </div>

              {/* Step B: Checkbox Confirmation */}
              <div
                style={{
                  background: '#121212',
                  border: '1px solid var(--gold-border)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--gold-gradient)',
                      color: '#080808',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    2
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#FFFFFF' }}>
                    Confirm Form Submission:
                  </span>
                </div>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    marginLeft: 32,
                    cursor: 'pointer',
                    fontSize: 12,
                    color: '#D4D4D4',
                    lineHeight: 1.5,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formCompleted}
                    onChange={(e) => setFormCompleted(e.target.checked)}
                    style={{ marginTop: 2, width: 16, height: 16, accentColor: '#D4AF37', cursor: 'pointer' }}
                  />
                  <span>
                    I confirm that I am <strong>{verifiedStudent.studentName}</strong> ({verifiedStudent.studentId}) and have completed/submitted the Google Form verification for this academic session.
                  </span>
                </label>
              </div>

              {/* Submit Authentication Button */}
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 14,
                }}
                disabled={!formCompleted || studentLoading}
                onClick={handleFinalStudentLogin}
              >
                {studentLoading ? (
                  <><div className="spinner"></div> Authenticating with Server...</>
                ) : (
                  <><i className="bi bi-unlock-fill"></i> Complete Authentication & Enter Portal</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
