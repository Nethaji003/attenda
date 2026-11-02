import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/services';
import { toast } from 'react-toastify';

/* ─── LEFT EDUCATIONAL DECORATION (Books, Open Notebook, Graduation Cap, School Supplies - Pure Vector Art, No Words) ─── */
function LeftEducationalDecoration() {
  return (
    <aside className="login-decor-side login-decor-left" aria-label="Educational illustration">
      <svg
        width="100%"
        height="310"
        viewBox="0 0 320 310"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', margin: '0 auto', filter: 'drop-shadow(0 10px 28px rgba(0,0,0,0.65))' }}
      >
        <defs>
          <linearGradient id="goldMetallicLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="35%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#AA771C" />
            <stop offset="100%" stopColor="#F5D76E" />
          </linearGradient>

          <linearGradient id="bookCover1Left" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#24201A" />
            <stop offset="50%" stopColor="#151310" />
            <stop offset="100%" stopColor="#2E2820" />
          </linearGradient>

          <linearGradient id="bookCover2Left" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1F2326" />
            <stop offset="50%" stopColor="#121518" />
            <stop offset="100%" stopColor="#2B3035" />
          </linearGradient>

          <linearGradient id="bookCover3Left" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#261A1D" />
            <stop offset="50%" stopColor="#160E10" />
            <stop offset="100%" stopColor="#332226" />
          </linearGradient>

          <linearGradient id="pagesGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E2D4B7" />
            <stop offset="50%" stopColor="#FAF4E6" />
            <stop offset="100%" stopColor="#EADCC2" />
          </linearGradient>

          <filter id="goldGlowSoftLeft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient golden aura behind stack */}
        <circle cx="160" cy="165" r="95" fill="rgba(212,175,55,0.07)" />

        {/* ── 1. BOTTOM BOOK (Large Gilded Hardcover Tome) ── */}
        <g transform="translate(30, 230)">
          {/* Ground shadow */}
          <ellipse cx="130" cy="46" rx="125" ry="12" fill="rgba(0,0,0,0.65)" />
          {/* Paper pages block */}
          <rect x="20" y="10" width="232" height="28" rx="3" fill="url(#pagesGradLeft)" stroke="#B39B72" strokeWidth="1" />
          {/* Fine page gilding ridges */}
          <line x1="244" y1="15" x2="252" y2="15" stroke="#AA771C" strokeWidth="1" />
          <line x1="244" y1="21" x2="252" y2="21" stroke="#AA771C" strokeWidth="1" />
          <line x1="244" y1="27" x2="252" y2="27" stroke="#AA771C" strokeWidth="1" />
          <line x1="244" y1="33" x2="252" y2="33" stroke="#AA771C" strokeWidth="1" />
          {/* Spine and outer binding */}
          <path d="M 12 38 L 250 38 C 252 38 254 36 254 33 L 254 5 C 254 2 252 0 250 0 L 12 0 C 5 0 0 7 0 19 C 0 31 5 38 12 38 Z" fill="url(#bookCover1Left)" stroke="url(#goldMetallicLeft)" strokeWidth="1.6" />
          {/* Gold embossed ornamental spine ribs (Pure geometric art, NO text) */}
          <rect x="26" y="0" width="5" height="38" fill="url(#goldMetallicLeft)" />
          <rect x="38" y="0" width="2" height="38" fill="url(#goldMetallicLeft)" />
          <rect x="195" y="0" width="2" height="38" fill="url(#goldMetallicLeft)" />
          <rect x="207" y="0" width="5" height="38" fill="url(#goldMetallicLeft)" />
          {/* Central gold filigree diamond motif on spine */}
          <polygon points="120,19 126,11 132,19 126,27" fill="url(#goldMetallicLeft)" />
          <polygon points="108,19 112,14 116,19 112,24" fill="url(#goldMetallicLeft)" />
          <polygon points="136,19 140,14 144,19 140,24" fill="url(#goldMetallicLeft)" />
        </g>

        {/* ── 2. MIDDLE BOOK (Academic Tome with Silk Bookmark) ── */}
        <g transform="translate(44, 185)">
          {/* Pages block */}
          <rect x="18" y="8" width="206" height="25" rx="3" fill="url(#pagesGradLeft)" stroke="#B39B72" strokeWidth="1" />
          {/* Cover and curved spine */}
          <path d="M 10 33 L 222 33 C 224 33 226 31 226 28 L 226 4 C 226 1 224 0 222 0 L 10 0 C 4 0 0 6 0 16.5 C 0 27 4 33 10 33 Z" fill="url(#bookCover2Left)" stroke="url(#goldMetallicLeft)" strokeWidth="1.5" />
          {/* Spine gold filigree bars */}
          <rect x="22" y="0" width="4" height="33" fill="url(#goldMetallicLeft)" />
          <rect x="32" y="0" width="2" height="33" fill="url(#goldMetallicLeft)" />
          <rect x="184" y="0" width="2" height="33" fill="url(#goldMetallicLeft)" />
          <rect x="194" y="0" width="4" height="33" fill="url(#goldMetallicLeft)" />
          {/* Spine center emblem (pure geometric shapes, no letters) */}
          <circle cx="113" cy="16.5" r="5" fill="none" stroke="url(#goldMetallicLeft)" strokeWidth="1.2" />
          <circle cx="113" cy="16.5" r="2" fill="url(#goldMetallicLeft)" />
          {/* Hanging silk bookmark ribbon */}
          <path d="M 148 33 Q 150 48 144 64 L 152 60 L 160 64 Q 154 48 152 33 Z" fill="#D4AF37" />
        </g>

        {/* ── 3. TOP HARDBOUND JOURNAL (Dark Obsidian with Gold Corner Guards) ── */}
        <g transform="translate(56, 142)">
          {/* Pages */}
          <rect x="16" y="6" width="184" height="23" rx="2" fill="url(#pagesGradLeft)" stroke="#B39B72" strokeWidth="1" />
          {/* Cover */}
          <path d="M 10 29 L 198 29 C 200 29 202 27 202 25 L 202 4 C 202 2 200 0 198 0 L 10 0 C 4 0 0 5 0 14.5 C 0 24 4 29 10 29 Z" fill="url(#bookCover3Left)" stroke="url(#goldMetallicLeft)" strokeWidth="1.5" />
          {/* Spine accents */}
          <rect x="20" y="0" width="3" height="29" fill="url(#goldMetallicLeft)" />
          <rect x="178" y="0" width="3" height="29" fill="url(#goldMetallicLeft)" />
          {/* Geometric gold spine flourish */}
          <polygon points="101,14.5 106,9 111,14.5 106,20" fill="url(#goldMetallicLeft)" />
        </g>

        {/* ── 4. OPEN NOTEBOOK (Clean Parchment, Gold Frame, STRICTLY NO WORDS) ── */}
        <g transform="translate(48, 92)">
          {/* Notebook back base */}
          <path d="M 12 40 Q 112 45 216 40 L 220 4 Q 112 8 12 4 Z" fill="#141414" stroke="url(#goldMetallicLeft)" strokeWidth="1.3" />
          {/* Left blank page with delicate gold margin border */}
          <path d="M 14 38 Q 66 34 114 37 L 114 3 Q 66 0 14 3 Z" fill="#FDFBF4" />
          <path d="M 22 34 Q 66 31 106 33 L 106 7 Q 66 4 22 7 Z" fill="none" stroke="rgba(212, 175, 55, 0.4)" strokeWidth="0.8" />
          {/* Right blank page with delicate gold margin border */}
          <path d="M 118 37 Q 166 34 218 38 L 218 3 Q 166 0 118 3 Z" fill="#F8F3E5" />
          <path d="M 126 33 Q 166 31 210 34 L 210 7 Q 166 4 126 7 Z" fill="none" stroke="rgba(212, 175, 55, 0.4)" strokeWidth="0.8" />
          {/* Center spine stitching */}
          <line x1="116" y1="1" x2="116" y2="39" stroke="#AA771C" strokeWidth="2.5" />
          {/* Elegant gold corner filigree on pages */}
          <polygon points="14,3 26,3 14,15" fill="#D4AF37" />
          <polygon points="218,3 206,3 218,15" fill="#D4AF37" />
        </g>

        {/* ── 5. GRADUATION MORTARBOARD CAP (Golden Tassel, Diamond Peak) ── */}
        <g transform="translate(132, 12)">
          {/* Cap skull base */}
          <path d="M 45 42 Q 65 53 85 42 L 85 53 Q 65 65 45 53 Z" fill="#181818" stroke="#D4AF37" strokeWidth="1.2" />
          {/* Cap diamond top plate */}
          <polygon points="65,16 118,34 65,52 12,34" fill="#131313" stroke="url(#goldMetallicLeft)" strokeWidth="2.2" filter="url(#goldGlowSoftLeft)" />
          {/* Center gold button rivet */}
          <circle cx="65" cy="34" r="4.5" fill="url(#goldMetallicLeft)" />
          {/* Flowing golden tassel cord */}
          <path d="M 65 34 Q 94 37 104 55 L 108 75" stroke="#F5D76E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Tassel brass ring & fringe brush */}
          <rect x="105" y="73" width="7" height="3" rx="1" fill="#D4AF37" />
          <path d="M 105 76 L 101 92 L 115 92 L 112 76 Z" fill="url(#goldMetallicLeft)" />
        </g>

        {/* ── 6. DIPLOMA SCROLL WITH GOLD SEAL ── */}
        <g transform="translate(24, 115) rotate(-16)">
          {/* Rolled parchment tube */}
          <rect x="0" y="0" width="74" height="20" rx="4" fill="url(#pagesGradLeft)" stroke="#B39B72" strokeWidth="1" />
          {/* Inner roll spiral curl */}
          <ellipse cx="72" cy="10" rx="3.5" ry="9" fill="#D9C7A1" stroke="#9E875C" strokeWidth="1" />
          {/* Imperial gold ribbon band and wax seal */}
          <rect x="31" y="-1" width="11" height="22" fill="#AA771C" />
          <circle cx="36.5" cy="10" r="7" fill="url(#goldMetallicLeft)" stroke="#121212" strokeWidth="1" />
          <path d="M 34 17 L 30 29 L 37 26 L 44 29 L 41 17" fill="#AA771C" />
        </g>

        {/* ── 7. VINTAGE QUILL & INKWELL ── */}
        <g transform="translate(230, 52)">
          {/* Inkwell pot */}
          <path d="M 20 80 L 40 80 L 44 98 L 16 98 Z" fill="#1A1A1A" stroke="url(#goldMetallicLeft)" strokeWidth="1.3" />
          <ellipse cx="30" cy="80" rx="9" ry="3.5" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="1" />
          {/* Quill feather plume */}
          <path d="M 30 80 Q 42 42 70 8 Q 54 26 36 58 Z" fill="#F5D76E" stroke="#AA771C" strokeWidth="1" />
          <path d="M 30 80 Q 38 62 56 28" stroke="#121212" strokeWidth="1.2" />
        </g>

        {/* Ambient floating gold sparkles */}
        <path d="M 32 55 Q 36 55 36 51 Q 36 55 40 55 Q 36 55 36 59 Q 36 55 32 55 Z" fill="#F5D76E" />
        <path d="M 285 145 Q 290 145 290 140 Q 290 145 295 145 Q 290 145 290 150 Q 290 145 285 145 Z" fill="#D4AF37" />
        <path d="M 120 10 Q 123 10 123 7 Q 123 10 126 10 Q 123 10 123 13 Q 123 10 120 10 Z" fill="#FFF2B2" />
      </svg>
    </aside>
  );
}

