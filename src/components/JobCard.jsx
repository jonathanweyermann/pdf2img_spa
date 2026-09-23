import { Check, CircleAlert, FileText, LoaderCircle, X } from 'lucide-react';
import { formatBytes, pluralize } from '../lib/files';

const STEP_INDEX = { reading: 0, uploading: 1, done: 2 };

const overallProgress = ({ phase, progress = 0 }) => {
  if (phase === 'reading') return 0.06;
  if (phase === 'uploading') return 0.1 + progress * 0.85;
  if (phase === 'done') return 1;
  return 0;
};

function StepIcon({ state }) {
  if (state === 'done') return <Check aria-hidden="true" />;
  if (state === 'active') return <LoaderCircle className="spinner" aria-hidden="true" />;
  if (state === 'error') return <X aria-hidden="true" />;
  return <span className="step__dot" aria-hidden="true" />;
}

export default function JobCard({ job, onCancel, onRetry, onReset }) {
  const { phase, file, numPages, thumbnail, progress = 0, error, failedStep } = job;
  const current = phase === 'error' ? STEP_INDEX[failedStep] ?? 1 : STEP_INDEX[phase];

  const steps = [
    { label: 'Read PDF', detail: numPages ? pluralize(numPages, 'page') : 'Counting pages' },
    { label: 'Upload', detail: phase === 'uploading' ? `${Math.round(progress * 100)}%` : 'Secure S3 upload' },
    { label: 'Convert to JPG', detail: 'Starts automatically' },
  ];

  const stepState = (i) => {
    if (i < current) return 'done';
    if (i === current) return phase === 'error' ? 'error' : 'active';
    return 'pending';
  };

  const percent = Math.round(overallProgress(job) * 100);

  return (
    <div className="job" aria-live="polite">
      <div className="job__file">
        <div className="job__thumb">
          {thumbnail ? <img src={thumbnail} alt="" /> : <FileText aria-hidden="true" />}
        </div>
        <div className="job__info">
          <div className="job__name" title={file.name}>{file.name}</div>
          <div className="job__meta">
            {formatBytes(file.size)}
            {numPages ? ` · ${pluralize(numPages, 'page')}` : ''}
          </div>
        </div>
      </div>

      <ol className="steps">
        {steps.map((step, i) => (
          <li key={step.label} className={`step step--${stepState(i)}`}>
            <span className="step__icon"><StepIcon state={stepState(i)} /></span>
            <span className="step__label">{step.label}</span>
            <span className="step__detail">{step.detail}</span>
          </li>
        ))}
      </ol>

      {phase === 'error' ? (
        <>
          <div className="alert" role="alert">
            <CircleAlert aria-hidden="true" />
            <span>{error}</span>
          </div>
          <div className="job__actions">
            {failedStep !== 'reading' && (
              <button type="button" className="btn btn--primary btn--sm" onClick={onRetry}>
                Try again
              </button>
            )}
            <button type="button" className="btn btn--ghost btn--sm" onClick={onReset}>
              Choose another file
            </button>
          </div>
        </>
      ) : (
        <>
          <div
            className="progress"
            role="progressbar"
            aria-label="Upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div className="progress__bar" style={{ width: `${percent}%` }} />
          </div>
          <div className="job__actions">
            <span className="job__status">
              {phase === 'done' ? 'Uploaded. Opening your pages…' : phase === 'reading' ? 'Reading your PDF…' : 'Uploading…'}
            </span>
            {phase !== 'done' && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>
                Cancel
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
