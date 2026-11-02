import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/services';
import { toast } from 'react-toastify';

/* ─── LEFT EDUCATIONAL DECORATION (Books, Notebooks, School Illustration) ─── */
function LeftEducationalDecoration() {
  return (
    <aside className="login-decor-side login-decor-left" aria-label="Educational heritage decoration">
      {/* SVG Illustration: Stack of books, notebook, diploma scroll, graduation cap, quill */}
      <svg
        width="100%"
        height="240"
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', margin: '0 auto', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))' }}
      >
        <defs>
          <linearGradient id="goldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="35%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#AA771C" />
            <stop offset="100%" stopColor="#F5D76E" />
          </linearGradient>

          <linearGradient id="bookCover1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E1E1E" />
            <stop offset="50%" stopColor="#121212" />
            <stop offset="100%" stopColor="#282828" />
          </linearGradient>

          <linearGradient id="bookCover2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#242119" />
            <stop offset="50%" stopColor="#18150F" />
            <stop offset="100%" stopColor="#352F1F" />
          </linearGradient>

          <linearGradient id="pagesGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E2D4B7" />
            <stop offset="100%" stopColor="#F5EDDB" />
          </linearGradient>

          <filter id="goldGlowSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient golden aura behind books */}
        <circle cx="160" cy="130" r="85" fill="rgba(212,175,55,0.06)" />

        {/* ── 1. BOTTOM BOOK (Large Hardcover Textbook) ── */}
        <g transform="translate(35, 175)">
          {/* Shadow */}
          <ellipse cx="125" cy="40" rx="120" ry="10" fill="rgba(0,0,0,0.6)" />
          {/* Book base & pages */}
          <rect x="18" y="8" width="220" height="24" rx="3" fill="url(#pagesGrad)" stroke="#B39B72" strokeWidth="1" />
          {/* Page line ridges */}
          <line x1="230" y1="13" x2="238" y2="13" stroke="#8A7753" strokeWidth="1" />
          <line x1="230" y1="18" x2="238" y2="18" stroke="#8A7753" strokeWidth="1" />
          <line x1="230" y1="23" x2="238" y2="23" stroke="#8A7753" strokeWidth="1" />
          <line x1="230" y1="28" x2="238" y2="28" stroke="#8A7753" strokeWidth="1" />
          {/* Bottom cover spine */}
          <path d="M 12 32 L 236 32 C 238 32 240 30 240 28 L 240 4 C 240 2 238 0 236 0 L 12 0 C 6 0 0 6 0 16 C 0 26 6 32 12 32 Z" fill="url(#bookCover1)" stroke="url(#goldMetallic)" strokeWidth="1.5" />
          {/* Gold embossed bands on spine */}
          <rect x="24" y="0" width="4" height="32" fill="url(#goldMetallic)" />
          <rect x="36" y="0" width="2" height="32" fill="url(#goldMetallic)" />
          <rect x="180" y="0" width="2" height="32" fill="url(#goldMetallic)" />
          <rect x="190" y="0" width="4" height="32" fill="url(#goldMetallic)" />
          {/* Title on spine */}
          <text x="105" y="20" fill="url(#goldMetallic)" fontSize="10" fontFamily="'Cinzel', serif" fontWeight="700" letterSpacing="2">ENCYCLOPEDIA</text>
        </g>

        {/* ── 2. MIDDLE BOOK (Angled Academic Tome) ── */}
        <g transform="translate(50, 142)">
          {/* Pages */}
          <rect x="16" y="6" width="195" height="22" rx="3" fill="url(#pagesGrad)" stroke="#B39B72" strokeWidth="1" />
          {/* Cover */}
          <path d="M 10 28 L 210 28 C 212 28 214 26 214 24 L 214 4 C 214 2 212 0 210 0 L 10 0 C 5 0 0 5 0 14 C 0 23 5 28 10 28 Z" fill="url(#bookCover2)" stroke="url(#goldMetallic)" strokeWidth="1.5" />
          {/* Gold spine filigree */}
          <rect x="20" y="0" width="3" height="28" fill="url(#goldMetallic)" />
          <rect x="175" y="0" width="3" height="28" fill="url(#goldMetallic)" />
          {/* Title */}
          <text x="95" y="17" fill="#F5D76E" fontSize="9" fontFamily="'Cinzel', serif" fontWeight="700" letterSpacing="1.5">MATHEMATICS</text>
          {/* Hanging silk bookmark ribbon */}
          <path d="M 140 28 Q 142 42 136 54 L 144 51 L 152 54 Q 146 42 144 28 Z" fill="#D4AF37" />
        </g>

        {/* ── 3. TOP OPEN NOTEBOOK / JOURNAL ── */}
        <g transform="translate(48, 98)">
          {/* Notebook cover base */}
          <path d="M 12 36 Q 110 40 212 36 L 216 4 Q 110 8 12 4 Z" fill="#141414" stroke="url(#goldMetallic)" strokeWidth="1.2" />
          {/* Left Page */}
          <path d="M 14 34 Q 65 30 112 33 L 112 3 Q 65 0 14 3 Z" fill="#FBF8EE" />
          {/* Right Page */}
          <path d="M 116 33 Q 165 30 214 34 L 214 3 Q 165 0 116 3 Z" fill="#F6F1E3" />
          {/* Center spine crease */}
          <line x1="114" y1="1" x2="114" y2="35" stroke="#AA771C" strokeWidth="2" />
          {/* Faint ruled lines on left page */}
          <line x1="26" y1="10" x2="102" y2="10" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="26" y1="16" x2="102" y2="16" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="26" y1="22" x2="102" y2="22" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="26" y1="28" x2="88" y2="28" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 2" />
          {/* Faint ruled lines on right page */}
          <line x1="126" y1="10" x2="202" y2="10" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="126" y1="16" x2="202" y2="16" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="126" y1="22" x2="202" y2="22" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="126" y1="28" x2="180" y2="28" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 2" />
          {/* Gold corner ornaments */}
          <polygon points="14,3 24,3 14,13" fill="#D4AF37" />
          <polygon points="214,3 204,3 214,13" fill="#D4AF37" />
        </g>

        {/* ── 4. GRADUATION MORTARBOARD CAP (Left Accent) ── */}
        <g transform="translate(130, 18)">
          {/* Skull cap beneath */}
          <path d="M 45 42 Q 65 52 85 42 L 85 52 Q 65 64 45 52 Z" fill="#181818" stroke="#D4AF37" strokeWidth="1" />
          {/* Diamond top */}
          <polygon points="65,18 115,35 65,52 15,35" fill="#141414" stroke="url(#goldMetallic)" strokeWidth="2" filter="url(#goldGlowSoft)" />
          {/* Gold button on center */}
          <circle cx="65" cy="35" r="4" fill="url(#goldMetallic)" />
          {/* Tassel cord & drape */}
          <path d="M 65 35 Q 92 38 102 54 L 106 72" stroke="#F5D76E" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Tassel fringe ring & brush */}
          <rect x="103" y="70" width="6" height="3" rx="1" fill="#D4AF37" />
          <path d="M 103 73 L 100 86 L 112 86 L 109 73 Z" fill="url(#goldMetallic)" />
        </g>

        {/* ── 5. DIPLOMA SCROLL WITH GOLD SEAL (Left Bottom) ── */}
        <g transform="translate(25, 120) rotate(-18)">
          {/* Rolled parchment cylinder */}
          <rect x="0" y="0" width="70" height="18" rx="4" fill="url(#pagesGrad)" stroke="#B39B72" strokeWidth="1" />
          {/* Inner roll curl */}
          <ellipse cx="68" cy="9" rx="3" ry="8" fill="#D9C7A1" stroke="#9E875C" strokeWidth="1" />
          {/* Red/Gold tie ribbon */}
          <rect x="30" y="-1" width="10" height="20" fill="#AA771C" />
          <circle cx="35" cy="9" r="6" fill="url(#goldMetallic)" stroke="#121212" strokeWidth="1" />
          <path d="M 33 15 L 30 26 L 36 23 L 42 26 L 39 15" fill="#AA771C" />
        </g>

        {/* ── 6. VINTAGE FEATHER QUILL & INKWELL ── */}
        <g transform="translate(225, 60)">
          {/* Inkwell pot */}
          <path d="M 22 75 L 38 75 L 42 92 L 18 92 Z" fill="#1A1A1A" stroke="url(#goldMetallic)" strokeWidth="1.2" />
          <ellipse cx="30" cy="75" rx="8" ry="3" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="1" />
          {/* Quill feather angling up */}
          <path d="M 30 75 Q 40 40 65 8 Q 50 25 35 55 Z" fill="#F5D76E" stroke="#AA771C" strokeWidth="1" />
          <path d="M 30 75 Q 36 60 52 28" stroke="#121212" strokeWidth="1.2" />
        </g>

        {/* Floating golden sparkle stars */}
        <path d="M 35 60 Q 40 60 40 55 Q 40 60 45 60 Q 40 60 40 65 Q 40 60 35 60 Z" fill="#F5D76E" />
        <path d="M 275 140 Q 280 140 280 135 Q 280 140 285 140 Q 280 140 280 145 Q 280 140 275 140 Z" fill="#D4AF37" />
        <path d="M 125 12 Q 128 12 128 9 Q 128 12 131 12 Q 128 12 128 15 Q 128 12 125 12 Z" fill="#FFF2B2" />
      </svg>

      <div className="login-decor-title">Scholastic Heritage</div>
      <div className="login-decor-subtitle">
        Empowering institutional excellence through disciplined attendance & rigorous academic tracking.
      </div>

      <div className="login-decor-badges">
        <div className="login-decor-badge-item">
          <i className="bi bi-book-half"></i>
          <span>Standards 1st to 12th Complete Curriculum</span>
        </div>
        <div className="login-decor-badge-item">
          <i className="bi bi-award-fill"></i>
          <span>Continuous Assessment & Grading Scheme</span>
        </div>
        <div className="login-decor-badge-item">
          <i className="bi bi-shield-check"></i>
          <span>Certified Institutional Academic Records</span>
        </div>
      </div>
    </aside>
  );
}

