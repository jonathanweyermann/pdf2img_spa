import { Link } from 'react-router';
import './Logo.css';

export function LogoMark({ size = 32 }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3b6cff" />
          <stop offset="1" stopColor="#7b5cff" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
      {/* back page */}
      <path d="M11 7.5h7.5l4 4V20" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {/* front page as an image */}
      <rect x="8" y="11" width="12.5" height="14" rx="2" fill="#fff" />
      <circle cx="11.6" cy="14.9" r="1.4" fill="#5b63ff" />
      <path d="M8.9 23.6l3.6-4 2.3 2.4 1.6-1.6 3.2 3.2" fill="none" stroke="#5b63ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="PDF 2 JPGs home">
      <LogoMark />
      <span className="logo__word">
        pdf<span className="logo__two">2</span>jpgs
      </span>
    </Link>
  );
}
