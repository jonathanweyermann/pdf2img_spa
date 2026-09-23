import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ChevronDown, FileText, History, Trash2 } from 'lucide-react';
import { useRecentList, useRecentUploads } from '../state/RecentUploads';
import { pluralize, timeAgo } from '../lib/files';

export default function RecentMenu() {
  const [open, setOpen] = useState(false);
  const recent = useRecentList();
  const { clear } = useRecentUploads();
  const rootRef = useRef(null);
  const location = useLocation();
  const menuId = useId();

  useEffect(() => setOpen(false), [location]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="recent-menu" ref={rootRef}>
      <button
        type="button"
        className="recent-menu__trigger"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <History aria-hidden="true" />
        <span className="recent-menu__label">Recent</span>
        {recent.length > 0 && <span className="recent-menu__count">{recent.length}</span>}
        <ChevronDown className="recent-menu__chevron" aria-hidden="true" />
      </button>

      {open && (
        <div className="recent-menu__panel" id={menuId}>
          <div className="recent-menu__head">
            <span className="mono">Recent on this device</span>
          </div>
          {recent.length === 0 ? (
            <p className="recent-menu__empty">
              Nothing yet. PDFs you convert here show up for 30 days.
            </p>
          ) : (
            <>
              <ul className="recent-menu__list">
                {recent.map((item) => (
                  <li key={item.s3SafeFileName}>
                    <Link to={`/uploaded/${item.index}`} className="recent-menu__item">
                      <span className="recent-menu__icon"><FileText aria-hidden="true" /></span>
                      <span className="recent-menu__text">
                        <span className="recent-menu__name">{item.uploadFileName}.pdf</span>
                        <span className="recent-menu__meta">
                          {pluralize(Number(item.numPages), 'page')}
                          {item.convertedAt ? ` · ${timeAgo(item.convertedAt)}` : ''}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button type="button" className="recent-menu__clear" onClick={clear}>
                <Trash2 aria-hidden="true" /> Clear history
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
