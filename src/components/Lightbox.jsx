import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Download, ExternalLink, LoaderCircle, RotateCcw, RotateCw, X } from 'lucide-react';
import './Lightbox.css';

export default function Lightbox({ title, page, total, lastReady, getSrc, onNavigate, onDownload, onClose }) {
  const [rotations, setRotations] = useState({});
  const [loadedPage, setLoadedPage] = useState(null);
  const closeRef = useRef(null);
  const rotation = rotations[page] || 0;
  const src = getSrc(page);
  const canPrev = page > 1;
  const canNext = page < lastReady;

  // Kept unbounded (not mod 360) so the CSS transition always turns the short way.
  const rotate = (delta) => setRotations((current) => ({ ...current, [page]: rotation + delta }));
  const sideways = Math.abs(rotation % 180) === 90;

  const handlers = useRef({});
  handlers.current = {
    prev: () => canPrev && onNavigate(page - 1),
    next: () => canNext && onNavigate(page + 1),
    rotate: () => rotate(90),
    close: onClose,
  };

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    closeRef.current && closeRef.current.focus();

    const onKey = (event) => {
      const actions = {
        Escape: 'close',
        ArrowLeft: 'prev',
        ArrowRight: 'next',
        r: 'rotate',
        R: 'rotate',
      };
      const action = actions[event.key];
      if (!action) return;
      event.preventDefault();
      handlers.current[action]();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
  }, []);

  return createPortal(
    <div className="lightbox theme-dark" role="dialog" aria-modal="true" aria-label={`${title}, page ${page} of ${total}`}>
      <div className="lightbox__bar">
        <div className="lightbox__title">
          <span className="lightbox__name">{title}</span>
          <span className="lightbox__count">
            Page {page} of {total}
          </span>
        </div>
        <div className="lightbox__tools">
          <button type="button" className="icon-btn" onClick={() => rotate(-90)} aria-label="Rotate left" title="Rotate left">
            <RotateCcw />
          </button>
          <button type="button" className="icon-btn" onClick={() => rotate(90)} aria-label="Rotate right" title="Rotate right (R)">
            <RotateCw />
          </button>
          <button type="button" className="icon-btn" onClick={() => onDownload(page)} aria-label="Download this page" title="Download JPG">
            <Download />
          </button>
          <a className="icon-btn" href={src} target="_blank" rel="noopener noreferrer" aria-label="Open image in a new tab" title="Open original">
            <ExternalLink />
          </a>
          <span className="lightbox__divider" aria-hidden="true" />
          <button type="button" className="icon-btn" onClick={onClose} ref={closeRef} aria-label="Close viewer" title="Close (Esc)">
            <X />
          </button>
        </div>
      </div>

      <div
        className="lightbox__stage"
        onClick={(event) => event.target === event.currentTarget && onClose()}
      >
        <button
          type="button"
          className="lightbox__nav lightbox__nav--prev"
          onClick={handlers.current.prev}
          disabled={!canPrev}
          aria-label="Previous page"
        >
          <ChevronLeft />
        </button>

        {loadedPage !== page && <LoaderCircle className="spinner lightbox__spinner" aria-hidden="true" />}
        <img
          key={page}
          src={src}
          alt={`Page ${page}`}
          className={`lightbox__image${sideways ? ' is-sideways' : ''}${loadedPage === page ? ' is-loaded' : ''}`}
          style={{ '--rotation': `${rotation}deg` }}
          onLoad={() => setLoadedPage(page)}
          onClick={(event) => event.stopPropagation()}
        />

        <button
          type="button"
          className="lightbox__nav lightbox__nav--next"
          onClick={handlers.current.next}
          disabled={!canNext}
          aria-label="Next page"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="lightbox__hint" aria-hidden="true">
        <kbd>←</kbd> <kbd>→</kbd> browse · <kbd>R</kbd> rotate · <kbd>Esc</kbd> close
      </div>
    </div>,
    document.body,
  );
}