/* ─── RIGHT EDUCATIONAL DECORATION (Pencils, Pens, Pencil Holder, Notebook, Ruler - Pure Vector Art, No Words) ─── */
function RightEducationalDecoration() {
  return (
    <aside className="login-decor-side login-decor-right" aria-label="Educational stationery illustration">
      <svg
        width="100%"
        height="310"
        viewBox="0 0 320 310"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', margin: '0 auto', filter: 'drop-shadow(0 10px 28px rgba(0,0,0,0.65))' }}
      >
        <defs>
          <linearGradient id="goldStationeryRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="40%" stopColor="#D4AF37" />
            <stop offset="80%" stopColor="#C59B27" />
            <stop offset="100%" stopColor="#F5D76E" />
          </linearGradient>

          <linearGradient id="cupGradRight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E1E1E" />
            <stop offset="50%" stopColor="#141414" />
            <stop offset="100%" stopColor="#2A2A2A" />
          </linearGradient>

          <linearGradient id="pencilYellowRight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E5C048" />
            <stop offset="50%" stopColor="#F5D76E" />
            <stop offset="100%" stopColor="#C59B27" />
          </linearGradient>
        </defs>

        {/* Ambient golden aura behind stationery */}
        <circle cx="160" cy="165" r="95" fill="rgba(212,175,55,0.07)" />

        {/* ── 1. STANDING SPIRAL NOTEBOOK (Right Background, Geometric Emblem, NO WORDS) ── */}
        <g transform="translate(190, 75)">
          {/* Notebook cover base */}
          <rect x="0" y="0" width="90" height="150" rx="7" fill="#141414" stroke="url(#goldStationeryRight)" strokeWidth="1.6" />
          {/* Inset cover panel */}
          <rect x="8" y="10" width="74" height="130" rx="3" fill="#1A1A1A" />
          {/* Subtle gold geometric grid frame */}
          <rect x="14" y="18" width="62" height="114" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
          <line x1="14" y1="42" x2="76" y2="42" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />
          <line x1="14" y1="68" x2="76" y2="68" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />
          <line x1="14" y1="94" x2="76" y2="94" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />
          {/* Central gold geometric star crest (STRICTLY NO LETTERS) */}
          <circle cx="45" cy="68" r="16" fill="#141414" stroke="url(#goldStationeryRight)" strokeWidth="1.3" />
          <polygon points="45,56 49,64 57,68 49,72 45,80 41,72 33,68 41,64" fill="#F5D76E" />
          {/* Golden twin-wire spiral coils along spine */}
          {[16, 28, 40, 52, 64, 76, 88, 100, 112, 124, 136].map((yPos) => (
            <ellipse key={yPos} cx="0" cy={yPos} rx="4.5" ry="2.2" fill="url(#goldStationeryRight)" stroke="#080808" strokeWidth="1" />
          ))}
        </g>

        {/* ── 2. METRIC DRAFTING RULER (Tick Marks Only, NO WORDS, NO NUMBERS) ── */}
        <g transform="translate(65, 50) rotate(-16)">
          {/* Ruler body */}
          <rect x="0" y="0" width="24" height="175" rx="3" fill="#1E1E1E" stroke="url(#goldStationeryRight)" strokeWidth="1.3" />
          {/* Measurement tick marks only (NO WORDS, NO NUMBERS) */}
          {[12, 20, 28, 36, 44, 52, 60, 68, 76, 84, 92, 100, 108, 116, 124, 132, 140, 148, 156, 164].map((y, i) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2={i % 2 === 0 ? "9" : "5"}
              y2={y}
              stroke="url(#goldStationeryRight)"
              strokeWidth="1.1"
            />
          ))}
          {/* Brass centerline groove */}
          <line x1="18" y1="12" x2="18" y2="164" stroke="rgba(212,175,55,0.4)" strokeWidth="1" strokeDasharray="6 3" />
        </g>

        {/* ── 3. TECHNICAL GEOMETRY COMPASS ── */}
        <g transform="translate(45, 95) rotate(-8)">
          {/* Compass top pivot knob */}
          <circle cx="35" cy="15" r="5" fill="url(#goldStationeryRight)" />
          <rect x="33" y="10" width="4" height="14" fill="url(#goldStationeryRight)" />
          {/* Left metal leg */}
          <path d="M 33 22 L 15 105" stroke="url(#goldStationeryRight)" strokeWidth="3" strokeLinecap="round" />
          {/* Needle point */}
          <path d="M 15 105 L 12 118" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          {/* Right metal leg */}
          <path d="M 37 22 L 53 100" stroke="url(#goldStationeryRight)" strokeWidth="3" strokeLinecap="round" />
          {/* Pencil collar clamp and lead */}
          <rect x="50" y="98" width="6" height="10" rx="1" fill="#181818" stroke="#D4AF37" strokeWidth="1" />
          <polygon points="51,108 55,108 53,118" fill="#555" />
          {/* Brass adjustment knurled thumb screw */}
          <line x1="23" y1="55" x2="45" y2="55" stroke="#F5D76E" strokeWidth="1.6" />
          <circle cx="34" cy="55" r="3.2" fill="#D4AF37" />
        </g>

        {/* ── 4. DESK STATIONERY CUP / HOLDER ── */}
        <g transform="translate(98, 145)">
          {/* Desk shadow */}
          <ellipse cx="48" cy="115" rx="46" ry="9" fill="rgba(0,0,0,0.65)" />
          {/* Cup cylindrical tapered body */}
          <path d="M 12 110 L 4 12 C 4 12 48 5 92 12 L 84 110 C 84 110 48 116 12 110 Z" fill="url(#cupGradRight)" stroke="url(#goldStationeryRight)" strokeWidth="1.6" />
          {/* Elegant geometric gold crisscross wire lattice */}
          <path d="M 18 24 L 78 100 M 78 24 L 18 100 M 10 52 L 86 52 M 12 76 L 84 76" stroke="rgba(212,175,55,0.26)" strokeWidth="1.1" />
          {/* Polished gold top rim */}
          <ellipse cx="48" cy="12" rx="44" ry="9" fill="#161616" stroke="url(#goldStationeryRight)" strokeWidth="2" />
          {/* Polished gold base rim */}
          <ellipse cx="48" cy="109" rx="36" ry="6" fill="none" stroke="url(#goldStationeryRight)" strokeWidth="1.6" />
        </g>

        {/* ── 5. PENS AND PENCILS ARRANGED INSIDE THE CUP ── */}
        {/* Luxury Gold Fountain Pen (Left) */}
        <g transform="translate(112, 36) rotate(-5)">
          {/* Pen lacquered barrel */}
          <rect x="18" y="44" width="9" height="85" rx="2" fill="#151515" stroke="url(#goldStationeryRight)" strokeWidth="1" />
          {/* Cap band */}
          <rect x="17" y="42" width="11" height="4.5" fill="url(#goldStationeryRight)" />
          {/* Gold pocket clip */}
          <path d="M 27 44 L 29.5 44 L 29.5 78 L 27 80" stroke="url(#goldStationeryRight)" strokeWidth="1.8" fill="none" />
          {/* 18K engraved nib */}
          <path d="M 18 42 L 22.5 15 L 27 42 Z" fill="url(#goldStationeryRight)" stroke="#9E7618" strokeWidth="0.8" />
          <circle cx="22.5" cy="27" r="1" fill="#121212" />
          <line x1="22.5" y1="15" x2="22.5" y2="27" stroke="#121212" strokeWidth="0.6" />
        </g>

        {/* Hexagonal Drawing Pencil (Gold-Yellow Body, Center) */}
        <g transform="translate(134, 48) rotate(5)">
          {/* Pencil body */}
          <rect x="10" y="32" width="7.5" height="90" fill="url(#pencilYellowRight)" stroke="#AA771C" strokeWidth="0.8" />
          {/* Metal ferrule collar */}
          <rect x="9.5" y="116" width="8.5" height="7" fill="url(#goldStationeryRight)" />
          {/* Eraser tip */}
          <rect x="10" y="123" width="7.5" height="5" rx="2" fill="#D97706" />
          {/* Sharpened cedar cone */}
          <polygon points="10,32 17.5,32 13.75,10" fill="#E2D4B7" stroke="#AA771C" strokeWidth="0.6" />
          {/* Black graphite point */}
          <polygon points="12,19 15.5,19 13.75,10" fill="#121212" />
        </g>

        {/* Mechanical Drafting Pencil (Right) */}
        <g transform="translate(154, 58) rotate(14)">
          {/* Metallic shaft */}
          <rect x="6" y="30" width="6.5" height="85" rx="1" fill="#242424" stroke="url(#goldStationeryRight)" strokeWidth="0.8" />
          {/* Gold knurled grip */}
          <rect x="5.5" y="32" width="7.5" height="20" fill="url(#goldStationeryRight)" />
          {/* Pocket clip */}
          <line x1="12.5" y1="62" x2="12.5" y2="90" stroke="url(#goldStationeryRight)" strokeWidth="1.6" />
          {/* Precision lead sleeve */}
          <polygon points="6,30 12.5,30 9.25,16" fill="url(#goldStationeryRight)" />
          <line x1="9.25" y1="16" x2="9.25" y2="9" stroke="#FFF" strokeWidth="1.1" />
        </g>

        {/* ── 6. DESK ACCESSORIES (Brass Paperclips) ── */}
        <g transform="translate(85, 252) rotate(22)">
          <path d="M 0 0 L 0 22 C 0 27 7 27 7 22 L 7 5 C 7 2 11 2 11 5 L 11 24 C 11 31 -2 31 -2 24 L -2 7" fill="none" stroke="url(#goldStationeryRight)" strokeWidth="1.8" strokeLinecap="round" />
        </g>
        <g transform="translate(182, 260) rotate(-15)">
          <path d="M 0 0 L 0 16 C 0 20 5 20 5 16 L 5 4 C 5 2 8 2 8 4 L 8 18 C 8 23 -2 23 -2 18 L -2 5" fill="none" stroke="url(#goldStationeryRight)" strokeWidth="1.6" strokeLinecap="round" />
        </g>

        {/* Floating golden sparkle stars */}
        <path d="M 295 65 Q 300 65 300 60 Q 300 65 305 65 Q 300 65 300 70 Q 300 65 295 65 Z" fill="#F5D76E" />
        <path d="M 40 180 Q 45 180 45 175 Q 45 180 50 180 Q 45 180 45 185 Q 45 180 40 180 Z" fill="#D4AF37" />
        <path d="M 205 35 Q 208 35 208 32 Q 208 35 211 35 Q 208 35 208 38 Q 208 35 205 35 Z" fill="#FFF2B2" />
      </svg>
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
