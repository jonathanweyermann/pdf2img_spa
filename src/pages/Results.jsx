import { useCallback, useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowLeft,
  CircleAlert,
  Clock,
  FileArchive,
  FileText,
  Grid2x2,
  Grid3x3,
  LoaderCircle,
  Plus,
  Square,
} from 'lucide-react';
import PageCard from '../components/PageCard';
import Lightbox from '../components/Lightbox';
import EmptyState from '../components/EmptyState';
import { useConversionStatus } from '../hooks/useConversionStatus';
import { useRecentUploads } from '../state/RecentUploads';
import { daysLeft, imageUrl, pluralize, timeAgo, zipUrl } from '../lib/files';
import { downloadFile, pageFileName } from '../lib/download';
import { imageBucket } from '../config';
import './Results.css';

const SIZES = [
  { key: 'sm', label: 'Small thumbnails', icon: Grid3x3 },
  { key: 'md', label: 'Medium thumbnails', icon: Grid2x2 },
  { key: 'lg', label: 'Large thumbnails', icon: Square },
];
const SIZE_KEY = 'thumb_size';

const readSize = () => {
  try {
    return localStorage.getItem(SIZE_KEY) || 'md';
  } catch {
    return 'md';
  }
};

function StatusBadge({ expired, complete, zipReady, stalled }) {
  if (expired) return <span className="badge badge--muted">Expired</span>;
  if (stalled) return <span className="badge badge--warning">Delayed</span>;
  if (complete && zipReady) return <span className="badge badge--success"><span className="badge__dot" />Ready</span>;
  return <span className="badge badge--info"><span className="badge__dot" />Converting</span>;
}

export default function Results({ index }) {
  const { uploads, remove } = useRecentUploads();
  // Snapshot the entry so background history pruning can't swap it out.
  const [entry] = useState(() => uploads[index]);
  const status = useConversionStatus(entry);
  const [viewer, setViewer] = useState(null);
  const [size, setSize] = useState(readSize);

  const chooseSize = (key) => {
    setSize(key);
    try {
      localStorage.setItem(SIZE_KEY, key);
    } catch {
      // ignore
    }
  };

  const src = useCallback((page) => imageUrl(imageBucket, entry.s3SafeFileName, page), [entry]);
  const download = useCallback(
    (page) => downloadFile(src(page), pageFileName(entry.uploadFileName, page)),
    [entry, src],
  );

  if (!entry) {
    return (
      <EmptyState
        icon={FileText}
        title="We couldn't find that conversion"
        body="It may have been cleared from this browser's history. Convert the PDF again to get fresh images."
      />
    );
  }

  const numPages = Number(entry.numPages);
  const title = `${entry.uploadFileName}.pdf`;

  if (status.expired) {
    return (
      <EmptyState
        icon={Clock}
        title="This conversion has expired"
        body={`Files are kept for 30 days, and "${title}" has been cleaned up. Convert it again to get new images.`}
      >
        <button type="button" className="btn btn--ghost" onClick={() => remove(entry.s3SafeFileName)}>
          Remove from history
        </button>
      </EmptyState>
    );
  }

  const { readyPages, zipReady, stalled, keepWaiting } = status;
  const complete = readyPages >= numPages;
  const percent = Math.round((readyPages / numPages) * 100);
  const left = daysLeft(entry.convertedAt);
  const pages = Array.from({ length: numPages }, (_, i) => i + 1);

  return (
    <>
      <title>{`${title} · PDF 2 JPGs`}</title>
      <section className="results-head surface-brand grid-bg">
        <div className="hero__glow hero__glow--blue results-head__glow" aria-hidden="true" />
        <div className="container">
          <Link to="/" className="back-link">
            <ArrowLeft aria-hidden="true" /> Convert another PDF
          </Link>

          <div className="results-head__row">
            <div className="results-head__file">
              <span className="results-head__icon"><FileText aria-hidden="true" /></span>
              <div className="results-head__text">
                <h1 className="results-head__title" title={title}>{title}</h1>
                <div className="results-head__meta">
                  <StatusBadge expired={false} complete={complete} zipReady={zipReady} stalled={stalled} />
                  <span>{pluralize(numPages, 'page')}</span>
                  {entry.convertedAt && <span>Converted {timeAgo(entry.convertedAt)}</span>}
                  {left !== null && <span>Deleted in {pluralize(left, 'day')}</span>}
                </div>
              </div>
            </div>

            <div className="results-head__actions">
              {zipReady ? (
                <a className="btn btn--primary" href={zipUrl(imageBucket, entry.s3SafeFileName)} download={`${entry.uploadFileName}.zip`}>
                  <FileArchive aria-hidden="true" /> Download all (.zip)
                </a>
              ) : (
                <button type="button" className="btn btn--primary" disabled>
                  <LoaderCircle className="spinner" aria-hidden="true" />
                  {complete ? 'Preparing ZIP…' : 'Converting…'}
                </button>
              )}
              <Link to="/#convert" className="btn btn--ghost">
                <Plus aria-hidden="true" /> New PDF
              </Link>
            </div>
          </div>

          {!complete && !stalled && (
            <div className="results-progress" aria-live="polite">
              <div
                className={`progress${readyPages === 0 ? ' progress--indeterminate' : ''}`}
                role="progressbar"
                aria-label="Conversion progress"
                aria-valuemin={0}
                aria-valuemax={numPages}
                aria-valuenow={readyPages}
              >
                <div className="progress__bar" style={{ width: `${percent}%` }} />
              </div>
              <span className="results-progress__label">
                {readyPages === 0 ? 'Starting conversion…' : `${readyPages} of ${numPages} pages ready`}
              </span>
            </div>
          )}

          {stalled && (
            <div className="alert alert--warning results-alert" role="status">
              <CircleAlert aria-hidden="true" />
              <span>
                This is taking longer than usual. Very large PDFs can take a few minutes, or the conversion may have
                failed.{' '}
                <button type="button" className="link-button" onClick={keepWaiting}>Keep waiting</button>
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="results-body">
        <div className="container">
          <div className="results-toolbar">
            <span className="results-toolbar__label">
              {complete ? 'Click a page to view it full size' : 'Pages appear here as they finish'}
            </span>
            <div className="segmented" role="group" aria-label="Thumbnail size">
              {SIZES.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  className="segmented__btn"
                  aria-pressed={size === key}
                  aria-label={label}
                  title={label}
                  onClick={() => chooseSize(key)}
                >
                  <Icon aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <ul className={`page-grid page-grid--${size}`}>
            {pages.map((page) => (
              <li key={page}>
                <PageCard
                  page={page}
                  src={src(page)}
                  ready={page <= readyPages}
                  onOpen={() => setViewer(page)}
                  onDownload={() => download(page)}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {viewer !== null && (
        <Lightbox
          title={title}
          page={viewer}
          total={numPages}
          lastReady={readyPages}
          getSrc={src}
          onNavigate={setViewer}
          onDownload={download}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  );
}
