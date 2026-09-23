import { Link } from 'react-router';
import { LogoMark } from './Logo';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <LogoMark size={28} />
          <div>
            <div className="footer__name">pdf2jpgs.com</div>
            <div className="footer__tag">Free PDF to JPG conversion, page by page.</div>
          </div>
        </div>
        <nav className="footer__links" aria-label="Footer">
          <Link to="/#convert">Convert</Link>
          <Link to="/#how-it-works">How it works</Link>
          <Link to="/#faq">FAQ</Link>
          <Link to="/about">About</Link>
        </nav>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Jonathan Weyermann</span>
        <a href="https://jonathanweyermann.com" className="footer__credit">
          Built by <strong>Weyermann Web Development</strong>
        </a>
      </div>
    </footer>
  );
}