/* ─── RIGHT EDUCATIONAL DECORATION (Pencils, Pens, Notebook, Stationery) ─── */
function RightEducationalDecoration() {
  return (
    <aside className="login-decor-side login-decor-right" aria-label="Educational stationery decoration">
      {/* SVG Illustration: Pencil holder, luxury fountain pen, drafting pencils, ruler, compass, notepad */}
      <svg
        width="100%"
        height="240"
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', margin: '0 auto', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))' }}
      >
        <defs>
          <linearGradient id="goldStationery" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="40%" stopColor="#D4AF37" />
            <stop offset="80%" stopColor="#C59B27" />
            <stop offset="100%" stopColor="#F5D76E" />
          </linearGradient>

          <linearGradient id="cupGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1C1C1C" />
            <stop offset="50%" stopColor="#141414" />
            <stop offset="100%" stopColor="#2A2A2A" />
          </linearGradient>

          <linearGradient id="pencilYellow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E5C048" />
            <stop offset="50%" stopColor="#F5D76E" />
            <stop offset="100%" stopColor="#C59B27" />
          </linearGradient>
        </defs>

        {/* Ambient golden aura behind stationery */}
        <circle cx="160" cy="130" r="85" fill="rgba(212,175,55,0.06)" />

        {/* ── 1. SPIRAL NOTEBOOK (Standing on the right side) ── */}
        <g transform="translate(185, 55)">
          {/* Notebook back shadow */}
          <rect x="0" y="0" width="85" height="135" rx="6" fill="#141414" stroke="url(#goldStationery)" strokeWidth="1.5" />
          {/* Lined cover accent */}
          <rect x="8" y="10" width="69" height="115" rx="3" fill="#1A1A1A" />
          {/* Golden grid pattern lines */}
          <line x1="16" y1="28" x2="70" y2="28" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
          <line x1="16" y1="44" x2="70" y2="44" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
          <line x1="16" y1="60" x2="70" y2="60" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
          <line x1="16" y1="76" x2="70" y2="76" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
          <line x1="16" y1="92" x2="70" y2="92" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
          {/* Center gold emblem badge */}
          <circle cx="42" cy="60" r="14" fill="#141414" stroke="url(#goldStationery)" strokeWidth="1.2" />
          <path d="M 37 60 L 42 55 L 47 60 L 42 65 Z" fill="#F5D76E" />
          {/* Spiral binding rings along left margin */}
          {[16, 28, 40, 52, 64, 76, 88, 100, 112].map((yPos) => (
            <ellipse key={yPos} cx="0" cy={yPos} rx="4" ry="2" fill="url(#goldStationery)" stroke="#080808" strokeWidth="1" />
          ))}
        </g>

        {/* ── 2. METRIC DRAFTING RULER (Behind stationery cup) ── */}
        <g transform="translate(68, 40) rotate(-16)">
          {/* Wooden/brass ruler body */}
          <rect x="0" y="0" width="22" height="150" rx="3" fill="#1E1E1E" stroke="url(#goldStationery)" strokeWidth="1.2" />
          {/* Gold measurement edge ticks */}
          {[10, 18, 26, 34, 42, 50, 58, 66, 74, 82, 90, 98, 106, 114, 122, 130, 138].map((y, i) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2={i % 2 === 0 ? "8" : "4"}
              y2={y}
              stroke="url(#goldStationery)"
              strokeWidth="1"
            />
          ))}
          <text x="14" y="55" fill="#D4AF37" fontSize="7" fontFamily="'Outfit', sans-serif" transform="rotate(90 14 55)">ATTENDA 30CM</text>
        </g>

        {/* ── 3. TECHNICAL GEOMETRY COMPASS (Slanted left) ── */}
        <g transform="translate(50, 75) rotate(-8)">
          {/* Compass top hinge knob */}
          <circle cx="35" cy="15" r="5" fill="url(#goldStationery)" />
          <rect x="33" y="10" width="4" height="14" fill="url(#goldStationery)" />
          {/* Left leg */}
          <path d="M 33 22 L 15 95" stroke="url(#goldStationery)" strokeWidth="3" strokeLinecap="round" />
          {/* Needle point */}
          <path d="M 15 95 L 12 108" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          {/* Right leg */}
          <path d="M 37 22 L 52 90" stroke="url(#goldStationery)" strokeWidth="3" strokeLinecap="round" />
          {/* Pencil holder collar & lead */}
          <rect x="49" y="88" width="6" height="10" rx="1" fill="#181818" stroke="#D4AF37" strokeWidth="1" />
          <polygon points="50,98 54,98 52,108" fill="#555" />
          {/* Adjustment screw rod */}
          <line x1="24" y1="50" x2="44" y2="50" stroke="#F5D76E" strokeWidth="1.5" />
          <circle cx="34" cy="50" r="3" fill="#D4AF37" />
        </g>

        {/* ── 4. DESK STATIONERY CUP / HOLDER ── */}
        <g transform="translate(100, 115)">
          {/* Shadow */}
          <ellipse cx="45" cy="100" rx="42" ry="7" fill="rgba(0,0,0,0.6)" />
          {/* Holder body */}
          <path d="M 12 95 L 4 10 C 4 10 45 4 86 10 L 78 95 C 78 95 45 100 12 95 Z" fill="url(#cupGrad)" stroke="url(#goldStationery)" strokeWidth="1.5" />
          {/* Decorative geometric gold mesh lattice */}
          <path d="M 18 20 L 72 85 M 72 20 L 18 85 M 10 45 L 80 45 M 12 65 L 78 65" stroke="rgba(212,175,55,0.22)" strokeWidth="1" />
          {/* Top rim */}
          <ellipse cx="45" cy="10" rx="41" ry="8" fill="#161616" stroke="url(#goldStationery)" strokeWidth="1.8" />
          {/* Base band */}
          <ellipse cx="45" cy="94" rx="33" ry="5" fill="none" stroke="url(#goldStationery)" strokeWidth="1.5" />
        </g>

        {/* ── 5. STATIONERY PENS & PENCILS INSIDE THE CUP ── */}
        {/* Luxury Gold Fountain Pen (Center-left) */}
        <g transform="translate(112, 18) rotate(-4)">
          {/* Pen body barrel */}
          <rect x="18" y="42" width="9" height="70" rx="2" fill="#161616" stroke="url(#goldStationery)" strokeWidth="1" />
          {/* Gold cap ring */}
          <rect x="17" y="40" width="11" height="4" fill="url(#goldStationery)" />
          {/* Gold pocket clip */}
          <path d="M 27 42 L 29 42 L 29 70 L 27 72" stroke="url(#goldStationery)" strokeWidth="1.8" fill="none" />
          {/* Golden 18K engraved nib */}
          <path d="M 18 40 L 22.5 16 L 27 40 Z" fill="url(#goldStationery)" stroke="#9E7618" strokeWidth="0.8" />
          {/* Nib breathing hole & slit */}
          <circle cx="22.5" cy="27" r="1" fill="#121212" />
          <line x1="22.5" y1="16" x2="22.5" y2="27" stroke="#121212" strokeWidth="0.6" />
        </g>

        {/* Hexagonal Drawing Pencil (Gold-Yellow Body) */}
        <g transform="translate(132, 28) rotate(6)">
          {/* Pencil shaft */}
          <rect x="10" y="32" width="7" height="75" fill="url(#pencilYellow)" stroke="#AA771C" strokeWidth="0.8" />
          {/* Metal ferrule collar */}
          <rect x="9.5" y="100" width="8" height="6" fill="url(#goldStationery)" />
          {/* Pink/dark eraser tip */}
          <rect x="10" y="106" width="7" height="4" rx="2" fill="#D97706" />
          {/* Sharpened cedar wood cone */}
          <polygon points="10,32 17,32 13.5,12" fill="#E2D4B7" stroke="#AA771C" strokeWidth="0.6" />
          {/* Black graphite point */}
          <polygon points="12,20 15,20 13.5,12" fill="#121212" />
        </g>

        {/* Mechanical Drafting Pencil (Right side) */}
        <g transform="translate(150, 36) rotate(14)">
          {/* Dark metallic shaft */}
          <rect x="6" y="30" width="6" height="75" rx="1" fill="#242424" stroke="url(#goldStationery)" strokeWidth="0.8" />
          {/* Gold knurled grip */}
          <rect x="5.5" y="32" width="7" height="18" fill="url(#goldStationery)" />
          {/* Brass pocket clip */}
          <line x1="12" y1="58" x2="12" y2="82" stroke="url(#goldStationery)" strokeWidth="1.5" />
          {/* Precision lead sleeve */}
          <polygon points="6,30 12,30 9,18" fill="url(#goldStationery)" />
          <line x1="9" y1="18" x2="9" y2="12" stroke="#FFF" strokeWidth="1" />
        </g>

        {/* ── 6. BRASS ACCESSORIES (Desk Foreground) ── */}
        {/* Brass paperclip */}
        <g transform="translate(85, 205) rotate(25)">
          <path d="M 0 0 L 0 20 C 0 24 6 24 6 20 L 6 4 C 6 2 10 2 10 4 L 10 22 C 10 28 -2 28 -2 22 L -2 6" fill="none" stroke="url(#goldStationery)" strokeWidth="1.8" strokeLinecap="round" />
        </g>

        {/* Floating golden sparkle stars */}
        <path d="M 285 55 Q 290 55 290 50 Q 290 55 295 55 Q 290 55 290 60 Q 290 55 285 55 Z" fill="#F5D76E" />
        <path d="M 45 155 Q 50 155 50 150 Q 50 155 55 155 Q 50 155 50 160 Q 50 155 45 155 Z" fill="#D4AF37" />
        <path d="M 195 25 Q 198 25 198 22 Q 198 25 201 25 Q 198 25 198 28 Q 198 25 195 25 Z" fill="#FFF2B2" />
      </svg>

      <div className="login-decor-title">Administrative Precision</div>
      <div className="login-decor-subtitle">
        Automated parent communication, real-time absence tracking, and dynamic report generation.
      </div>

      <div className="login-decor-badges">
        <div className="login-decor-badge-item">
          <i className="bi bi-chat-left-dots-fill"></i>
          <span>Instant Parent SMS & Notice Dispatch</span>
        </div>
        <div className="login-decor-badge-item">
          <i className="bi bi-calendar2-check-fill"></i>
          <span>Real-Time Attendance Synchronization</span>
        </div>
        <div className="login-decor-badge-item">
          <i className="bi bi-file-earmark-bar-graph-fill"></i>
          <span>Cumulative Marksheet & PDF Analytics</span>
        </div>
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
