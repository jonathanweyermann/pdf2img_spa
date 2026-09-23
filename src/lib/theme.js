// Dark is the default look; a stored "light" choice switches the branded
// surfaces over. index.html applies the stored theme before first paint.
export const THEME_KEY = 'theme';
const THEME_COLORS = { dark: '#070a12', light: '#ffffff' };

export const currentTheme = () =>
  document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';

export const applyTheme = (theme, { animate = false } = {}) => {
  const root = document.documentElement;
  if (animate) {
    root.classList.add('theme-switching');
    window.setTimeout(() => root.classList.remove('theme-switching'), 350);
  }
  root.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLORS[theme]);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage may be unavailable; the choice just won't persist.
  }
};
