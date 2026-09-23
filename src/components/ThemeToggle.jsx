import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { applyTheme, currentTheme } from '../lib/theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme);
  const next = theme === 'dark' ? 'light' : 'dark';

  const toggle = () => {
    applyTheme(next, { animate: true });
    setTheme(next);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  );
}
