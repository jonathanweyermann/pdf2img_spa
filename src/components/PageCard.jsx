import { useEffect, useState } from 'react';
import { Download, ImageOff, LoaderCircle, Maximize2 } from 'lucide-react';

const MAX_RETRIES = 3;

export default function PageCard({ page, src, ready, onOpen, onDownload }) {
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [failed, setFailed] = useState(false);

  // S3 can briefly 403 right after an object appears; retry with a cache-buster.
  const handleError = () => {
    if (attempt >= MAX_RETRIES) setFailed(true);
    else setWaiting(true);
  };

  useEffect(() => {
    if (!waiting) return undefined;
    const timer = setTimeout(() => {
      setAttempt((n) => n + 1);
      setWaiting(false);
    }, 1500 * (attempt + 1));
    return () => clearTimeout(timer);
  }, [waiting, attempt]);

  const url = attempt > 0 ? `${src}?r=${attempt}` : src;
  const showImage = ready && !failed && !waiting;

  let placeholder = null;
  if (!loaded) {
    if (failed) {
      placeholder = (
        <>
          <ImageOff aria-hidden="true" />
          <span>Couldn't load</span>
        </>
      );
    } else if (ready) {
      placeholder = <LoaderCircle className="spinner" aria-hidden="true" />;
    } else {
      placeholder = <span className="page-card__pending">Converting</span>;
    }
  }

  return (
    <figure className={`page-card${loaded ? ' is-loaded' : ''}${ready ? '' : ' is-pending'}`}>
      <button
        type="button"
        className="page-card__preview"
        onClick={onOpen}
        disabled={!loaded}
        aria-label={`View page ${page} full size`}
      >
        {showImage && (
          <img
            src={url}
            alt={`Page ${page}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={handleError}
          />
        )}
        {placeholder && <span className="page-card__placeholder">{placeholder}</span>}
        {loaded && (
          <span className="page-card__zoom" aria-hidden="true">
            <Maximize2 />
          </span>
        )}
      </button>
      <figcaption className="page-card__caption">
        <span className="page-card__num">Page {page}</span>
        <button
          type="button"
          className="icon-btn icon-btn--sm"
          onClick={onDownload}
          disabled={!loaded}
          aria-label={`Download page ${page}`}
          title="Download JPG"
        >
          <Download />
        </button>
      </figcaption>
    </figure>
  );
}
