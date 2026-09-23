import { Link, NavLink } from 'react-router';
import Logo from './Logo';
import RecentMenu from './RecentMenu';
import ThemeToggle from './ThemeToggle';
import './Nav.css';

export default function Nav() {
  return (
    <header className="nav">
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="container nav__inner">
        <Logo />
        <nav className="nav__links" aria-label="Primary">
          <Link to="/#how-it-works">How it works</Link>
          <Link to="/#faq">FAQ</Link>
          <NavLink to="/about">About</NavLink>
        </nav>
        <div className="nav__actions">
          <RecentMenu />
          <ThemeToggle />
          <Link to="/#convert" className="btn btn--primary btn--sm nav__cta">
            Convert a PDF
          </Link>
        </div>
      </div>
    </header>
  );
}
