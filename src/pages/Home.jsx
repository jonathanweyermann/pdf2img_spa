import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ArrowRight,
  Check,
  Clock,
  Download,
  FileArchive,
  FileText,
  History,
  Maximize2,
  MonitorSmartphone,
  Plus,
} from 'lucide-react';
import Dropzone from '../components/Dropzone';
import JobCard from '../components/JobCard';
import ToolWindow from '../components/ToolWindow';
import { useConversionJob } from '../hooks/useConversionJob';
import { useWindowFileDrop } from '../hooks/useWindowFileDrop';
import { useRecentList, useRecentUploads } from '../state/RecentUploads';
import { daysLeft, pluralize, timeAgo } from '../lib/files';
import './Home.css';

const STEPS = [
  {
    title: 'Drop in your PDF',
    body: 'Drag it onto the page or pick it from your files. The page count is read right in your browser.',
  },
  {
    title: 'Every page becomes a JPG',
    body: 'Each page is rendered to a crisp JPG on our servers, and they fill a thumbnail grid as they finish.',
  },
  {
    title: 'Take what you need',
    body: 'Open any page full size, rotate it, save it on its own, or grab the whole set as one ZIP.',
  },
];

const FEATURES = [
  { icon: FileArchive, title: 'One ZIP, every page', body: 'Download all the images at once in a single archive, ready to share or unzip.' },
  { icon: Download, title: 'Page-by-page downloads', body: 'Only need page 7? Save any single page as a JPG straight from the grid.' },
  { icon: Maximize2, title: 'Full-size viewer', body: 'Open pages full screen, flip through with arrow keys, and rotate sideways scans.' },
  { icon: History, title: 'Come back later', body: 'Conversions you make are listed under Recent on the same device for 30 days.' },
  { icon: MonitorSmartphone, title: 'Nothing to install', body: 'Runs in any modern browser on desktop, tablet, or phone. No account needed.' },
  { icon: Clock, title: 'Cleaned up automatically', body: 'PDFs, images, and ZIPs are deleted from the server after 30 days.' },
];

const FAQ = [
  {
    q: 'Is PDF 2 JPGs really free?',
    a: 'Yes. There is no account, no watermark, and nothing to install. Drop in a PDF and download the images.',
  },
  {
    q: 'What quality are the JPGs?',
    a: 'Each page is rendered at 128 DPI with anti-aliased text. That is sharp on screen and works well for slides, documents, chat, and the web.',
  },
  {
    q: 'How long does a conversion take?',
    a: 'Most PDFs are done in a few seconds. Long documents can take a minute or two. Pages show up in the grid as soon as they are ready, so you can start looking before the ZIP is finished.',
  },
  {
    q: 'What happens to my files?',
    a: 'Your PDF, its images, and the ZIP are stored for 30 days so you can come back to them, then deleted automatically. Files are reachable by anyone who has their direct link, so avoid uploading highly sensitive documents.',
  },
  {
    q: 'Can I get back to a PDF I converted earlier?',
    a: 'Yes. Open Recent in the top bar to see what you have converted on this browser in the last 30 days. Clearing your browser data also clears that list.',
  },
  {
    q: 'Does it work with password-protected PDFs?',
    a: 'Not yet. Remove the password first (most PDF readers can save an unlocked copy), then convert that file.',
  },
];

