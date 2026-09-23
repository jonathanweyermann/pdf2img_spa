// Naming helpers. These must stay in sync with the conversion lambda, which
// writes `<base>/image<N>.jpg` and `<base>.zip`, where <base> is everything in
// the uploaded key before the first dot.

export const RETENTION_DAYS = 30;

export const safeFileName = (pcid, name) => `${pcid}${name.replace(/[^0-9a-zA-Z_.]/g, '')}`;

export const baseName = (s3SafeFileName) => s3SafeFileName.split('.')[0];

export const fileExtension = (name) => {
  const parts = name.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : 'pdf';
};

export const displayName = (name) => name.replace(/\.pdf$/i, '');

export const isPdf = (file) =>
  Boolean(file) && (file.type === 'application/pdf' || /\.pdf$/i.test(file.name));

export const pdfUrl = (bucket, s3SafeFileName) => `${bucket}pdfs/${s3SafeFileName}`;

export const imageUrl = (bucket, s3SafeFileName, page) =>
  `${bucket}${baseName(s3SafeFileName)}/image${page}.jpg`;

export const zipUrl = (bucket, s3SafeFileName) => `${bucket}${baseName(s3SafeFileName)}.zip`;

export const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const pluralize = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

const DAY = 24 * 60 * 60 * 1000;

export const timeAgo = (timestamp, now = Date.now()) => {
  if (!timestamp) return null;
  const diff = Math.max(0, now - timestamp);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const daysLeft = (timestamp, now = Date.now()) => {
  if (!timestamp) return null;
  return Math.max(0, Math.ceil((timestamp + RETENTION_DAYS * DAY - now) / DAY));
};