function RecentStrip() {
  const recent = useRecentList().slice(0, 4);
  if (recent.length === 0) return null;
  return (
    <div className="recent-strip">
      <div className="recent-strip__head">
        <span className="mono">Pick up where you left off</span>
      </div>
      <ul className="recent-strip__list">
        {recent.map((item) => {
          const left = daysLeft(item.convertedAt);
          return (
            <li key={item.s3SafeFileName}>
              <Link to={`/uploaded/${item.index}`} className="recent-card">
                <span className="recent-card__icon"><FileText aria-hidden="true" /></span>
                <span className="recent-card__text">
                  <span className="recent-card__name">{item.uploadFileName}.pdf</span>
                  <span className="recent-card__meta">
                    {pluralize(Number(item.numPages), 'page')}
                    {item.convertedAt ? ` · ${timeAgo(item.convertedAt)}` : ''}
                    {left !== null && left <= 7 ? ` · ${left}d left` : ''}
                  </span>
                </span>
                <ArrowRight className="recent-card__arrow" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { add } = useRecentUploads();

  const onUploaded = useCallback(
    (entry) => navigate(`/uploaded/${add(entry)}`, { state: { fresh: true } }),
    [add, navigate],
  );

  const { job, start, reset, retry } = useConversionJob({ onUploaded });
  const idle = job.phase === 'idle';
  const dragActive = useWindowFileDrop(idle || job.phase === 'error', start);

  const windowTitle = idle ? 'pdf2jpgs.com / convert' : `converting / ${job.file.name}`;

  return (
    <>
      <link rel="canonical" href="https://pdf2jpgs.com/" />
      <section className="hero surface-brand grid-bg">
        <div className="hero__glow hero__glow--blue" aria-hidden="true" />
        <div className="hero__glow hero__glow--teal" aria-hidden="true" />
        <div className="container hero__grid">
          <div className="hero__copy">
            <span className="eyebrow">
              <span className="pulse-dot" aria-hidden="true" />
              Free · No sign-up · No watermarks
            </span>
            <h1 className="hero__title">
              PDF to JPG, <span className="gradient-text">page by page.</span>
            </h1>
            <p className="hero__lead">
              Convert a PDF file to a set of optimized JPG images. Preview every page as a
              thumbnail, open it full size, and download just the pages you need or the whole set as a ZIP.
            </p>
            <ul className="hero__points">
              <li><Check aria-hidden="true" /> Every page, rendered at 128 DPI</li>
              <li><Check aria-hidden="true" /> Thumbnails appear as pages convert</li>
              <li><Check aria-hidden="true" /> One-click ZIP of all images</li>
            </ul>
          </div>

          <div className="hero__tool" id="convert">
            <ToolWindow title={windowTitle}>
              {idle ? (
                <Dropzone onFile={start} error={job.error} />
              ) : (
                <JobCard job={job} onCancel={reset} onRetry={retry} onReset={reset} />
              )}
            </ToolWindow>
            <div className="hero__chip" aria-hidden="true">
              <span className="pulse-dot" /> Pages appear as they convert
            </div>
          </div>
        </div>
        <div className="container">
          <RecentStrip />
        </div>
      </section>

      <section className="section surface-light" id="how-it-works">
        <div className="container">
          <div className="section__head section__head--center">
            <span className="section__kicker">How it works</span>
            <h2 className="section__title">Three steps. No learning curve.</h2>
          </div>
          <ol className="how">
            {STEPS.map((step, i) => (
              <li key={step.title} className="how__step">
                <span className="how__num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section surface-light section--tight-top" id="features">
        <div className="container">
          <div className="section__head">
            <span className="section__kicker">Features</span>
            <h2 className="section__title">Built for getting pages out of PDFs, fast.</h2>
            <p className="section__lead">
              A focused tool that does one job well, with the small touches that save you clicks.
            </p>
          </div>
          <ul className="features">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="feature">
                <span className="feature__icon"><Icon aria-hidden="true" /></span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section surface-light section--tight-top" id="faq">
        <div className="container faq">
          <div className="section__head">
            <span className="section__kicker">FAQ</span>
            <h2 className="section__title">Questions, answered.</h2>
            <p className="section__lead">
              Still curious? <Link to="/about">Learn who built this</Link>.
            </p>
          </div>
          <div className="faq__list">
            {FAQ.map((item) => (
              <details key={item.q} className="faq__item">
                <summary>
                  {item.q}
                  <Plus className="faq__icon" aria-hidden="true" />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="cta surface-brand grid-bg">
        <div className="hero__glow hero__glow--blue cta__glow" aria-hidden="true" />
        <div className="container cta__inner">
          <h2>Got a PDF? Get the pages.</h2>
          <p>Free, fast, and nothing to install.</p>
          <Link to="/#convert" className="btn btn--primary btn--lg">
            Convert a PDF <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      {dragActive && (
        <div className="drop-overlay" aria-hidden="true">
          <div className="drop-overlay__target">
            <span className="drop-overlay__title">Drop to convert</span>
            <span className="mono">Release your PDF anywhere</span>
          </div>
        </div>
      )}
    </>
  );
}
